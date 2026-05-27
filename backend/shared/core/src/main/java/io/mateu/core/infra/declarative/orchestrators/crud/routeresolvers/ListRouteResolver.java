package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getColumns;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getFilters;

import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.core.infra.declarative.orchestrators.ViewOrchestrator;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrudOrchestrator;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudOrchestrator;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.interfaces.Deleteable;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

public class ListRouteResolver implements CrudOrchestratorRouteResolver {
  @Override
  public boolean supports(String route, HttpRequest httpRequest, ViewOrchestrator orchestrator) {
    return route.endsWith("/list") || route.equals(orchestrator.getConsumedRoute(httpRequest));
  }

  @Override
  public OrchestrationResult resolve(
      String route, HttpRequest httpRequest, CrudOrchestrator orchestrator) {
    return new OrchestrationResult(
        "list", orchestrator.list(httpRequest), createListComponent(httpRequest, orchestrator));
  }

  private Component createListComponent(HttpRequest httpRequest, CrudOrchestrator orchestrator) {
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
        getClass().isAnnotationPresent(ReadOnly.class)
            ? (List<GridContent>)
                getColumns(
                    orchestrator.viewClass(),
                    this,
                    "base_url",
                    httpRequest.runActionRq().route(),
                    httpRequest.runActionRq().initiatorComponentId(),
                    httpRequest)
            : Stream.concat(
                    getColumns(
                        orchestrator.rowClass(),
                        this,
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
    String title;
    httpRequest.setAttribute("windowTitle", title = orchestrator.title());
    return Page.builder()
        .title(title)
        .style(orchestrator.getStyleForList(columns))
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
                            this,
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
}
