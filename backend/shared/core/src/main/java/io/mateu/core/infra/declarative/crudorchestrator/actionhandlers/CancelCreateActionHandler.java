package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.interfaces.HttpRequest;

public class CancelCreateActionHandler implements CrudActionHandler {

  @Override
  public boolean supports(String actionId) {
    return "cancel-create".equals(actionId);
  }

  @Override
  public CrudActionResult handle(
      CrudOrchestrator<?, ?, ?, ?, ?, ?> orchestrator,
      CrudActionResult current,
      HttpRequest httpRequest) {
    return current.withActionId("");
  }
}
