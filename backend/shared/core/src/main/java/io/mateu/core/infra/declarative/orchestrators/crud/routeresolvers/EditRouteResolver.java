package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import io.mateu.core.infra.declarative.orchestrators.MultiView;
import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.interfaces.HttpRequest;

public class EditRouteResolver implements CrudOrchestratorRouteResolver {
  @Override
  public boolean supports(String route, HttpRequest httpRequest, MultiView orchestrator) {
    return route.endsWith("/edit");
  }

  @Override
  public OrchestrationResult resolve(String route, HttpRequest httpRequest, Crud orchestrator) {
    route = route.substring(0, route.lastIndexOf("/edit"));
    var id = route.substring(httpRequest.runActionRq().consumedRoute().length() + 1);
    var editor = orchestrator.edit(orchestrator.toId(id), httpRequest);
    httpRequest.setAttribute("selectedItem", editor);
    return new OrchestrationResult(
        "edit", editor, CrudFormComponentBuilder.build(false, httpRequest, editor, orchestrator));
  }
}
