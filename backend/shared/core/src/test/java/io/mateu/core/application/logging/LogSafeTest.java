package io.mateu.core.application.logging;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class LogSafeTest {

  @Test
  void aValueCannotForgeLogLinesNorFloodTheLog() {
    assertThat(LogSafe.of("/orders\r\nINFO forged line")).isEqualTo("/orders??INFO forged line");
    assertThat(LogSafe.of("x".repeat(10_000))).hasSize(LogSafe.MAX + 1).endsWith("…");
    assertThat(LogSafe.of(null)).isEqualTo("null");
    assertThat(LogSafe.of("event=ping")).isEqualTo("event=ping");
  }
}
