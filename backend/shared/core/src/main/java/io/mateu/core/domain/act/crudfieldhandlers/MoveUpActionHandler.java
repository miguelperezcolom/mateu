package io.mateu.core.domain.act.crudfieldhandlers;

import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
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
      // 1. Creamos una copia mutable de la lista actual
      var mutableList = new ArrayList<>(fullList);

      // 2. Aplicamos la lógica de "burbujeo" hacia arriba
      // Empezamos en 1 porque el elemento en 0 no puede subir más
      for (int i = 1; i < mutableList.size(); i++) {
        var currentItem = mutableList.get(i);

        // Si el elemento está seleccionado, intentamos moverlo
        if (selectedLines.contains(currentItem)) {
          int targetIndex = i - 1;
          var itemAbove = mutableList.get(targetIndex);

          // Solo intercambiamos si el de arriba NO está seleccionado
          // Esto permite que grupos de filas seleccionadas suban juntos
          if (!selectedLines.contains(itemAbove)) {
            mutableList.set(targetIndex, currentItem);
            mutableList.set(i, itemAbove);
          }
        }
      }

      // 3. Construimos el nuevo estado con la lista reordenada
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
