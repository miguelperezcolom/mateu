package io.mateu.core.domain.act.crudfieldhandlers;

import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.*;

public class SelectActionHandler {

  public static Object handleSelect(
      Object crudOrchestrator,
      String actionId,
      HttpRequest httpRequest,
      String _state,
      Map<String, Object> _show_detail,
      Map<String, Object> _editing,
      Field field,
      String fieldId) {
    _show_detail.put(fieldId, true);
    _editing.put(fieldId, true);

    var rowNumber = httpRequest.runActionRq().parameters().get("_rowNumber");

    var values =
        ((List<Map<String, Object>>) httpRequest.runActionRq().componentState().get(fieldId))
            .stream().filter(map -> rowNumber.equals(map.get("_rowNumber"))).toList().get(0);
    var newState = new HashMap<>(httpRequest.runActionRq().componentState());
    for (String key : values.keySet()) {
      newState.put(fieldId + "-" + key, values.get(key));
    }
    var items = (List<Map<String, Object>>) httpRequest.runActionRq().componentState().get(fieldId);
    var position = 0;
    newState.put("" + fieldId + "_position", "" + (position + 1) + "/" + items.size());

    newState.put("_show_detail", _show_detail);
    newState.put("_editing", _editing);
    return new State(newState);
  }
}
