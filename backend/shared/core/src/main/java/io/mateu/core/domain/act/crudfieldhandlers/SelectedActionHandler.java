package io.mateu.core.domain.act.crudfieldhandlers;

import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

public class SelectedActionHandler {

  public static Object handleSelected(
      Object crudOrchestrator,
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
    var newState = CrudFieldHandlerHelper.newStateMap(httpRequest, _show_detail, _editing);
    for (String key : values.keySet()) {
      newState.put(fieldId + "-" + key, values.get(key));
    }
    var items = (List<Map<String, Object>>) httpRequest.runActionRq().componentState().get(fieldId);
    var position = getIndex(items, values.get("_rowNumber"));
    newState.put("" + fieldId + "_position", "" + (position + 1) + "/" + items.size());
    return new State(newState);
  }

  public static int getIndex(List<Map<String, Object>> list, Object rowNumber) {
    return CrudFieldHandlerHelper.findPositionByRowNumber(list, rowNumber);
  }
}
