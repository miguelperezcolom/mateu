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

    return Mono.just(loadClass(className))
        .map(uiClass -> newInstance(uiClass, newData, httpRequest))
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
}
