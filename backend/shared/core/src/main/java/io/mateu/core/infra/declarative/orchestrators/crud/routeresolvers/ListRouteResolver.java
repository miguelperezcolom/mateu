package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import static io.mateu.core.domain.out.componentmapper.PageListingBuilder.getColumns;
import static io.mateu.core.domain.out.componentmapper.PageListingBuilder.getFilters;

import io.mateu.core.infra.declarative.orchestrators.MultiView;
import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.NotCreatable;
import io.mateu.uidl.annotations.NotDeletable;
import io.mateu.uidl.annotations.NotNavigable;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.interfaces.Auditable;
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
        || MetaAnnotations.isPresent(orchestrator.metadataSource(), NotCreatable.class);
  }

  private static boolean notDeletable(Crud orchestrator) {
    return orchestrator.readOnly()
        || MetaAnnotations.isPresent(orchestrator.metadataSource(), NotDeletable.class);
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

  /**
   * The formats a registered ListingExporter writes (the toolbar is built before ExporterContext is
   * set).
   */
  private static java.util.Set<io.mateu.uidl.data.ExportFormat> availableExportFormats() {
    try {
      return io.mateu.core.domain.act.ListingExporters.formats(
          io.mateu.uidl.di.MateuBeanProvider.getBeans(
              io.mateu.uidl.interfaces.ListingExporter.class));
    } catch (RuntimeException notInitialised) {
      return java.util.EnumSet.noneOf(io.mateu.uidl.data.ExportFormat.class);
    }
  }

  private Component createListComponent(HttpRequest httpRequest, Crud orchestrator) {
    var toolbar = new ArrayList<UserTrigger>();
    orchestrator.addButtonsToList(toolbar);
    if (orchestrator.behaviourSource() instanceof UploadEnabled) {
      toolbar.add(new Button(orchestrator.importLabel(), "import"));
    }
    if (orchestrator.behaviourSource() instanceof Auditable) {
      toolbar.add(new Button(orchestrator.historyLabel(), "history"));
    }
    // export the listing (Listing.csvExportable/excelExportable/pdfExportable): an AutoCrud is a
    // Listing and ExportActionRunner answers it; a button only when an exporter writes the format
    toolbar.addAll(
        io.mateu.core.domain.act.ListingExporters.exportButtons(
            orchestrator, availableExportFormats()));
    var display = orchestrator.display();
    if (!notCreatable(orchestrator) && orchestrator.canCreate() && display.create().shown()) {
      toolbar.add(
          new Button(orchestrator.newLabel(), "new")
              .toBuilder().disabled(!display.create().enabled()).build());
    }
    if (!notDeletable(orchestrator) && orchestrator.canDelete() && display.delete().shown()) {
      toolbar.add(
          Button.builder()
              .label(orchestrator.deleteLabel())
              .actionId("delete")
              .variant(ButtonVariant.error)
              .disabled(!display.delete().enabled())
              .build());
    }
    List<GridContent> columns =
        MetaAnnotations.isPresent(getClass(), ReadOnly.class)
            ? (List<GridContent>)
                getColumns(
                    orchestrator.viewClass(),
                    orchestrator,
                    "base_url",
                    httpRequest.runActionRq().route(),
                    httpRequest.runActionRq().initiatorComponentId(),
                    httpRequest)
            : MetaAnnotations.isPresent(orchestrator.metadataSource(), NotNavigable.class)
                    || !(orchestrator.canView() || orchestrator.editInDrawer())
                ? (List<GridContent>)
                    getColumns(
                        orchestrator.rowClass(),
                        orchestrator,
                        "base_url",
                        httpRequest.runActionRq().route(),
                        httpRequest.runActionRq().initiatorComponentId(),
                        httpRequest)
                : withViewOnFirstColumn(
                    getColumns(
                        orchestrator.rowClass(),
                        orchestrator,
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
                    // a @Subresource island: the host draws the title (or leaves it out)
                    .title(
                        io.mateu.core.domain.out.componentmapper.EmbeddedOrchestratorFieldBuilder
                                .isHideTitleRequest(httpRequest)
                            ? null
                            : title)
                    .toolbar(toolbar)
                    .searchable(orchestrator.searchable())
                    // @Compact on the crud: dense rows (Vaadin's compact theme, Redwood's grid)
                    .compact(
                        MetaAnnotations.isPresent(
                            orchestrator.metadataSource(), io.mateu.uidl.annotations.Compact.class))
                    .rowsSelectionEnabled(orchestrator.selectionEnabled())
                    .groupBy(
                        io.mateu.core.infra.declarative.orchestrators.crud.ListingSummarySpec.of(
                                orchestrator.rowClass())
                            .groupBy())
                    .rowStatusField(
                        io.mateu.core.infra.declarative.orchestrators.crud.ListingSummarySpec
                            .rowStatusFieldOf(orchestrator.rowClass()))
                    .dragType(
                        io.mateu.core.infra.declarative.orchestrators.crud.ListingSummarySpec
                            .dragTypeOf(orchestrator.metadataSource()))
                    .columns(columns)
                    .detailPath(
                        io.mateu.core.domain.out.componentmapper.PageListingBuilder.getDetailPath(
                            orchestrator.rowClass()))
                    // @RowRoute: a row opens a route (a record master), not the crud's own view
                    .rowRoute(rowRouteOf(orchestrator))
                    .filters(
                        getFilters(
                            orchestrator.filtersClass(),
                            this,
                            "base_url",
                            httpRequest.runActionRq().route(),
                            httpRequest.runActionRq().consumedRoute(),
                            httpRequest.runActionRq().initiatorComponentId(),
                            httpRequest,
                            // crud semantics: temporals/annotated numerics as ranges, enums as
                            // multi-selects — their values travel as criteria, not in the example
                            true))
                    .style(
                        io.mateu.core.domain.out.componentmapper.PageListingBuilder
                            .LISTING_BOX_STYLE)
                    .initialPage(parseInitialPage(httpRequest.runActionRq().route()))
                    .gridLayout(orchestrator.gridLayout())
                    .build()))
        .build();
  }

  private static String rowRouteOf(Object orchestrator) {
    var type =
        orchestrator instanceof io.mateu.core.infra.declarative.orchestrators.MultiView multiView
            ? io.mateu.core.infra.reflection.ClassLoaders.forName(multiView.serverSideTypeName())
            : orchestrator.getClass();
    var rowRoute =
        io.mateu.core.infra.reflection.MetaAnnotations.find(
            type, io.mateu.uidl.annotations.RowRoute.class);
    return rowRoute == null || rowRoute.value().isBlank() ? null : rowRoute.value();
  }
}
