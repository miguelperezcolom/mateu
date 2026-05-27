package io.mateu.core.infra.declarative.orchestrators.crudorchestrator.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crudorchestrator.CrudOrchestrator;
import io.mateu.uidl.interfaces.HttpRequest;

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
    return current.withRoute("/list");
  }
}
