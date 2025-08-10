package io.mateu.uidl.interfaces;

import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.RunActionRqDto;
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

  Object getAttribute(String key);

  void setAttribute(String key, Object value);

  default String getString(String key) {
    return (String) runActionRq().componentState().get(key);
  }

  default int getInt(String key) {
    var stringValue = (String) runActionRq().componentState().getOrDefault(key, "0");
    if ("".equals(stringValue)) {
      return 0;
    }
    return Integer.parseInt(stringValue);
  }

  default double getDouble(String key) {
    var stringValue = (String) runActionRq().componentState().getOrDefault(key, "0");
    if ("".equals(stringValue)) {
      return 0;
    }
    return Double.parseDouble(stringValue);
  }
}
