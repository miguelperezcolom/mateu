package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

class ClientErrorLogTest {

  @Test
  void keepsKnownFieldsInAFixedOrderAndAddsTheUser() throws Exception {
    var lines =
        ClientErrorLog.lines(
            "{\"stack\":\"s\",\"kind\":\"server\",\"status\":502,\"other\":1}", "ana");
    assertThat(lines)
        .containsExactly(
            "client-error {\"level\":\"error\",\"kind\":\"server\",\"stack\":\"s\","
                + "\"status\":502,\"user\":\"ana\"}");
  }

  @Test
  void truncatesLongFieldsAndEscapesNewlines() throws Exception {
    var line =
        ClientErrorLog.lines("{\"message\":\"" + "m".repeat(1500) + "\",\"stack\":\"a\\nb\"}", null)
            .get(0);
    assertThat(line).contains("m".repeat(1000) + "…\"").doesNotContain("m".repeat(1001));
    assertThat(line).contains("a\\nb").doesNotContain("\n");
  }

  @Test
  void capsTheBatchAndSkipsNonObjects() throws Exception {
    var batch = new StringBuilder("[1,\"x\"");
    for (int i = 0; i < 40; i++) {
      batch.append(",{\"kind\":\"k").append(i).append("\"}");
    }
    batch.append("]");
    assertThat(ClientErrorLog.lines(batch.toString(), null))
        .hasSize(ClientErrorLog.MAX_REPORTS_PER_BODY);
  }

  @Test
  void answersWithoutThrowing() {
    assertThat(ClientErrorLog.handle(null, null)).isEqualTo(400);
    assertThat(ClientErrorLog.handle("nope".getBytes(StandardCharsets.UTF_8), null)).isEqualTo(400);
    assertThat(ClientErrorLog.handle("\"str\"".getBytes(StandardCharsets.UTF_8), null))
        .isEqualTo(400);
    assertThat(ClientErrorLog.handle(new byte[ClientErrorLog.MAX_BODY_BYTES + 1], null))
        .isEqualTo(413);
    assertThat(ClientErrorLog.handle("{\"kind\":\"x\"}".getBytes(StandardCharsets.UTF_8), null))
        .isEqualTo(204);
  }

  /** #10: an anonymous caller cannot fill the log at will — reports are capped per client. */
  @Test
  void reportsAreRateLimitedPerClientPerMinute() {
    var now = new long[] {1_000_000};
    var previous = ClientErrorLog.clock;
    ClientErrorLog.clock = () -> now[0];
    ClientErrorLog.resetRateLimit();
    try {
      byte[] one = "{\"kind\":\"x\"}".getBytes(StandardCharsets.UTF_8);
      for (int i = 0; i < ClientErrorLog.DEFAULT_MAX_REPORTS_PER_MINUTE; i++) {
        assertThat(ClientErrorLog.handle(one, null, "10.0.0.1")).isEqualTo(204);
      }
      assertThat(ClientErrorLog.handle(one, null, "10.0.0.1")).isEqualTo(429);
      // another client, and an authenticated user, have budgets of their own
      assertThat(ClientErrorLog.handle(one, null, "10.0.0.2")).isEqualTo(204);
      assertThat(ClientErrorLog.handle(one, "ana", "10.0.0.1")).isEqualTo(204);
      // a batch is admitted up to the budget left
      assertThat(ClientErrorLog.admit("addr:10.0.0.3", 70))
          .isEqualTo(ClientErrorLog.DEFAULT_MAX_REPORTS_PER_MINUTE);
      // the next minute starts over
      now[0] += 60_000;
      assertThat(ClientErrorLog.handle(one, null, "10.0.0.1")).isEqualTo(204);
      System.setProperty(ClientErrorLog.MAX_REPORTS_PER_MINUTE_PROPERTY, "1");
      try {
        assertThat(ClientErrorLog.handle(one, null, "10.0.0.9")).isEqualTo(204);
        assertThat(ClientErrorLog.handle(one, null, "10.0.0.9")).isEqualTo(429);
        System.setProperty(ClientErrorLog.MAX_REPORTS_PER_MINUTE_PROPERTY, "lots");
        assertThat(ClientErrorLog.maxReportsPerMinute())
            .isEqualTo(ClientErrorLog.DEFAULT_MAX_REPORTS_PER_MINUTE);
      } finally {
        System.clearProperty(ClientErrorLog.MAX_REPORTS_PER_MINUTE_PROPERTY);
      }
    } finally {
      ClientErrorLog.clock = previous;
      ClientErrorLog.resetRateLimit();
    }
  }
}
