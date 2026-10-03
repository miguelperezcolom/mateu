package io.mateu.uidl.interfaces;

import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.CustomEvent;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * The glue between a {@code @Searchable} field and the {@link Selector} it opens in a modal: what
 * the selector answers when a row is picked (single-valued field) or rows are added (multi-valued
 * field — {@code List}, {@code Set} or array of ids).
 *
 * <p>The modal carries, in the selector's component state, whether the field is multi-valued
 * ({@link #MULTI}), the ids it holds when the modal opened ({@link #VALUES}) and their labels
 * ({@link #LABELS}). On a pick the selector answers the merged value — current ids first, the new
 * ones appended in order, duplicates dropped — so the renderer just sets it, like any other value.
 *
 * <p>Wire, for a field {@code f}: state {@code f} = the ids; data {@code f-label} = the labels
 * joined by ", " (the read-only text) and, for a multi-valued field, data {@code f-labels} = {@code
 * {id → label}} (the chips).
 *
 * <p>Framework-internal: application code implements {@link Selector} and never calls this.
 */
public final class SearchableSelection {

  /** Component-state key: the field the selector writes to. */
  public static final String FIELD = "_searchableField";

  /** Component-state key: the selector serves a multi-valued field. */
  public static final String MULTI = "_searchableMulti";

  /** Component-state key: the ids the multi-valued field held when the modal opened. */
  public static final String VALUES = "_searchableValues";

  /** Component-state key: {@code {id → label}} for {@link #VALUES}. */
  public static final String LABELS = "_searchableLabels";

  /** The action of the «Add selected» button of a multi-valued field's selector. */
  public static final String ADD_SELECTED_ACTION = "select-selected";

  /** The suffix of the data key carrying {@code {id → label}} for a multi-valued field. */
  public static final String LABELS_SUFFIX = "-labels";

  /** The suffix of the data key carrying the display text of the field. */
  public static final String LABEL_SUFFIX = "-label";

  private static final String SELECTED_ROWS = "crud_selected_items";

  private SearchableSelection() {}

  /**
   * The field the selector writes to: its own {@link Selector#fieldId()} or, when the selector does
   * not keep it in its state, the one the modal carries ({@link #FIELD}).
   */
  public static String fieldIdOf(Selector<?> selector, HttpRequest httpRequest) {
    var fieldId = selector.fieldId();
    if (fieldId != null && !fieldId.isBlank()) {
      return fieldId;
    }
    var carried = httpRequest != null ? componentState(httpRequest).get(FIELD) : null;
    return carried != null ? String.valueOf(carried) : null;
  }

  /** Whether the action comes from the selector of a multi-valued field. */
  public static boolean isMulti(HttpRequest httpRequest) {
    if (httpRequest == null) {
      return false;
    }
    var attribute = httpRequest.getAttribute(MULTI);
    if (attribute instanceof java.util.Optional<?> optional) {
      attribute = optional.orElse(null);
    }
    if (Boolean.TRUE.equals(attribute)) {
      return true;
    }
    var state = componentState(httpRequest);
    var value = state.get(MULTI);
    return Boolean.TRUE.equals(value) || "true".equals(String.valueOf(value));
  }

  /**
   * The commands a selector answers for the picked {@code items}: set the field's value, its
   * label(s), and close the modal. For a single-valued field only the first item counts.
   */
  public static List<UICommand> commands(
      Selector<?> selector, List<? extends SelectedItem<?>> items, HttpRequest httpRequest) {
    var picked =
        items == null
            ? List.<SelectedItem<?>>of()
            : items.stream().filter(Objects::nonNull).toList();
    var fieldId = fieldIdOf(selector, httpRequest);
    if (fieldId == null) {
      // nothing to write the pick to: just close the modal
      return List.of(event("close-modal-requested", null));
    }
    var commands = new ArrayList<UICommand>();
    if (isMulti(httpRequest)) {
      var labels = new LinkedHashMap<String, String>(currentLabels(httpRequest));
      var values = new ArrayList<Object>();
      var seen = new LinkedHashSet<String>();
      for (var value : currentValues(httpRequest)) {
        if (value != null && seen.add(String.valueOf(value))) {
          values.add(value);
        }
      }
      for (var item : picked) {
        var key = String.valueOf(item.id());
        if (item.id() != null && seen.add(key)) {
          values.add(item.id());
        }
        if (item.id() != null) {
          labels.put(key, item.label() != null ? item.label() : key);
        }
      }
      var orderedLabels = new LinkedHashMap<String, String>();
      for (var value : values) {
        var key = String.valueOf(value);
        orderedLabels.put(key, labels.getOrDefault(key, key));
      }
      commands.add(event("value-changed", Map.of("fieldId", fieldId, "value", values)));
      commands.add(
          event("data-changed", Map.of("key", fieldId + LABELS_SUFFIX, "value", orderedLabels)));
      commands.add(
          event(
              "data-changed",
              Map.of(
                  "key",
                  fieldId + LABEL_SUFFIX,
                  "value",
                  String.join(", ", orderedLabels.values()))));
    } else {
      if (picked.isEmpty()) {
        return List.of();
      }
      var item = picked.get(0);
      var value = new HashMap<String, Object>();
      value.put("fieldId", fieldId);
      value.put("value", item.id());
      commands.add(event("value-changed", value));
      var label = new HashMap<String, Object>();
      label.put("key", fieldId + LABEL_SUFFIX);
      label.put("value", item.label());
      commands.add(event("data-changed", label));
    }
    commands.add(event("close-modal-requested", null));
    return commands;
  }

  /**
   * The checked rows of the selector's listing, each mapped through {@link
   * Selector#selected(HttpRequest)} as if it were the clicked row. The request is restored after.
   */
  static <IdType> List<SelectedItem<IdType>> selectedItemsByRow(
      Selector<IdType> selector, HttpRequest httpRequest) {
    var rows = selectedRows(httpRequest);
    if (rows.isEmpty()) {
      var one = selector.selected(httpRequest);
      return one == null ? List.of() : List.of(one);
    }
    var original = httpRequest.runActionRq();
    var out = new ArrayList<SelectedItem<IdType>>();
    for (var row : rows) {
      var parameters =
          new HashMap<String, Object>(
              original.parameters() != null ? original.parameters() : Map.of());
      parameters.put("_clickedRow", row);
      var rowRequest =
          new ClickedRowRequest(
              httpRequest,
              new RunActionRqDto(
                  original.componentState(),
                  original.appState(),
                  parameters,
                  original.initiatorComponentId(),
                  original.consumedRoute(),
                  original.actionId(),
                  original.route(),
                  original.serverSideType(),
                  original.serverSideComponentRoute(),
                  original.knownStructureHash()));
      var item = selector.selected(rowRequest);
      if (item != null) {
        out.add(item);
      }
    }
    return out;
  }

  /** The checked rows, as raw maps: from the action parameters or the component state. */
  @SuppressWarnings("unchecked")
  static List<Map<String, Object>> selectedRows(HttpRequest httpRequest) {
    var rq = httpRequest.runActionRq();
    if (rq == null) {
      return List.of();
    }
    Object rows = rq.parameters() != null ? rq.parameters().get(SELECTED_ROWS) : null;
    if (!(rows instanceof Collection<?>) || ((Collection<?>) rows).isEmpty()) {
      rows = rq.componentState().get(SELECTED_ROWS);
    }
    if (rows instanceof Collection<?> collection) {
      return collection.stream()
          .filter(Map.class::isInstance)
          .map(row -> (Map<String, Object>) row)
          .toList();
    }
    return List.of();
  }

  private static Map<String, Object> componentState(HttpRequest httpRequest) {
    var rq = httpRequest.runActionRq();
    return rq != null ? rq.componentState() : Map.of();
  }

  private static List<Object> currentValues(HttpRequest httpRequest) {
    var value = componentState(httpRequest).get(VALUES);
    if (value instanceof Collection<?> collection) {
      return new ArrayList<>(collection);
    }
    if (value != null && value.getClass().isArray()) {
      var out = new ArrayList<Object>();
      for (int i = 0; i < java.lang.reflect.Array.getLength(value); i++) {
        out.add(java.lang.reflect.Array.get(value, i));
      }
      return out;
    }
    return List.of();
  }

  private static Map<String, String> currentLabels(HttpRequest httpRequest) {
    var value = componentState(httpRequest).get(LABELS);
    if (value instanceof Map<?, ?> map) {
      return map.entrySet().stream()
          .filter(e -> e.getKey() != null)
          .collect(
              Collectors.toMap(
                  e -> String.valueOf(e.getKey()),
                  e ->
                      e.getValue() != null
                          ? String.valueOf(e.getValue())
                          : String.valueOf(e.getKey()),
                  (a, b) -> a,
                  LinkedHashMap::new));
    }
    return Map.of();
  }

  private static UICommand event(String name, Object detail) {
    return UICommand.builder()
        .type(io.mateu.uidl.data.UICommandType.DispatchEvent)
        .data(CustomEvent.builder().eventName(name).detail(detail).build())
        .build();
  }

  /** The request as seen by {@link Selector#selected(HttpRequest)} for one checked row. */
  private record ClickedRowRequest(HttpRequest delegate, RunActionRqDto rq) implements HttpRequest {

    @Override
    public RunActionRqDto runActionRq() {
      return rq;
    }

    @Override
    public String getParameterValue(String name) {
      return delegate.getParameterValue(name);
    }

    @Override
    public List<String> getParameterValues(String name) {
      return delegate.getParameterValues(name);
    }

    @Override
    public Object getAttribute(String key) {
      return "payload_run_action_rq".equals(key) ? rq : delegate.getAttribute(key);
    }

    @Override
    public void setAttribute(String key, Object value) {
      delegate.setAttribute(key, value);
    }

    @Override
    public String getHeaderValue(String key) {
      return delegate.getHeaderValue(key);
    }

    @Override
    public List<String> getHeaderValues(String key) {
      return delegate.getHeaderValues(key);
    }

    @Override
    public String path() {
      return delegate.path();
    }

    @Override
    public List<String> getParameterNames() {
      return delegate.getParameterNames();
    }
  }
}
