package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.uidl.interfaces.SelectedItem;
import io.mateu.uidl.interfaces.Selector;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Predicate;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * {@code @Searchable} on MULTI-valued fields — {@code List}, {@code Set} and arrays of ids: the
 * field metadata and labels, the selector modal (row selection + «Add selected», the current ids
 * travelling with it), adding picked rows (merged, deduplicated, in order) and the value
 * round-tripping into the view model for String, Long and UUID ids.
 */
class SearchableMultiSyncTest {

  private static final ObjectMapper JSON = new ObjectMapper();

  // ── selectors ───────────────────────────────────────────────────────────────

  public record HotelRow(String id, String name) {}

  public static class HotelSelector
      implements Listing<HotelRow>, Selector<String>, LookupLabelSupplier {
    static final List<HotelRow> ROWS =
        List.of(
            new HotelRow("h1", "Hotel One"),
            new HotelRow("h2", "Hotel Two"),
            new HotelRow("h3", "Hotel Three"));

    String fieldId;

    @Override
    public ListingData<HotelRow> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(ROWS);
    }

    @Override
    public SelectedItem<String> selected(HttpRequest httpRequest) {
      var row = httpRequest.getClickedRow(HotelRow.class);
      return row == null ? null : new SelectedItem<>(row.id(), row.name());
    }

    @Override
    public String fieldId() {
      return fieldId;
    }

    @Override
    public Selector withFieldId(String name) {
      this.fieldId = name;
      return this;
    }

    @Override
    public String label(String fieldName, Object id, HttpRequest httpRequest) {
      return ROWS.stream()
          .filter(row -> row.id().equals(String.valueOf(id)))
          .map(HotelRow::name)
          .findFirst()
          .orElseThrow();
    }
  }

  public record CodeRow(Long id, String name) {}

  /** Overrides selectedItems: reads the checked rows itself. */
  public static class CodeSelector implements Listing<CodeRow>, Selector<Long> {
    String fieldId;

    @Override
    public ListingData<CodeRow> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(List.of(new CodeRow(1L, "One"), new CodeRow(2L, "Two")));
    }

    @Override
    public SelectedItem<Long> selected(HttpRequest httpRequest) {
      var row = httpRequest.getClickedRow(CodeRow.class);
      return new SelectedItem<>(row.id(), row.name());
    }

    @Override
    public List<SelectedItem<Long>> selectedItems(HttpRequest httpRequest) {
      return httpRequest.getSelectedRows(CodeRow.class).stream()
          .map(row -> new SelectedItem<>(row.id(), "#" + row.name()))
          .toList();
    }

    @Override
    public String fieldId() {
      return fieldId;
    }

    @Override
    public Selector withFieldId(String name) {
      this.fieldId = name;
      return this;
    }
  }

  // ── the form ────────────────────────────────────────────────────────────────

  static MultiForm captured;

  @SuppressWarnings("unused")
  @UI("/multi-search")
  public static class MultiForm {
    @Searchable(selector = HotelSelector.class, label = HotelSelector.class)
    List<String> hotels = new ArrayList<>(List.of("h1", "h3"));

    // no label=: the selector, being a LookupLabelSupplier, labels its own ids
    @Searchable(selector = HotelSelector.class)
    Set<String> favourites;

    @Searchable(selector = CodeSelector.class)
    Set<Long> codes;

    @Searchable(selector = HotelSelector.class)
    UUID[] refs;

    @Searchable(selector = HotelSelector.class, label = HotelSelector.class)
    String hotel = "h2";

    @Action
    void capture() {
      captured = this;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(MultiForm.class, HotelSelector.class, CodeSelector.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ── metadata + labels ───────────────────────────────────────────────────────

  @Test
  void multiValuedFieldsAreSearchableArraysNotNestedForms() {
    var root = tree(mateu.sync("/multi-search"));
    for (var fieldId : List.of("hotels", "favourites", "codes", "refs")) {
      var field = findFirst(root, node -> fieldId.equals(node.path("fieldId").asText()));
      assertThat(field).as(fieldId).isNotNull();
      assertThat(field.path("dataType").asText()).as(fieldId).isEqualTo("array");
      assertThat(field.path("stereotype").asText()).as(fieldId).isEqualTo("searchable");
    }
    var single = findFirst(root, node -> "hotel".equals(node.path("fieldId").asText()));
    assertThat(single.path("dataType").asText()).isEqualTo("string");
  }

  @Test
  void theLabelsOfEveryIdTravelInData() {
    var data = JSON.valueToTree(mateu.sync("/multi-search").fragments().get(0).data());
    assertThat(data.path("hotels-labels").path("h1").asText()).isEqualTo("Hotel One");
    assertThat(data.path("hotels-labels").path("h3").asText()).isEqualTo("Hotel Three");
    assertThat(data.path("hotels-label").asText()).isEqualTo("Hotel One, Hotel Three");
    // the single-valued field gets its label on load too
    assertThat(data.path("hotel-label").asText()).isEqualTo("Hotel Two");
  }

  @Test
  void anIdWithNoLabelShowsAsItself() {
    var increment =
        run(
            MultiForm.class,
            "",
            Map.of("hotels", List.of("h2", "zz"), "favourites", List.of("h1")));
    var data = JSON.valueToTree(increment.fragments().get(0).data());
    assertThat(data.path("hotels-labels").path("zz").asText()).isEqualTo("zz");
    assertThat(data.path("hotels-label").asText()).isEqualTo("Hotel Two, zz");
    // no label=: labelled by the selector
    assertThat(data.path("favourites-labels").path("h1").asText()).isEqualTo("Hotel One");
  }

  // ── the modal ───────────────────────────────────────────────────────────────

  @Test
  void codesearchOpensTheSelectorWithMultiSelectionAndTheCurrentIds() {
    var increment =
        run(MultiForm.class, "codesearch-hotels", Map.of("hotels", List.of("h1", "h3")));
    var root = tree(increment);
    var dialog = findFirst(root, node -> "Dialog".equals(node.path("type").asText()));
    assertThat(dialog).isNotNull();
    var selector =
        findFirst(
            root,
            node ->
                "ServerSide".equals(node.path("type").asText())
                    && node.path("serverSideType").asText().endsWith("HotelSelector"));
    var initialData = selector.path("initialData");
    assertThat(initialData.path("_searchableMulti").asBoolean()).isTrue();
    assertThat(initialData.path("_searchableValues").toString()).isEqualTo("[\"h1\",\"h3\"]");
    assertThat(initialData.path("_searchableLabels").path("h3").asText()).isEqualTo("Hotel Three");
    assertThat(initialData.path("fieldId").asText()).isEqualTo("hotels");
    assertThat(initialData.path("_searchableField").asText()).isEqualTo("hotels");

    var listing = findFirst(root, node -> node.has("rowsSelectionEnabled"));
    assertThat(listing.path("rowsSelectionEnabled").asBoolean()).isTrue();
    assertThat(listing.path("toolbar").toString()).contains("action-on-row-select-selected");
    assertThat(selector.path("actions").toString()).contains("action-on-row-select-selected");
  }

  @Test
  void aSingleValuedFieldOpensTheSelectorWithoutMultiSelection() {
    var root = tree(run(MultiForm.class, "codesearch-hotel", Map.of("hotel", "h2")));
    var selector =
        findFirst(
            root,
            node ->
                "ServerSide".equals(node.path("type").asText())
                    && node.path("serverSideType").asText().endsWith("HotelSelector"));
    assertThat(selector.path("initialData").has("_searchableMulti")).isFalse();
    var listing = findFirst(root, node -> node.has("rowsSelectionEnabled"));
    assertThat(listing.path("rowsSelectionEnabled").asBoolean()).isFalse();
    assertThat(listing.path("toolbar").toString()).doesNotContain("select-selected");
  }

  // ── adding picked rows ──────────────────────────────────────────────────────

  @Test
  void addSelectedMergesTheCheckedRowsKeepingOrderAndDroppingDuplicates() {
    var state = multiState("hotels", List.of("h1"), Map.of("h1", "Hotel One"));
    state.put(
        "crud_selected_items",
        List.of(
            Map.of("id", "h3", "name", "Hotel Three"), Map.of("id", "h1", "name", "Hotel One")));
    var commands = commands(run(HotelSelector.class, "action-on-row-select-selected", state));

    var value = event(commands, "value-changed");
    assertThat(value.path("fieldId").asText()).isEqualTo("hotels");
    assertThat(value.path("value").toString()).isEqualTo("[\"h1\",\"h3\"]");
    var labels = dataChange(commands, "hotels-labels");
    assertThat(labels.path("h1").asText()).isEqualTo("Hotel One");
    assertThat(labels.path("h3").asText()).isEqualTo("Hotel Three");
    assertThat(dataChange(commands, "hotels-label").asText()).isEqualTo("Hotel One, Hotel Three");
    assertThat(event(commands, "close-modal-requested")).isNotNull();
  }

  @Test
  void theCheckedRowsCanAlsoArriveAsActionParameters() {
    var state = multiState("hotels", List.of(), Map.of());
    var parameters =
        Map.<String, Object>of(
            "crud_selected_items", List.of(Map.of("id", "h2", "name", "Hotel Two")));
    var commands =
        commands(run(HotelSelector.class, "action-on-row-select-selected", state, parameters));
    assertThat(event(commands, "value-changed").path("value").toString()).isEqualTo("[\"h2\"]");
  }

  @Test
  void aRowClickAddsThatRowToAMultiValuedField() {
    var state = multiState("hotels", List.of("h1"), Map.of("h1", "Hotel One"));
    var commands =
        commands(
            run(
                HotelSelector.class,
                "action-on-row-select",
                state,
                Map.of("_clickedRow", Map.of("id", "h2", "name", "Hotel Two"))));
    assertThat(event(commands, "value-changed").path("value").toString())
        .isEqualTo("[\"h1\",\"h2\"]");
    assertThat(dataChange(commands, "hotels-labels").path("h2").asText()).isEqualTo("Hotel Two");
  }

  @Test
  void aRowClickOnASingleValuedFieldStillSetsTheId() {
    var state = new HashMap<String, Object>(Map.of("fieldId", "hotel"));
    var commands =
        commands(
            run(
                HotelSelector.class,
                "action-on-row-select",
                state,
                Map.of("_clickedRow", Map.of("id", "h2", "name", "Hotel Two"))));
    var value = event(commands, "value-changed");
    assertThat(value.path("fieldId").asText()).isEqualTo("hotel");
    assertThat(value.path("value").asText()).isEqualTo("h2");
    assertThat(dataChange(commands, "hotel-label").asText()).isEqualTo("Hotel Two");
    assertThat(event(commands, "close-modal-requested")).isNotNull();
  }

  @Test
  void aSelectorThatDoesNotKeepItsFieldIdUsesTheOneTheModalCarries() {
    var state = multiState("hotels", List.of(), Map.of());
    state.remove("fieldId");
    state.put("_searchableField", "hotels");
    state.put("crud_selected_items", List.of(Map.of("id", "h2", "name", "Hotel Two")));
    var commands = commands(run(HotelSelector.class, "action-on-row-select-selected", state));
    assertThat(event(commands, "value-changed").path("fieldId").asText()).isEqualTo("hotels");
  }

  @Test
  void withNoFieldToWriteToThePickJustClosesTheModal() {
    var state = new HashMap<String, Object>();
    var commands =
        commands(
            run(
                HotelSelector.class,
                "action-on-row-select",
                state,
                Map.of("_clickedRow", Map.of("id", "h2", "name", "Hotel Two"))));
    assertThat(event(commands, "value-changed")).isNull();
    assertThat(event(commands, "close-modal-requested")).isNotNull();
  }

  @Test
  void aSelectorCanOverrideSelectedItems() {
    var state = multiState("codes", List.of(2), Map.of("2", "Two"));
    state.put("crud_selected_items", List.of(Map.of("id", 1, "name", "One")));
    var commands = commands(run(CodeSelector.class, "action-on-row-select-selected", state));
    assertThat(event(commands, "value-changed").path("value").toString()).isEqualTo("[2,1]");
    assertThat(dataChange(commands, "codes-labels").path("1").asText()).isEqualTo("#One");
    assertThat(dataChange(commands, "codes-label").asText()).isEqualTo("Two, #One");
  }

  @Test
  void addSelectedWithNothingCheckedFallsBackToTheClickedRowOrNothing() {
    var state = multiState("hotels", List.of("h1"), Map.of("h1", "Hotel One"));
    var commands = commands(run(HotelSelector.class, "action-on-row-select-selected", state));
    // nothing picked: the field keeps its ids
    assertThat(event(commands, "value-changed").path("value").toString()).isEqualTo("[\"h1\"]");
  }

  // ── binding ─────────────────────────────────────────────────────────────────

  @Test
  void theIdsRoundTripIntoListsSetsAndArrays() {
    captured = null;
    var uuid = UUID.randomUUID();
    var state = new HashMap<String, Object>();
    state.put("hotels", List.of("h2", "h1"));
    state.put("favourites", List.of("h3", "h3", "h1"));
    state.put("codes", List.of(7, "8", 7));
    state.put("refs", List.of(uuid.toString()));
    state.put("hotel", "h3");
    run(MultiForm.class, "capture", state);
    assertThat(captured).isNotNull();
    assertThat(captured.hotels).containsExactly("h2", "h1");
    assertThat(captured.favourites).containsExactlyInAnyOrder("h3", "h1");
    assertThat(captured.codes).containsExactlyInAnyOrder(7L, 8L);
    assertThat(captured.refs).containsExactly(uuid);
    assertThat(captured.hotel).isEqualTo("h3");
  }

  // ── helpers ─────────────────────────────────────────────────────────────────

  private static HashMap<String, Object> multiState(
      String fieldId, List<?> values, Map<String, String> labels) {
    var state = new HashMap<String, Object>();
    state.put("fieldId", fieldId);
    state.put("_searchableMulti", true);
    state.put("_searchableValues", values);
    state.put("_searchableLabels", new LinkedHashMap<>(labels));
    return state;
  }

  private static UIIncrementDto run(Class<?> type, String actionId, Map<String, Object> state) {
    return run(type, actionId, state, Map.of());
  }

  private static UIIncrementDto run(
      Class<?> type, String actionId, Map<String, Object> state, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/multi-search")
            .consumedRoute("_empty")
            .actionId(actionId)
            .serverSideType(type.getName())
            .componentState(state)
            .parameters(parameters)
            .initiatorComponentId("ms1")
            .build());
  }

  private static JsonNode tree(UIIncrementDto increment) {
    return JSON.valueToTree(increment.fragments());
  }

  private static JsonNode commands(UIIncrementDto increment) {
    return JSON.valueToTree(increment.commands());
  }

  private static JsonNode event(JsonNode commands, String name) {
    for (var command : commands) {
      var data = command.path("data");
      if (name.equals(data.path("eventName").asText())) {
        return data.path("detail");
      }
    }
    return null;
  }

  private static JsonNode dataChange(JsonNode commands, String key) {
    for (var command : commands) {
      var data = command.path("data");
      if ("data-changed".equals(data.path("eventName").asText())
          && key.equals(data.path("detail").path("key").asText())) {
        return data.path("detail").path("value");
      }
    }
    return null;
  }

  private static JsonNode findFirst(JsonNode node, Predicate<JsonNode> test) {
    if (node == null) {
      return null;
    }
    if (node.isObject() && test.test(node)) {
      return node;
    }
    if (node.isContainerNode()) {
      for (var child : node) {
        var found = findFirst(child, test);
        if (found != null) {
          return found;
        }
      }
    }
    return null;
  }
}
