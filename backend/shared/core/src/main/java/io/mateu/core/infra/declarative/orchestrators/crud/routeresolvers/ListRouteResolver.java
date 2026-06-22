package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import static io.mateu.core.domain.out.componentmapper.PageListingBuilder.getColumns;
import static io.mateu.core.domain.out.componentmapper.PageListingBuilder.getFilters;

import io.mateu.core.infra.declarative.orchestrators.MultiView;
import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.annotations.NotCreatable;
import io.mateu.uidl.annotations.NotDeletable;
import io.mateu.uidl.annotations.NotNavigable;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.interfaces.Auditable;
import io.mateu.uidl.interfaces.Deleteable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.UploadEnabled;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class ListRouteResolver implements CrudOrchestratorRouteResolver {
  @Override
  public boolean supports(String route, HttpRequest httpRequest, MultiView orchestrator) {
    if (route.endsWith("/list")) return true;
    var pathPart = route.contains("?") ? route.substring(0, route.indexOf('?')) : route;
    var cleanPath =
        pathPart.endsWith("/") ? pathPart.substring(0, pathPart.length() - 1) : pathPart;
    return cleanPath.equals(orchestrator.getConsumedRoute(httpRequest));
  }

  @Override
  public OrchestrationResult resolve(String route, HttpRequest httpRequest, Crud orchestrator) {
    return new OrchestrationResult(
        "list", orchestrator.list(httpRequest), createListComponent(httpRequest, orchestrator));
  }

  private static boolean notCreatable(Crud orchestrator) {
    return orchestrator.readOnly()
        || orchestrator.getClass().isAnnotationPresent(NotCreatable.class);
  }

  private static boolean notDeletable(Crud orchestrator) {
    return orchestrator.readOnly()
        || orchestrator.getClass().isAnnotationPresent(NotDeletable.class);
  }

  private List<GridContent> withViewOnFirstColumn(Collection<? extends GridContent> rawColumns) {
    var list = new ArrayList<GridContent>(rawColumns);
    if (list.isEmpty() || !(list.get(0) instanceof GridColumn first)) {
      return list;
    }
    list.set(0, first.toBuilder().actionId("view").build());
    return list;
  }

  private int parseInitialPage(String route) {
    if (route == null || !route.contains("?")) return 0;
    var query = route.substring(route.indexOf('?') + 1);
    for (var param : query.split("&")) {
      var parts = param.split("=", 2);
      if (parts.length == 2 && "page".equals(parts[0])) {
        try {
          return Integer.parseInt(parts[1]);
        } catch (NumberFormatException ignored) {
          return 0;
        }
      }
    }
    return 0;
  }

  private Component createListComponent(HttpRequest httpRequest, Crud orchestrator) {
    var toolbar = new ArrayList<UserTrigger>();
    orchestrator.addButtonsToList(toolbar);
    if (orchestrator instanceof UploadEnabled) {
      toolbar.add(new Button(orchestrator.importLabel(), "import"));
    }
    if (orchestrator instanceof Auditable) {
      toolbar.add(new Button(orchestrator.historyLabel(), "history"));
    }
    if (!notCreatable(orchestrator)) {
      toolbar.add(new Button(orchestrator.newLabel(), "new"));
    }
    if (!notDeletable(orchestrator)
        && (orchestrator instanceof AutoCrud
            || Deleteable.class.isAssignableFrom(orchestrator.viewClass()))) {
      toolbar.add(
          Button.builder()
              .label(orchestrator.deleteLabel())
              .actionId("delete")
              .variant(ButtonVariant.error)
              .build());
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
            : orchestrator.getClass().isAnnotationPresent(NotNavigable.class)
                ? (List<GridContent>)
                    getColumns(
                        orchestrator.rowClass(),
                        this,
                        "base_url",
                        httpRequest.runActionRq().route(),
                        httpRequest.runActionRq().initiatorComponentId(),
                        httpRequest)
                : withViewOnFirstColumn(
                    getColumns(
                        orchestrator.rowClass(),
                        this,
                        "base_url",
                        httpRequest.runActionRq().route(),
                        httpRequest.runActionRq().initiatorComponentId(),
                        httpRequest));
    String title;
    httpRequest.setAttribute("windowTitle", title = orchestrator.title());
    return PageView.builder()
        .style(orchestrator.getStyleForList(columns))
        .content(
            List.of(
                Listing.builder()
                    .listingType(ListingType.table)
                    .title(title)
                    .toolbar(toolbar)
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
                    .initialPage(parseInitialPage(httpRequest.runActionRq().route()))
                    .gridLayout(orchestrator.gridLayout())
                    .build()))
        .build();
  }
}
