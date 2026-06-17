package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getView;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getTitle;
import static io.mateu.core.infra.declarative.FormViewModel.createBadges;
import static io.mateu.core.infra.declarative.FormViewModel.createKpis;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.core.infra.declarative.orchestrators.MultiView;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class ViewRouteResolver implements CrudOrchestratorRouteResolver {
  @Override
  public boolean supports(String route, HttpRequest httpRequest, MultiView orchestrator) {
    return true;
  }

  @Override
  public OrchestrationResult resolve(
      String route, HttpRequest httpRequest, Crud orchestrator) {
    var id = route.substring(orchestrator.getConsumedRoute(httpRequest).length() + 1);
    var view = orchestrator.view(orchestrator.toId(id), httpRequest);
    httpRequest.setAttribute("selectedItem", view);
    return new OrchestrationResult(
        "view", view, createViewComponent(httpRequest, view, orchestrator));
  }

  private Component createViewComponent(
      HttpRequest httpRequest, Object view, Crud orchestrator) {
    Object viewModel = view instanceof AutoNamedView autoNamedView ? autoNamedView.entity() : view;
    var toolbar = createViewToolbar(viewModel, orchestrator, httpRequest);
    String title;
    httpRequest.setAttribute("windowTitle", title = getTitle(viewModel));
    var page =
        PageView.builder()
            .title(title)
            .style(orchestrator.getStyleForView())
            .badges(createBadges(viewModel))
            .kpis(createKpis(viewModel))
            .content(
                getView(
                        viewModel,
                        "base_url",
                        httpRequest.runActionRq().route(),
                        httpRequest.runActionRq().consumedRoute(),
                        httpRequest.runActionRq().initiatorComponentId(),
                        httpRequest,
                        true,
                        false)
                    .stream()
                    .toList())
            .toolbar(toolbar)
            .build();
    return page;
  }

  private List<UserTrigger> createViewToolbar(
      Object item, Crud orchestrator, HttpRequest httpRequest) {
    return ViewToolbarBuilder.createViewToolbar(item, orchestrator, httpRequest);
  }
}
