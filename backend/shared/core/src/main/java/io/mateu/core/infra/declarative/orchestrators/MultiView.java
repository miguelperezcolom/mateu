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

  /**
   * Whether {@link #setComponentRouteTo} has been called at all, as opposed to {@code
   * _componentRoute} merely still holding its empty initial value.
   *
   * <p>The two are different things and the difference is load bearing: a crud that IS its app's
   * root legitimately has an empty component route, while a crud reached through an ACTION has
   * never been told its own — the route-load path is the only one that calls the setter. Without
   * this flag those two are indistinguishable, and {@link #pathForHistory} cannot tell "prepend
   * nothing, correctly" from "prepend nothing, because nobody said".
   */
  boolean _componentRouteEstablished = false;

  public String route() {
    return _route;
  }

  public void setRouteTo(String route) {
    _route = route;
  }

  public void setComponentRouteTo(String route) {
    _componentRoute = route;
    _componentRouteEstablished = true;
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
          // `route`, not runActionRq().route(): the query string was stripped off it a few lines
          // above and the raw one still carries it. Using the raw one made this view's own route
          // the QUERY — "?status=CANCELLED" rather than "" — which the browser round-trips and
          // appends to a url that already has it. The doubled query then parses as a single
          // parameter whose VALUE contains the second copy, and a listing filtered from the chat
          // showed a chip reading `Status: CANCELLED?status=CANCELLED` and matched nothing.
          setRouteTo(
              route.startsWith(componentRoute) ? route.substring(componentRoute.length()) : route);
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
    var requested = withoutQuery(httpRequest.runActionRq().route());
    return requested != null && resolved != null && requested.startsWith(resolved)
        ? requested
        : resolved;
  }

  /**
   * A route is a path. Filters live in the query string and the browser reads them back out of
   * {@code window.location.search} itself, so the query is not part of what a view is routed to.
   *
   * <p>Letting it through made a view's own route the QUERY — {@code "?status=CANCELLED"} instead
   * of {@code ""} — because {@code wrapRoute} takes the remainder after the consumed path, and the
   * consumed path never contains a query. The browser round-trips that route and appends it to a
   * url that already carries the query, and {@code ?status=CANCELLED?status=CANCELLED} parses as
   * ONE parameter whose value holds the second copy: a listing asked for from the chat showed a
   * filter chip reading {@code Status: CANCELLED?status=CANCELLED}, and matched nothing.
   */
  static String withoutQuery(String route) {
    if (route == null) {
      return null;
    }
    var q = route.indexOf('?');
    return q < 0 ? route : route.substring(0, q);
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

  /**
   * The same, for a request that reached this view as an ACTION rather than as a route load.
   *
   * <p>An action never establishes a component route: {@code handleRoute} is where {@link
   * #setComponentRouteTo} is called, and only in its {@code actionId} is-empty branch. So a crud
   * mounted under a menu at {@code /shop/products} pushed {@code /p1/edit} instead of {@code
   * /shop/products/p1/edit} — a url that 404s on reload and is useless to paste — while the very
   * same crud pushed the absolute path on a route load. One {@code PushStateToHistory} channel
   * carrying sometimes a relative path and sometimes an absolute one is the actual defect; the
   * client cannot tell them apart, and its own compensating rule (mateu-ux prepends its consumed
   * route) is skipped exactly when it would be needed.
   *
   * <p>A crud that is its app's ROOT is left alone, and is told apart by the request carrying a
   * consumed route the current route sits under: there the browser already prepends the app's base
   * url, so the relative path is the right answer and prepending anything would double it.
   */
  public String pathForHistory(String route, HttpRequest httpRequest) {
    if (_componentRouteEstablished || route == null) {
      return pathForHistory(route);
    }
    var mount = mountPathOf(httpRequest, route);
    return mount + pathForHistory(route);
  }

  /**
   * Where this view is mounted, read off the route the browser is on.
   *
   * <p>The request route is {@code mount + whatever relative route the browser currently sits on},
   * and the relative part is one of a crud's own shapes — a record, optionally followed by {@code
   * /edit}, or {@code /new}. Stripping those off the end leaves the mount. The record's segment is
   * taken from the route being navigated TO rather than from the component state, so it does not
   * depend on what an entity happens to call its id field.
   */
  private static String mountPathOf(HttpRequest httpRequest, String route) {
    var requested = httpRequest.runActionRq().route();
    if (requested == null || requested.isBlank()) {
      return "";
    }
    var consumed = httpRequest.runActionRq().consumedRoute();
    // Its app's root: the browser prepends the base url itself.
    if (consumed != null && !consumed.isBlank() && requested.startsWith(consumed)) {
      return "";
    }
    var mount = requested;
    for (var tail : new String[] {"/edit", "/new"}) {
      if (mount.endsWith(tail)) {
        mount = mount.substring(0, mount.length() - tail.length());
        break;
      }
    }
    var record = firstSegmentOf(route);
    if (record != null && mount.endsWith("/" + record)) {
      mount = mount.substring(0, mount.length() - record.length() - 1);
    }
    return mount;
  }

  private static String firstSegmentOf(String route) {
    if (route == null || !route.startsWith("/") || route.length() < 2) {
      return null;
    }
    var rest = route.substring(1);
    var slash = rest.indexOf('/');
    return slash < 0 ? rest : rest.substring(0, slash);
  }

  public UICommand setWindowTitle(HttpRequest httpRequest) {
    var windowTitle = httpRequest.getAttribute("windowTitle");
    if (windowTitle == null) {
      return null;
    }
    return new UICommand(UICommandType.SetWindowTitle, windowTitle);
  }
}
