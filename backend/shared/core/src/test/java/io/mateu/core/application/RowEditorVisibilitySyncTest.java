package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.OnValueChangeTriggerDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The editor of a {@code List<Row>} field's row asks the ROW whether each field shows: a row class
 * implementing {@link VisibilitySupplier} shows only the fields its values call for — when the
 * editor opens (Edit, "+"), on Prev/Next, and again when a field the visibility depends on changes
 * ({@code <field>_refresh-detail}, fired by an OnValueChange trigger on that field only).
 */
class RowEditorVisibilitySyncTest {

  public enum BlockType {
    HTML,
    LINKS,
    GREETING
  }

  @SuppressWarnings("unused")
  public static class Block implements VisibilitySupplier {
    public BlockType type = BlockType.HTML;
    public String title;
    public String html;
    public String links;
    public boolean pinned;
    public String note;

    public Block() {}

    @Override
    public boolean isHidden(String memberName, HttpRequest httpRequest) {
      return switch (memberName) {
        case "html" -> type != BlockType.HTML;
        case "links" -> type != BlockType.LINKS;
        default -> false;
      };
    }
  }

  @SuppressWarnings("unused")
  @UI("/page")
  public static class PageForm {
    String name = "Home";
    List<Block> blocks = new ArrayList<>();
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(PageForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static Map<String, Object> block(String type, String title, int rowNumber) {
    var row = new HashMap<String, Object>();
    row.put("type", type);
    row.put("title", title);
    row.put("pinned", false);
    row.put("_rowNumber", rowNumber);
    return row;
  }

  private static Map<String, Object> baseState() {
    var state = new HashMap<String, Object>();
    state.put("name", "Home");
    state.put("blocks", List.of(block("HTML", "Welcome", 0), block("LINKS", "Shortcuts", 1)));
    return state;
  }

  private UIIncrementDto run(
      String actionId, Map<String, Object> state, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/page")
            .actionId(actionId)
            .serverSideType(PageForm.class.getName())
            .componentState(state)
            .parameters(parameters)
            .initiatorComponentId("form1_app")
            .build());
  }

  private static ServerSideComponentDto editor(UIIncrementDto increment) {
    return increment.fragments().stream()
        .map(fragment -> fragment.component())
        .filter(ServerSideComponentDto.class::isInstance)
        .map(ServerSideComponentDto.class::cast)
        .filter(component -> Block.class.getName().equals(component.serverSideType()))
        .findFirst()
        .orElseThrow();
  }

  private static List<String> fieldIds(ServerSideComponentDto editor) {
    return FieldKindsSyncTest.collect(editor, FormFieldDto.class).stream()
        .map(FormFieldDto::fieldId)
        .toList();
  }

  private static List<String> refreshTriggerFields(ServerSideComponentDto editor) {
    return editor.triggers() == null
        ? List.of()
        : editor.triggers().stream()
            .filter(OnValueChangeTriggerDto.class::isInstance)
            .map(OnValueChangeTriggerDto.class::cast)
            .filter(trigger -> "blocks_refresh-detail".equals(trigger.actionId()))
            .map(OnValueChangeTriggerDto::propertyName)
            .toList();
  }

  @Test
  void editingARowShowsOnlyTheFieldsItsTypeUses() {
    var increment = run("blocks_select", baseState(), Map.of("_rowNumber", 1));
    var fields = fieldIds(editor(increment));
    assertThat(fields).contains("type", "title", "links", "pinned", "note");
    assertThat(fields).doesNotContain("html");
  }

  @Test
  void aNewRowShowsTheFieldsOfItsDefaultType() {
    var increment = run("blocks_add", baseState(), Map.of());
    var fields = fieldIds(editor(increment));
    assertThat(fields).contains("type", "title", "html");
    assertThat(fields).doesNotContain("links");
  }

  @Test
  void onlyTheFieldsTheVisibilityDependsOnFireARefresh() {
    var increment = run("blocks_select", baseState(), Map.of("_rowNumber", 0));
    // type decides what shows; pinned (a boolean) and the texts do not
    assertThat(refreshTriggerFields(editor(increment))).containsExactly("type");
  }

  @Test
  void theHolderAdvertisesTheRefreshAsABackgroundRead() {
    var increment = mateu.sync("/page");
    var component = (ServerSideComponentDto) increment.fragments().get(0).component();
    var refresh =
        component.actions().stream()
            .filter(action -> "blocks_refresh-detail".equals(action.id()))
            .findFirst()
            .orElseThrow();
    assertThat(refresh.background()).isTrue();
    assertThat(refresh.validationRequired()).isFalse();
    assertThat(component.actions()).extracting(ActionDto::id).contains("blocks_select");
  }

  @Test
  void changingTheTypeRebuildsTheEditorWithTheEditedValues() {
    var edited = block("LINKS", "Welcome!", 0);
    edited.put("_position", "1/2");
    var increment = run("blocks_refresh-detail", baseState(), Map.of("initiatorState", edited));
    // only the editor comes back: the holder's state (the list, which editor is open) stays
    assertThat(increment.fragments())
        .noneMatch(fragment -> fragment.component() == null && fragment.state() != null);
    var editor = editor(increment);
    assertThat(fieldIds(editor)).contains("links").doesNotContain("html");
    assertThat(editor.containerId()).isEqualTo("blocks-container");
    @SuppressWarnings("unchecked")
    var state = (Map<String, Object>) editor.initialData();
    assertThat(state).containsEntry("title", "Welcome!").containsEntry("_position", "1/2");
    // still the editor of an existing row: Save, not Create
    var increment2 = io.mateu.core.infra.JsonSerializer.toJson(increment);
    assertThat(increment2).contains("blocks_save").doesNotContain("blocks_create");
  }

  @Test
  void aNewRowsEditorStaysANewRowsEditorOnRefresh() {
    var edited = block("GREETING", "Hi", 7);
    var increment = run("blocks_refresh-detail", baseState(), Map.of("initiatorState", edited));
    var editor = editor(increment);
    assertThat(fieldIds(editor)).doesNotContain("html", "links");
    assertThat(io.mateu.core.infra.JsonSerializer.toJson(increment)).contains("blocks_create");
  }

  @Test
  void prevAndNextRebuildTheEditorForTheNeighbour() {
    var current = block("HTML", "Welcome", 0);
    current.put("_position", "1/2");
    var increment = run("blocks_next", baseState(), Map.of("initiatorState", current));
    var fields = fieldIds(editor(increment));
    assertThat(fields).contains("links").doesNotContain("html");
    assertThat(Set.copyOf(fields)).contains("title");
  }
}
