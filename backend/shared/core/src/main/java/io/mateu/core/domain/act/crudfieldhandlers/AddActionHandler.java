package io.mateu.core.domain.act.crudfieldhandlers;

import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.*;
import lombok.SneakyThrows;

import static io.mateu.core.infra.declarative.WizardOrchestrator.addRowNumber;

public class AddActionHandler {

  @SneakyThrows
  public static Object handleAdd(
      Object instance,
      String actionId,
      HttpRequest httpRequest,
      String _state,
      Map<String, Object> _show_detail,
      Map<String, Object> _editing,
      Field field,
      String fieldId) {
    _show_detail.put(fieldId, true);
    _editing.put(fieldId, false);

    var newState = new HashMap<>(httpRequest.runActionRq().componentState());
    newState.put("_show_detail", _show_detail);
    newState.put("_editing", _editing);
      addRowNumber(instance.getClass(), newState);
    return new State(newState);
  }
}
