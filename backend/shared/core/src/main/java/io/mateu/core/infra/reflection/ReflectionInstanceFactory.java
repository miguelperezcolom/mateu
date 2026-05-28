package io.mateu.core.infra.reflection;

import static io.mateu.core.infra.reflection.write.Hydrater.hydrate;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;
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
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
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
        Method builderMethod = null;
        try {
          builderMethod = c.getMethod("builder");
        } catch (Exception ignored) {

        }
        if (builderMethod != null) {
          Object builder = c.getMethod("builder").invoke(null);
          for (String key : data.keySet()) {
            var found =
                Arrays.stream(builder.getClass().getMethods())
                    .filter(m -> m.getName().equals(key))
                    .findFirst();
            if (found.isPresent()) {
              Method setter = found.get();
              setter.invoke(
                  builder,
                  createInstance(
                      setter.getParameterTypes()[0],
                      data.get(key),
                      httpRequest,
                      getGenericClass(setter.getGenericParameterTypes()[0])));
            }
          }
          o = (T) builder.getClass().getMethod("build").invoke(builder);
        } else {
          Constructor con = getConstructor(c);
          if (con != null) {
            if (con.getParameterCount() > 0) {
              o = (T) con.newInstance(buildConstructorParams(con, data, httpRequest));
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

  private Object[] buildConstructorParams(
      Constructor con, Map<String, Object> data, HttpRequest httpRequest)
      throws InvocationTargetException,
          IllegalAccessException,
          InstantiationException,
          NoSuchMethodException {
    List<Object> params = new ArrayList<>();
    for (Parameter parameter : con.getParameters()) {
      params.add(
          createInstance(
              parameter.getType(),
              data.get(parameter.getName()),
              httpRequest,
              getGenericClass(parameter.getParameterizedType())));
    }
    return params.toArray();
  }

  private Object createInstance(
      Class type, Object data, HttpRequest httpRequest, Class genericType) {
    return ReflectionTypeCoercer.coerce(type, data, httpRequest, genericType, this);
  }

  private Constructor getConstructor(Class type) {
    Constructor con = null;
    int minParams = Integer.MAX_VALUE;
    // look for public constructors
    for (Constructor x : type.getConstructors()) // public constructors
    if (Modifier.isPublic(x.getModifiers())) {
        if (x.getParameterCount() < minParams) {
          con = x;
          minParams = con.getParameterCount();
        }
      }
    // look for protected constructors
    if (con == null) {
      for (Constructor x : type.getDeclaredConstructors()) // public, protected and private
      if (Modifier.isProtected(x.getModifiers())) {
          if (x.getParameterCount() < minParams) {
            con = x;
            minParams = con.getParameterCount();
          }
        }
    }
    // look for private constructors
    if (con == null) {
      for (Constructor x : type.getDeclaredConstructors()) // public, protected and private
      if (x.getParameterCount() < minParams) {
          con = x;
          minParams = con.getParameterCount();
        }
    }
    if (con != null) {
      if (!Modifier.isPublic(con.getModifiers())) {
        con.setAccessible(true);
      }
    }
    return con;
  }
}
