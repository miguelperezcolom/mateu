package io.mateu.core.infra.reflection;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.infra.reflection.Hydrater.hydrate;
import static java.lang.Thread.currentThread;
import static org.apache.commons.beanutils.ConvertUtils.convert;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Hydratable;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.lang.reflect.Array;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import reactor.core.publisher.Mono;

@Singleton
@Named
@RequiredArgsConstructor
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

    return Mono.just(loadClass(className))
        .map(uiClass -> newInstance(uiClass, data, httpRequest))
        .map(uiInstance -> hydrateIfNeeded(uiInstance, httpRequest))
        .map(uiInstance -> initIfNeeded(uiInstance, httpRequest));
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

  private Object initIfNeeded(Object uiInstance, HttpRequest httpRequest) {
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
            Method setter =
                Arrays.stream(builder.getClass().getMethods())
                    .filter(m -> m.getName().equals(key))
                    .findFirst()
                    .get();
            setter.invoke(
                builder, createInstance(setter.getParameterTypes()[0], data.get(key), httpRequest));
          }
          o = (T) builder.getClass().getMethod("build").invoke(builder);
        } else {
          Constructor con = getConstructor(c);
          if (con != null) {
            if (con.getParameterCount() > 0) {
              o = (T) con.newInstance(buildConstructorParams(con, data, httpRequest));
            } else {
              o = (T) con.newInstance();
              o = hydrate(o, data, this, httpRequest);
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
      params.add(createInstance(parameter.getType(), data.get(parameter.getName()), httpRequest));
    }
    return params.toArray();
  }

  private Object createInstance(Class type, Object data, HttpRequest httpRequest) {
    if (isBasic(type)) {
      if (LocalDate.class.equals(type)) {
        return LocalDate.parse(convert(data));
      } else if (LocalDateTime.class.equals(type)) {
        return LocalDateTime.parse(convert(data));
      } else {
        return convert(data, type);
      }
    } else if (type.isEnum()) {
      return Enum.valueOf(type, (String) data);
    } else if (type.isArray()) {
      List<Object> values = new ArrayList<>();
      List<Map<String, Object>> datas = (List<Map<String, Object>>) data;
      datas.forEach(map -> values.add(newInstance(type.componentType(), map, httpRequest)));
      var array = Array.newInstance(type.componentType(), values.size());
      for (var i = 0; i < values.size(); i++) {
        ((Object[]) array)[i] = values.get(i);
      }
      return array;
    } else {
      return newInstance(type, (Map<String, Object>) data, httpRequest);
    }
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
