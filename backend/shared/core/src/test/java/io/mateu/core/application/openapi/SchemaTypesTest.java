package io.mateu.core.application.openapi;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.UUID;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;

/**
 * The OpenAPI type a parameter or field is declared with in the derived contract — from its Java
 * type (annotated views) or from the wire's dataType (YAML/bundle) — and the compact "type:format"
 * form the call model records them in.
 */
class SchemaTypesTest {

  static Stream<Arguments> javaTypes() {
    return Stream.of(
        Arguments.of(int.class, "integer:int32"),
        Arguments.of(Integer.class, "integer:int32"),
        Arguments.of(short.class, "integer:int32"),
        Arguments.of(Short.class, "integer:int32"),
        Arguments.of(BigInteger.class, "integer:int32"),
        Arguments.of(long.class, "integer:int64"),
        Arguments.of(Long.class, "integer:int64"),
        Arguments.of(double.class, "number:double"),
        Arguments.of(Double.class, "number:double"),
        Arguments.of(float.class, "number:double"),
        Arguments.of(Float.class, "number:double"),
        Arguments.of(BigDecimal.class, "number"),
        Arguments.of(boolean.class, "boolean"),
        Arguments.of(Boolean.class, "boolean"),
        Arguments.of(LocalDate.class, "string:date"),
        Arguments.of(LocalDateTime.class, "string:date-time"),
        Arguments.of(Instant.class, "string:date-time"),
        Arguments.of(OffsetDateTime.class, "string:date-time"),
        Arguments.of(ZonedDateTime.class, "string:date-time"),
        Arguments.of(LocalTime.class, "string:time"),
        Arguments.of(String.class, "string"),
        Arguments.of(UUID.class, "string"));
  }

  @ParameterizedTest
  @MethodSource("javaTypes")
  void aJavaTypeMapsToItsOpenApiTypeAndFormat(Class<?> javaType, String expected) {
    assertThat(SchemaTypes.of(javaType).asParamType()).isEqualTo(expected);
  }

  @ParameterizedTest
  @CsvSource({
    "integer, integer:int64",
    "number, number:double",
    "money, number:double",
    "bool, boolean",
    "date, string:date",
    "dateTime, string:date-time",
    "time, string:time",
    "array, array",
    "status, string",
    "string, string"
  })
  void aWireDataTypeMapsToItsOpenApiTypeAndFormat(String dataType, String expected) {
    assertThat(SchemaTypes.ofWire(dataType).asParamType()).isEqualTo(expected);
  }

  @Test
  void anUnknownTypeIsAString() {
    assertThat(SchemaTypes.of(null)).isEqualTo(SchemaTypes.SchemaType.STRING);
    assertThat(SchemaTypes.ofWire(null)).isEqualTo(SchemaTypes.SchemaType.STRING);
  }

  @Test
  void theRecordedFormRoundTrips() {
    assertThat(SchemaTypes.parse("integer:int64"))
        .isEqualTo(new SchemaTypes.SchemaType("integer", "int64"));
    assertThat(SchemaTypes.parse("boolean")).isEqualTo(new SchemaTypes.SchemaType("boolean", null));
    assertThat(SchemaTypes.parse(" ")).isEqualTo(SchemaTypes.SchemaType.STRING);
    assertThat(SchemaTypes.parse(null)).isEqualTo(SchemaTypes.SchemaType.STRING);
  }
}
