package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.DisabledUnless;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.interfaces.HttpRequest;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Permission-disabled buttons, read-only editable views, action return kinds (URI navigation, typed
 * parameters), and Actionable fields declared directly on the app.
 */
class ButtonsAndViewsSyncTest {

  // ── permission-driven buttons ───────────────────────────────────────────────

  @SuppressWarnings("unused")
  @UI("/guarded")
  public static class GuardedForm {
    String name = "x";

    @Toolbar
    @DisabledUnless(roles = "admin")
    void dangerous(HttpRequest httpRequest) {}

    @Button
    void open(HttpRequest httpRequest) {}
  }

  // ── read-only editable view ─────────────────────────────────────────────────

  @SuppressWarnings("unused")
  public static class Terms {
    String text = "the terms";
  }

  @SuppressWarnings("unused")
  @UI("/terms")
  @Title("Terms")
  @ReadOnly
  public static class TermsView
      extends io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView<Terms> {
    @Override
    public Terms load(HttpRequest httpRequest) {
      return new Terms();
    }

    @Override
    public void persist(Terms entity, HttpRequest httpRequest) {}
  }

  // ── action return kinds ─────────────────────────────────────────────────────

  public record Coordinates(double lat, double lon) {}

  @SuppressWarnings("unused")
  @UI("/actions2")
  public static class Actions2Form {
    String name = "x";

    static Coordinates received;

    @Action
    URI goHome(HttpRequest httpRequest) {
      return URI.create("/home");
    }

    @Action
    void locate(HttpRequest httpRequest) {
      // typed method params only inject the clicked row; free parameters read via getParameters
      received = httpRequest.getParameters(Coordinates.class);
    }
  }

  // ── Actionable field on the app ─────────────────────────────────────────────

  @SuppressWarnings("unused")
  @UI("/kiosk")
  @Title("Kiosk")
  public static class KioskApp {
    @Menu
    ContentLink help =
        ContentLink.builder()
            .path("/help")
            .label("Help")
            .componentSupplier(request -> new Text("help-content"))
            .build();
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(GuardedForm.class, TermsView.class, Actions2Form.class, KioskApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ── permission-driven buttons ───────────────────────────────────────────────

  @Test
  void disabledUnlessWithoutTokenDisablesTheButton() {
    var increment = mateu.sync("/guarded");
    var buttons = new ArrayList<io.mateu.dtos.ButtonDto>();
    collectButtons(increment.fragments().get(0).component(), buttons);
    assertThat(buttons)
        .filteredOn(button -> "dangerous".equals(button.actionId()))
        .allMatch(io.mateu.dtos.ButtonDto::disabled);
    assertThat(buttons)
        .filteredOn(button -> "open".equals(button.actionId()))
        .noneMatch(io.mateu.dtos.ButtonDto::disabled);
  }

  // ── read-only editable view ─────────────────────────────────────────────────

  @Test
  void readOnlyEditableViewsSyncWithoutTheEditFlow() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/terms")
                .consumedRoute("/terms")
                .serverSideType(TermsView.class.getName())
                .actionId("")
                .initiatorComponentId("tv_app")
                .build());
    assertThat(increment.fragments()).isNotEmpty();
    var state = stateOf(increment);
    assertThat(state).containsEntry("text", "the terms");
  }

  // ── action return kinds ─────────────────────────────────────────────────────

  @Test
  void uriReturnsBecomeNavigationCommands() {
    var increment = run("goHome", Map.of());
    assertThat(increment.commands())
        .anySatisfy(
            command -> {
              assertThat(command.type().name()).isEqualTo("NavigateTo");
              assertThat(String.valueOf(command.data())).isEqualTo("/home");
            });
  }

  @Test
  void typedParametersHydrateFromTheParametersMap() {
    Actions2Form.received = null;
    run("locate", Map.of("lat", 39.57, "lon", 2.65));
    assertThat(Actions2Form.received).isNotNull();
    assertThat(Actions2Form.received.lat()).isEqualTo(39.57);
    assertThat(Actions2Form.received.lon()).isEqualTo(2.65);
  }

  private UIIncrementDto run(String actionId, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/actions2")
            .actionId(actionId)
            .serverSideType(Actions2Form.class.getName())
            .componentState(Map.of("name", "x"))
            .parameters(parameters)
            .initiatorComponentId("a2_app")
            .build());
  }

  // ── Actionable field on the app ─────────────────────────────────────────────

  @Test
  void contentLinkFieldsBecomeMenuOptions() {
    var increment = mateu.sync("/kiosk");
    var app =
        FullSyncPipelineTest.findMetadata(
            increment.fragments().get(0).component(), io.mateu.dtos.AppDto.class);
    assertThat(app).isNotNull();
    assertThat(app.menu()).extracting(io.mateu.dtos.MenuOptionDto::label).contains("Help");
  }

  // ── helpers ─────────────────────────────────────────────────────────────────

  private static void collectButtons(Object component, List<io.mateu.dtos.ButtonDto> out) {
    if (component instanceof io.mateu.dtos.ClientSideComponentDto client) {
      if (client.metadata() instanceof io.mateu.dtos.ButtonDto button) {
        out.add(button);
      }
      if (client.metadata() instanceof io.mateu.dtos.PageDto page) {
        if (page.toolbar() != null) {
          out.addAll(page.toolbar());
        }
        if (page.buttons() != null) {
          out.addAll(page.buttons());
        }
      }
      client.children().forEach(child -> collectButtons(child, out));
    }
    if (component instanceof io.mateu.dtos.ServerSideComponentDto server) {
      server.children().forEach(child -> collectButtons(child, out));
    }
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> stateOf(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      if (fragment.state() instanceof Map<?, ?> state && !state.isEmpty()) {
        return (Map<String, Object>) state;
      }
    }
    return Map.of();
  }
}
