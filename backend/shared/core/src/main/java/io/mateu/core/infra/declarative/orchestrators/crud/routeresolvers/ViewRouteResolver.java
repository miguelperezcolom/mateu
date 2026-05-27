package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.*;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getView;
import static io.mateu.core.infra.declarative.FormViewModel.createBadges;
import static io.mateu.core.infra.declarative.FormViewModel.createKpis;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.core.infra.declarative.orchestrators.ViewOrchestrator;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudOrchestrator;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ModelSupplier;
import java.util.ArrayList;
import java.util.List;

public class ViewRouteResolver implements CrudOrchestratorRouteResolver {
  @Override
  public boolean supports(String route, HttpRequest httpRequest, ViewOrchestrator orchestrator) {
    return true;
  }

  @Override
  public OrchestrationResult resolve(
      String route, HttpRequest httpRequest, CrudOrchestrator orchestrator) {
      var id = route.substring(orchestrator.getConsumedRoute(httpRequest).length() + 1);
    var view = orchestrator.view(orchestrator.toId(id), httpRequest);
    httpRequest.setAttribute("selectedItem", view);
    return new OrchestrationResult(
        "view", view, createViewComponent(httpRequest, view, orchestrator));
  }

  private Component createViewComponent(
      HttpRequest httpRequest, Object view, CrudOrchestrator orchestrator) {
    Object viewModel = view instanceof AutoNamedView autoNamedView ? autoNamedView.entity() : view;
    var toolbar = createViewToolbar(viewModel, orchestrator);
    String title;
    httpRequest.setAttribute("windowTitle", title = getTitle(viewModel));
    var page =
        Page.builder()
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

  private List<UserTrigger> createViewToolbar(Object item, CrudOrchestrator orchestrator) {
    var toolbar = new ArrayList<UserTrigger>();
    getAllMethods(orchestrator.getClass()).stream()
        .filter(method -> method.isAnnotationPresent(ViewToolbarButton.class))
        .forEach(
            method -> {
              toolbar.add(
                  new Button(
                      toUpperCaseFirst(method.getName()), "action-on-view-" + method.getName()));
            });
    var entity = item;
    if (entity instanceof AutoNamedView<?> autoNamedView) {
      entity = autoNamedView.entity();
    }
    getAllMethods(entity.getClass()).stream()
        .filter(method -> method.isAnnotationPresent(Toolbar.class))
        .forEach(
            method -> {
              toolbar.add(
                  new Button(
                      toUpperCaseFirst(method.getName()), "action-on-view-" + method.getName()));
            });
    toolbar.add(new Button("Back to list", "cancel-view"));
    if (!readOnly(item, orchestrator)) {
      toolbar.add(new Button("Add another", "new"));
      toolbar.add(new Button("Edit", "edit"));
    }
    return toolbar;
  }

  private boolean readOnly(Object item, CrudOrchestrator orchestrator) {
    if (orchestrator.readOnly()) {
      return true;
    }
    if (orchestrator.viewClass().isAnnotationPresent(ReadOnly.class)) {
      return true;
    }
    if (item instanceof ModelSupplier modelSupplier) {
      return modelSupplier.model().getClass().isAnnotationPresent(ReadOnly.class);
    }
    return false;
  }
}
