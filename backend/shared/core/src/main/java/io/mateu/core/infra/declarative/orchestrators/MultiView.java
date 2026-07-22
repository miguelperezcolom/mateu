package io.mateu.core.infra.declarative.orchestrators;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.infra.declarative.orchestrators.crud.DataLayer.addData;

import io.mateu.core.domain.out.fragmentmapper.mappers.TriggerMapper;
import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.UICommandType;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.interfaces.*;
import java.util.List;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class MultiView
    implements ActionHandler, ActionSupplier, RouteHandler, DtoSupplier {

  String _route = "";
  String _componentRoute = "";

  public String route() {
    return _route;
  }

  public void setRouteTo(String route) {
    _route = route;
  }

  public void setComponentRouteTo(String route) {
    _componentRoute = route;
  }

  public String getComponentRoute() {
    return _componentRoute;
  }

  @Override
  public Object handleRoute(String route, HttpRequest httpRequest) {
    log.info("route is {}, action is {}", route, httpRequest.runActionRq().actionId());
    try {

      if (route.contains("?")) {
        route = route.substring(0, route.indexOf("?"));
      }

      if (httpRequest.runActionRq().actionId() == null
          || "".equals(httpRequest.runActionRq().actionId())) {

        if (!getClass().getName().equals(httpRequest.runActionRq().serverSideType())) {
          var componentRoute = (String) httpRequest.getAttribute("resolvedPath");
          if (componentRoute == null) {
            componentRoute = "";
            httpRequest.setAttribute("resolvedPath", componentRoute);
          }
          setComponentRouteTo(componentRoute);
          setRouteTo(
              httpRequest.runActionRq().route().startsWith(componentRoute)
                  ? httpRequest.runActionRq().route().substring(componentRoute.length())
                  : httpRequest.runActionRq().route());
          return this;
        }

        var orchestrationResult = resolveInternalRoute(route, httpRequest);

        if (orchestrationResult != null) {
          if (orchestrationResult.component() instanceof Component component) {
            return wrapView(
                orchestrationResult.route(),
                orchestrationResult.modelView(),
                component,
                httpRequest);
          }
          return orchestrationResult.component();
        } else {
          throw new UnsupportedOperationException(
              "route " + route + " not supported by " + getClass().getSimpleName());
        }
      }
    } catch (Throwable e) {
      log.error("when handling route", e);
      return Message.builder()
          .variant(NotificationVariant.error)
          .title(e.getClass().getSimpleName())
          .text(e.getMessage())
          .build();
    }
    return this;
  }

  protected abstract OrchestrationResult resolveInternalRoute(
      String route, HttpRequest httpRequest);

  private Object wrapView(
      String viewName, Object modelView, Component component, HttpRequest httpRequest) {
    setRouteTo(viewName);
    httpRequest.setAttribute(viewName, true);
    if (modelView instanceof AutoNamedView<?> autoNamedView) {
      modelView = autoNamedView.entity();
    }
    addData(modelView, httpRequest);
    return wrap(
            component,
            modelView,
            (String) httpRequest.getAttribute("baseUrl"),
            getConsumedRoute(httpRequest),
            getConsumedRoute(httpRequest),
            null,
            httpRequest)
        .withId(httpRequest.runActionRq().initiatorComponentId() + "_" + viewName)
        .withTriggers(
            Stream.concat(
                    triggers(viewName, httpRequest).stream().map(TriggerMapper::mapTrigger),
                    TriggerMapper.mapTriggers(modelView, httpRequest).stream())
                .toList())
        .withConfirmOnNavigationIfDirty(viewName.equals("edit") || viewName.equals("new"));
  }

  public List<Trigger> triggers(String viewName, HttpRequest httpRequest) {
    return List.of();
  }

  public String getConsumedRoute(HttpRequest httpRequest) {
    var componentRoute = getComponentRoute();
    if (componentRoute != null && !componentRoute.isEmpty()) {
      // Trust the component's own route only when the current request route actually lives under
      // it. When navigating to a SIBLING nested route (e.g. /workflow/definitions ->
      // /workflow/processes) the componentRoute is stale — it still points at the previous
      // sibling — and using it would make ListRouteResolver miss the list route and
      // ViewRouteResolver substring past the end of the (shorter) target route
      // (StringIndexOutOfBoundsException). In that case fall back to the request's consumedRoute.
      var requestRoute = httpRequest.runActionRq().route();
      if (requestRoute != null) {
        var cleanRoute =
            requestRoute.contains("?")
                ? requestRoute.substring(0, requestRoute.indexOf('?'))
                : requestRoute;
        if (cleanRoute.startsWith(componentRoute)) {
          return componentRoute;
        }
      }
    }
    return httpRequest.runActionRq().consumedRoute();
  }

  @Override
  public ComponentDto dto(HttpRequest httpRequest) {
    return wrapRoute((String) httpRequest.getAttribute("resolvedPath"), httpRequest);
  }

  public ServerSideComponentDto wrapRoute(String route, HttpRequest httpRequest) {
    httpRequest.setAttribute("mediator", true);
    var consumedRoute = (String) httpRequest.getAttribute("resolvedPath");
    if (!route.equals(consumedRoute)) setRouteTo(route.substring(consumedRoute.length()));
    httpRequest.setAttribute(
        "upstreamComponentId", httpRequest.runActionRq().initiatorComponentId() + "_app");
    return wrap(
        AppShell.builder()
            .clientSideComponentId(httpRequest.runActionRq().initiatorComponentId() + "_cs")
            .homeRoute(route)
            .serverSideType(getClass().getName())
            .homeConsumedRoute(consumedRoute)
            .variant(AppVariant.MEDIATOR)
            .layout(layout())
            .style("width: 100%;")
            .build(),
        this,
        (String) httpRequest.getAttribute("baseUrl"),
        consumedRoute,
        consumedRoute,
        httpRequest.runActionRq().initiatorComponentId() + "_x",
        httpRequest);
  }

  protected AppLayout layout() {
    return AppLayout.SINGLE_SLOT;
  }

  public String pathForHistory(String route) {
    if ("/list".equals(route)) {
      return _componentRoute;
    }
    return _componentRoute + route;
  }

  public UICommand setWindowTitle(HttpRequest httpRequest) {
    var windowTitle = httpRequest.getAttribute("windowTitle");
    if (windowTitle == null) {
      return null;
    }
    return new UICommand(UICommandType.SetWindowTitle, windowTitle);
  }
}
