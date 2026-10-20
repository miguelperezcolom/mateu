package io.mateu.core.infra.reflection;

import static io.mateu.core.infra.reflection.ClassLoaders.forName;
import static io.mateu.core.infra.reflection.write.Hydrater.hydrate;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Hydratable;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Singleton
@Named
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class ReflectionInstanceFactory implements InstanceFactory {

  private final BeanProvider beanProvider;

  @Override
  public boolean supports(String className) {
    return true;
  }

  @Override
  public Mono<? extends Object> createInstance(
      String className, Map<String, Object> data, HttpRequest httpRequest) {

    var newData = new HashMap<>(data != null ? data : Map.of());
    httpRequest
        .getParameterNames()
        .forEach(
            paramName -> {
              try {
                // newData, not data: data may be null, and the NPE was swallowed below — so a
                // request with no state silently lost every query parameter
                if (!newData.containsKey(paramName)) {
                  newData.put(paramName, httpRequest.getParameterValue(paramName));
                }
              } catch (Exception ignored) {
              }
            });

    var unflattenedData = unflatten(newData);

    return Mono.just(loadClass(className))
        .map(uiClass -> newInstance(uiClass, unflattenedData, httpRequest))
        .map(uiInstance -> hydrateIfNeeded(uiInstance, httpRequest))
        .map(
            uiInstance -> {
              io.mateu.core.domain.RequestBound.bind(uiInstance, httpRequest);
              return uiInstance;
            })
        .map(uiInstance -> postHydrateIfNeeded(uiInstance, httpRequest));
  }

  private Class<?> loadClass(String className) {
    // forName already falls back to the thread context classloader and throws an unchecked
    // IllegalStateException naming the class if it is genuinely missing.
    return forName(className);
  }

  private Object hydrateIfNeeded(Object uiInstance, HttpRequest httpRequest) {
    if (uiInstance instanceof Hydratable hydratable) {
      hydratable.hydrate(httpRequest);
    }
    return uiInstance;
  }

  private Object postHydrateIfNeeded(Object uiInstance, HttpRequest httpRequest) {
    if (uiInstance instanceof PostHydrationHandler hasInitMethod) {
      hasInitMethod.onHydrated(httpRequest);
    }
    return uiInstance;
  }

  public <T> T newInstance(Class c, HttpRequest httpRequest)
      throws NoSuchMethodException,
          IllegalAccessException,
          InvocationTargetException,
          InstantiationException {
    return (T) newInstance(c, Map.of(), httpRequest);
  }

  public <T> T newInstance(Class<T> c, Map<String, Object> data, HttpRequest httpRequest) {
    try {
      return newInstanceInner(c, data, httpRequest);
    } catch (InvocationTargetException e) {
      // a constructor (user code) threw — surface its real cause, not the reflective wrapper
      var cause = e.getCause() != null ? e.getCause() : e;
      if (cause instanceof RuntimeException re) {
        throw re;
      }
      if (cause instanceof Error err) {
        throw err;
      }
      throw new RuntimeException(cause);
    } catch (ReflectiveOperationException e) {
      throw new RuntimeException("Cannot instantiate " + c.getName(), e);
    } catch (Exception e) {
      throw e instanceof RuntimeException re ? re : new RuntimeException(e);
    }
  }

  private <T> T newInstanceInner(Class<T> c, Map<String, Object> data, HttpRequest httpRequest)
      throws Exception {
    var o = beanProvider.getBean(c);
    if (o != null && isShared(c, o)) {
      var fresh = freshInstanceOfSharedBean(c);
      if (fresh != null) {
        hydrate(fresh, data, this, httpRequest);
        return (T) fresh;
      }
    }
    if (o == null) { // not from spring
      if (c.getDeclaringClass() != null && !java.lang.reflect.Modifier.isStatic(c.getModifiers())) {
        // Non-static inner class: needs outer instance as first constructor arg
        Object p = newInstance(c.getDeclaringClass(), data, httpRequest);
        Constructor<?> cons =
            Arrays.stream(c.getDeclaredConstructors())
                .filter(constructor -> constructor.getParameterCount() == 1)
                .findFirst()
                .get();
        cons.setAccessible(true);
        o = (T) cons.newInstance(p);
      } else {
        o = BuilderInstantiator.tryInstantiate(c, data, httpRequest, this);
        if (o == null) {
          Constructor con = ConstructorResolver.getConstructor(c);
          if (con != null) {
            if (con.getParameterCount() > 0) {
              o =
                  (T)
                      con.newInstance(
                          ConstructorResolver.buildConstructorParams(con, data, this, httpRequest));
            } else {
              o = (T) con.newInstance();
              hydrate(o, data, this, httpRequest);
            }
          }
        }
      }
      injectDependencies(o);
    } else {
      hydrate(o, data, this, httpRequest);
    }
    return (T) o;
  }

  /**
   * Per class: whether the container hands out ONE instance for every lookup (a singleton, an
   * {@code @ApplicationScoped} bean, or a client proxy in front of a request/session-scoped one).
   * Decided once per class, on its first lookup, by asking the container a second time and
   * comparing identities. Per factory, not static: the answer is the container's.
   */
  private final java.util.Map<Class<?>, Boolean> sharedBeans =
      new java.util.concurrent.ConcurrentHashMap<>();

  private final java.util.Set<Class<?>> sharedBeanWarned =
      java.util.concurrent.ConcurrentHashMap.newKeySet();

  private boolean isShared(Class<?> c, Object first) {
    var known = sharedBeans.get(c);
    if (known != null) {
      return known;
    }
    var shared = beanProvider.getBean(c) == first;
    sharedBeans.put(c, shared);
    return shared;
  }

  /**
   * A view model the container shares between requests cannot hold a request's state: Mateu writes
   * the request's state into it (hydration) and orchestrators keep their routing in it, so with a
   * singleton one user's request leaked into the next one's (a CRUD under a menu pushed {@code
   * /app/students/students/new}) and two concurrent requests raced on the same fields. Behind a CDI
   * client proxy it was worse: the state was written into the PROXY's fields while the methods ran
   * on the real instance. So Mateu builds a fresh instance for the request instead, the way it
   * builds a view model that is not a bean at all: the {@code @Inject}/{@code @Autowired}
   * constructor (or the only one) gets the container's beans, injection fields are filled and
   * {@code @PostConstruct} methods run. Container interceptors (transactions, security…) do not
   * apply to that instance — hence the one-time warning naming the class.
   *
   * @return the fresh instance, or {@code null} when it cannot be built (a constructor parameter
   *     the container has no bean for): then the shared instance is used, as before
   */
  private Object freshInstanceOfSharedBean(Class<?> c) {
    try {
      var constructor = injectionConstructor(c);
      if (constructor == null) {
        warnShared(c, false);
        return null;
      }
      var params = new Object[constructor.getParameterCount()];
      for (int i = 0; i < params.length; i++) {
        params[i] = beanProvider.getBean(constructor.getParameterTypes()[i]);
        if (params[i] == null) {
          warnShared(c, false);
          return null;
        }
      }
      constructor.setAccessible(true);
      var o = constructor.newInstance(params);
      injectDependencies(o);
      runPostConstruct(o);
      warnShared(c, true);
      return o;
    } catch (ReflectiveOperationException | RuntimeException e) {
      log.debug("Could not build a fresh instance of shared bean {}", c.getName(), e);
      warnShared(c, false);
      return null;
    }
  }

  private void warnShared(Class<?> c, boolean replaced) {
    if (!sharedBeanWarned.add(c)) {
      return;
    }
    if (replaced) {
      log.warn(
          "{} is a shared bean (singleton / application scoped): Mateu keeps view state in the"
              + " view model, so it creates a fresh instance of it for every request instead (its"
              + " injected fields and constructor are filled from the container; container"
              + " interceptors do not apply). Make it prototype/@Dependent scoped, or do not"
              + " register it as a bean, to silence this warning.",
          c.getName());
    } else {
      log.warn(
          "{} is a shared bean (singleton / application scoped) and Mateu could not build a fresh"
              + " instance of it per request: its view state is shared between requests and"
              + " users. Make it prototype/@Dependent scoped, or do not register it as a bean.",
          c.getName());
    }
  }

  /** The constructor a container would use: the annotated one, a no-arg one, or the only one. */
  private static java.lang.reflect.Constructor<?> injectionConstructor(Class<?> c) {
    var constructors = c.getDeclaredConstructors();
    for (var constructor : constructors) {
      for (var annotation : constructor.getAnnotations()) {
        if (FIELD_INJECTION.contains(annotation.annotationType().getSimpleName())) {
          return constructor;
        }
      }
    }
    for (var constructor : constructors) {
      if (constructor.getParameterCount() == 0 && !constructor.isSynthetic()) {
        return constructor;
      }
    }
    return constructors.length == 1 ? constructors[0] : null;
  }

  private static void runPostConstruct(Object o) throws ReflectiveOperationException {
    var chain = new ArrayList<Class<?>>();
    for (Class<?> k = o.getClass(); k != null && k != Object.class; k = k.getSuperclass()) {
      chain.add(0, k);
    }
    for (var k : chain) {
      for (var method : k.getDeclaredMethods()) {
        if (method.getParameterCount() == 0
            && !java.lang.reflect.Modifier.isStatic(method.getModifiers())
            && java.util.Arrays.stream(method.getAnnotations())
                .anyMatch(a -> "PostConstruct".equals(a.annotationType().getSimpleName()))) {
          method.setAccessible(true);
          method.invoke(o);
        }
      }
    }
  }

  private static final java.util.concurrent.atomic.LongAdder FIELD_SCANS =
      new java.util.concurrent.atomic.LongAdder();

  /**
   * How many times a class's declared fields were walked looking for injection points, since the
   * JVM started. A diagnostic for the request-budget test (reflection on the request path); not
   * part of any contract.
   */
  public static long injectionFieldScans() {
    return FIELD_SCANS.sum();
  }

  /** The injection annotations a view model Mateu instantiates may use on its fields. */
  private static final java.util.Set<String> FIELD_INJECTION =
      java.util.Set.of("Autowired", "Inject", "Resource");

  /**
   * A view model Mateu instantiates itself (the default, recommended pattern: fresh per request,
   * not a container bean) still gets its injection points filled: every field marked {@code
   * Autowired} / {@code Inject} / {@code Resource} that is still null receives the container's bean
   * of its type. Without this the documented pattern compiled, rendered, and threw a
   * NullPointerException in the first action that used the service.
   */
  private void injectDependencies(Object o) {
    if (o == null) {
      return;
    }
    for (var field : INJECTABLE_FIELDS.get(o.getClass())) {
      try {
        if (field.get(o) != null) {
          continue;
        }
        var bean = beanProvider.getBean(field.getType());
        if (bean != null) {
          field.set(o, bean);
        }
      } catch (RuntimeException | IllegalAccessException e) {
        log.warn(
            "Could not inject {}.{}: {}",
            field.getDeclaringClass().getSimpleName(),
            field.getName(),
            e.getMessage());
      }
    }
  }

  /**
   * The injection points of a class (its own and its superclasses'), found once per class: walking
   * the declared fields and their annotations on every instantiation — every view model and nested
   * object, on every request — was pure overhead. The BEAN is still looked up per instance: its
   * scope is the app's decision.
   */
  private static final ClassValue<List<java.lang.reflect.Field>> INJECTABLE_FIELDS =
      new ClassValue<>() {
        @Override
        protected List<java.lang.reflect.Field> computeValue(Class<?> type) {
          var fields = new ArrayList<java.lang.reflect.Field>();
          for (Class<?> c = type; c != null && c != Object.class; c = c.getSuperclass()) {
            FIELD_SCANS.increment();
            for (var field : c.getDeclaredFields()) {
              if (java.lang.reflect.Modifier.isStatic(field.getModifiers())
                  || field.isSynthetic()) {
                continue;
              }
              if (!isInjectionPoint(field)) {
                continue;
              }
              try {
                field.setAccessible(true);
                fields.add(field);
              } catch (RuntimeException e) {
                log.warn(
                    "Could not inject {}.{}: {}",
                    c.getSimpleName(),
                    field.getName(),
                    e.getMessage());
              }
            }
          }
          return List.copyOf(fields);
        }
      };

  private static boolean isInjectionPoint(java.lang.reflect.Field field) {
    for (var annotation : field.getAnnotations()) {
      if (FIELD_INJECTION.contains(annotation.annotationType().getSimpleName())) {
        return true;
      }
    }
    return false;
  }

  private Object createInstance(
      Class type, Object data, HttpRequest httpRequest, Class genericType) {
    return ReflectionTypeCoercer.coerce(type, data, httpRequest, genericType, this);
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> unflatten(Map<String, Object> flatMap) {
    Map<String, Object> result = new LinkedHashMap<>();
    for (Map.Entry<String, Object> entry : flatMap.entrySet()) {
      String key = entry.getKey();
      int dashIdx = key.indexOf('-');
      if (dashIdx < 0) {
        // Full values override any dash-derived Map already created for this key
        Object existing = result.get(key);
        if (existing == null || existing instanceof Map) {
          result.put(key, entry.getValue());
        }
      } else {
        String prefix = key.substring(0, dashIdx);
        String rest = key.substring(dashIdx + 1);
        Object existing = result.get(prefix);
        // Skip dash-derived sub-entries when a full value (e.g. a List) already exists
        if (existing != null && !(existing instanceof Map)) {
          continue;
        }
        Map<String, Object> nested =
            (Map<String, Object>) result.computeIfAbsent(prefix, k -> new LinkedHashMap<>());
        nested.put(rest, entry.getValue());
      }
    }
    result.replaceAll((k, v) -> (v instanceof Map) ? unflatten((Map<String, Object>) v) : v);
    return result;
  }
}
