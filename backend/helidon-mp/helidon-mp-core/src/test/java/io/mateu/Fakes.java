package io.mateu;

import java.lang.reflect.Proxy;
import java.util.Map;

/** JDK proxies answering the named methods; anything else answers null (false for a boolean). */
final class Fakes {

  private Fakes() {}

  @SuppressWarnings("unchecked")
  static <T> T fake(Class<T> type, Map<String, Object> answers) {
    return (T)
        Proxy.newProxyInstance(
            type.getClassLoader(),
            new Class<?>[] {type},
            (proxy, method, args) -> {
              switch (method.getName()) {
                case "hashCode":
                  return System.identityHashCode(proxy);
                case "equals":
                  return proxy == args[0];
                case "toString":
                  return type.getSimpleName() + "@fake";
                default:
                  break;
              }
              var answer = answers.get(method.getName());
              if (answer instanceof RuntimeException e) throw e;
              if (answer instanceof java.util.function.Function<?, ?> f
                  && !java.util.function.Function.class.isAssignableFrom(method.getReturnType())) {
                return ((java.util.function.Function<Object[], Object>) f).apply(args);
              }
              if (answer == null && method.getReturnType() == boolean.class) return false;
              return answer;
            });
  }
}
