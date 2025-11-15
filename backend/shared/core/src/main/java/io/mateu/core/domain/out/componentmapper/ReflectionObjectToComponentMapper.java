package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.mapToAppComponent;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.mapToPageComponent;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.getData;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper.mapActions;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper.mapRules;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper.mapTriggers;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper.mapValidations;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ListingBackend;
import io.mateu.uidl.interfaces.Page;
import jakarta.inject.Named;
import java.util.List;
import java.util.UUID;

@Named
public class ReflectionObjectToComponentMapper {

  public Object mapToComponent(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (isApp(instance, route)) {
      return mapToAppComponent(instance, baseUrl, route, initiatorComponentId, httpRequest);
    }
    if (isPage(instance, route)) {
      return new UIFragmentDto(
          initiatorComponentId,
          new ServerSideComponentDto(
              UUID.randomUUID().toString(),
              instance.getClass().getName(),
              List.of(
                  mapComponentToDto(
                      null,
                      mapToPageComponent(
                          instance, baseUrl, route, initiatorComponentId, httpRequest),
                      baseUrl,
                      route,
                      httpRequest)),
              instance,
              "",
              "",
              mapActions(instance),
              mapTriggers(instance),
              mapRules(instance),
              mapValidations(instance),
              null),
          instance,
          getData(httpRequest),
          UIFragmentActionDto.Replace);
    }
    return instance;
  }

  private boolean isApp(Object instance, String route) {
    // no implementa componenttreesupplier
    // no implementa appsupplier
    // tiene anotaciones con @MenuOption o @Submenu?
    // implementa App
    if ("/_page".equals(route)) {
      return false;
    }
    if (instance instanceof ComponentTreeSupplier) {
      return false;
    }
    if (getAllFields(instance.getClass()).stream()
        .anyMatch(field -> field.isAnnotationPresent(Menu.class))) {
      return true;
    }
    return instance instanceof App;
  }

  private boolean isPage(Object instance, String route) {
    // no implementa componenttreesupplier
    // no implementa appsupplier
    // está anotado con @MateuUI o con @Route
    // implementa Page
    if ("/_page".equals(route)) {
      return true;
    }
    if (instance instanceof ComponentTreeSupplier
        || instance instanceof Component
        || instance instanceof ComponentDto) {
      return false;
    }
    return instance instanceof Page
        || instance instanceof ListingBackend<?, ?>
        || instance.getClass().isAnnotationPresent(MateuUI.class)
        || instance.getClass().isAnnotationPresent(Route.class)
        || !isBasic(instance);
  }
}
