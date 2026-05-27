package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.core.infra.declarative.orchestrators.ViewOrchestrator;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudOrchestrator;
import io.mateu.uidl.interfaces.HttpRequest;

public interface CrudOrchestratorRouteResolver {
  boolean supports(String route, HttpRequest httpRequest, ViewOrchestrator orchestrator);

  OrchestrationResult resolve(String route, HttpRequest httpRequest, CrudOrchestrator orchestrator);
}
