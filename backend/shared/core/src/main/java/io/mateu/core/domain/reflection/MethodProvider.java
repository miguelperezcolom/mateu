package io.mateu.core.domain.reflection;

import java.lang.reflect.Method;

public class MethodProvider {

  private final AllMethodsProvider allMethodsProvider = new AllMethodsProvider();

  public Method getMethod(Class<?> c, String methodName) {
    Method m = null;
    if (c != null) {
      for (Method q : allMethodsProvider.getAllMethods(c)) {
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
