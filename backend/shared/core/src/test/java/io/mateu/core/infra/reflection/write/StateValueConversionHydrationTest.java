package io.mateu.core.infra.reflection.write;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

/**
 * What the browser sends must land in the field TYPED — the write half of the state round trip. The
 * JS client sends numbers as JSON numbers (whole doubles integerized), dates and times as ISO
 * strings, enums as names, multi-selects as lists (or a comma-joined string after a URL restore),
 * and text inputs as strings. A conversion that throws is swallowed by hydration (logged once) and
 * the field silently keeps its initializer: the user's input is lost with nothing on screen.
 */
class StateValueConversionHydrationTest {

  enum Level {
    LOW,
    MID,
    HIGH
  }

  static class Form {
    int count = -1;
    Integer boxedCount = -1;
    long big = -1;
    double ratio = -1;
    Double boxedRatio = -1d;
    float weight = -1;
    BigDecimal amount = BigDecimal.ONE;
    boolean active = false;
    Boolean boxedActive = null;
    LocalDate day = null;
    LocalDateTime moment = null;
    LocalTime time = null;
    Level level = null;
    Set<Level> levels = null;
    EnumSet<Level> levelSet = null;
    List<Level> levelList = null;
    Level[] levelArray = null;
    String text = "initial";
  }

  private static Form hydrated(Map<String, Object> state) {
    return Hydrater.hydrate(new Form(), new HashMap<>(state), null, null);
  }

  @Test
  void numbersPourIntoEveryNumericFieldType() {
    var form =
        hydrated(
            Map.of(
                "count", 42,
                "boxedCount", 7,
                "big", 5_000_000_000L,
                "ratio", 343, // the client integerizes 343.0
                "boxedRatio", 2,
                "weight", 3,
                "amount", 1250));
    assertThat(form.count).isEqualTo(42);
    assertThat(form.boxedCount).isEqualTo(7);
    assertThat(form.big).isEqualTo(5_000_000_000L);
    assertThat(form.ratio).isEqualTo(343d);
    assertThat(form.boxedRatio).isEqualTo(2d);
    assertThat(form.weight).isEqualTo(3f);
    assertThat(form.amount).isEqualByComparingTo("1250");
  }

  @Test
  void numericStringsFromTextInputsAreParsed() {
    var form =
        hydrated(
            Map.of(
                "count", "42",
                "boxedCount", "7",
                "big", "5000000000",
                "ratio", "0.25",
                "boxedRatio", "1.5",
                "amount", "12.50"));
    assertThat(form.count).isEqualTo(42);
    assertThat(form.boxedCount).isEqualTo(7);
    assertThat(form.big).isEqualTo(5_000_000_000L);
    assertThat(form.ratio).isEqualTo(0.25d);
    assertThat(form.boxedRatio).isEqualTo(1.5d);
    assertThat(form.amount).isEqualByComparingTo("12.50");
  }

  @Test
  void booleansArriveAsBooleansOrStrings() {
    assertThat(hydrated(Map.of("active", true, "boxedActive", "true")).boxedActive).isTrue();
    assertThat(hydrated(Map.of("active", "true")).active).isTrue();
  }

  @Test
  void datesAndTimesArriveAsIsoStrings() {
    var form =
        hydrated(Map.of("day", "2026-08-19", "moment", "2026-08-19T10:30:00", "time", "10:30"));
    assertThat(form.day).isEqualTo(LocalDate.of(2026, 8, 19));
    assertThat(form.moment).isEqualTo(LocalDateTime.of(2026, 8, 19, 10, 30));
    assertThat(form.time).isEqualTo(LocalTime.of(10, 30));
  }

  @Test
  void anEnumArrivesByName() {
    assertThat(hydrated(Map.of("level", "HIGH")).level).isEqualTo(Level.HIGH);
  }

  @Test
  void aMultiSelectFillsEveryEnumCollectionTypeAndDropsStaleConstants() {
    var form =
        hydrated(
            Map.of(
                "levels", List.of("LOW", "HIGH"),
                "levelSet", List.of("MID"),
                "levelList", "LOW,MID",
                "levelArray", List.of("HIGH", "GONE")));
    assertThat(form.levels).containsExactlyInAnyOrder(Level.LOW, Level.HIGH);
    assertThat(form.levelSet).containsExactly(Level.MID);
    assertThat(form.levelList).containsExactly(Level.LOW, Level.MID);
    assertThat(form.levelArray).containsExactly(Level.HIGH);
  }

  @Test
  void aClearedPrimitiveGetsItsZeroAndAClearedTextStaysEmpty() {
    var form = hydrated(Map.of("count", "", "active", "", "ratio", " ", "text", ""));
    assertThat(form.count).isZero();
    assertThat(form.active).isFalse();
    assertThat(form.ratio).isZero();
    assertThat(form.text).isEmpty();
  }

  @Test
  void anyValueReachesAStringFieldAsText() {
    assertThat(hydrated(Map.of("text", 12)).text).isEqualTo("12");
  }
}
