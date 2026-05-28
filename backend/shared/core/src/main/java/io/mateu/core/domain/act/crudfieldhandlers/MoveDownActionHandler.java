package io.mateu.core.domain.act.crudfieldhandlers;

import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class MoveDownActionHandler {

  public static Object handleMoveDown(
      Object crudOrchestrator,
      String actionId,
      HttpRequest httpRequest,
      String _state,
      Map<String, Object> _show_detail,
      Map<String, Object> _editing,
      Field field,
      String fieldId) {
    _show_detail.put(fieldId, false);

    var selectedLines =
        (List) httpRequest.runActionRq().componentState().get(fieldId + "_selected_items");
    var fullList = (List) httpRequest.runActionRq().componentState().get(fieldId);

    if (selectedLines != null && fullList != null) {
      var mutableList = new ArrayList<>(fullList);
      int size = mutableList.size();

      // Bubble downward: start at size-2 because the last element cannot move lower
      for (int i = size - 2; i >= 0; i--) {
        var currentItem = mutableList.get(i);
        if (selectedLines.contains(currentItem)) {
          int targetIndex = i + 1;
          var itemBelow = mutableList.get(targetIndex);
          // Only swap if the item below is not also selected, so groups move together
          if (!selectedLines.contains(itemBelow)) {
            mutableList.set(targetIndex, currentItem);
            mutableList.set(i, itemBelow);
          }
        }
      }

      var newState = CrudFieldHandlerHelper.newStateMap(httpRequest, _show_detail, _editing);
      newState.put(fieldId, mutableList);
      return new State(newState);
    }
    return CrudFieldHandlerHelper.buildState(httpRequest, _show_detail, _editing);
  }
}
