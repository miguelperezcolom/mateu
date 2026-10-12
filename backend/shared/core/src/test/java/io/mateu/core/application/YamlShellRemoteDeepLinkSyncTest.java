package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.application.out.MateuHttpClient;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.Test;

/**
 * A remote screen under a DATA-AUTHORED shell ({@code type: AppShell} with a {@code RemoteMenu})
 * opens from a deep link, exactly as under an {@code @UI} class shell.
 *
 * <p>Found composing EventConductor's console into a YAML shell: clicking the remote section's
 * entries worked, but reloading or bookmarking {@code /workflow/processes} answered "Page not
 * found" — the YAML path never offered an unclaimed route to the shell's remotes. The {@code @UI}
 * class path does that on every load ({@code AppMenuResolver.resolveRemoteMenuForRoute}).
 *
 * <p>The fixture lives under {@code mount-home/remote-shell/specs/ui} and is served through {@link
 * MountHomeSyncTest.SpecsOverlay}, so the shared test {@code specs/ui} is untouched.
 */
class YamlShellRemoteDeepLinkSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  /** The remote console: its own menu declares its screens under /workflow. */
  static final class FakeConsole implements MateuHttpClient {
    final List<String> authorizations = new CopyOnWriteArrayList<>();

    @Override
    public CompletableFuture<UIIncrementDto> send(String baseUrl, RunActionRqDto request) {
      return send(baseUrl, request, null);
    }

    @Override
    public CompletableFuture<UIIncrementDto> send(
        String baseUrl, RunActionRqDto request, String authorization) {
      authorizations.add(String.valueOf(authorization));
      var appDto =
          AppDto.builder()
              .route("")
              .title("Workflow")
              .homeRoute("_no_home_route")
              .homeConsumedRoute("")
              .homeServerSideType("io.mateu.workflow.infra.in.ui.WorkflowHome")
              .menu(
                  List.of(
                      MenuOptionDto.builder()
                          .label("Workflow")
                          .path("/workflow")
                          .route("/workflow")
                          .submenus(
                              List.of(
                                  MenuOptionDto.builder()
                                      .label("Processes")
                                      .path("/workflow/processes")
                                      .route("/workflow/processes")
                                      .build()))
                          .build()))
              .build();
      var component = new ClientSideComponentDto(appDto, "wf_app", List.of(), null, null, null);
      return CompletableFuture.completedFuture(
          UIIncrementDto.builder()
              .fragments(List.of(UIFragmentDto.builder().component(component).build()))
              .build());
    }
  }

  private record Result(JsonNode wire, FakeConsole console) {}

  private static Result load(String route, Map<String, String> headers) {
    var thread = Thread.currentThread();
    var previous = thread.getContextClassLoader();
    thread.setContextClassLoader(
        new MountHomeSyncTest.SpecsOverlay(
            "remote-shell", YamlShellRemoteDeepLinkSyncTest.class.getClassLoader()));
    var console = new FakeConsole();
    try (var mateu = TestMateu.withUisAndBeans(List.of(console))) {
      var increment =
          mateu.run(
              RunActionRqDto.builder().route(route).consumedRoute("_empty").actionId("").build(),
              headers);
      return new Result(JSON.valueToTree(increment), console);
    } finally {
      thread.setContextClassLoader(previous);
    }
  }

  private static String first(JsonNode wire, String field) {
    var values = wire.findValues(field);
    return values.isEmpty() ? null : values.get(0).asText();
  }

  @Test
  void aDeepLinkToARemoteScreenMountsTheRemote() {
    var wire = load("/workflow/processes", Map.of()).wire();
    assertThat(first(wire, "homeBaseUrl")).isEqualTo("http://console.example/_workflow");
    assertThat(first(wire, "homeRoute")).isEqualTo("/workflow/processes");
  }

  @Test
  void theCallersTokenTravelsToTheRemote() {
    var console = load("/workflow/processes", Map.of("authorization", "Bearer abc")).console();
    assertThat(console.authorizations).isNotEmpty().allMatch("Bearer abc"::equals);
  }

  @Test
  void aLocalRouteIsNeverOfferedToTheRemote() {
    var result = load("/overview", Map.of());
    assertThat(result.console().authorizations).isEmpty();
    assertThat(first(result.wire(), "homeBaseUrl"))
        .isNotEqualTo("http://console.example/_workflow");
  }
}
