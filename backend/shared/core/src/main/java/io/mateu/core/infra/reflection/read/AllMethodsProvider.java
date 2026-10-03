package io.mateu.core.infra.reflection.read;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.ArrayList;
import java.util.List;

public final class AllMethodsProvider {

  /**
   * A class's methods never change, but this runs many times per request (every getter lookup,
   * every action dispatch) and is quadratic in the number of methods. Cached per class in a {@link
   * ClassValue}, which is stored on the class itself — so a redeployed/reloaded class is not pinned
   * by the cache.
   */
  private static final ClassValue<List<Method>> CACHE =
      new ClassValue<>() {
        @Override
        protected List<Method> computeValue(Class<?> type) {
          return List.copyOf(compute(type));
        }
      };

  /**
   * All the methods of {@code c} and its superclasses, overrides collapsed. A fresh, mutable list.
   */
  public static List<Method> getAllMethods(Class c) {

    if (c == null || c.equals(Class.class) || c.equals(Object.class) || c.equals(Record.class)) {
      return new ArrayList<>();
    }

    return new ArrayList<>(CACHE.get(c));
  }

  private static List<Method> compute(Class<?> c) {
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
