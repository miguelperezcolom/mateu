package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Deeper end-to-end flows: the AutoEditableView mediator (view → edit → save → view), listing
 * exports, the editable-grid _create handler, and wire-state type coercion into typed fields.
 */
class DeepFlowsSyncTest {

  // ── editable view fixture ───────────────────────────────────────────────────

  @SuppressWarnings("unused")
  public static class Profile {
    String name = "Ada";
    String email = "ada@example.com";
  }

  static Profile HELD = new Profile();
  static List<String> PERSISTED = new ArrayList<>();

  @SuppressWarnings("unused")
  @UI("/profile")
  @Title("Profile")
  public static class ProfileView extends AutoEditableView<Profile> {
    @Override
    public Profile load(HttpRequest httpRequest) {
      return HELD;
    }

    @Override
    public void persist(Profile entity, HttpRequest httpRequest) {
      HELD = entity;
      PERSISTED.add(entity.name);
    }
  }

  // ── type coercion fixture ───────────────────────────────────────────────────

  @SuppressWarnings("unused")
  public static class TypedForm {
    int count;
    double ratio;
    BigDecimal total;
    boolean active;
    LocalDate day;

    static TypedForm seen;

    @Action
    void snapshot(HttpRequest httpRequest) {
      seen = this;
    }
  }

  @UI("/typed")
  @SuppressWarnings("unused")
  public static class TypedFormPage extends TypedForm {}

  public static class FakeExcelExporter implements io.mateu.uidl.interfaces.ExcelExporter {
    @Override
    public byte[] export(
        List<?> rows, List<io.mateu.uidl.data.ExportColumn> columns, HttpRequest httpRequest) {
      return "excel".getBytes();
    }
  }

  public static class FakePdfExporter implements io.mateu.uidl.interfaces.PdfExporter {
    @Override
    public byte[] export(
        List<?> rows, List<io.mateu.uidl.data.ExportColumn> columns, HttpRequest httpRequest) {
      return "pdf".getBytes();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUisAndBeans(
            List.of(new FakeExcelExporter(), new FakePdfExporter()),
            ProfileView.class,
            TypedFormPage.class,
            MixedComponentsSyncTest.CitiesListing.class,
            EditableGridFieldSyncTest.OrderForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void reset() {
    HELD = new Profile();
    PERSISTED.clear();
  }

  // ── AutoEditableView lifecycle ──────────────────────────────────────────────

  private UIIncrementDto profile(String route, String actionId, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("/profile")
            .serverSideType(ProfileView.class.getName())
            .actionId(actionId)
            .initiatorComponentId("pv_app")
            .componentState(state)
            .build());
  }

  @Test
  void syncShowsTheLoadedEntityReadOnly() {
    // the sync returns the mediator; the entity view is what the inner ux then loads
    var increment = profile("/profile", "", Map.of());
    var state = stateOf(increment);
    assertThat(state).containsEntry("name", "Ada");
  }

  @Test
  void editActionSwitchesTheMediatorToTheEditRoute() {
    var increment = profile("/profile", "edit", Map.of("name", "Ada"));
    var state = stateOf(increment);
    assertThat(state.get("_route")).isNotNull();
  }

  @Test
  void saveActionPersistsTheEditedEntity() {
    profile("/profile/edit", "save", Map.of("name", "Eva", "email", "eva@example.com"));
    assertThat(PERSISTED).contains("Eva");
    assertThat(HELD.name).isEqualTo("Eva");
  }

  @Test
  void cancelEditReturnsToTheViewWithoutPersisting() {
    profile("/profile/edit", "cancel-edit", Map.of("name", "Zoe"));
    assertThat(PERSISTED).isEmpty();
    assertThat(HELD.name).isEqualTo("Ada");
  }

  // ── listing exports ─────────────────────────────────────────────────────────

  private UIIncrementDto export(String actionId) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/cities")
            .consumedRoute("/cities")
            .serverSideType(MixedComponentsSyncTest.CitiesListing.class.getName())
            .actionId(actionId)
            .initiatorComponentId("cl_app")
            .componentState(Map.of("searchText", "", "page", 0, "size", 10))
            .build());
  }

  @Test
  void exportExcelReturnsADownloadCommand() {
    var increment = export("export-excel");
    assertThat(increment.commands())
        .anySatisfy(command -> assertThat(command.type().name()).isEqualTo("DownloadFile"));
  }

  @Test
  void exportPdfReturnsADownloadCommand() {
    var increment = export("export-pdf");
    assertThat(increment.commands())
        .anySatisfy(command -> assertThat(command.type().name()).isEqualTo("DownloadFile"));
  }

  // ── editable grid _create ───────────────────────────────────────────────────

  @Test
  void createAppendsTheNewRowToTheListField() {
    var state = new HashMap<String, Object>();
    state.put("customer", "ACME");
    state.put("lines", List.of(row("A", 1, "0")));
    state.put("lines_rowClass", EditableGridFieldSyncTest.Line.class.getName());
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/order")
                .actionId("lines_create")
                .serverSideType(EditableGridFieldSyncTest.OrderForm.class.getName())
                .componentState(state)
                .parameters(Map.of("initiatorState", Map.of("concept", "D", "qty", 4)))
                .initiatorComponentId("form1_app")
                .build());
    @SuppressWarnings("unchecked")
    var lines = (List<Map<String, Object>>) stateOf(increment).get("lines");
    assertThat(lines).hasSize(2);
    assertThat(lines.get(1)).containsEntry("concept", "D");
  }

  private static Map<String, Object> row(String concept, int qty, String rowNumber) {
    var map = new HashMap<String, Object>();
    map.put("concept", concept);
    map.put("qty", qty);
    map.put("_rowNumber", rowNumber);
    return map;
  }

  // ── type coercion from wire state ───────────────────────────────────────────

  @Test
  void wireStringsAreCoercedIntoTypedFields() {
    TypedForm.seen = null;
    var state = new HashMap<String, Object>();
    state.put("count", "42");
    state.put("ratio", "3.14");
    state.put("total", "99.90");
    state.put("active", "true");
    state.put("day", "2026-07-05");
    mateu.run(
        RunActionRqDto.builder()
            .route("/typed")
            .actionId("snapshot")
            .serverSideType(TypedFormPage.class.getName())
            .componentState(state)
            .initiatorComponentId("tf_app")
            .build());
    assertThat(TypedForm.seen).isNotNull();
    assertThat(TypedForm.seen.count).isEqualTo(42);
    assertThat(TypedForm.seen.ratio).isEqualTo(3.14);
    assertThat(TypedForm.seen.total).isEqualByComparingTo(new BigDecimal("99.90"));
    assertThat(TypedForm.seen.active).isTrue();
    assertThat(TypedForm.seen.day).isEqualTo(LocalDate.of(2026, 7, 5));
  }

  // ── helpers ─────────────────────────────────────────────────────────────────

  @SuppressWarnings("unchecked")
  private static Map<String, Object> stateOf(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      if (fragment.state() instanceof Map<?, ?> state && !state.isEmpty()) {
        return (Map<String, Object>) fragment.state();
      }
    }
    return Map.of();
  }
}
