package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.application.runaction.RunActionUseCase.getState;
import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.UUID;

public class ComponentTreeSupplierMapper {

  public static ComponentDto mapComponentTreeSupplierToDto(
      ComponentTreeSupplier componentTreeSupplier,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new ServerSideComponentDto(
        UUID.randomUUID().toString(),
        componentTreeSupplier.getClass().getName(),
        consumedRoute,
        List.of(
            mapComponentToDto(
                componentTreeSupplier,
                componentTreeSupplier.component(httpRequest),
                baseUrl,
                route,
                consumedRoute,
                initiatorComponentId,
                httpRequest)),
        getState(componentTreeSupplier, httpRequest),
        componentTreeSupplier.style(),
        componentTreeSupplier.cssClasses(),
        ActionMapper.mapActions(componentTreeSupplier, httpRequest),
        TriggerMapper.mapTriggers(componentTreeSupplier, httpRequest),
        RuleMapper.mapRules(componentTreeSupplier, httpRequest),
        ValidationMapper.mapValidations(componentTreeSupplier, route),
        null,
        null,
        false,
        EmitsMapper.emitsName(componentTreeSupplier));
  }
}
