package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.interfaces.HttpRequest;

public class NewActionHandler implements CrudActionHandler {

  @Override
  public boolean supports(String actionId) {
    return "new".equals(actionId);
  }

  @Override
  @SuppressWarnings("unchecked")
  public CrudActionResult handle(
      CrudOrchestrator<?, ?, ?, ?, ?, ?> orchestrator,
      CrudActionResult current,
      HttpRequest httpRequest) {
    return current.withRoute("/new");
  }
}
