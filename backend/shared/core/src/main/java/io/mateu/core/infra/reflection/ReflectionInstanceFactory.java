package io.mateu.core.infra.reflection;

import static io.mateu.core.infra.reflection.write.Hydrater.hydrate;
import static java.lang.Thread.currentThread;

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
import lombok.SneakyThrows;
import reactor.core.publisher.Mono;

@Singleton
@Named
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class ReflectionInstanceFactory implements InstanceFactory {

  private final BeanProvider beanProvider;

  @Override
  public boolean supports(String className) {
    return true;
  }

  @SneakyThrows
  @Override
  public Mono<? extends Object> createInstance(
      String className, Map<String, Object> data, HttpRequest httpRequest) {

    var newData = new HashMap<>(data != null ? data : Map.of());
    httpRequest
        .getParameterNames()
        .forEach(
            paramName -> {
              try {
                if (!data.containsKey(paramName)) {
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

  private Class<?> loadClass(String className) throws ClassNotFoundException {
    try {
      return Class.forName(className);
    } catch (ClassNotFoundException e) {
      return currentThread().getContextClassLoader().loadClass(className);
    }
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

  @SneakyThrows
  public <T> T newInstance(Class<T> c, Map<String, Object> data, HttpRequest httpRequest) {
    var o = beanProvider.getBean(c);
    if (o == null) { // not from spring
      if (c.getDeclaringClass() != null) { // inner class
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
    } else {
      hydrate(o, data, this, httpRequest);
    }
    return (T) o;
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
        result.putIfAbsent(key, entry.getValue());
      } else {
        String prefix = key.substring(0, dashIdx);
        String rest = key.substring(dashIdx + 1);
        Map<String, Object> nested =
            (Map<String, Object>) result.computeIfAbsent(prefix, k -> new LinkedHashMap<>());
        nested.put(rest, entry.getValue());
      }
    }
    result.replaceAll((k, v) -> (v instanceof Map) ? unflatten((Map<String, Object>) v) : v);
    return result;
  }
}
