package io.mateu.core.infra.reflection.read;

import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.GetterProvider.getGetter;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import lombok.extern.slf4j.Slf4j;

@Slf4j
final class NestedPathValueResolver {

  static Object getValue(String id, Object o)
      throws IllegalAccessException, InvocationTargetException {

    if (o == null) return null;

    Object v = null;

    if (id.contains(".")) {
      String firstId = id.substring(0, id.indexOf("."));
      String path = id.substring(id.indexOf(".") + 1);

      Field f = getFieldByName(o.getClass(), firstId);

      if (f != null) {
        Method getter = null;
        try {
          getter = o.getClass().getMethod(getGetter(f));
          if (!getter.getReturnType().isAssignableFrom(f.getType())) {
            getter = null;
          }
          if (getter != null) {
            getter.setAccessible(true);
          }
        } catch (Exception ignored) {
        }

        if (getter != null) v = getter.invoke(o);

        if (v != null) {
          v = getValue(path, v);
        }
      }

    } else {
      Field f = getFieldByName(o.getClass(), id);

      if (f != null) {
        Method getter = null;
        try {
          getter = o.getClass().getMethod(getGetter(f));
          getter.setAccessible(true);
        } catch (Exception e) {
          try {
            getter = o.getClass().getMethod(f.getName());
            getter.setAccessible(true);
          } catch (Exception ignored) {
          }
        }
        try {
          if (getter != null) v = getter.invoke(o);
        } catch (IllegalAccessException e) {
          try {
            f.setAccessible(true);
            v = f.get(o);
          } catch (IllegalAccessException e1) {
            log.error("Cannot access field {}", f.getName(), e1);
          }
          log.error("Cannot invoke getter for field {}", f.getName(), e);
        } catch (InvocationTargetException e) {
          log.error("Getter threw exception for field {}", f.getName(), e);
        }
      }
    }

    return v;
  }
}
