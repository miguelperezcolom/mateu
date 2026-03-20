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

    if (position <= 0) {
      throw new RuntimeException("This is the first item. No previous item to select.");
    }

    var values = items.get(position - 1);
    var newState = new HashMap<>(httpRequest.runActionRq().componentState());
    for (String key : values.keySet()) {
      newState.put(fieldId + "-" + key, values.get(key));
    }
    newState.put("" + fieldId + "_position", "" + (position) + "/" + items.size());

    return new State(newState);
  }
}
