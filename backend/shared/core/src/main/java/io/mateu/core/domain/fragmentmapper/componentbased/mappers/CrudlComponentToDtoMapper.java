package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ColumnDto;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.fluent.ComponentTreeSupplier;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class CrudlComponentToDtoMapper {

  public static ServerSideComponentDto mapCrudlToDto(
      Crudl crudl,
      ComponentTreeSupplier componentSupplier,
      String baseUrl,
      String route,
      HttpRequest httpRequest) {
    var crudlDto =
        CrudlDto.builder()
            .title(crudl.title())
            .subtitle(crudl.subtitle())
            .actions(
                crudl.actions().stream()
                    .map(action -> ActionDto.builder().id(action.id()).href(action.href()).build())
                    .toList())
            .triggers(
                crudl.triggers().stream().map(FormComponentToDtoMapper::mapToTriggerDto).toList())
            .toolbar(
                crudl.toolbar().stream().map(FormComponentToDtoMapper::mapToButtonDto).toList())
            .columns(
                crudl.columns().stream()
                    .map(
                        column ->
                            ColumnDto.builder()
                                .id(column.id())
                                .header(column.label())
                                .dataType(column.dataType().toString())
                                .build())
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
            .build();
    return new ServerSideComponentDto(
        crudl.id(),
        componentSupplier.getClass().getName(),
        List.of(new ClientSideComponentDto(crudlDto, crudl.id(), List.of(), "", "")),
        componentSupplier,
        "",
        "");
  }
}
