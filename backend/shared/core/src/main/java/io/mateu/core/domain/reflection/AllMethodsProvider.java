package io.mateu.core.domain.reflection;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.ArrayList;
import java.util.List;

public final class AllMethodsProvider {

  public static List<Method> getAllMethods(Class c) {

    if (c == null || c.equals(Class.class) || c.equals(Object.class) || c.equals(Record.class)) {
      return new ArrayList<>();
    }

    List<Method> l = new ArrayList<>();

    if (c.getSuperclass() != null) l.addAll(getAllMethods(c.getSuperclass()));

    for (Method f : c.getDeclaredMethods()) {
      if (!f.getDeclaringClass().equals(Object.class)) {
        l.removeIf(m -> getSignature(m).equals(getSignature(f)));
        l.add(f);
      }
    }

    return l;
  }

  private static String getSignature(Method m) {
    return m.getGenericReturnType().getTypeName()
        + " "
        + m.getName()
        + "("
        + getSignature(m.getParameters())
        + ")";
  }

  private static String getSignature(Parameter[] parameters) {
    StringBuilder s = new StringBuilder();
    if (parameters != null)
      for (Parameter p : parameters) {
        if (!s.isEmpty()) s.append(", ");
        s.append(p.getType().getName());
      }
    return s.toString();
  }
}
