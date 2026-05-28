package io.mateu.core.infra.reflection;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Map;
import lombok.SneakyThrows;

final class BuilderInstantiator {

  @SneakyThrows
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
  }

  private BuilderInstantiator() {}
}
