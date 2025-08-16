package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class CrudlComponentToDtoMapper {

  public static ComponentDto mapCrudlToDto(
      Crudl crudl,
      ComponentTreeSupplier componentSupplier,
      String baseUrl,
      String route,
      HttpRequest httpRequest) {
    var crudlDto =
        CrudlDto.builder()
            .title(crudl.title())
            .subtitle(crudl.subtitle())
            .searchable(crudl.searchable())
            .actions(
                crudl.actions().stream().map(ComponentTreeSupplierToDtoMapper::mapAction).toList())
            .triggers(
                crudl.triggers().stream().map(FormComponentToDtoMapper::mapToTriggerDto).toList())
            .toolbar(
                crudl.toolbar().stream().map(FormComponentToDtoMapper::mapToButtonDto).toList())
            .columns(
                crudl.columns().stream()
                    .map(column -> mapComponentToDto(null, column, baseUrl, route, httpRequest))
                    .toList())
            .filters(
                crudl.filters().stream()
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
                                .build())
                    .toList())
            .emptyStateMessage(crudl.emptyStateMessage())
            .autoFocusOnSearchText(crudl.autoFocusOnSearchText())
            .searchOnEnter(crudl.searchOnEnter())
            .allRowsVisible(crudl.allRowsVisible())
            .lazyLoading(crudl.lazyLoading())
            .lazyColumnRendering(crudl.lazyColumnRendering())
            .infiniteScrolling(crudl.infiniteScrolling())
            .useButtonForDetail(crudl.useButtonForDetail())
            .actionIdOnSelectionChanged(crudl.actionIdOnSelectionChanged())
            .columnReorderingAllowed(crudl.columnReorderingAllowed())
            .pageSize(crudl.pageSize())
            .rowsSelectionEnabled(crudl.rowsSelectionEnabled())
            .header(
                crudl.header().stream()
                    .map(
                        component ->
                            mapComponentToDto(null, component, baseUrl, route, httpRequest))
                    .toList())
            .footer(
                crudl.footer().stream()
                    .map(
                        component ->
                            mapComponentToDto(null, component, baseUrl, route, httpRequest))
                    .toList())
            .build();
    return new ClientSideComponentDto(
        crudlDto, crudl.id(), List.of(), crudl.style(), crudl.cssClasses(), null);
  }
}
