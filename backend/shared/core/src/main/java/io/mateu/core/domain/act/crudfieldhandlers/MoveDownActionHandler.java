package io.mateu.core.domain.act.crudfieldhandlers;

import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
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

      var selectedLines = (List) httpRequest.runActionRq().componentState().get(fieldId + "_selected_items");
      var fullList = (List) httpRequest.runActionRq().componentState().get(fieldId);

      if (selectedLines != null && fullList != null) {
          var mutableList = new ArrayList<>(fullList);
          int size = mutableList.size();

          // 1. Iteramos de abajo hacia arriba
          // Empezamos en size - 2 porque el último elemento (size - 1) no puede bajar más
          for (int i = size - 2; i >= 0; i--) {
              var currentItem = mutableList.get(i);

              // 2. Si el elemento está seleccionado...
              if (selectedLines.contains(currentItem)) {
                  int targetIndex = i + 1;
                  var itemBelow = mutableList.get(targetIndex);

                  // 3. ...y el de abajo NO está seleccionado, los intercambiamos
                  if (!selectedLines.contains(itemBelow)) {
                      mutableList.set(targetIndex, currentItem);
                      mutableList.set(i, itemBelow);
                  }
              }
          }

          var newState = new HashMap<>(httpRequest.runActionRq().componentState());
          newState.put(fieldId, mutableList);
          newState.put("_show_detail", _show_detail);
          newState.put("_editing", _editing);

          return new State(newState);
      }
    var newState = new HashMap<>(httpRequest.runActionRq().componentState());
    newState.put("_show_detail", _show_detail);
    newState.put("_editing", _editing);
    return new State(newState);
  }
}
