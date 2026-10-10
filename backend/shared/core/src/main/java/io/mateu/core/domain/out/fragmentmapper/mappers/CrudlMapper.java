package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.CrudlTypeDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.uidl.fluent.Listing;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class CrudlMapper {

  /**
   * The names of the path parameters of the request route's chain — the parameters every level of a
   * record master (customers/:customerId/orders) reads off the URL. A listing filter with one of
   * these names is fixed by where the listing is mounted, not chosen by the user.
   */
  static java.util.Set<String> routeScope(HttpRequest httpRequest) {
    if (httpRequest == null || httpRequest.runActionRq() == null) {
      return java.util.Set.of();
    }
    var cached = httpRequest.getAttribute("_routeScope");
    if (cached instanceof java.util.Set<?> set) {
      @SuppressWarnings("unchecked")
      var names = (java.util.Set<String>) set;
      return names;
    }
    var names = new java.util.LinkedHashSet<String>();
    io.mateu.core.application.runaction.RouteChains.chainOf(httpRequest.runActionRq().route())
        .forEach(link -> names.addAll(link.pathParams().keySet()));
    names.addAll(
        io.mateu.core.domain.out.componentmapper.EmbeddedOrchestratorFieldBuilder.scopeOf(
            httpRequest));
    httpRequest.setAttribute("_routeScope", names);
    return names;
  }

  public static ComponentDto mapCrudlToDto(
      Listing crudl,
      ComponentTreeSupplier componentSupplier,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var crudlDto =
        CrudlDto.builder()
            .crudlType(
                crudl.listingType() != null
                    ? CrudlTypeDto.valueOf(crudl.listingType().name())
                    : CrudlTypeDto.table)
            .title(
                io.mateu.core.application.runaction.RouteChains.dedupeTitle(
                    crudl.title(), httpRequest))
            .subtitle(crudl.subtitle())
            .searchable(crudl.searchable())
            .toolbar(crudl.toolbar().stream().map(FormMapper::mapToButtonDto).toList())
            .columns(
                crudl.columns().stream()
                    .map(
                        column ->
                            mapComponentToDto(
                                null,
                                column,
                                baseUrl,
                                route,
                                consumedRoute,
                                initiatorComponentId,
                                httpRequest))
                    .toList())
            .filters(
                crudl.filters() != null
                    ? crudl.filters().stream()
                        .map(
                            filter ->
                                FormFieldDto.builder()
                                    .fieldId(filter.id())
                                    .label(filter.label())
                                    .dataType(filter.dataType().name())
                                    .stereotype(filter.stereotype().name())
                                    .cssClasses(filter.cssClasses())
                                    .description(filter.description())
                                    .placeholder(filter.placeholder())
                                    // enum/select filters need their options or the dropdown
                                    // arrives empty
                                    .options(
                                        filter.options() != null
                                            ? filter.options().stream()
                                                .map(
                                                    option ->
                                                        new io.mateu.dtos.OptionDto(
                                                            option.value(),
                                                            option.label(),
                                                            option.description(),
                                                            option.image(),
                                                            option.imageStyle(),
                                                            option.icon()))
                                                .toList()
                                            : List.of())
                                    .colspan(filter.colspan() > 0 ? filter.colspan() : 1)
                                    .sliderMin(filter.sliderMin())
                                    .sliderMax(filter.sliderMax())
                                    .stepButtonsVisible(filter.stepButtonsVisible())
                                    .step(filter.step())
                                    .mainFilter(filter.mainFilter())
                                    // a @Lookup filter searches its options like a form field
                                    // does: without its coordinates the renderers had no search
                                    // to run, and its editor came up empty
                                    .remoteCoordinates(
                                        FieldMapper.mapRemoteCoordinates(
                                            filter.remoteCoordinates()))
                                    // a filter the ROUTE fixes (the record master's :id, read
                                    // off the path) is the listing's scope, not a condition the
                                    // user set: renderers show it as a fixed chip and never
                                    // write it into the query string
                                    .readOnly(routeScope(httpRequest).contains(filter.id()))
                                    .build())
                        .toList()
                    : List.of())
            .emptyStateMessage(crudl.emptyStateMessage())
            .autoFocusOnSearchText(crudl.autoFocusOnSearchText())
            .searchOnEnter(crudl.searchOnEnter())
            .allRowsVisible(crudl.allRowsVisible())
            .size(crudl.size())
            .lazyLoading(crudl.lazyLoading())
            .lazyColumnRendering(crudl.lazyColumnRendering())
            .infiniteScrolling(crudl.infiniteScrolling())
            .useButtonForDetail(crudl.useButtonForDetail())
            .columnReorderingAllowed(crudl.columnReorderingAllowed())
            .pageSize(crudl.pageSize())
            .rowsSelectionEnabled(crudl.rowsSelectionEnabled())
            .header(
                crudl.header().stream()
                    .map(
                        component ->
                            mapComponentToDto(
                                null,
                                component,
                                baseUrl,
                                route,
                                consumedRoute,
                                initiatorComponentId,
                                httpRequest))
                    .toList())
            .footer(
                crudl.footer().stream()
                    .map(
                        component ->
                            mapComponentToDto(
                                null,
                                component,
                                baseUrl,
                                route,
                                consumedRoute,
                                initiatorComponentId,
                                httpRequest))
                    .toList())
            .wrapCellContent(crudl.wrapCellContent())
            .compact(crudl.compact())
            .noBorder(crudl.noBorder())
            .noRowBorder(crudl.noRowBorder())
            .columnBorders(crudl.columnBorders())
            .rowStripes(crudl.rowStripes())
            .vaadinGridCellBackground(crudl.vaadinGridCellBackground())
            .vaadinGridCellPadding(crudl.vaadinGridCellPadding())
            .gridStyle(crudl.gridStyle())
            .detailPath(crudl.detailPath())
            .rowRoute(crudl.rowRoute())
            .onRowSelectionChangedActionId(crudl.onRowSelectionChangedActionId())
            .contentHeight(crudl.contentHeight())
            .initialPage(crudl.initialPage())
            .filtersLayout(crudl.filtersLayout().name())
            .gridLayout(crudl.gridLayout().name())
            .groupBy(crudl.groupBy())
            .groupActions(
                crudl.groupActions() != null
                    ? crudl.groupActions().stream().map(FormMapper::mapToButtonDto).toList()
                    : null)
            .rowsSource(mapRestDataSource(crudl.rowsSource()))
            .rowStatusField(crudl.rowStatusField())
            .dragType(crudl.dragType())
            .build();
    return new ClientSideComponentDto(
        crudlDto,
        crudl.id() != null ? crudl.id() : "crud",
        List.of(),
        crudl.style(),
        crudl.cssClasses(),
        null,
        // A listing fills the space its parent leaves and scrolls internally (coherence-plan #8):
        // the default sizing intent for a table/listing. The frontend maps "fill" to a flex-grow
        // that, in a viewport-height flex chain, subtracts header/menu/searchbox automatically.
        "fill");
  }

  private static io.mateu.dtos.RestDataSourceDto mapRestDataSource(
      io.mateu.uidl.data.RestDataSource source) {
    return FieldMapper.mapRestDataSource(source);
  }
}
