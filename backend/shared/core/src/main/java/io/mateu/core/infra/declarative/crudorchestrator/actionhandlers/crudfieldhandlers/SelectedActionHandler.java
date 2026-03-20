package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.crudfieldhandlers;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SelectedActionHandler {

  public static Object handleSelected(
      CrudOrchestrator<?, ?, ?, ?, ?, ?> crudOrchestrator,
      String actionId,
      HttpRequest httpRequest,
      String _state,
      Map<String, Object> _show_detail,
      Map<String, Object> _editing,
      Field field,
      String fieldId) {
    var values =
        ((List<Map<String, Object>>)
                httpRequest.runActionRq().componentState().get(fieldId + "_selected_items"))
            .get(0);
    var newState = new HashMap<>(httpRequest.runActionRq().componentState());
    for (String key : values.keySet()) {
      newState.put(fieldId + "-" + key, values.get(key));
    }
    var items = (List<Map<String, Object>>) httpRequest.runActionRq().componentState().get(fieldId);
    var position = crudOrchestrator.getIndex(items, new HashMap<>(values).get("_rowNumber"));
    newState.put("" + fieldId + "_position", "" + (position + 1) + "/" + items.size());

    return new State(newState);
  }
}
