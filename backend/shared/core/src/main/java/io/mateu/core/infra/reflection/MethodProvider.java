package io.mateu.core.infra.reflection;

import static io.mateu.core.infra.reflection.AllMethodsProvider.getAllMethods;

import java.lang.reflect.Method;

public final class MethodProvider {

  public static Method getMethod(Class<?> c, String methodName) {
    Method m = null;
    if (c != null) {
      for (Method q : getAllMethods(c)) {
        if (methodName.equals(q.getName())) {
          m = q;
          break;
        }
      }
      if (m == null) {
        for (Method q : c.getMethods()) {
          if (methodName.equals(q.getName())) {
            m = q;
            break;
          }
        }
      }
    }
    return m;
  }
}
