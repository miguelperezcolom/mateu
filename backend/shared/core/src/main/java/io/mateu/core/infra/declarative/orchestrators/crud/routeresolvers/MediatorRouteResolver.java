package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;

import io.mateu.core.infra.declarative.orchestrators.MultiView;
import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.interfaces.HttpRequest;

public class MediatorRouteResolver implements CrudOrchestratorRouteResolver {
  @Override
  public boolean supports(String route, HttpRequest httpRequest, MultiView orchestrator) {
    // if this is a first time, we return the mediator app
    return !orchestrator.getClass().getName().equals(httpRequest.runActionRq().serverSideType());
  }

  @Override
  public OrchestrationResult resolve(String route, HttpRequest httpRequest, Crud orchestrator) {
    return new OrchestrationResult("mediator", orchestrator, dto(httpRequest, orchestrator));
  }

  public ComponentDto dto(HttpRequest httpRequest, Crud orchestrator) {
    return wrapRoute((String) httpRequest.getAttribute("resolvedPath"), httpRequest, orchestrator);
  }

  public ServerSideComponentDto wrapRoute(
      String route, HttpRequest httpRequest, Crud orchestrator) {
    httpRequest.setAttribute("mediator", true);
    var consumedRoute = (String) httpRequest.getAttribute("resolvedPath");
    if (!route.equals(consumedRoute))
      orchestrator.setRouteTo(route.substring(consumedRoute.length()));
    httpRequest.setAttribute(
        "upstreamComponentId", httpRequest.runActionRq().initiatorComponentId() + "_app");
    return wrap(
        AppShell.builder()
            .clientSideComponentId(httpRequest.runActionRq().initiatorComponentId() + "_cs")
            .homeRoute(route)
            .serverSideType(orchestrator.getClass().getName())
            .homeConsumedRoute(consumedRoute)
            .variant(AppVariant.MEDIATOR)
            .style("width: 100%;")
            .build(),
        this,
        (String) httpRequest.getAttribute("baseUrl"),
        consumedRoute,
        consumedRoute,
        httpRequest.runActionRq().initiatorComponentId() + "_x",
        httpRequest);
  }
}
