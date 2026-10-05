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
}
