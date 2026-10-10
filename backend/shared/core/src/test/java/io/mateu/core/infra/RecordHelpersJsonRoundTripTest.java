package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.uidl.data.DateRange;
import io.mateu.uidl.data.LayoutDelta;
import io.mateu.uidl.data.NumberRange;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * Records with an {@code isEmpty()} helper: Jackson reads an {@code isX()} accessor as a property,
 * so it wrote an extra {@code "empty"} key that a strict reader (FAIL_ON_UNKNOWN_PROPERTIES, the
 * Jackson default) then refused to read back. The helpers are {@code @JsonIgnore}d; this pins the
 * round trip with a strict mapper.
 */
class RecordHelpersJsonRoundTripTest {

  private final ObjectMapper strict =
      new ObjectMapper()
          .findAndRegisterModules()
          .enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

  private <T> T roundTrip(T value, Class<T> type) throws Exception {
    var json = strict.writeValueAsString(value);
    assertThat(json).doesNotContain("\"empty\"");
    return strict.readValue(json, type);
  }

  @Test
  void aDateRangeRoundTrips() throws Exception {
    var range = new DateRange(LocalDate.of(2026, 1, 1), null);
    assertThat(roundTrip(range, DateRange.class)).isEqualTo(range);
  }

  @Test
  void aNumberRangeRoundTrips() throws Exception {
    var range = new NumberRange(1.5, 9.0);
    assertThat(roundTrip(range, NumberRange.class)).isEqualTo(range);
  }

  @Test
  void aLayoutDeltaRoundTrips() throws Exception {
    var delta =
        new LayoutDelta(
            List.of("b", "a"),
            List.of("c"),
            Map.of("a", new LayoutDelta.FieldOverride("A!", 2, null)));
    assertThat(roundTrip(delta, LayoutDelta.class)).isEqualTo(delta);
    assertThat(roundTrip(LayoutDelta.empty(), LayoutDelta.class).isEmpty()).isTrue();
  }
}
