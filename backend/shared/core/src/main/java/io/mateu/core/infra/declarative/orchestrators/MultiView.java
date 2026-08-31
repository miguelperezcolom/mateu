package io.mateu.core.infra.declarative.orchestrators;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.infra.declarative.orchestrators.crud.DataLayer.addData;

import io.mateu.core.domain.out.fragmentmapper.mappers.TriggerMapper;
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

        if (!serverSideTypeName().equals(httpRequest.runActionRq().serverSideType())) {
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

  /**
   * The type name advertised on the wire so actions route back to this orchestrator. The capability
   * bridge overrides it with the underlying listing's class, so round-trips re-create the listing
   * (and re-bridge it) instead of the anonymous bridge.
   */
  public String serverSideTypeName() {
    return getClass().getName();
  }

  /**
   * The name that travels on the wire for the orchestrator's OWN component, which has to be the
   * same one {@link #serverSideTypeName()} advertises everywhere else.
   *
   * <p>The default from {@code ComponentTreeSupplier} answers "this class", and for the capability
   * bridge that is a class the client must never name back: it stands in for a listing, it is built
   * around one, and recreating it from a bare class name produces a bridge with nothing behind it —
   * the listing page rendered, and its very first search died with a NullPointerException on the
   * missing target.
   */
  @Override
  public String serverSideType() {
    return serverSideTypeName();
  }

  /**
   * Orchestrators own their whole action vocabulary (delete, bulk methods, action-on-row-*…).
   * {@code Listing} — which {@code Crud} also implements — narrows the claim to {@code search} for
   * plain listings; materializing the broad {@link ActionHandler} default as a class method makes
   * it win over that interface default for every orchestrator.
   */
  @Override
  public boolean supportsAction(String actionId) {
    return ActionHandler.super.supportsAction(actionId);
  }

  protected abstract OrchestrationResult resolveInternalRoute(
      String route, HttpRequest httpRequest);

  private Object wrapView(
      String viewName, Object modelView, Component component, HttpRequest httpRequest) {
    setRouteTo(viewName);
    httpRequest.setAttribute(viewName, true);
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
    return wrapRoute(requestedRoute(httpRequest), httpRequest);
  }

  /**
   * What the browser ASKED for, falling back to the consumed path when there is nothing else.
   *
   * <p>They differ exactly when a link points INSIDE the listing — at one record — and opening the
   * mediator on the consumed part alone drops the id, so a pasted link to a record lands on the
   * list of them all. {@code wrapRoute} already knows what to do with a remainder; until now it was
   * never given one.
   */
  public static String requestedRoute(HttpRequest httpRequest) {
    var resolved = (String) httpRequest.getAttribute("resolvedPath");
    var requested = httpRequest.runActionRq().route();
    return requested != null && resolved != null && requested.startsWith(resolved)
        ? requested
        : resolved;
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
            .serverSideType(serverSideTypeName())
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
