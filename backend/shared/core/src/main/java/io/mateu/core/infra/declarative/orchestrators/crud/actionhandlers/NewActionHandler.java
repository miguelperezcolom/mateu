package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.CrudOrchestrator;
import io.mateu.core.infra.declarative.orchestrators.crudorchestrator.actionhandlers.CrudActionResult;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.Map;

public class NewActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return "new".equals(actionId);
  }

  @Override
  public Object handleAction(
      String actionId, HttpRequest httpRequest, CrudOrchestrator orchestrator) {
    return CrudActionResult.of(actionId).withRoute("/new");
  }
}
