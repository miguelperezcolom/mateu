package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * An app shell does not have to sit at a mount root: a {@code type: AppShell} definition bound to
 * {@code /museum} draws its chrome there, and its menu routes are relative to it ({@code
 * collection} → {@code /museum/collection}). It used to answer "Page not found": only the
 * definition bound to the mount's root route was ever read as a shell.
 */
class NestedAppShellSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  private static JsonNode run(RunActionRqDto rq) {
    var thread = Thread.currentThread();
    var previous = thread.getContextClassLoader();
    thread.setContextClassLoader(
        new MountHomeSyncTest.SpecsOverlay(
            "nested-shell", NestedAppShellSyncTest.class.getClassLoader()));
    try (var mateu = TestMateu.withUis()) {
      return JSON.valueToTree(mateu.run(rq));
    } finally {
      thread.setContextClassLoader(previous);
    }
  }

  private static JsonNode fresh(String route) {
    return run(RunActionRqDto.builder().route(route).consumedRoute("_empty").actionId("").build());
  }

  /** The content load the shell's slot sends for a menu route (what the Vaadin shell asks). */
  private static JsonNode content(String route) {
    return run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("/museum")
            .actionId("")
            .initiatorComponentId("ux_root")
            .build());
  }

  private static JsonNode appOf(JsonNode wire) {
    return wire.findParents("type").stream()
        .filter(node -> "App".equals(node.path("type").asText()))
        .findFirst()
        .orElseThrow(() -> new AssertionError("no App in " + wire));
  }

  @Test
  void aShellBoundBelowTheMountRootDrawsItsChromeWithItsMenuRelativeToIt() {
    var app = appOf(fresh("/museum"));
    assertThat(app.path("title").asText()).isEqualTo("City Museum");
    assertThat(app.path("route").asText()).isEqualTo("/museum");
    // relative to the shell, not to the mount: «collection» is /museum/collection
    assertThat(app.findValues("route").stream().map(JsonNode::asText))
        .contains("/museum/collection", "/museum/visitors")
        .doesNotContain("/collection", "/visitors");
    // its home is a page inside it — never the shell's own route (that reloaded the shell forever)
    assertThat(app.path("homeRoute").asText()).isEqualTo("/museum/collection");
  }

  @Test
  void theShellsContentLoadsAnswerItsPages() {
    assertThat(content("/museum/collection").toString())
        .contains("The museum collection")
        .doesNotContain("Not found");
    assertThat(content("/museum/visitors").toString()).contains("The museum visitors");
  }

  @Test
  void aDeepLinkBelowTheShellDrawsTheShellAroundIt() {
    var wire = fresh("/museum/visitors");
    assertThat(appOf(wire).path("title").asText()).isEqualTo("City Museum");
  }

  /** A view model bound in routes.yaml to /gallery that returns a fluent AppShell as its tree. */
  public static class GalleryShell implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return AppShell.builder()
          .title("Gallery in code")
          .homeRoute("rooms")
          .menu(List.of(RouteLink.builder().label("Rooms").route("rooms").build()))
          .build();
    }
  }

  @Test
  void aViewModelReturningAShellBelowTheMountRootAnswersItsContentLoads() {
    var app = appOf(fresh("/gallery"));
    assertThat(app.path("title").asText()).isEqualTo("Gallery in code");
    assertThat(app.findValues("route").stream().map(JsonNode::asText)).contains("/gallery/rooms");
    // the slot's content load names the shell by type: it used to answer the shell again
    var rooms =
        run(RunActionRqDto.builder()
                .route("/gallery/rooms")
                .consumedRoute("/gallery")
                .serverSideType(GalleryShell.class.getName())
                .actionId("")
                .initiatorComponentId("ux_root")
                .build())
            .toString();
    assertThat(rooms).contains("The gallery rooms").doesNotContain("Gallery in code");
  }

  @Test
  void theMountRootIsNotWrappedByAShellBelowIt() {
    var wire = fresh("/").toString();
    assertThat(wire).contains("The mount home").doesNotContain("City Museum");
  }
}
