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
    for (Class<?> c = o.getClass(); c != null && c != Object.class; c = c.getSuperclass()) {
      for (var field : c.getDeclaredFields()) {
        if (java.lang.reflect.Modifier.isStatic(field.getModifiers()) || field.isSynthetic()) {
          continue;
        }
        boolean injected = false;
        for (var annotation : field.getAnnotations()) {
          if (FIELD_INJECTION.contains(annotation.annotationType().getSimpleName())) {
            injected = true;
            break;
          }
        }
        if (!injected) {
          continue;
        }
        try {
          field.setAccessible(true);
          if (field.get(o) != null) {
            continue;
          }
          var bean = beanProvider.getBean(field.getType());
          if (bean != null) {
            field.set(o, bean);
          }
        } catch (RuntimeException | IllegalAccessException e) {
          log.warn(
              "Could not inject {}.{}: {}", c.getSimpleName(), field.getName(), e.getMessage());
        }
      }
    }
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
