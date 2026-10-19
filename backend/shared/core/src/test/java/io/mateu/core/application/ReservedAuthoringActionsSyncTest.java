package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.core.infra.dev.DevMode;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The reserved authoring actions on the plain sync endpoint (NM2). {@code __preview__} stays open —
 * the chat's and live push's shell render target and the visual editor need it — but it is SAFE:
 * every component of the catalogue previews with no attribute set without an exception escaping, an
 * empty container renders cleanly, and anything that does fail answers through the error boundary
 * (a message, never a raw 500). {@code __validate__} answers only an MCP call, or an app running
 * with {@code mateu.mcp.enabled=true} or in dev mode.
 */
class ReservedAuthoringActionsSyncTest {

  @UI("/reserved")
  @Title("Reserved")
  public static class ReservedPage {
    public String name = "x";
  }

  @UI("/reserved-boom")
  public static class BoomPage implements io.mateu.uidl.interfaces.ComponentTreeSupplier {
    @Override
    public io.mateu.uidl.fluent.Component component(io.mateu.uidl.interfaces.HttpRequest rq) {
      throw new IllegalStateException("db password is hunter2");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ReservedPage.class, BoomPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @AfterEach
  void reset() {
    System.clearProperty("mateu.mcp.enabled");
    DevMode.reset();
  }

  private static RunActionRqDto preview(String yaml) {
    return RunActionRqDto.builder()
        .actionId("__preview__")
        .initiatorComponentId("preview")
        .parameters(Map.of("_yaml", yaml))
        .build();
  }

  @Test
  void anEmptyContainerPreviewsCleanly() {
    UIIncrementDto increment = mateu.run(preview("type: VerticalLayout"));
    assertThat(increment.messages()).isNullOrEmpty();
    assertThat(increment.fragments()).isNotEmpty();
  }

  @Test
  void everyComponentOfTheCatalogueWithNothingSetPreviewsWithoutAnException() throws Exception {
    var schema = new ObjectMapper().readTree(Path.of("..", "uidl", "uidl-schema.json").toFile());
    List<String> failures = new ArrayList<>();
    for (var ref : schema.path("$defs").path("Component").path("oneOf")) {
      var name = ref.path("$ref").asText().replace("#/$defs/", "");
      try {
        var increment = mateu.run(preview("type: " + name));
        if (increment == null) {
          failures.add(name + ": no answer");
        } else if (increment.messages() != null && !increment.messages().isEmpty()) {
          failures.add(name + ": " + increment.messages().get(0).text());
        }
      } catch (RuntimeException e) {
        failures.add(name + ": " + e);
      }
    }
    assertThat(failures).isEmpty();
  }

  @Test
  void aReservedActionThatFailsAnswersThroughTheErrorBoundary() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/reserved-boom")
                .actionId("__contract__")
                .serverSideType(BoomPage.class.getName())
                .build());
    assertThat(increment.messages()).hasSize(1);
    assertThat(increment.messages().get(0).text())
        .startsWith("An unexpected error occurred. Reference: ")
        .doesNotContain("hunter2");
  }

  @Test
  void validateIsRefusedOnThePlainSyncEndpointWhenMcpAndDevModeAreOff() {
    assertThatThrownBy(
            () ->
                mateu.run(
                    RunActionRqDto.builder()
                        .actionId("__validate__")
                        .parameters(Map.of("_yaml", "type: Text\ntext: hi\n"))
                        .build()))
        .isInstanceOf(MateuForbiddenException.class);
  }

  @Test
  void validateAnswersWhenMcpIsEnabledOrInDevMode() {
    var rq =
        RunActionRqDto.builder()
            .actionId("__validate__")
            .parameters(Map.of("_yaml", "type: Text\ntext: hi\n"))
            .build();
    System.setProperty("mateu.mcp.enabled", "true");
    assertThat(((Map<?, ?>) mateu.run(rq).appData()).containsKey("_validation")).isTrue();
    System.clearProperty("mateu.mcp.enabled");
    DevMode.enable(null);
    assertThat(((Map<?, ?>) mateu.run(rq).appData()).containsKey("_validation")).isTrue();
  }
}
