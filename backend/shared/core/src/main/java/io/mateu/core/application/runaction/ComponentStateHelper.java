package io.mateu.core.application.runaction;

import static io.mateu.core.domain.act.FieldCrudActionRunner.getViewModelClass;
import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ActionMapper.mapActions;
import static io.mateu.core.domain.out.fragmentmapper.mappers.EmitsMapper.emitsName;
import static io.mateu.core.domain.out.fragmentmapper.mappers.RuleMapper.mapRules;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TriggerMapper.mapTriggers;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ValidationMapper.mapValidations;
import static io.mateu.core.infra.declarative.FormViewModel.toMap;
import static io.mateu.core.infra.declarative.orchestrators.wizard.Wizard.addRowNumber;

import io.mateu.core.domain.out.componentmapper.PageTypeResolver;
import io.mateu.core.domain.out.componentmapper.PageWidthResolver;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.UI;
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
        mapRules(modelView, httpRequest),
        mapValidations(modelView, route),
        null,
        null,
        false,
        emitsName(modelView),
        PageWidthResolver.wirePageWidth(modelView),
        PageTypeResolver.wirePageType(modelView));
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
      var newState = toMap(state);
      GeneratedValueInitializer.initialize(
          getViewModelClass(modelView, httpRequest), newState, httpRequest);
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
