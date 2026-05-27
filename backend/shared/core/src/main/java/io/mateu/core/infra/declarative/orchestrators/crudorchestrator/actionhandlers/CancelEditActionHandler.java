package io.mateu.core.infra.declarative.orchestrators.crudorchestrator.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crudorchestrator.CrudOrchestrator;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;

public class CancelEditActionHandler implements CrudActionHandler {

  @Override
  public boolean supports(String actionId) {
    return "cancel-edit".equals(actionId);
  }

  @Override
  @SuppressWarnings("unchecked")
  public CrudActionResult handle(
      CrudOrchestrator<?, ?, ?, ?, ?, ?> orchestrator,
      CrudActionResult current,
      HttpRequest httpRequest) {
    var idField = orchestrator.getIdFieldForRow();
    var savedId = httpRequest.getComponentState(Map.class).get(idField);
    if (savedId == null) {
      savedId = httpRequest.runActionRq().parameters().get(idField);
    }
    if (savedId == null) {
      var initiatorState =
          (Map<String, Object>) httpRequest.runActionRq().parameters().get("initiatorState");
      if (initiatorState != null) {
        savedId = initiatorState.get(idField);
      }
    }
    return current.withSavedId(savedId).withRoute("/" + savedId);
  }
}
