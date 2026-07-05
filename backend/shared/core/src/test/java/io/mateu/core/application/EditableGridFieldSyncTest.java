package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.UI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The editable-grid-in-a-form machinery (domain.act crudfieldhandlers): a {@code List<Row>} form
 * field advertises {@code <fieldId>_add/_select/_save/_remove/_move-up/_move-down/_prev/_next}
 * actions. The frontend keeps the rows in the component state (with {@code _rowNumber} markers and
 * a {@code <fieldId>_rowClass} entry) and each action returns a new State (plus a detail form
 * fragment for add/select).
 */
class EditableGridFieldSyncTest {

  @SuppressWarnings("unused")
  public static class Line {
    String concept;
    int qty;

    public Line() {}
  }

  @SuppressWarnings("unused")
  @UI("/order")
  public static class OrderForm {
    String customer = "ACME";
    List<Line> lines = new ArrayList<>();
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(OrderForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ── helpers ─────────────────────────────────────────────────────────────────

  private static Map<String, Object> baseState() {
    var state = new HashMap<String, Object>();
    state.put("customer", "ACME");
    state.put("lines", List.of(rowMap("A", 1, 0), rowMap("B", 2, 1), rowMap("C", 3, 2)));
    state.put("lines_rowClass", Line.class.getName());
    return state;
  }

  private static Map<String, Object> rowMap(String concept, int qty, int rowNumber) {
    var row = new HashMap<String, Object>();
    row.put("concept", concept);
    row.put("qty", qty);
    row.put("_rowNumber", rowNumber);
    return row;
  }

  private UIIncrementDto run(
      String actionId, Map<String, Object> state, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/order")
            .actionId(actionId)
            .serverSideType(OrderForm.class.getName())
            .componentState(state)
            .parameters(parameters)
            .initiatorComponentId("form1_app")
            .build());
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> stateOf(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      if (fragment.state() instanceof Map<?, ?> state && !state.isEmpty()) {
        return (Map<String, Object>) fragment.state();
      }
    }
    return Map.of();
  }

  @SuppressWarnings("unchecked")
  private static List<Map<String, Object>> lines(UIIncrementDto increment) {
    return (List<Map<String, Object>>) stateOf(increment).get("lines");
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> showDetail(UIIncrementDto increment) {
    return (Map<String, Object>) stateOf(increment).get("_show_detail");
  }

  // ── the listing form itself ─────────────────────────────────────────────────

  @Test
  void syncAdvertisesTheEditableGridActions() {
    var increment = mateu.sync("/order");
    var component = (io.mateu.dtos.ServerSideComponentDto) increment.fragments().get(0).component();
    assertThat(component.actions())
        .extracting(io.mateu.dtos.ActionDto::id)
        .contains("lines_add", "lines_save", "lines_remove");
  }

  // ── add / save ──────────────────────────────────────────────────────────────

  @Test
  void addOpensAnEmptyDetailForm() {
    var increment = run("lines_add", baseState(), Map.of());
    assertThat(showDetail(increment)).containsEntry("lines", true);
    // a second fragment carries the detail form
    assertThat(increment.fragments().size()).isGreaterThanOrEqualTo(2);
  }

  @Test
  void saveUpdatesTheRowMatchedByRowNumber() {
    var parameters =
        Map.<String, Object>of(
            "initiatorState", Map.of("_rowNumber", 1, "concept", "B2", "qty", 22));
    var increment = run("lines_save", baseState(), parameters);
    var rows = lines(increment);
    assertThat(rows).hasSize(3);
    assertThat(rows.get(1)).containsEntry("concept", "B2").containsEntry("qty", 22);
    assertThat(showDetail(increment)).containsEntry("lines", false);
  }

  // ── select / navigate ───────────────────────────────────────────────────────

  @Test
  void selectOpensTheRowDetailInEditMode() {
    var parameters = new HashMap<String, Object>(rowMap("B", 2, 1));
    var increment = run("lines_select", baseState(), parameters);
    assertThat(showDetail(increment)).containsEntry("lines", true);
    @SuppressWarnings("unchecked")
    var editing = (Map<String, Object>) stateOf(increment).get("_editing");
    assertThat(editing).containsEntry("lines", true);
    assertThat(increment.fragments().size()).isGreaterThanOrEqualTo(2);
  }

  // ── remove ──────────────────────────────────────────────────────────────────

  @Test
  void removeDropsTheSelectedRows() {
    var state = baseState();
    state.put("lines_selected_items", List.of(rowMap("B", 2, 1)));
    var increment = run("lines_remove", state, Map.of());
    var rows = lines(increment);
    assertThat(rows).hasSize(2);
    assertThat(rows).extracting(row -> row.get("concept")).containsExactly("A", "C");
  }

  @Test
  void removeWithoutSelectionKeepsTheList() {
    var increment = run("lines_remove", baseState(), Map.of());
    assertThat(lines(increment)).hasSize(3);
  }

  // ── reorder ─────────────────────────────────────────────────────────────────

  @Test
  void moveUpBubblesTheSelectedRowUpwards() {
    var state = baseState();
    state.put("lines_selected_items", List.of(rowMap("B", 2, 1)));
    var increment = run("lines_move-up", state, Map.of());
    assertThat(lines(increment))
        .extracting(row -> row.get("concept"))
        .containsExactly("B", "A", "C");
  }

  @Test
  void moveDownBubblesTheSelectedRowDownwards() {
    var state = baseState();
    state.put("lines_selected_items", List.of(rowMap("B", 2, 1)));
    var increment = run("lines_move-down", state, Map.of());
    assertThat(lines(increment))
        .extracting(row -> row.get("concept"))
        .containsExactly("A", "C", "B");
  }

  @Test
  void moveUpOfTheFirstRowIsANoOp() {
    var state = baseState();
    state.put("lines_selected_items", List.of(rowMap("A", 1, 0)));
    var increment = run("lines_move-up", state, Map.of());
    assertThat(lines(increment))
        .extracting(row -> row.get("concept"))
        .containsExactly("A", "B", "C");
  }
}
