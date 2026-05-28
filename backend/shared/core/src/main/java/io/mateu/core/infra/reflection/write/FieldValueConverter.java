package io.mateu.core.infra.reflection.write;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

final class FieldValueConverter {

  static Object convert(Object value, Class<?> targetType) throws Exception {
    if (value == null) {
      return null;
    }
    if (targetType.equals(value.getClass())) {
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
