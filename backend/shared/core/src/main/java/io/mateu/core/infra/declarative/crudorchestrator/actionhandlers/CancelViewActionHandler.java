package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;

public class CancelViewActionHandler implements CrudActionHandler {

  @Override
  public boolean supports(String actionId) {
    return "cancel-view".equals(actionId);
  }

  @Override
  @SuppressWarnings("unchecked")
  public CrudActionResult handle(
      CrudOrchestrator<?, ?, ?, ?, ?, ?> orchestrator,
      CrudActionResult current,
      HttpRequest httpRequest) {
    var idField = orchestrator.getIdFieldForRow();
    var savedId = httpRequest.getComponentState(Map.class).get(idField);
    return current.withSavedId(savedId).withActionId("");
  }
}
