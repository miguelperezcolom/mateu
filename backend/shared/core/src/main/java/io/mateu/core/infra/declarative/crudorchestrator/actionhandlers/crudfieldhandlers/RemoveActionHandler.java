package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.crudfieldhandlers;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RemoveActionHandler {

  public static Object handleRemove(
      CrudOrchestrator<?, ?, ?, ?, ?, ?> crudOrchestrator,
      String actionId,
      HttpRequest httpRequest,
      String _state,
      Map<String, Object> _show_detail,
      Map<String, Object> _editing,
      Field field,
      String fieldId) {
    String fieldId = actionId.substring(0, actionId.indexOf('_'));
    _show_detail.put(fieldId, false);
    var selectedLines =
        (List) httpRequest.runActionRq().componentState().get(fieldId + "_selected_items");
    if (selectedLines != null) {
      var list =
          ((List) httpRequest.runActionRq().componentState().get(fieldId))
              .stream()
                  .filter(
                      line ->
                          selectedLines.stream()
                              .filter(selected -> selected.equals(line))
                              .findAny()
                              .isEmpty())
                  .toList();
      var newState = new HashMap<>(httpRequest.runActionRq().componentState());
      newState.put(fieldId, list);
      return new State(newState);
    }
    return new State(crudOrchestrator);
  }
}
