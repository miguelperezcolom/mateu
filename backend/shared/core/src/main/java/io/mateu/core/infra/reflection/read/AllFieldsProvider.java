package io.mateu.core.infra.reflection.read;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;

public final class AllFieldsProvider {

  // @Cacheable(initialValue = "all-fields-per-class")
  public static List<Field> getAllFields(Class c) {
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
