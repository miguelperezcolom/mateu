package io.mateu.uidl.interfaces;

import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.RunActionRqDto;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface HttpRequest {

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
    return ((List<Map<String, Object>>)
            runActionRq().componentState().getOrDefault("crud_selected_items", List.of()))
        .stream().map(data -> MateuInstanceFactory.newInstance(rowType, data)).toList();
  }

  default <T> T getClickedRow(Class<T> rowType) {
    if (runActionRq().parameters() == null) {
      return null;
    }
    var data = runActionRq().parameters().get("_clickedRow");
    if (data != null) {
      return MateuInstanceFactory.newInstance(rowType, (Map<String, Object>) data);
    }
    return null;
  }

  default <T> T getParameters(Class<T> rowType) {
    if (runActionRq().parameters() == null) {
      return null;
    }
    return MateuInstanceFactory.newInstance(rowType, runActionRq().parameters());
  }

  default <T> T getAppState(Class<T> appStateType) {
    return MateuInstanceFactory.newInstance(appStateType, runActionRq().appState());
  }

  default <T> T getComponentState(Class<T> componentStateType) {
    return MateuInstanceFactory.newInstance(componentStateType, runActionRq().componentState());
  }
}
