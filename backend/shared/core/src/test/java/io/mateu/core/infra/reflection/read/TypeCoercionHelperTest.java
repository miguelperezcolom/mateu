package io.mateu.core.infra.reflection.read;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import io.mateu.core.domain.ports.InstanceFactory;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

/**
 * The READ side of the state round trip: a value as JSON delivers it (numbers of whatever boxed
 * type — the JS client integerizes whole doubles —, strings, maps) coerced into the type a field or
 * parameter declares. A blank text is an absence, which a primitive reads as its zero.
 */
class TypeCoercionHelperTest {

  enum Level {
    LOW,
    HIGH
  }

  public static class Address {
    public String street;
  }

  private static Object coerce(Class<?> type, Object value) throws Exception {
    return TypeCoercionHelper.getActualValue(type, value, null, null);
  }

  @Test
  void anyJsonNumberPoursIntoAnyNumericType() throws Exception {
    assertThat(coerce(double.class, 343)).isEqualTo(343.0);
    assertThat(coerce(Double.class, 2L)).isEqualTo(2.0);
    assertThat(coerce(float.class, 3)).isEqualTo(3f);
    assertThat(coerce(Float.class, 1.5d)).isEqualTo(1.5f);
    assertThat(coerce(BigDecimal.class, 1250)).isEqualTo(new BigDecimal("1250"));
    assertThat(coerce(int.class, 7L)).isEqualTo(7);
    assertThat(coerce(Integer.class, 7.0d)).isEqualTo(7);
    assertThat(coerce(long.class, 5)).isEqualTo(5L);
    assertThat(coerce(Long.class, 5)).isEqualTo(5L);
  }

  @Test
  void aBlankTextIsAnAbsenceAndAPrimitiveReadsItsZero() throws Exception {
    assertThat(coerce(int.class, " ")).isEqualTo(0);
    assertThat(coerce(long.class, "")).isEqualTo(0L);
    assertThat(coerce(float.class, null)).isEqualTo(0f);
    assertThat(coerce(double.class, null)).isEqualTo(0.0);
    assertThat(coerce(boolean.class, "")).isEqualTo(false);
    assertThat(coerce(Integer.class, "")).isNull();
    assertThat(coerce(String.class, " ")).isEqualTo(" ");
  }

  @Test
  void textIsParsedIntoTheDeclaredType() throws Exception {
    assertThat(coerce(int.class, "42")).isEqualTo(42);
    assertThat(coerce(long.class, "42")).isEqualTo(42L);
    assertThat(coerce(double.class, "4.5")).isEqualTo(4.5);
    assertThat(coerce(float.class, "4.5")).isEqualTo(4.5f);
    assertThat(coerce(boolean.class, "true")).isEqualTo(true);
    assertThat(coerce(Boolean.class, "false")).isEqualTo(false);
    assertThat(coerce(Integer.class, "1")).isEqualTo(1);
    assertThat(coerce(Long.class, "1")).isEqualTo(1L);
    assertThat(coerce(Double.class, "1.25")).isEqualTo(1.25);
    assertThat(coerce(Float.class, "1.25")).isEqualTo(1.25f);
    assertThat(coerce(BigDecimal.class, "19.99")).isEqualTo(new BigDecimal("19.99"));
    assertThat(coerce(LocalDate.class, "2024-02-29")).isEqualTo(LocalDate.of(2024, 2, 29));
    assertThat(coerce(LocalDateTime.class, "2024-02-29T10:15"))
        .isEqualTo(LocalDateTime.of(2024, 2, 29, 10, 15));
    assertThat(coerce(LocalTime.class, "09:30")).isEqualTo(LocalTime.of(9, 30));
    var id = UUID.randomUUID();
    assertThat(coerce(UUID.class, id.toString())).isEqualTo(id);
    assertThat(coerce(Level.class, "HIGH")).isEqualTo(Level.HIGH);
    assertThat(coerce(Class.class, String.class.getName())).isEqualTo(String.class);
    assertThat(coerce(String.class, "same")).isEqualTo("same");
  }

  @Test
  void aMapIsBuiltIntoTheDeclaredTypeByTheInstanceFactoryAndAnythingElsePassesThrough()
      throws Exception {
    var factory = mock(InstanceFactory.class);
    var built = new Address();
    built.street = "Main";
    when(factory.createInstance(eq(Address.class.getName()), any(), any()))
        .thenReturn((Mono) Mono.just(built));
    assertThat(
            TypeCoercionHelper.getActualValue(
                Address.class, Map.of("street", "Main"), factory, null))
        .isSameAs(built);

    var list = java.util.List.of("a");
    assertThat(coerce(java.util.Collection.class, list)).isSameAs(list);
  }
}
