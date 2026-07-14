package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.AppContext;
import io.mateu.uidl.annotations.Audience;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Persona projection ({@code @Audience}): one declared model, projected per audience. The current
 * audience is the app-context value under "audience" (the {@code @AppContext} enum field named
 * {@code audience} gives the header switch for free); when it is UNSET everything is visible, and
 * when it is set the {@code @Audience}-marked fields, buttons and menu entries that don't declare
 * it are hidden. A UX projection aid — NOT security (that's {@code @EyesOnly}).
 */
class AudienceSyncTest {

  @SuppressWarnings("unused")
  public enum Mode {
    staff,
    cliente
  }

  @SuppressWarnings("unused")
  @UI("/audience-app")
  @Title("Audience app")
  public static class AudienceApp {

    @Menu String home = "/";

    @Menu
    @Audience({"staff"})
    String staffArea = "/staff-area";

    // the developer declares the switch by naming the @AppContext field "audience"
    @AppContext Mode audience;
  }

  /** One model, three projections: full (no audience), staff and cliente. */
  @SuppressWarnings("unused")
  @UI("/audience-view")
  @Title("Check-in")
  public static class ProjectedView {

    String bookingCode = "B-42"; // unrestricted → visible to every audience

    @Audience({"staff"})
    String internalNotes = "VIP, late arrival";

    @Audience({"cliente"})
    String welcomeMessage = "¡Bienvenido!";

    @Audience({"staff"})
    @Toolbar
    public Message audit() {
      return new Message("audited");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(AudienceApp.class, ProjectedView.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto syncView(Map<String, Object> appState) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/audience-view")
            .actionId("")
            .componentState(Map.of())
            .appState(appState)
            .build());
  }

  private static List<String> fieldIds(UIIncrementDto increment) {
    var root = (ServerSideComponentDto) increment.fragments().get(0).component();
    return FieldKindsSyncTest.collect(root, FormFieldDto.class).stream()
        .map(FormFieldDto::fieldId)
        .toList();
  }

  private static List<String> toolbarLabels(UIIncrementDto increment) {
    var page =
        FullSyncPipelineTest.findMetadata(increment.fragments().get(0).component(), PageDto.class);
    assertThat(page).isNotNull();
    return page.toolbar().stream().map(ButtonDto::label).toList();
  }

  private static List<String> menuLabels(Map<String, Object> appState) {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/audience-app")
                .actionId("")
                .componentState(Map.of())
                .appState(appState)
                .build());
    var app =
        FullSyncPipelineTest.findMetadata(increment.fragments().get(0).component(), AppDto.class);
    assertThat(app).isNotNull();
    return app.menu().stream().map(MenuOptionDto::label).toList();
  }

  @Test
  void audienceSwitchIsAnAppContextSelectorWiredByEnumName() {
    var increment = mateu.sync("/audience-app");
    var app =
        FullSyncPipelineTest.findMetadata(increment.fragments().get(0).component(), AppDto.class);
    assertThat(app).isNotNull();
    var audience =
        app.contextSelectors().stream()
            .filter(selector -> "audience".equals(selector.fieldName()))
            .findFirst()
            .orElseThrow();
    // enum options travel as their name() — the value @Audience matches against
    assertThat(audience.options())
        .extracting(io.mateu.dtos.OptionDto::value)
        .containsExactly("staff", "cliente");
  }

  @Test
  void noAudienceSetShowsEverything() {
    var increment = syncView(Map.of());
    assertThat(fieldIds(increment)).contains("bookingCode", "internalNotes", "welcomeMessage");
    assertThat(toolbarLabels(increment)).contains("Audit");
  }

  @Test
  void clienteProjectionHidesStaffOnlyFieldAndButton() {
    var increment = syncView(Map.of("audience", "cliente"));
    assertThat(fieldIds(increment)).contains("bookingCode", "welcomeMessage");
    assertThat(fieldIds(increment)).doesNotContain("internalNotes");
    assertThat(toolbarLabels(increment)).doesNotContain("Audit");
  }

  @Test
  void staffProjectionHidesClienteOnlyFieldAndKeepsStaffElements() {
    var increment = syncView(Map.of("audience", "staff"));
    assertThat(fieldIds(increment)).contains("bookingCode", "internalNotes");
    assertThat(fieldIds(increment)).doesNotContain("welcomeMessage");
    assertThat(toolbarLabels(increment)).contains("Audit");
  }

  @Test
  void blankAudienceCountsAsUnset() {
    var increment = syncView(Map.of("audience", ""));
    assertThat(fieldIds(increment)).contains("bookingCode", "internalNotes", "welcomeMessage");
  }

  @Test
  void menuEntriesProjectLikeFields() {
    assertThat(menuLabels(Map.of())).contains("Staff area");
    assertThat(menuLabels(Map.of("audience", "staff"))).contains("Staff area");
    assertThat(menuLabels(Map.of("audience", "cliente"))).doesNotContain("Staff area");
  }
}
