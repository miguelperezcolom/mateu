package io.mateu.core.domain;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class BasicTypeCheckerTest {

  final BasicTypeChecker checker = new BasicTypeChecker();

  @Test
  void returnsTrueForString() {
    assertTrue(checker.isBasic("hola"));
  }

  @Test
  void returnsTrueForInteger() {
    assertTrue(checker.isBasic(Integer.valueOf("123")));
  }

  @Test
  void returnsTrueForLong() {
    assertTrue(checker.isBasic(Long.valueOf("123")));
  }

  @Test
  void returnsTrueForFloat() {
    assertTrue(checker.isBasic(Float.valueOf("123")));
  }

  @Test
  void returnsTrueForDouble() {
    assertTrue(checker.isBasic(Double.valueOf("123")));
  }

  @Test
  void returnsTrueForBigDecimal() {
    assertTrue(checker.isBasic(BigDecimal.valueOf(123)));
  }

  @Test
  void returnsTrueForBoolean() {
    assertTrue(checker.isBasic(Boolean.valueOf("true")));
  }

  @Test
  void returnsTrueForLocalDate() {
    assertTrue(checker.isBasic(LocalDate.now()));
  }

  @Test
  void returnsTrueForLocalDateTime() {
    assertTrue(checker.isBasic(LocalDateTime.now()));
  }

  @Test
  void returnsTrueForPrimitiveInt() {
    assertTrue(checker.isBasic(int.class));
  }

  @Test
  void returnsTrueForPrimitiveLong() {
    assertTrue(checker.isBasic(long.class));
  }

  @Test
  void returnsTrueForPrimitiveFloat() {
    assertTrue(checker.isBasic(float.class));
  }

  @Test
  void returnsTrueForPrimitiveDouble() {
    assertTrue(checker.isBasic(double.class));
  }

  @Test
  void returnsTrueForPrimitiveBoolean() {
    assertTrue(checker.isBasic(boolean.class));
  }

  @Test
  void returnsFalseForObject() {
    assertFalse(checker.isBasic(new Object()));
  }

  @Test
  void returnsFalseForNull() {
    assertFalse(checker.isBasic(null));
  }
}
