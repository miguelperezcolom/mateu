package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;

public class CancelEditActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return "cancel-edit".equals(actionId);
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest, Crud orchestrator) {
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
    return CrudActionResult.of(actionId).withSavedId(savedId).withRoute("/" + savedId);
  }
}
