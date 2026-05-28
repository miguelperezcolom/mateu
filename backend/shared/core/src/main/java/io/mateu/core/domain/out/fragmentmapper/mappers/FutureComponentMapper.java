package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ActionMapper.mapActions;
import static io.mateu.core.domain.out.fragmentmapper.mappers.RuleMapper.mapRules;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TriggerMapper.mapTriggers;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ValidationMapper.mapValidations;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.data.FutureComponent;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.reflection.ComponentMapper;
import java.util.List;
import java.util.UUID;

public class FutureComponentMapper {

  public static ComponentDto mapFutureComponentToDto(
      FutureComponent futureComponent,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new ServerSideComponentDto(
        UUID.randomUUID().toString(),
        futureComponent.instance().getClass().getName(),
        consumedRoute,
        List.of(
            mapComponentToDto(
                null,
                createComponent(
                    futureComponent.instance(),
                    baseUrl,
                    route,
                    consumedRoute,
                    initiatorComponentId,
                    httpRequest),
                baseUrl,
                route,
                consumedRoute,
                initiatorComponentId,
                httpRequest)),
        futureComponent.instance(),
        "",
        "",
        mapActions(futureComponent.instance(), httpRequest),
        mapTriggers(futureComponent.instance(), httpRequest),
        mapRules(futureComponent.instance()),
        mapValidations(futureComponent.instance(), route),
        null,
        null);
  }

  private static Component createComponent(
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    ComponentMapper componentMapper = MateuBeanProvider.getBean(ComponentMapper.class);
    var resolvedComponents =
        componentMapper.mapToComponents(
            instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    if (resolvedComponents.size() == 1) {
      return resolvedComponents.iterator().next();
    }
    return new VerticalLayout((List<Component>) resolvedComponents.stream().toList());
  }
}
