package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.crudfieldhandlers;


import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.*;
import lombok.SneakyThrows;

public class AddActionHandler {

  @SneakyThrows
  public static Object handleAdd(
      CrudOrchestrator<?, ?, ?, ?, ?, ?> crudOrchestrator,
      String actionId,
      HttpRequest httpRequest,
      String _state,
      Map<String, Object> _show_detail,
      Map<String, Object> _editing,
      Field field,
      String fieldId) {
    _show_detail.put(fieldId, true);
    _editing.put(fieldId, false);

    return new State(crudOrchestrator);
  }
}
