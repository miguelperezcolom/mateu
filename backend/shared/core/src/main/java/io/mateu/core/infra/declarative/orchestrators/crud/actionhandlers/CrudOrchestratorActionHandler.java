package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.CrudOrchestrator;
import io.mateu.core.infra.declarative.orchestrators.crudorchestrator.actionhandlers.CrudActionResult;
import io.mateu.uidl.interfaces.HttpRequest;

public interface CrudOrchestratorActionHandler {
  boolean supports(String actionId, HttpRequest httpRequest);

  Object handleAction(String actionId, HttpRequest httpRequest, CrudOrchestrator orchestrator);
}
