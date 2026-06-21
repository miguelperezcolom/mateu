package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import io.mateu.core.infra.declarative.orchestrators.MultiView;
import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.interfaces.HttpRequest;

public class NewRouteResolver implements CrudOrchestratorRouteResolver {
  @Override
  public boolean supports(String route, HttpRequest httpRequest, MultiView orchestrator) {
    return route.endsWith("/new");
  }

  @Override
  public OrchestrationResult resolve(String route, HttpRequest httpRequest, Crud orchestrator) {
    var editor = orchestrator.adapter().getCreationForm(httpRequest);
    httpRequest.setAttribute("selectedItem", editor);
    return new OrchestrationResult(
        "new", editor, CrudFormComponentBuilder.build(true, httpRequest, editor, orchestrator));
  }

}
