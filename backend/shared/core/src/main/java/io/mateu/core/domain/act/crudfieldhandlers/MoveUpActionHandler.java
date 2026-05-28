package io.mateu.core.domain.act.crudfieldhandlers;

import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class MoveUpActionHandler {

  public static Object handleMoveUp(
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

      // Bubble upward: start at 1 because index 0 cannot move higher
      for (int i = 1; i < mutableList.size(); i++) {
        var currentItem = mutableList.get(i);
        if (selectedLines.contains(currentItem)) {
          int targetIndex = i - 1;
          var itemAbove = mutableList.get(targetIndex);
          // Only swap if the item above is not also selected, so groups move together
          if (!selectedLines.contains(itemAbove)) {
            mutableList.set(targetIndex, currentItem);
            mutableList.set(i, itemAbove);
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
