package io.mateu.core.domain;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class BasicTypeCheckerTest {

  @Test
  void returnsTrueForString() {
    assertTrue(isBasic("hola"));
  }

  @Test
  void returnsTrueForInteger() {
    assertTrue(isBasic(Integer.valueOf("123")));
  }

  @Test
  void returnsTrueForLong() {
    assertTrue(isBasic(Long.valueOf("123")));
  }

  @Test
  void returnsTrueForFloat() {
    assertTrue(isBasic(Float.valueOf("123")));
  }

  @Test
  void returnsTrueForDouble() {
    assertTrue(isBasic(Double.valueOf("123")));
  }

  @Test
  void returnsTrueForBigDecimal() {
    assertTrue(isBasic(BigDecimal.valueOf(123)));
  }

  @Test
  void returnsTrueForBoolean() {
    assertTrue(isBasic(Boolean.valueOf("true")));
  }

  @Test
  void returnsTrueForLocalDate() {
    assertTrue(isBasic(LocalDate.now()));
  }

  @Test
  void returnsTrueForLocalDateTime() {
    assertTrue(isBasic(LocalDateTime.now()));
  }

  @Test
  void returnsTrueForPrimitiveInt() {
    assertTrue(isBasic(int.class));
  }

  @Test
  void returnsTrueForPrimitiveLong() {
    assertTrue(isBasic(long.class));
  }

  @Test
  void returnsTrueForPrimitiveFloat() {
    assertTrue(isBasic(float.class));
  }

  @Test
  void returnsTrueForPrimitiveDouble() {
    assertTrue(isBasic(double.class));
  }

  @Test
  void returnsTrueForPrimitiveBoolean() {
    assertTrue(isBasic(boolean.class));
  }

  @Test
  void returnsFalseForObject() {
    assertFalse(isBasic(new Object()));
  }

  @Test
  void returnsFalseForNull() {
    assertFalse(isBasic(null));
  }
}
