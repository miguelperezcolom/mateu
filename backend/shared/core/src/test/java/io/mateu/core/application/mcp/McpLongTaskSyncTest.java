package io.mateu.core.application.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.LongTask;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;

/** A tool call cannot be resumed, so a {@code LongTask} it starts is waited for. */
class McpLongTaskSyncTest {

  static final AtomicBoolean COMPLETED = new AtomicBoolean();
  static final AtomicBoolean CANCELLED = new AtomicBoolean();

  @UI("/mcp-long-task")
  public static class Jobs {

    @Button
    public Flux<?> importAll() {
      return LongTask.create("Importing")
          .done("Imported", "3 rows")
          .run(
              progress ->
                  Flux.interval(Duration.ofMillis(30))
                      .take(3)
                      .map(i -> progress.step("Row " + i))
                      .doOnComplete(() -> COMPLETED.set(true)));
    }

    @Button
    public Flux<?> endless() {
      return LongTask.create("Endless")
          .onCancel(() -> CANCELLED.set(true))
          .run(
              progress ->
                  Flux.interval(Duration.ofMillis(20)).map(i -> progress.step("tick " + i)));
    }
  }

  static TestMateu mateu;
  static McpService mcp;
  static final McpService.HttpRequestFactory REQUESTS =
      rq -> new FakeHttpRequest(rq).withAttribute("baseUrl", "");

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Jobs.class);
    mcp = new McpService(mateu.service(), new ObjectMapper());
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void theToolCallAnswersWhenTheTaskHasEnded() {
    COMPLETED.set(false);
    var answer = mcp.runAction("mcp-long-task", "importAll", Map.of(), "", REQUESTS);
    assertThat(COMPLETED).isTrue();
    assertThat(answer.toString()).doesNotContain("did not finish");
  }

  @Test
  void aTaskThatOutlastsTheCallIsCancelledAndTheCallerIsTold() throws Exception {
    System.setProperty(McpEndpoint.TASK_TIMEOUT_PROPERTY, "1");
    try {
      CANCELLED.set(false);
      var answer = mcp.runAction("mcp-long-task", "endless", Map.of(), "", REQUESTS);
      assertThat(answer.toString()).contains("did not finish within 1 s and was cancelled");
      for (int i = 0; i < 100 && !CANCELLED.get(); i++) {
        Thread.sleep(20);
      }
      assertThat(CANCELLED).isTrue();
    } finally {
      System.clearProperty(McpEndpoint.TASK_TIMEOUT_PROPERTY);
    }
  }
}
