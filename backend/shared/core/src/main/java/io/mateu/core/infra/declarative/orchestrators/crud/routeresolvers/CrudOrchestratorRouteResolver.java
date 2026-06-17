package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.core.infra.declarative.orchestrators.MultiView;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.interfaces.HttpRequest;

public interface CrudOrchestratorRouteResolver {
  boolean supports(String route, HttpRequest httpRequest, MultiView orchestrator);

  OrchestrationResult resolve(String route, HttpRequest httpRequest, Crud orchestrator);
}
