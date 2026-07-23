package io.mateu.core.infra.declarative.orchestrators.crud;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class CrudIdConverterTest {

  enum Color {
    red,
    green
  }

  /** A value-object id with a single-String constructor. */
  static final class Sku {
    final String value;

    Sku(String value) {
      this.value = value;
    }

    @Override
    public boolean equals(Object o) {
      return o instanceof Sku s && s.value.equals(value);
    }

    @Override
    public int hashCode() {
      return value.hashCode();
    }
  }

  /** No String constructor and not a known scalar. */
  static final class Opaque {
    Opaque(int ignored) {}
  }

  @Test
  void stringIsIdentity() {
    assertEquals("abc", CrudIdConverter.convert("abc", String.class, getClass()));
  }

  @Test
  void objectAndCharSequenceSupertypesAreIdentity() {
    assertEquals("abc", CrudIdConverter.convert("abc", Object.class, getClass()));
    assertEquals("abc", CrudIdConverter.convert("abc", CharSequence.class, getClass()));
  }

  @Test
  void nullIdOrNullClassPassesThrough() {
    assertEquals(null, CrudIdConverter.convert(null, Long.class, getClass()));
    assertEquals("x", CrudIdConverter.convert("x", null, getClass()));
  }

  @Test
  void knownScalars() {
    assertEquals(42, CrudIdConverter.convert("42", Integer.class, getClass()));
    assertEquals(42L, CrudIdConverter.convert("42", Long.class, getClass()));
    assertEquals(3.5d, CrudIdConverter.convert("3.5", Double.class, getClass()));
    assertEquals(true, CrudIdConverter.convert("true", Boolean.class, getClass()));
    assertEquals(new BigInteger("10"), CrudIdConverter.convert("10", BigInteger.class, getClass()));
    assertEquals(
        new BigDecimal("1.5"), CrudIdConverter.convert("1.5", BigDecimal.class, getClass()));
    assertEquals('a', CrudIdConverter.convert("a", Character.class, getClass()));
  }

  @Test
  void uuidAndEnum() {
    var uuid = UUID.randomUUID();
    assertEquals(uuid, CrudIdConverter.convert(uuid.toString(), UUID.class, getClass()));
    assertEquals(Color.green, CrudIdConverter.convert("green", Color.class, getClass()));
  }

  @Test
  void singleStringConstructor() {
    assertEquals(new Sku("K-1"), CrudIdConverter.convert("K-1", Sku.class, getClass()));
  }

  @Test
  void unparseableScalarThrowsIllegalArgument() {
    assertThrows(
        IllegalArgumentException.class,
        () -> CrudIdConverter.convert("notanumber", Long.class, getClass()));
    assertThrows(
        IllegalArgumentException.class,
        () -> CrudIdConverter.convert("ab", Character.class, getClass()));
    assertThrows(
        IllegalArgumentException.class,
        () -> CrudIdConverter.convert("purple", Color.class, getClass()));
  }

  @Test
  void unconvertibleTypeThrowsUnsupportedWithGuidance() {
    var ex =
        assertThrows(
            UnsupportedOperationException.class,
            () -> CrudIdConverter.convert("1", Opaque.class, getClass()));
    org.junit.jupiter.api.Assertions.assertTrue(ex.getMessage().contains("must override toId"));
  }
}
