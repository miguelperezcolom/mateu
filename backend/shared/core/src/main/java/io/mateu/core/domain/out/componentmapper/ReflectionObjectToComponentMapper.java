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
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.AppData;
import io.mateu.uidl.data.AppState;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ListingBackend;
import io.mateu.uidl.interfaces.Page;
import jakarta.inject.Named;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.List;
import java.util.UUID;

@Named
public class ReflectionObjectToComponentMapper {

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
    if (isApp(instance.getClass(), route)) {
      return mapToAppComponent(
          instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
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
                          instance,
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
              instance,
              "",
              "",
              mapActions(instance),
              mapTriggers(instance, httpRequest),
              mapRules(instance),
              mapValidations(instance, route),
              null,
                  null),
          instance,
          getData(httpRequest, instance),
          UIFragmentActionDto.Replace,
              null);
    }
    return instance;
  }

  public static boolean isApp(Class<?> instanceType, String route) {
    // no implementa componenttreesupplier
    // no implementa appsupplier
    // tiene anotaciones con @MenuOption o @Submenu?
    // implementa App

    if (route.endsWith("_page") || route.endsWith("_no_home_route")) {
      return false;
    }

    if (instanceType.isAnnotationPresent(HomeRoute.class)) {
      return true;
    }

    if (AppSupplier.class.isAssignableFrom(instanceType)) {
      return true;
    }

    if (App.class.isAssignableFrom(instanceType)) {
      return true;
    }

    if (getAllFields(instanceType).stream()
        .anyMatch(field -> field.isAnnotationPresent(Menu.class))) {
      return true;
    }

    return false;
  }

  public static boolean isPage(Object instance, String route) {
    // no implementa componenttreesupplier
    // no implementa appsupplier
    // está anotado con @UI o con @Route
    // implementa Page
    if (instance instanceof Data) {
      return false;
    }
    if (instance instanceof State) {
      return false;
    }
    if (instance instanceof AppData) {
      return false;
    }
    if (instance instanceof AppState) {
      return false;
    }
    if (route != null && (route.endsWith("_page") || route.endsWith("_no_home_route"))) {
      return true;
    }
    if (instance instanceof ComponentTreeSupplier
        || instance instanceof Component
        || instance instanceof ComponentDto) {
      return false;
    }
    return instance instanceof Page
        || instance instanceof ListingBackend<?, ?>
        || instance.getClass().isAnnotationPresent(UI.class)
        || instance.getClass().isAnnotationPresent(Route.class)
        || instance.getClass().isRecord()
        || (!isBasic(instance) && (hasSomething(instance)));
  }

  private static boolean hasSomething(Object instance) {
    for (Method method : getAllMethods(instance.getClass())) {
      if (method.isAnnotationPresent(Toolbar.class)) {
        return true;
      }
      if (method.isAnnotationPresent(Button.class)) {
        return true;
      }
    }
    for (Field field : getAllFields(instance.getClass())) {
      if (field.isAnnotationPresent(Toolbar.class)) {
        return true;
      }
      if (field.isAnnotationPresent(Button.class)) {
        return true;
      }
      if (field.isAnnotationPresent(KPI.class)) {
        return true;
      }
      if (!Modifier.isFinal(field.getModifiers())) {
        return true;
      }
    }
    return false;
  }
}
