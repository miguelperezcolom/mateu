package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.interfaces.HttpRequest;

public class CancelViewActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return "cancel-view".equals(actionId);
  }

  @Override
  public Object handleAction(
      String actionId, HttpRequest httpRequest, Crud orchestrator) {
    return CrudActionResult.of(actionId).withRoute("/list");
  }
}
