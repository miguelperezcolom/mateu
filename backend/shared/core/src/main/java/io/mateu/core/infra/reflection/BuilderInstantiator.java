package io.mateu.core.infra.reflection;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Map;

final class BuilderInstantiator {

  static <T> T tryInstantiate(
      Class<T> c,
      Map<String, Object> data,
      HttpRequest httpRequest,
      ReflectionInstanceFactory factory) {
    Method builderMethod = null;
    try {
      builderMethod = c.getMethod("builder");
    } catch (Exception ignored) {
    }
    if (builderMethod == null) return null;

    try {
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
              ReflectionTypeCoercer.coerce(
                  setter.getParameterTypes()[0],
                  data.get(key),
                  httpRequest,
                  getGenericClass(setter.getGenericParameterTypes()[0]),
                  factory));
        }
      }
      return (T) builder.getClass().getMethod("build").invoke(builder);
    } catch (InvocationTargetException e) {
      // a builder/setter/build method (user code) threw — surface its real cause
      var cause = e.getCause() != null ? e.getCause() : e;
      if (cause instanceof RuntimeException re) {
        throw re;
      }
      if (cause instanceof Error err) {
        throw err;
      }
      throw new RuntimeException(cause);
    } catch (ReflectiveOperationException e) {
      throw new RuntimeException("Cannot build " + c.getName(), e);
    }
  }

  private BuilderInstantiator() {}
}
