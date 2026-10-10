package io.mateu.core.infra.reflection.write;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

final class FieldValueConverter {

  /**
   * A List/Set (or array) of enum constants receives what the client sends for a multi-choice
   * widget — a list of names, or a comma-joined string after a URL restore — and needs the
   * CONSTANTS in the collection type the field declares. Without this a Set field could not be
   * filled from a list at all (the conversion threw, hydration swallowed it and the field kept its
   * initializer) and a List field ended up holding raw strings. Anything else is left untouched.
   */
  @SuppressWarnings({"unchecked", "rawtypes"})
  static Object convertEnumCollection(java.lang.reflect.Field field, Object value) {
    if (value == null) return null;
    Class<?> type = field.getType();
    Class<?> element = null;
    if (type.isArray() && type.getComponentType().isEnum()) element = type.getComponentType();
    else if (java.util.Collection.class.isAssignableFrom(type)
        && field.getGenericType() instanceof java.lang.reflect.ParameterizedType p
        && p.getActualTypeArguments().length == 1
        && p.getActualTypeArguments()[0] instanceof Class<?> c
        && c.isEnum()) element = c;
    if (element == null) return value;
    java.util.Collection<?> raw;
    if (value instanceof java.util.Collection<?> collection) raw = collection;
    else if (value instanceof String string)
      raw = string.isBlank() ? List.of() : java.util.Arrays.asList(string.split(","));
    else if (value.getClass().isArray()) raw = java.util.Arrays.asList((Object[]) value);
    else return value;
    var constants = new java.util.ArrayList<Object>();
    for (Object item : raw) {
      if (item == null) continue;
      if (element.isInstance(item)) {
        constants.add(item);
        continue;
      }
      try {
        constants.add(Enum.valueOf((Class<Enum>) element, String.valueOf(item).trim()));
      } catch (IllegalArgumentException staleConstant) {
        // a constant that no longer exists (an old saved view, a renamed value) is dropped
      }
    }
    if (type.isArray()) {
      Object array = java.lang.reflect.Array.newInstance(element, constants.size());
      for (int i = 0; i < constants.size(); i++)
        java.lang.reflect.Array.set(array, i, constants.get(i));
      return array;
    }
    if (java.util.Set.class.isAssignableFrom(type)) {
      if (java.util.EnumSet.class.isAssignableFrom(type)) {
        var set = java.util.EnumSet.noneOf((Class<Enum>) element);
        constants.forEach(c -> set.add((Enum) c));
        return set;
      }
      return new java.util.LinkedHashSet<>(constants);
    }
    return constants;
  }

  static Object convert(Object value, Class<?> targetType) throws Exception {
    if (value == null) {
      return null;
    }
    // Same rule as the read side (TypeCoercionHelper): a blank string aimed at anything that
    // is not a String is an absence, not a value, and parsing it would throw and be swallowed
    // by hydration — leaving the field holding exactly what the user just cleared, with
    // nothing on screen saying so. A primitive cannot hold an absence, so it gets its zero.
    if (value instanceof String string && string.isBlank() && !String.class.equals(targetType)) {
      if (int.class.equals(targetType)) return 0;
      if (long.class.equals(targetType)) return 0L;
      if (float.class.equals(targetType)) return 0f;
      if (double.class.equals(targetType)) return 0.0;
      if (boolean.class.equals(targetType)) return false;
      return null;
    }
    if (targetType.equals(value.getClass())) {
      return value;
    }
    // an already-assignable value needs no conversion — e.g. a LinkedHashSet assembled by
    // FilterStateAssembler pouring into a Set<SomeEnum> filter field (primitives are unaffected:
    // isInstance is always false for them)
    if (targetType.isInstance(value)) {
      return value;
    }
    if (int.class.equals(targetType) && value instanceof Integer integer) {
      return integer.intValue();
    }
    if (long.class.equals(targetType) && value instanceof Long aLong) {
      return aLong.longValue();
    }
    if (float.class.equals(targetType) && value instanceof Float aFloat) {
      return aFloat.floatValue();
    }
    if (double.class.equals(targetType) && value instanceof Double aDouble) {
      return aDouble.doubleValue();
    }
    if (boolean.class.equals(targetType) && value instanceof Boolean aBoolean) {
      return aBoolean.booleanValue();
    }
    if (Integer.class.equals(targetType) && int.class.equals(value.getClass())) {
      return value;
    }
    if (Long.class.equals(targetType) && long.class.equals(value.getClass())) {
      return value;
    }
    if (Float.class.equals(targetType) && float.class.equals(value.getClass())) {
      return value;
    }
    if (Double.class.equals(targetType) && double.class.equals(value.getClass())) {
      return value;
    }
    if (Boolean.class.equals(targetType) && boolean.class.equals(value.getClass())) {
      return value;
    }
    // numeric widening — the JS client integerizes whole doubles (343.0 travels as 343), so an
    // Integer/Long arriving in the state must pour into Double/Float/BigDecimal/long fields
    if (value instanceof Number number) {
      if (double.class.equals(targetType) || Double.class.equals(targetType)) {
        return number.doubleValue();
      }
      if (float.class.equals(targetType) || Float.class.equals(targetType)) {
        return number.floatValue();
      }
      if (long.class.equals(targetType) || Long.class.equals(targetType)) {
        return number.longValue();
      }
      if (BigDecimal.class.equals(targetType)) {
        return new BigDecimal(number.toString());
      }
    }
    if (String.class.equals(targetType)) {
      return value.toString();
    }
    if (value instanceof String string) {
      if (int.class.equals(targetType)) {
        return Integer.valueOf(string).intValue();
      }
      if (long.class.equals(targetType)) {
        return Long.valueOf(string).longValue();
      }
      if (float.class.equals(targetType)) {
        return Float.valueOf(string).floatValue();
      }
      if (double.class.equals(targetType)) {
        return Double.valueOf(string).doubleValue();
      }

      if (Integer.class.equals(targetType)) {
        return Integer.valueOf(string);
      }
      if (Long.class.equals(targetType)) {
        return Long.valueOf(string);
      }
      if (Float.class.equals(targetType)) {
        return Float.valueOf(string);
      }
      if (Double.class.equals(targetType)) {
        return Double.valueOf(string);
      }

      if (boolean.class.equals(targetType)) {
        return Boolean.valueOf(string).booleanValue();
      }
      if (Boolean.class.equals(targetType)) {
        return Boolean.valueOf(string);
      }

      if (LocalDate.class.equals(targetType)) {
        return LocalDate.parse(string, DateTimeFormatter.ISO_LOCAL_DATE);
      }
      if (LocalDateTime.class.equals(targetType)) {
        return LocalDateTime.parse(string, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
      }
    }
    if (List.class.equals(targetType)) {
      if (value instanceof List list) {
        return list;
      }
    }
    if (Map.class.equals(targetType)) {
      if (value instanceof Map map) {
        return map;
      }
    }

    throw new Exception(
        "Conversion from "
            + value.getClass().getSimpleName()
            + " to "
            + targetType.getSimpleName()
            + " is not supported.");
  }
}
