package io.mateu.springdata;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Converts a value from the wire (a String id, a Double where the attribute is a Long, an enum
 * name) to the Java type of the JPA attribute it is compared with — a criteria query compares typed
 * values, unlike the in-memory default store.
 */
final class Coercion {

  private Coercion() {}

  @SuppressWarnings({"unchecked", "rawtypes"})
  static Object to(Object value, Class<?> type) {
    if (value == null || type == null) {
      return value;
    }
    Class<?> target = wrap(type);
    if (target.isInstance(value)) {
      return value;
    }
    if (target == String.class) {
      return value instanceof Enum<?> e ? e.name() : value.toString();
    }
    if (target.isEnum()) {
      String name = value instanceof Enum<?> e ? e.name() : value.toString();
      return Enum.valueOf((Class<Enum>) target, name);
    }
    if (value instanceof Number number) {
      if (target == Long.class) return number.longValue();
      if (target == Integer.class) return number.intValue();
      if (target == Short.class) return number.shortValue();
      if (target == Byte.class) return number.byteValue();
      if (target == Double.class) return number.doubleValue();
      if (target == Float.class) return number.floatValue();
      if (target == BigDecimal.class) return new BigDecimal(number.toString());
      if (target == BigInteger.class) return BigInteger.valueOf(number.longValue());
      return value;
    }
    String text = value.toString().trim();
    if (target == Long.class) return Long.valueOf(text);
    if (target == Integer.class) return Integer.valueOf(text);
    if (target == Short.class) return Short.valueOf(text);
    if (target == Byte.class) return Byte.valueOf(text);
    if (target == Double.class) return Double.valueOf(text);
    if (target == Float.class) return Float.valueOf(text);
    if (target == BigDecimal.class) return new BigDecimal(text);
    if (target == BigInteger.class) return new BigInteger(text);
    if (target == Boolean.class) return Boolean.valueOf(text);
    if (target == UUID.class) return UUID.fromString(text);
    if (target == LocalDate.class) return LocalDate.parse(text);
    if (target == LocalDateTime.class) return LocalDateTime.parse(text);
    if (target == LocalTime.class) return LocalTime.parse(text);
    if (target == Instant.class) return Instant.parse(text);
    return value;
  }

  static Class<?> wrap(Class<?> type) {
    if (!type.isPrimitive()) return type;
    if (type == int.class) return Integer.class;
    if (type == long.class) return Long.class;
    if (type == double.class) return Double.class;
    if (type == float.class) return Float.class;
    if (type == boolean.class) return Boolean.class;
    if (type == short.class) return Short.class;
    if (type == byte.class) return Byte.class;
    if (type == char.class) return Character.class;
    return type;
  }
}
