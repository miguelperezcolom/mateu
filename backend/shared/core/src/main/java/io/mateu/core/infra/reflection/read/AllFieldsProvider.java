package io.mateu.core.infra.reflection.read;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;

public final class AllFieldsProvider {

  /** Per-class cache (see {@code AllMethodsProvider}): a class's fields never change. */
  private static final ClassValue<List<Field>> CACHE =
      new ClassValue<>() {
        @Override
        protected List<Field> computeValue(Class<?> type) {
          return List.copyOf(compute(type));
        }
      };

  /** All the instance fields of {@code c} and its superclasses. A fresh, mutable list. */
  public static List<Field> getAllFields(Class c) {
    return new ArrayList<>(CACHE.get(c));
  }

  private static List<Field> compute(Class<?> c) {
    List<String> vistos = new ArrayList<>();
    Map<String, Field> originales = new HashMap<>();
    for (Field f : c.getDeclaredFields())
      if (!Logger.class.isAssignableFrom(f.getType())) {
        if (!f.getName().contains("$")
            && !"_proxied".equalsIgnoreCase(f.getName())
            && !"_possibleValues".equalsIgnoreCase(f.getName())
            && !"_binder".equalsIgnoreCase(f.getName())
            && !"_field".equalsIgnoreCase(f.getName())) originales.put(f.getName(), f);
      }

    List<Field> l = new ArrayList<>();

    if (c.getSuperclass() != null && !Object.class.equals(c.getSuperclass())) {
      for (Field f : getAllFields(c.getSuperclass())) {
        if (!originales.containsKey(f.getName())) l.add(f);
        else l.add(f);
        vistos.add(f.getName());
      }
    }

    for (Field f : c.getDeclaredFields())
      if (!Modifier.isStatic(f.getModifiers()))
        if (!Logger.class.isAssignableFrom(f.getType()))
          if (!vistos.contains(f.getName()))
            if (!f.getName().contains("$")
                && !"_proxied".equalsIgnoreCase(f.getName())
                && !"_possibleValues".equalsIgnoreCase(f.getName())
                && !"_binder".equalsIgnoreCase(f.getName())
                && !"_field".equalsIgnoreCase(f.getName())) {
              l.add(f);
            }

    return l;
  }
}
