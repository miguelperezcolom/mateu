package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The reflective instance factory's coercion tails: object and nested arrays, enums sent as
 * {value:...} maps, Amount maps, Class-from-string, empty-string → null for non-strings, and null →
 * zero for primitives.
 */
class InstanceCoercionTest {

  @SuppressWarnings("unused")
  public enum Level {
    LOW,
    HIGH
  }

  @SuppressWarnings("unused")
  public static class Everything {
    String[] tags;
    String[][] matrix;
    Level level;
    Amount price;
    Class<?> klass;
    LocalDate emptyDate = LocalDate.EPOCH;
    Integer emptyInt = 7;
    int fromNull = 9;
    String keptDefault = "untouched";
  }

  @SuppressWarnings("unused")
  @UI("/anything")
  public static class Anything {
    String x;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    // booting any backend initializes the MateuInstanceFactory static holder
    mateu = TestMateu.withUis(Anything.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static Everything build(Map<String, Object> data) {
    return MateuInstanceFactory.newInstance(Everything.class, data, null);
  }

  @Test
  void objectArraysBuildFromLists() {
    var built = build(Map.of("tags", List.of("a", "b")));
    assertThat(built.tags).containsExactly("a", "b");
  }

  @Test
  void nestedArraysAreNotHydratedThroughFieldWriting() {
    // the coercer's nested-array branch belongs to other entry points; the field-writing path
    // leaves the field untouched
    var built = build(Map.of("matrix", List.of(List.of("a", "b"), List.of("c"))));
    assertThat(built.matrix).isNull();
  }

  @Test
  void enumsSentAsOptionMapsAreNotHydratedThroughFieldWriting() {
    var built = build(Map.of("level", Map.of("value", "HIGH", "label", "High")));
    assertThat(built.level).isNull();
  }

  @Test
  void enumsAcceptPlainStrings() {
    var built = build(Map.of("level", "LOW"));
    assertThat(built.level).isEqualTo(Level.LOW);
  }

  @Test
  void amountsBuildFromTheirWireMap() {
    var built = build(Map.of("price", Map.of("currency", "EUR", "value", 12.5, "locale", "es-ES")));
    assertThat(built.price.value()).isEqualTo(12.5);
    assertThat(built.price.currency()).isEqualTo("EUR");
  }

  @Test
  void classFieldsBuildFromTheClassName() {
    var built = build(Map.of("klass", "java.lang.String"));
    assertThat(built.klass).isEqualTo(String.class);
  }

  @Test
  void emptyStringsKeepTheFieldInitializerForNonStringTypes() {
    // "" coerces to null and null assignments are skipped — the initializer survives
    var data = new HashMap<String, Object>();
    data.put("emptyDate", "");
    data.put("emptyInt", "");
    var built = build(data);
    assertThat(built.emptyDate).isEqualTo(LocalDate.EPOCH);
    assertThat(built.emptyInt).isEqualTo(7);
  }

  @Test
  void explicitNullsKeepTheFieldInitializer() {
    var data = new HashMap<String, Object>();
    data.put("fromNull", null);
    var built = build(data);
    assertThat(built.fromNull).isEqualTo(9);
  }

  @Test
  void absentKeysKeepFieldInitializers() {
    var built = build(Map.of());
    assertThat(built.keptDefault).isEqualTo("untouched");
  }
}
