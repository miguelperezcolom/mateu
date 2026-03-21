package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.crudfieldhandlers;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PrevActionHandler {

  public static Object handlePrev(
      CrudOrchestrator<?, ?, ?, ?, ?, ?> crudOrchestrator,
      String actionId,
      HttpRequest httpRequest,
      String _state,
      Map<String, Object> _show_detail,
      Map<String, Object> _editing,
      Field field,
      String fieldId) {
    var items = (List<Map<String, Object>>) httpRequest.runActionRq().componentState().get(fieldId);
    var position =
        crudOrchestrator.getIndex(
            items, httpRequest.runActionRq().componentState().get(fieldId + "-_rowNumber"));
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

    if (position <= 0) {
      throw new RuntimeException("This is the first item. No previous item to select.");
    }

    var values2 = items.get(position - 1);
    newState = new HashMap<>(httpRequest.runActionRq().componentState());
    for (String key : values2.keySet()) {
      newState.put(fieldId + "-" + key, values2.get(key));
    }
    newState.put("" + fieldId + "_position", "" + (position) + "/" + items.size());

    return new State(newState);
  }
}
