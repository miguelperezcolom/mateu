package io.mateu.core.application.openapi;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;

/**
 * Java and wire types as OpenAPI types.
 *
 * <p>It matters more than it looks: a parameter emitted as a bare {@code string} because nobody
 * looked at its declared type turns into a {@code String} in any server generated from the
 * document, and the implementer parses a date by hand. The type is already known — on the class
 * from the field's Java type, on the wire from the field's {@code dataType} — so emitting it is
 * free accuracy.
 */
final class SchemaTypes {

  /** An OpenAPI type and its optional format. */
  record SchemaType(String type, String format) {

    static final SchemaType STRING = new SchemaType("string", null);

    String asParamType() {
      return format == null ? type : type + ":" + format;
    }
  }

  private SchemaTypes() {}

  /** The OpenAPI type of a Java type. */
  static SchemaType of(Class<?> javaType) {
    if (javaType == null) {
      return SchemaType.STRING;
    }
    if (javaType == int.class
        || javaType == long.class
        || javaType == short.class
        || javaType == Integer.class
        || javaType == Long.class
        || javaType == Short.class
        || javaType == BigInteger.class) {
      return new SchemaType(
          "integer", javaType == long.class || javaType == Long.class ? "int64" : "int32");
    }
    if (javaType == double.class
        || javaType == float.class
        || javaType == Double.class
        || javaType == Float.class
        || javaType == BigDecimal.class) {
      return new SchemaType("number", javaType == BigDecimal.class ? null : "double");
    }
    if (javaType == boolean.class || javaType == Boolean.class) {
      return new SchemaType("boolean", null);
    }
    if (javaType == LocalDate.class) {
      return new SchemaType("string", "date");
    }
    if (javaType == LocalDateTime.class
        || javaType == Instant.class
        || javaType == OffsetDateTime.class
        || javaType == ZonedDateTime.class) {
      return new SchemaType("string", "date-time");
    }
    if (javaType == LocalTime.class) {
      return new SchemaType("string", "time");
    }
    return SchemaType.STRING;
  }

  /**
   * The OpenAPI type of a wire {@code dataType}. The values that describe a WIDGET rather than a
   * value ({@code component}, {@code menu}, {@code action}…) carry no type information, so they
   * fall back to string rather than inventing one.
   */
  static SchemaType ofWire(String dataType) {
    if (dataType == null) {
      return SchemaType.STRING;
    }
    return switch (dataType) {
      case "integer" -> new SchemaType("integer", "int64");
      case "number", "money" -> new SchemaType("number", "double");
      case "bool" -> new SchemaType("boolean", null);
      case "date" -> new SchemaType("string", "date");
      case "dateTime" -> new SchemaType("string", "date-time");
      case "time" -> new SchemaType("string", "time");
      case "array" -> new SchemaType("array", null);
      default -> SchemaType.STRING;
    };
  }

  /** The type recorded on a {@link RestCall.Param}, split back into type and format. */
  static SchemaType parse(String recorded) {
    if (recorded == null || recorded.isBlank()) {
      return SchemaType.STRING;
    }
    int separator = recorded.indexOf(':');
    return separator < 0
        ? new SchemaType(recorded, null)
        : new SchemaType(recorded.substring(0, separator), recorded.substring(separator + 1));
  }
}
