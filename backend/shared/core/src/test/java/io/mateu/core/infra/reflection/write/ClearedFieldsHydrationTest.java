package io.mateu.core.infra.reflection.write;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * Emptying a field in the browser must empty it on the server.
 *
 * <p>A control that is cleared reports an empty string, and for anything that is not a String that
 * string is not a value — it is the absence of one. Parsing it instead ({@code
 * LocalDate.parse("")}, {@code Enum.valueOf(type, "")}, {@code new BigDecimal("")}) throws, and
 * hydration logs the failure at DEBUG and moves on, so the field silently keeps what it held: the
 * user clears a date, saves, and the old date is still there with nothing on screen saying so.
 * Absence has to survive the trip as absence.
 */
class ClearedFieldsHydrationTest {

  enum Level {
    LOW,
    HIGH
  }

  static class Booking {
    LocalDate departure = LocalDate.of(2026, 8, 19);
    Level level = Level.HIGH;
    Integer seats = 4;
    Long durationMs = 90L;
    BigDecimal price = new BigDecimal("25.50");
    String note = "kept as an empty string, because for a String empty IS a value";
  }

  private static Booking hydrated(Map<String, Object> state) {
    return Hydrater.hydrate(new Booking(), state, null, null);
  }

  private static Map<String, Object> cleared(String... fields) {
    var state = new HashMap<String, Object>();
    for (String field : fields) state.put(field, "");
    return state;
  }

  @Test
  void clearingADateClearsIt() {
    assertThat(hydrated(cleared("departure")).departure).isNull();
  }

  @Test
  void clearingASelectClearsIt() {
    assertThat(hydrated(cleared("level")).level).isNull();
  }

  @Test
  void clearingBoxedNumbersClearsThem() {
    var booking = hydrated(cleared("seats", "durationMs", "price"));
    assertThat(booking.seats).isNull();
    assertThat(booking.durationMs).isNull();
    assertThat(booking.price).isNull();
  }

  @Test
  void aBlankStringIsStillAValueForAStringField() {
    // The rule is about types that cannot hold an empty string, not about emptiness in general.
    assertThat(hydrated(cleared("note")).note).isEmpty();
  }

  @Test
  void whitespaceOnlyCountsAsCleared() {
    var state = new HashMap<String, Object>();
    state.put("departure", "   ");
    assertThat(hydrated(state).departure).isNull();
  }
}
