package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.application.runaction.RunActionUseCase.getState;
import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.core.application.runaction.PartialExpander;
import io.mateu.core.domain.out.componentmapper.PageTypeResolver;
import io.mateu.core.domain.out.componentmapper.PageWidthResolver;
import io.mateu.core.domain.out.componentmapper.SizingResolver;
import io.mateu.core.domain.out.componentmapper.StaticViewResolver;
import io.mateu.dtos.ClientSideComponentDto;
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
    var leaf =
        mapComponentToDto(
            componentTreeSupplier,
            PartialExpander.expand(componentTreeSupplier.component(httpRequest), httpRequest),
            baseUrl,
            route,
            consumedRoute,
            initiatorComponentId,
            httpRequest);
    // An explicit @Size on the view sizes its whole surface (coherence-plan #8): e.g. a full-canvas
    // screen that should fill the viewport and scroll internally. It overrides any inferred sizing.
    var sizing = SizingResolver.wireSizing(componentTreeSupplier.getClass());
    if (sizing != null && leaf instanceof ClientSideComponentDto client) {
      leaf = client.withSizing(sizing);
    }
    return new ServerSideComponentDto(
        UUID.randomUUID().toString(),
        componentTreeSupplier.serverSideType(),
        consumedRoute,
        List.of(leaf),
        getState(componentTreeSupplier, httpRequest),
        componentTreeSupplier.style(),
        componentTreeSupplier.cssClasses(),
        ActionMapper.mapActions(componentTreeSupplier, httpRequest),
        TriggerMapper.mapTriggers(componentTreeSupplier, httpRequest),
        RuleMapper.mapRules(componentTreeSupplier, httpRequest),
        ValidationMapper.mapValidations(componentTreeSupplier, route, httpRequest),
        null,
        null,
        false,
        EmitsMapper.emitsName(componentTreeSupplier),
        PageWidthResolver.wirePageWidth(componentTreeSupplier),
        PageTypeResolver.wirePageType(componentTreeSupplier),
        StaticViewResolver.isStatic(componentTreeSupplier),
        null);
  }
}
