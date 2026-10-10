package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.Test;

class WireMapperTest {

  @Test
  void sseEventIsOneDataLine() {
    var event = WireMapper.sseEvent(Map.of("a", "line1\nline2"));
    assertThat(event).startsWith("data:{").endsWith("}\n\n");
    // newlines inside values are escaped, so the event stays one data: line
    assertThat(event.substring(0, event.length() - 2)).doesNotContain("\n");
  }

  @Test
  void datesAreIsoStrings() throws Exception {
    assertThat(WireMapper.shared().writeValueAsString(LocalDate.of(2026, 10, 10)))
        .isEqualTo("\"2026-10-10\"");
    assertThat(WireMapper.create()).isNotSameAs(WireMapper.shared());
  }
}
