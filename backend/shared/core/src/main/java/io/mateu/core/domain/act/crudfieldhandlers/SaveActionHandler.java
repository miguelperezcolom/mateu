package io.mateu.core.domain.act.crudfieldhandlers;

import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

public class SaveActionHandler {

  public static Object handleSave(
      Object crudOrchestrator,
      String actionId,
      HttpRequest httpRequest,
      String _state,
      Map<String, Object> _show_detail,
      Map<String, Object> _editing,
      Field field,
      String fieldId) {
    _show_detail.put(fieldId, false);
    _editing.put(fieldId, false);

    Map<String, Object> filteredState =
        (Map<String, Object>) httpRequest.runActionRq().parameters().get("initiatorState");

    var newState = CrudFieldHandlerHelper.newStateMap(httpRequest, _show_detail, _editing);
    List<Map<String, Object>> list = (List<Map<String, Object>>) newState.get(fieldId);
    var row =
        list.stream()
            .filter(l -> l.get("_rowNumber").equals(filteredState.get("_rowNumber")))
            .findFirst()
            .orElseThrow();
    for (String key : filteredState.keySet()) {
      row.put(key, filteredState.get(key));
    }
    return new State(newState);
  }
}
