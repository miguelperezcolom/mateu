package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.mapToAppComponent;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.mapToPageComponent;
import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isApp;
import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isPage;
import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.domain.out.fragmentmapper.UIFragmentAssembler.getData;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ActionMapper.mapActions;
import static io.mateu.core.domain.out.fragmentmapper.mappers.EmitsMapper.emitsName;
import static io.mateu.core.domain.out.fragmentmapper.mappers.RuleMapper.mapRules;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TriggerMapper.mapTriggers;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ValidationMapper.mapValidations;

import io.mateu.core.application.runaction.YamlUidlLoader;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.annotations.ConfirmOnNavigationIfDirty;
import io.mateu.uidl.annotations.UISpec;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@Named
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class ReflectionObjectToComponentMapper {

  private final YamlUidlLoader yamlUidlLoader;

  public Object mapToComponent(
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (instance instanceof ServerSideComponentDto serverSideComponentDto) {
      if (serverSideComponentDto != null && serverSideComponentDto.containerId() != null) {
        initiatorComponentId = serverSideComponentDto.containerId();
      }
      return new UIFragmentDto(
          initiatorComponentId,
          serverSideComponentDto,
          serverSideComponentDto.initialData(),
          getData(httpRequest),
          UIFragmentActionDto.Replace,
          serverSideComponentDto.containerId());
    }
    if (!(instance instanceof ComponentTreeSupplier)
        && MetaAnnotations.isPresent(instance.getClass(), UISpec.class)) {
      var uiSpec = MetaAnnotations.find(instance.getClass(), UISpec.class);
      var component = yamlUidlLoader.loadFromSpec(uiSpec.value());
      if (component != null) {
        return buildPageUIFragment(
            instance, component, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
      }
    }
    if (isApp(instance.getClass(), route)) {
      return mapToAppComponent(
          instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (isPage(instance, route)) {
      return buildPageUIFragment(
          instance,
          mapToPageComponent(
              instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest),
          baseUrl,
          route,
          consumedRoute,
          initiatorComponentId,
          httpRequest);
    }
    return instance;
  }

  private UIFragmentDto buildPageUIFragment(
      Object instance,
      Component component,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new UIFragmentDto(
        initiatorComponentId,
        new ServerSideComponentDto(
            UUID.randomUUID().toString(),
            instance.getClass().getName(),
            consumedRoute,
            List.of(
                mapComponentToDto(
                    null,
                    component,
                    baseUrl,
                    route,
                    consumedRoute,
                    initiatorComponentId,
                    httpRequest)),
            instance,
            "",
            "",
            mapActions(instance, httpRequest),
            mapTriggers(instance, httpRequest),
            mapRules(instance, httpRequest),
            mapValidations(instance, route),
            null,
            null,
            MetaAnnotations.isPresent(instance.getClass(), ConfirmOnNavigationIfDirty.class),
            emitsName(instance),
            PageWidthResolver.wirePageWidth(instance)),
        instance,
        getData(httpRequest, instance),
        UIFragmentActionDto.Replace,
        null);
  }
}
