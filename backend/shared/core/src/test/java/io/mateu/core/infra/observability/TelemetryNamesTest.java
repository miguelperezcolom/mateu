package io.mateu.core.infra.observability;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.audit.ActionOutcome;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

class TelemetryNamesTest {

  @AfterEach
  void reset() {
    TelemetryNames.reset();
  }

  @Test
  void idLikeSegmentsBecomeAPlaceholder() {
    assertThat(TelemetryNames.routeTemplate("/products/42/edit")).isEqualTo("/products/:id/edit");
    assertThat(TelemetryNames.routeTemplate("/orders/3f2504e0-4f89-11d3-9a0c-0305e82c3301"))
        .isEqualTo("/orders/:id");
    assertThat(TelemetryNames.routeTemplate("/bookings/BK2026A01?tab=2"))
        .isEqualTo("/bookings/:id");
    assertThat(TelemetryNames.routeTemplate("/products/new")).isEqualTo("/products/new");
    assertThat(TelemetryNames.routeTemplate("/checkin/v2/")).isEqualTo("/checkin/v2");
    assertThat(TelemetryNames.routeTemplate("")).isEqualTo("/");
    assertThat(TelemetryNames.routeTemplate("_empty")).isEqualTo("/");
    assertThat(TelemetryNames.routeTemplate(null)).isEqualTo("/");
  }

  @Test
  void aLoadIsNamedAndARefusalIsMeasuredUnderOther() {
    assertThat(TelemetryNames.action("")).isEqualTo(TelemetryNames.LOAD);
    assertThat(TelemetryNames.metricKey("/a/1", "save", ActionOutcome.OK))
        .containsExactly("/a/:id", "save");
    assertThat(TelemetryNames.metricKey("/a", "anything", ActionOutcome.FORBIDDEN))
        .containsExactly(TelemetryNames.OTHER, TelemetryNames.OTHER);
    assertThat(TelemetryNames.metricKey("/zzz", "", ActionOutcome.NOT_FOUND))
        .containsExactly(TelemetryNames.OTHER, TelemetryNames.OTHER);
  }

  @Test
  void theNumberOfSeriesIsBounded() {
    for (int i = 0; i < TelemetryNames.MAX_SERIES; i++) {
      TelemetryNames.metricKey("/r", "a" + i, ActionOutcome.OK);
    }
    assertThat(TelemetryNames.metricKey("/r", "one-too-many", ActionOutcome.OK))
        .containsExactly(TelemetryNames.OTHER, TelemetryNames.OTHER);
    // a pair already seen keeps its name
    assertThat(TelemetryNames.metricKey("/r", "a0", ActionOutcome.OK)).containsExactly("/r", "a0");
  }
}
