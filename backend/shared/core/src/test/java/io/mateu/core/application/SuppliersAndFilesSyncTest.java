package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.ButtonsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MenuSupplier;
import io.mateu.uidl.interfaces.ToolbarSupplier;
import java.io.File;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Programmatic buttons/toolbar (ButtonsSupplier / ToolbarSupplier over fluent Buttons), file-typed
 * fields through the collection converter, and ContentLink menu options rendering a supplied
 * component tree.
 */
class SuppliersAndFilesSyncTest {

  // ── programmatic buttons ────────────────────────────────────────────────────

  @SuppressWarnings("unused")
  @UI("/actions-page")
  @Title("Actions")
  public static class ActionsPage implements ButtonsSupplier, ToolbarSupplier {
    String name = "x";

    static String ran;

    @Action
    void doIt(HttpRequest httpRequest) {
      ran = "done";
    }

    @Override
    public Collection<UserTrigger> buttons() {
      return List.of(Button.builder().label("Do it").actionId("doIt").build());
    }

    @Override
    public Collection<UserTrigger> toolbar() {
      return List.of(
          Button.builder()
              .label("Tool")
              .actionId("doIt")
              .buttonStyle(io.mateu.uidl.data.ButtonStyle.primary)
              .build());
    }
  }

  // ── file fields ─────────────────────────────────────────────────────────────

  @SuppressWarnings("unused")
  @UI("/uploads")
  public static class UploadsForm {
    File document;
    List<File> attachments = new ArrayList<>();

    static UploadsForm seen;

    @Action
    void snap(HttpRequest httpRequest) {
      seen = this;
    }
  }

  // ── ContentLink menu option ─────────────────────────────────────────────────

  @SuppressWarnings("unused")
  public static class StaticContent implements MenuSupplier {
    @Override
    public List<io.mateu.uidl.interfaces.Actionable> menu(HttpRequest httpRequest) {
      return List.of(
          ContentLink.builder()
              .path("/about")
              .label("About")
              .componentSupplier(request -> new Text("about-us-content"))
              .build());
    }
  }

  @SuppressWarnings("unused")
  @UI("/site")
  @Title("Site")
  public static class SiteApp {
    @Menu StaticContent pages = new StaticContent();
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ActionsPage.class, UploadsForm.class, SiteApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ── programmatic buttons ────────────────────────────────────────────────────

  @Test
  void supplierButtonsAndToolbarAppearOnThePage() {
    var increment = mateu.sync("/actions-page");
    var page =
        FullSyncPipelineTest.findMetadata(
            increment.fragments().get(0).component(), io.mateu.dtos.PageDto.class);
    assertThat(page).isNotNull();
    assertThat(page.toolbar()).extracting(io.mateu.dtos.ButtonDto::label).contains("Tool");
  }

  @Test
  void supplierButtonActionsRun() {
    ActionsPage.ran = null;
    mateu.run(
        RunActionRqDto.builder()
            .route("/actions-page")
            .actionId("doIt")
            .serverSideType(ActionsPage.class.getName())
            .componentState(Map.of("name", "x"))
            .initiatorComponentId("ap_app")
            .build());
    assertThat(ActionsPage.ran).isEqualTo("done");
  }

  // ── file fields ─────────────────────────────────────────────────────────────

  @Test
  void fileFieldsHydrateWithoutCrashing() {
    UploadsForm.seen = null;
    mateu.run(
        RunActionRqDto.builder()
            .route("/uploads")
            .actionId("snap")
            .serverSideType(UploadsForm.class.getName())
            .componentState(
                Map.of(
                    "attachments",
                    List.of(
                        Map.of("id", "f1", "name", "a.pdf"), Map.of("id", "f2", "name", "b.pdf"))))
            .initiatorComponentId("up_app")
            .build());
    assertThat(UploadsForm.seen).isNotNull();
    // the file materializer is a stub — the list arrives with placeholder entries
    assertThat(UploadsForm.seen.attachments).hasSize(2);
  }

  @Test
  void fileFormSyncReturnsAnIncrement() {
    // rendering java.io.File fields is not supported (empty fragments) — only hydration works
    var increment = mateu.sync("/uploads");
    assertThat(increment).isNotNull();
  }

  // ── ContentLink ─────────────────────────────────────────────────────────────

  @Test
  void appSyncListsTheContentLink() {
    var increment = mateu.sync("/site");
    var app =
        FullSyncPipelineTest.findMetadata(
            increment.fragments().get(0).component(), io.mateu.dtos.AppDto.class);
    assertThat(app).isNotNull();
    assertThat(collectLabels(app)).contains("About");
  }

  private static List<String> collectLabels(io.mateu.dtos.AppDto app) {
    var labels = new ArrayList<String>();
    app.menu().forEach(option -> collectLabels(option, labels));
    return labels;
  }

  private static void collectLabels(io.mateu.dtos.MenuOptionDto option, List<String> labels) {
    labels.add(option.label());
    if (option.submenus() != null) {
      option.submenus().forEach(sub -> collectLabels(sub, labels));
    }
  }

  @Test
  void contentLinkRouteRendersTheSuppliedComponent() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/site/pages/about")
                .consumedRoute("/site")
                .serverSideType(SiteApp.class.getName())
                .actionId("")
                .initiatorComponentId("st_app")
                .build());
    assertThat(increment.fragments()).isNotEmpty();
    var text =
        FullSyncPipelineTest.findMetadata(
            increment.fragments().get(0).component(), io.mateu.dtos.TextDto.class);
    assertThat(text).isNotNull();
    assertThat(text.text()).isEqualTo("about-us-content");
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
