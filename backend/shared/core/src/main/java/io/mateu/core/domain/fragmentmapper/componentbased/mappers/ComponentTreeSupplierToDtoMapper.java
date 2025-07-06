package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.OnLoadTriggerDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.TriggerDto;
import io.mateu.uidl.fluent.ComponentTreeSupplier;
import io.mateu.uidl.fluent.HasActions;
import io.mateu.uidl.fluent.HasTriggers;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class ComponentTreeSupplierToDtoMapper {

  public static ComponentDto mapComponentTreeSupplierToDto(
      ComponentTreeSupplier componentTreeSupplier,
      String baseUrl,
      String route,
      HttpRequest httpRequest) {
    return new ServerSideComponentDto(
        componentTreeSupplier.id(),
        componentTreeSupplier.getClass().getName(),
        List.of(
            mapComponentToDto(
                componentTreeSupplier,
                componentTreeSupplier.getComponent(httpRequest),
                baseUrl,
                route,
                httpRequest)),
        componentTreeSupplier,
        "",
        "",
        mapActions(componentTreeSupplier),
        mapTriggers(componentTreeSupplier));
  }

  private static List<TriggerDto> mapTriggers(Object serverSideObject) {
    if (serverSideObject instanceof HasTriggers hasTriggers) {
      return hasTriggers.triggers().stream()
          .map(
              trigger ->
                  switch (trigger) {
                    case OnLoadTrigger onLoadTrigger ->
                        new OnLoadTriggerDto(onLoadTrigger.actionId(), 0, 0);
                    default -> new OnLoadTriggerDto("", 0, 0);
                  })
          .map(trigger -> (TriggerDto) trigger)
          .toList();
    }
    return List.of();
  }

  private static List<ActionDto> mapActions(Object serverSideObject) {
    if (serverSideObject instanceof HasActions hasActions) {
      return hasActions.actions().stream()
          .map(
              action ->
                  ActionDto.builder()
                      .id(action.id())
                      .confirmationRequired(action.confirmationRequired())
                      .validationRequired(action.validationRequired())
                      .background(action.background())
                      .build())
          .toList();
    }
    return List.of();
  }
}
