package io.mateu.uidl.interfaces;

import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.RunActionRqDto;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Framework-agnostic abstraction over the incoming HTTP request that Mateu injects into any action
 * or supplier method that declares it as a parameter. It exposes the request path ({@link #path()},
 * {@link #lastPathItem()}), query parameters, headers and attributes, plus typed accessors over the
 * submitted component state and action parameters — e.g. {@link #getSelectedRows(Class)}, {@link
 * #getClickedRow(Class)}, {@link #getParameters(Class)}, {@link #getComponentState(Class)} and
 * {@link #getInitiatorState(Class)} — each of which reconstructs a strongly-typed object from the
 * request payload.
 */
public interface HttpRequest {

  default String getBaseUrl() {
    return (String) getAttribute("baseUrl");
  }

  default String getUriPrefix() {
    return (String) getAttribute("uriPrefix");
  }

  default RunActionRqDto runActionRq() {
    var value = getAttribute("payload_run_action_rq");
    if (value instanceof Optional<?> optional) {
      return (RunActionRqDto) optional.get();
    }
    return (RunActionRqDto) value;
  }

  default GetUIRqDto getUiRq() {
    var value = getAttribute("payload_get_ui_rq");
    if (value instanceof Optional<?> optional) {
      return (GetUIRqDto) optional.get();
    }
    return (GetUIRqDto) value;
  }

  default HttpRequest storeRunActionRqDto(RunActionRqDto runActionRqDto) {
    setAttribute("payload_run_action_rq", runActionRqDto);
    return this;
  }

  default HttpRequest storeGetUIRqDto(GetUIRqDto getUIRqDto) {
    setAttribute("payload_get_ui_rq", getUIRqDto);
    return this;
  }

  String getParameterValue(String name);

  List<String> getParameterValues(String name);

  Object getAttribute(String key);

  void setAttribute(String key, Object value);

  default String getString(String key) {
    return (String) runActionRq().componentState().get(key);
  }

  default int getInt(String key) {
    var value = runActionRq().componentState().getOrDefault(key, "0");
    if (value instanceof Integer) {
      return (Integer) value;
    }
    if (value instanceof Long) {
      return ((Long) value).intValue();
    }
    var stringValue = "" + value;
    if ("".equals(stringValue)) {
      return 0;
    }
    return Integer.parseInt(stringValue);
  }

  default double getDouble(String key) {
    var value = runActionRq().componentState().getOrDefault(key, "0");
    if (value instanceof Double) {
      return (Double) value;
    }
    if (value instanceof Integer) {
      return (Integer) value;
    }
    if (value instanceof Long) {
      return (Long) value;
    }
    var stringValue = "" + value;
    if ("".equals(stringValue)) {
      return 0;
    }
    return Double.parseDouble(stringValue);
  }

  default List<Map<String, Object>> getListOfMaps(String key) {
    return (List<Map<String, Object>>) runActionRq().componentState().getOrDefault(key, List.of());
  }

  String getHeaderValue(String key);

  List<String> getHeaderValues(String key);

  default <T> List<T> getSelectedRows(Class<T> rowType) {
    List<Map<String, Object>> selection =
        (List<Map<String, Object>>) runActionRq().componentState().get("crud_selected_items");
    if (selection == null) {
      if (runActionRq().parameters() != null
          && runActionRq().parameters().get("initiatorState") != null) {
        selection =
            (List<Map<String, Object>>)
                ((Map<String, Object>) runActionRq().parameters().get("initiatorState"))
                    .get("crud_selected_items");
      }
    }
    if (selection != null) {
      return selection.stream()
          .map(data -> MateuInstanceFactory.newInstance(rowType, data, this))
          .toList();
    }
    return List.of();
  }

  default <T> List<T> getSelectedRows(String fieldName, Class<T> rowType) {
    return ((List<Map<String, Object>>)
            runActionRq().componentState().getOrDefault(fieldName + "_selected_items", List.of()))
        .stream().map(data -> MateuInstanceFactory.newInstance(rowType, data, this)).toList();
  }

  default <T> T getClickedRow(Class<T> rowType) {
    if (runActionRq().parameters() == null) {
      return null;
    }
    var data = runActionRq().parameters().get("_clickedRow");
    if (data != null) {
      return MateuInstanceFactory.newInstance(rowType, (Map<String, Object>) data, this);
    }
    return null;
  }

  default <T> T getParameters(Class<T> rowType) {
    if (runActionRq().parameters() == null) {
      return null;
    }
    if (Map.class.equals(rowType)) {
      return (T) runActionRq().parameters();
    }
    return MateuInstanceFactory.newInstance(rowType, runActionRq().parameters(), this);
  }

  default <T> T getAppState(Class<T> appStateType) {
    return MateuInstanceFactory.newInstance(appStateType, runActionRq().appState(), this);
  }

  default <T> T getComponentState(Class<T> componentStateType) {
    return MateuInstanceFactory.newInstance(
        componentStateType, runActionRq().componentState(), this);
  }

  /**
   * State of the component that originated a bubbled action. When a nested form/editor bubbles an
   * action up to a parent (e.g. a mediator handling its child's {@code save}), the originating
   * component's own state travels in {@code parameters.initiatorState}. This returns it built into
   * {@code type}, falling back to the regular component state when no bubbling happened.
   */
  @SuppressWarnings("unchecked")
  default <T> T getInitiatorState(Class<T> type) {
    var parameters = runActionRq().parameters();
    if (parameters != null
        && parameters.get("initiatorState") instanceof Map<?, ?> initiatorState) {
      return MateuInstanceFactory.newInstance(type, (Map<String, Object>) initiatorState, this);
    }
    return getComponentState(type);
  }

  String path();

  default String lastPathItem() {
    var items = path().split("/");
    return items[items.length - 1];
  }

  default String penultimatePathItem() {
    var items = path().split("/");
    return items[items.length - 2];
  }

  List<String> getParameterNames();
}
