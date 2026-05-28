package io.mateu.core.application.runaction;

import static io.mateu.core.domain.act.FieldCrudActionRunner.getViewModelClass;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ActionMapper.mapActions;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.DataComponentToDtoMapper.mapPojo;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.RuleMapper.mapRules;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.TriggerMapper.mapTriggers;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ValidationMapper.mapValidations;
import static io.mateu.core.infra.declarative.orchestrators.wizard.WizardOrchestrator.addRowNumber;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.DataComponentToDtoMapper;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.StateSupplier;
import java.lang.reflect.Method;
import java.util.*;
import lombok.SneakyThrows;

/** Static helpers for building ServerSideComponentDto and extracting component/state metadata. */
public class ComponentStateHelper {

  public static ServerSideComponentDto wrap(
      Component component,
      Object modelView,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return wrap(
        List.of(component),
        modelView,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest);
  }

  public static ServerSideComponentDto wrap(
      List<Component> components,
      Object modelView,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new ServerSideComponentDto(
        httpRequest.getAttribute("upstreamComponentId") != null
            ? httpRequest.getAttribute("upstreamComponentId").toString()
            : UUID.randomUUID().toString(),
        modelView.getClass().getName(),
        consumedRoute,
        components.stream()
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
            .toList(),
        getState(modelView, httpRequest),
        "width: 100%;",
        "",
        mapActions(modelView, httpRequest),
        mapTriggers(modelView, httpRequest),
        mapRules(modelView),
        mapValidations(modelView, route),
        null,
        null);
  }

  public static Object getState(Object modelView, HttpRequest httpRequest) {
    if (modelView == null) {
      return null;
    }
    var state =
        (modelView instanceof StateSupplier stateSupplier)
            ? stateSupplier.state(httpRequest)
            : modelView;
    if (!(state instanceof Map<?, ?>)) {
      var newState = mapPojo(state);
      if (Boolean.TRUE.equals(httpRequest.getAttribute("new"))) {
        getAllFields(getViewModelClass(modelView, httpRequest)).stream()
            .filter(field -> field.isAnnotationPresent(GeneratedValue.class))
            .forEach(
                field -> {
                  var generator =
                      MateuBeanProvider.getBean(field.getAnnotation(GeneratedValue.class).value());
                  var value = generator.generate();
                  if (value != null && List.class.isAssignableFrom(value.getClass())) {
                    var list = (List<?>) value;
                    var mappedList = list.stream().map(DataComponentToDtoMapper::mapItem).toList();
                    newState.put(field.getName(), mappedList);
                  } else {
                    newState.put(field.getName(), value);
                  }
                });
      }
      addRowNumber(modelView.getClass(), newState);
      return newState;
    }
    return state;
  }

  public static String getAppRoute(Object potentialApp) {
    if (potentialApp.getClass().isAnnotationPresent(UI.class)) {
      return potentialApp.getClass().getAnnotation(UI.class).value();
    }
    if (potentialApp.getClass().isAnnotationPresent(Route.class)) {
      return potentialApp.getClass().getAnnotation(Route.class).value();
    }
    return "";
  }

  @SneakyThrows
  public static Object invoke(Method method, Object instance) {
    return method.invoke(instance);
  }
}
