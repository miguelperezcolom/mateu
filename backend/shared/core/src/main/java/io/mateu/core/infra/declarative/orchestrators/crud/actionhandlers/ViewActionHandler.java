package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;

public class ViewActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return "view".equals(actionId);
  }

  @Override
  public Object handleAction(
      String actionId, HttpRequest httpRequest, Crud orchestrator) {
    var idField = orchestrator.getIdFieldForRow();
    var savedId = httpRequest.getComponentState(Map.class).get(idField);
    if (savedId == null) {
      savedId = httpRequest.runActionRq().parameters().get(idField);
    }
    return CrudActionResult.of(actionId).withSavedId(savedId).withRoute("/" + savedId);
  }
}
