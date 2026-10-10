package io.mateu.uidl.data;

import java.util.Map;

/**
 * A column of a listing export: the row property it reads ({@code id}) and its header text ({@code
 * label}). Mateu decides which columns are exported (the visible row fields, in declaration order,
 * labelled like the grid); the exporter only lays them out.
 *
 * @param id the row property (field / record component / map key)
 * @param label the header text
 */
public record ExportColumn(String id, String label) {

  /**
   * The raw value of this column on {@code row}: a map entry, a record accessor / public no-arg
   * method, a getter or the field itself, in that order; null when the row has no such property.
   */
  public Object valueOf(Object row) {
    if (row == null || id == null || id.isEmpty()) return null;
    if (row instanceof Map<?, ?> map) return map.get(id);
    var type = row.getClass();
    try {
      return type.getMethod(id).invoke(row);
    } catch (ReflectiveOperationException | RuntimeException ignored) {
      // not a record accessor
    }
    try {
      return type.getMethod("get" + Character.toUpperCase(id.charAt(0)) + id.substring(1))
          .invoke(row);
    } catch (ReflectiveOperationException | RuntimeException ignored) {
      // no getter
    }
    for (var current = type; current != null; current = current.getSuperclass()) {
      try {
        var field = current.getDeclaredField(id);
        field.setAccessible(true);
        return field.get(row);
      } catch (ReflectiveOperationException | RuntimeException ignored) {
        // keep looking up the hierarchy
      }
    }
    return null;
  }

  /** {@link #valueOf(Object)} as text: an empty string for null, {@code toString()} otherwise. */
  public String textOf(Object row) {
    var value = valueOf(row);
    return value != null ? value.toString() : "";
  }
}
