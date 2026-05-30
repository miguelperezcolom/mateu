package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getView;
import static io.mateu.core.domain.out.componentmapper.PageListingBuilder.getColumns;
import static io.mateu.core.domain.out.componentmapper.PageListingBuilder.getFilters;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getTitle;
import static io.mateu.core.infra.declarative.FormViewModel.createBadges;
import static io.mateu.core.infra.declarative.FormViewModel.createKpis;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.core.infra.declarative.orchestrators.ViewOrchestrator;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrudOrchestrator;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudOrchestrator;
import io.mateu.uidl.annotations.SplitCrud;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.interfaces.Deleteable;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

public class SplitListRouteResolver implements CrudOrchestratorRouteResolver {

  @Override
  public boolean supports(String route, HttpRequest httpRequest, ViewOrchestrator orchestrator) {
    if (!orchestrator.getClass().isAnnotationPresent(SplitCrud.class)) return false;
    if (route.endsWith("/new") || route.contains("/edit/")) return false;
    return true;
  }

  @Override
  public OrchestrationResult resolve(
      String route, HttpRequest httpRequest, CrudOrchestrator orchestrator) {
    String selectedId = extractSelectedId(route, orchestrator, httpRequest);
    return new OrchestrationResult(
        "list",
        orchestrator.list(httpRequest),
        createSplitComponent(selectedId, httpRequest, orchestrator));
  }

  private String extractSelectedId(
      String route, CrudOrchestrator orchestrator, HttpRequest httpRequest) {
    var consumedRoute = orchestrator.getConsumedRoute(httpRequest);
    if (route.endsWith("/list") || route.equals(consumedRoute)) return null;
    var suffix = route.startsWith(consumedRoute) ? route.substring(consumedRoute.length()) : route;
    if (suffix.startsWith("/")) suffix = suffix.substring(1);
    return suffix.isEmpty() ? null : suffix;
  }

  public static Component createSplitComponent(
      String selectedId, HttpRequest httpRequest, CrudOrchestrator orchestrator) {
    Component listing = createListingComponent(httpRequest, orchestrator);
    Component detail =
        selectedId != null ? createDetailComponent(selectedId, httpRequest, orchestrator) : null;

    String title;
    httpRequest.setAttribute("windowTitle", title = orchestrator.title());

    return PageView.builder()
        .title(title)
        .style("width: 100%;")
        .content(List.of(new MasterDetailLayout(listing, detail)))
        .build();
  }

  public static Component createListingComponent(
      HttpRequest httpRequest, CrudOrchestrator orchestrator) {
    var toolbar = new ArrayList<UserTrigger>();
    orchestrator.addButtonsToList(toolbar);
    if (!orchestrator.readOnly()) {
      toolbar.add(new Button("New", "new"));
      if (orchestrator instanceof AutoCrudOrchestrator
          || Deleteable.class.isAssignableFrom(orchestrator.viewClass())) {
        toolbar.add(
            Button.builder()
                .label("Delete")
                .actionId("delete")
                .variant(ButtonVariant.error)
                .build());
      }
    }

    List<GridContent> columns =
        Stream.concat(
                getColumns(
                    orchestrator.rowClass(),
                    null,
                    "base_url",
                    httpRequest.runActionRq().route(),
                    httpRequest.runActionRq().initiatorComponentId(),
                    httpRequest)
                    .stream(),
                Stream.of(
                    GridColumn.builder()
                        .label("Action")
                        .id("_action")
                        .stereotype(FieldStereotype.button)
                        .actionId("view")
                        .text("View")
                        .build()))
            .toList();

    return PageView.builder()
        .content(
            List.of(
                Listing.builder()
                    .listingType(ListingType.table)
                    .title("Xxx")
                    .searchable(orchestrator.searchable())
                    .rowsSelectionEnabled(orchestrator.selectionEnabled())
                    .columns(columns)
                    .filters(
                        getFilters(
                            orchestrator.filtersClass(),
                            null,
                            "base_url",
                            httpRequest.runActionRq().route(),
                            httpRequest.runActionRq().consumedRoute(),
                            httpRequest.runActionRq().initiatorComponentId(),
                            httpRequest))
                    .style("min-width: 30rem; display: block;")
                    .build()))
        .toolbar(toolbar)
        .build();
  }

  public static Component createDetailComponent(
      String selectedId, HttpRequest httpRequest, CrudOrchestrator orchestrator) {
    var view = orchestrator.view(orchestrator.toId(selectedId), httpRequest);
    Object viewModel = view instanceof AutoNamedView autoNamedView ? autoNamedView.entity() : view;
    var toolbar = ViewToolbarBuilder.createViewToolbar(viewModel, orchestrator);
    String title = getTitle(viewModel);
    return PageView.builder()
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
  }
}
