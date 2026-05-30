package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.CrudOrchestrator;
import io.mateu.uidl.interfaces.HttpRequest;

public interface CrudOrchestratorActionHandler {
  boolean supports(String actionId, HttpRequest httpRequest);

  default boolean supports(
      String actionId, HttpRequest httpRequest, CrudOrchestrator orchestrator) {
    return supports(actionId, httpRequest);
  }

  Object handleAction(String actionId, HttpRequest httpRequest, CrudOrchestrator orchestrator);
}
