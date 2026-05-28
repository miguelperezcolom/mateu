package io.mateu.core.infra.reflection.write;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;
import lombok.SneakyThrows;

final class FallbackFieldSetter {

  @SneakyThrows
  static void set(Field field, Object target, Object value) {
    if (!java.lang.reflect.Modifier.isPublic(field.getModifiers())) {
      field.setAccessible(true);
    }
    try {
      value = coerce(field, value);
      field.set(target, value);
    } catch (Exception ignored) {
      field.set(target, null);
    }
  }

  private static Object coerce(Field field, Object value) {
    if (value != null && "".equals(value.toString())) {
      return String.class.equals(field.getType()) ? value : null;
    }
    if (value == null || "".equals(value.toString())) {
      return value;
    }
    if (Integer.class.equals(field.getType())) return Integer.valueOf(value.toString());
    if (Long.class.equals(field.getType())) return Long.valueOf(value.toString());
    if (Double.class.equals(field.getType())) return Double.valueOf(value.toString());
    if (BigInteger.class.equals(field.getType())) return new BigInteger(value.toString());
    if (BigDecimal.class.equals(field.getType())) return new BigDecimal(value.toString());
    if (java.sql.Date.class.equals(field.getType())) {
      return new java.sql.Date(
          LocalDateTime.parse(value.toString())
              .atZone(ZoneId.systemDefault())
              .toInstant()
              .toEpochMilli());
    }
    if (Date.class.equals(field.getType())) {
      return Date.from(
          LocalDateTime.parse(value.toString()).atZone(ZoneId.systemDefault()).toInstant());
    }
    if (ZonedDateTime.class.equals(field.getType())) {
      return LocalDateTime.parse(value.toString()).atZone(ZoneId.systemDefault());
    }
    return value;
  }

  private FallbackFieldSetter() {}
}
