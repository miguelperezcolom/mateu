package io.mateu.core.domain.act.crudfieldhandlers;

import static io.mateu.core.infra.declarative.CrudOrchestrator.getIndex;

import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.HashMap;
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

    var items = (List<Map<String, Object>>) httpRequest.runActionRq().componentState().get(fieldId);
    var position =
        getIndex(items, httpRequest.runActionRq().componentState().get(fieldId + "-_rowNumber"));
    var values = items.get(position);

    var newState = new HashMap<>(httpRequest.runActionRq().componentState());
    List<Map<String, Object>> list = (List<Map<String, Object>>) newState.get(fieldId);
    var row =
        list.stream()
            .filter(l -> l.get("_rowNumber").equals(values.get("_rowNumber")))
            .findFirst()
            .orElseThrow();
    for (String key : values.keySet()) {
      row.put(key, newState.get(fieldId + "-" + key));
    }

    newState.put("_show_detail", _show_detail);
    newState.put("_editing", _editing);
    return new State(newState);
  }
}
