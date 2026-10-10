package io.mateu.core.infra.declarative.orchestrators.crud;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Map;

/** Reads a listing row's id (a map entry, a record accessor, a getter or a field). */
final class CrudRowIds {

  static Object idOf(Object row, String idField) {
    if (row == null || idField == null) {
      return null;
    }
    if (row instanceof Map<?, ?> map) {
      return map.get(idField);
    }
    for (var name :
        new String[] {
          idField, "get" + Character.toUpperCase(idField.charAt(0)) + idField.substring(1)
        }) {
      try {
        Method accessor = row.getClass().getMethod(name);
        accessor.setAccessible(true);
        return accessor.invoke(row);
      } catch (ReflectiveOperationException | RuntimeException ignored) {
        // try the next way in
      }
    }
    for (Class<?> type = row.getClass(); type != null; type = type.getSuperclass()) {
      try {
        Field field = type.getDeclaredField(idField);
        field.setAccessible(true);
        return field.get(row);
      } catch (ReflectiveOperationException | RuntimeException ignored) {
        // up the hierarchy
      }
    }
    return null;
  }

  private CrudRowIds() {}
}
