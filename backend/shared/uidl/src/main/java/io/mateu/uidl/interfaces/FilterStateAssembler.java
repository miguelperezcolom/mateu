package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.DateRange;
import io.mateu.uidl.data.NumberRange;
import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Assembles the TYPED filter fields of a Filters class back from the flat component state before
 * hydration: the smart search bar writes a {@link DateRange}/{@link NumberRange} filter as {@code
 * <field>_from}/{@code <field>_to} keys and a {@code Set}-of-enum multi-select as a value list (or
 * a comma-joined string after a URL restore) — none of which the instance factory can pour into the
 * typed field. This helper replaces those raw entries with ready-made {@code DateRange}/{@code
 * NumberRange}/{@code Set} instances (which type coercion passes through untouched), so {@code
 * search(...)} receives the Filters object fully hydrated. Fields of other types are left alone.
 */
public final class FilterStateAssembler {

  public static Map<String, Object> assemble(Class<?> filtersClass, Map<String, Object> state) {
    if (filtersClass == null
        || state == null
        || state.isEmpty()
        || Map.class.isAssignableFrom(filtersClass)) {
      return state;
    }
    Map<String, Object> assembled = new HashMap<>(state);
    for (Class<?> type = filtersClass;
        type != null && !Object.class.equals(type);
        type = type.getSuperclass()) {
      for (Field field : type.getDeclaredFields()) {
        if (DateRange.class.equals(field.getType())) {
          Object from = blankToNull(assembled.remove(field.getName() + "_from"));
          Object to = blankToNull(assembled.remove(field.getName() + "_to"));
          if (from != null || to != null) {
            assembled.put(field.getName(), new DateRange(toLocalDate(from), toLocalDate(to)));
          }
        } else if (NumberRange.class.equals(field.getType())) {
          Object from = blankToNull(assembled.remove(field.getName() + "_from"));
          Object to = blankToNull(assembled.remove(field.getName() + "_to"));
          if (from != null || to != null) {
            assembled.put(field.getName(), new NumberRange(toDouble(from), toDouble(to)));
          }
        } else if (enumSetElementType(field) != null) {
          Object value = assembled.get(field.getName());
          if (value != null && !(value instanceof Set)) {
            Set<Object> set = toEnumSet(enumSetElementType(field), value);
            if (set.isEmpty()) {
              assembled.remove(field.getName());
            } else {
              assembled.put(field.getName(), set);
            }
          }
        }
      }
    }
    return assembled;
  }

  /** The enum element class of a {@code Set<SomeEnum>} field, or null for any other shape. */
  public static Class<?> enumSetElementType(Field field) {
    if (!Set.class.isAssignableFrom(field.getType())) {
      return null;
    }
    if (field.getGenericType() instanceof ParameterizedType parameterized
        && parameterized.getActualTypeArguments().length == 1
        && parameterized.getActualTypeArguments()[0] instanceof Class<?> element
        && element.isEnum()) {
      return element;
    }
    return null;
  }

  private static Object blankToNull(Object value) {
    if (value instanceof String s && s.isBlank()) {
      return null;
    }
    return value;
  }

  private static LocalDate toLocalDate(Object value) {
    if (value == null) {
      return null;
    }
    if (value instanceof LocalDate date) {
      return date;
    }
    String text = value.toString().trim();
    try {
      return LocalDate.parse(text);
    } catch (DateTimeParseException e) {
      try {
        return LocalDateTime.parse(text).toLocalDate();
      } catch (DateTimeParseException ignored) {
        // an unparseable bound (e.g. a mangled URL param) is dropped rather than breaking search
        return null;
      }
    }
  }

  private static Double toDouble(Object value) {
    if (value == null) {
      return null;
    }
    if (value instanceof Number number) {
      return number.doubleValue();
    }
    try {
      return Double.parseDouble(value.toString().trim());
    } catch (NumberFormatException e) {
      return null;
    }
  }

  @SuppressWarnings({"unchecked", "rawtypes"})
  private static Set<Object> toEnumSet(Class<?> enumType, Object value) {
    List<?> raw =
        value instanceof List<?> list
            ? list
            : Arrays.stream(value.toString().split(",")).map(String::trim).toList();
    Set<Object> set = new LinkedHashSet<>();
    for (Object item : raw) {
      if (item == null || item.toString().isBlank()) {
        continue;
      }
      try {
        set.add(Enum.valueOf((Class<? extends Enum>) enumType, item.toString().trim()));
      } catch (IllegalArgumentException ignored) {
        // a stale value (renamed constant in an old URL) is skipped rather than breaking search
      }
    }
    return set;
  }

  private FilterStateAssembler() {}
}
