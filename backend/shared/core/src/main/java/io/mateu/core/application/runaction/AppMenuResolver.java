package io.mateu.core.application.runaction;

import static io.mateu.core.application.runaction.ComponentStateHelper.getAppRoute;
import static io.mateu.core.domain.out.componentmapper.HomeRouteResolver.getSelectedOption;
import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.mapToAppComponent;
import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isApp;
import static io.mateu.core.infra.reflection.ReflectionUiIncrementMapper.removeQueryParamsFromRoute;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.PageView;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteResolver;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.List;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

/** Resolves AppShell/menu actionables and remote menus from a route. */
@Slf4j
@Named
@Singleton
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class AppMenuResolver {

  private final BeanProvider beanProvider;
  private final InstanceFactoryProvider instanceFactoryProvider;
  private final RemoteMenuHandler remoteMenuHandler;
  private final List<RouteResolver> routeResolvers;

  // ── Public static: used by RunActionUseCase ──────────────────────────────

  public static Actionable resolveMenu(
      String appRoute,
      List<Actionable> actionables,
      String route,
      String completeRoute,
      HttpRequest httpRequest) {
    if (route.endsWith("_page") || "".equals(route) || route.endsWith("_no_home_route")) {
      return null;
    }
    var selectedOption = getSelectedOption(appRoute, route, actionables, httpRequest);
    if (selectedOption != null && selectedOption.isPresent()) {
      return selectedOption.get();
    }
    return null;
  }

  // ── resolveMenuIfApp ──────────────────────────────────────────────────────

  Mono<?> resolveMenuIfApp(
      RunActionCommand command,
      Object instance,
      Function<RunActionCommand, Mono<?>> findRouteResolverFn) {
    var rawRoute = command.route();
    var route = removeQueryParamsFromRoute(rawRoute);

    if (instance instanceof AppShell app) {
      return resolveInApp(command, route, app, instance, true, findRouteResolverFn);
    }
    if (instance instanceof AppSupplier appSupplier) {
      var app =
          appSupplier
              .getApp(command.httpRequest())
              .withServerSideType(instance.getClass().getName());
      return resolveInApp(command, route, app, instance, false, findRouteResolverFn);
    }
    if (isApp(instance.getClass(), route)) {
      var app =
          mapToAppComponent(
              instance,
              command.baseUrl(),
              route,
              command.consumedRoute(),
              command.initiatorComponentId(),
              command.httpRequest());
      return resolveInApp(command, route, app, instance, false, findRouteResolverFn);
    }
    return Mono.just(instance);
  }

  // ── resolveInApp ─────────────────────────────────────────────────────────

  Mono<?> resolveInApp(
      RunActionCommand command,
      String route,
      Object potentialApp,
      Object instance,
      boolean emptyIfRoute,
      Function<RunActionCommand, Mono<?>> findRouteResolverFn) {
    var consumedRoute = command.consumedRoute();
    var data = command.componentState();
    var httpRequest = command.httpRequest();

    var app =
        toApp(
            potentialApp,
            command.baseUrl(),
            consumedRoute,
            command.initiatorComponentId(),
            httpRequest);
    if (app == null) {
      return Mono.empty();
    }

    var resolvedRoute =
        httpRequest.getAttribute("resolvedRoute") != null
            ? (String) httpRequest.getAttribute("resolvedRoute")
            : app.route();
    var actionable = AppMenuActionableFinder.find(app, route, consumedRoute, httpRequest);

    if (actionable instanceof RemoteMenu remoteMenu) {
      return remoteMenuHandler.handleRemoteMenuActionable(remoteMenu, app, httpRequest, command);
    }

    if ("_empty".equals(consumedRoute) || "/_page".equals(route) || "_page".equals(route)) {
      return Mono.just(potentialApp);
    }

    var resolved =
        AbsoluteRouteDispatcher.tryResolve(
            routeResolvers,
            route,
            resolvedRoute,
            instance,
            data,
            instanceFactoryProvider,
            httpRequest);
    if (resolved != null) {
      return resolved;
    }

    if (actionable == null) {
      // The route may point at a menu group (children but no page of its own, e.g. /workflow):
      // render a section-index page instead of letting the frontend show "Not found".
      var group = AppMenuActionableFinder.findGroup(app, route, consumedRoute, httpRequest);
      if (group != null && group.submenu() != null && !group.submenu().isEmpty()) {
        return Mono.just(buildSectionIndex(group, route));
      }
      return Mono.empty();
    }
    return ActionableDispatcher.dispatch(
        actionable,
        command,
        route,
        emptyIfRoute,
        findRouteResolverFn,
        instanceFactoryProvider,
        beanProvider);
  }

  Mono<?> resolveRemoteMenuForRoute(
      RunActionCommand command, Object potentialApp, HttpRequest httpRequest) {
    var app =
        toApp(
            potentialApp,
            command.baseUrl(),
            command.consumedRoute(),
            command.initiatorComponentId(),
            httpRequest);
    if (app == null) {
      return Mono.just(potentialApp);
    }

    var actionable =
        AppMenuActionableFinder.find(app, command.route(), command.consumedRoute(), httpRequest);

    if (actionable instanceof RemoteMenu remoteMenu) {
      return remoteMenuHandler.handleRemoteMenuActionable(remoteMenu, app, httpRequest, command);
    }

    // Deep links: no local menu matches the route — give the remote menus a chance; the
    // first remote app that owns it gets mounted (e.g. a bookmarked /venta).
    if (actionable == null
        && command.route() != null
        && !command.route().isBlank()
        && !command.route().endsWith("_page")
        && !command.route().endsWith("_no_home_route")) {
      return tryRemoteMenusForRoute(app, command, httpRequest)
          .switchIfEmpty((Mono) Mono.just(potentialApp));
    }

    return Mono.just(potentialApp);
  }

  /**
   * The remote that owns a deep link no local entry claims, chosen by LONGEST PREFIX — not by
   * asking every remote in turn, which cost one round trip per remote declared before the right one
   * and let any of them, being down, fail the whole request.
   *
   * <p>First from what the shell already knows: the menus of the remotes it has in its cache
   * (RemoteAppDescriptorCache) and the mount prefix of the others ({@code /forms} for a remote
   * declared as the field {@code forms}, wherever it is grouped). The best of those is the only one
   * asked. Only when that tells nothing — or the chosen remote turns the route down — are the rest
   * asked, all at once, and the longest claim wins (ties go to the one declared first). A remote
   * that does not answer claims nothing.
   */
  private Mono<?> tryRemoteMenusForRoute(
      AppShell app, RunActionCommand command, HttpRequest httpRequest) {
    var route = removeQueryParamsFromRoute(command.route());
    var remotes = remoteMenusIn(app.menu());
    RemoteMenu known = null;
    int knownLength = -1;
    for (var remote : remotes) {
      int claim = remoteMenuHandler.cachedClaim(remote, route, httpRequest);
      if (claim == RemoteMenuHandler.NOT_KNOWN) {
        claim = prefixClaim(remote, route);
      }
      if (claim > knownLength) {
        known = remote;
        knownLength = claim;
      }
    }
    if (known == null) {
      return askAll(remotes, app, command, httpRequest);
    }
    var chosen = known;
    var rest = remotes.stream().filter(remote -> remote != chosen).toList();
    return remoteMenuHandler
        .tryResolveRoute(chosen, command.route(), app, httpRequest, command)
        .switchIfEmpty(Mono.defer(() -> (Mono) askAll(rest, app, command, httpRequest)));
  }

  /**
   * Every remote asked at once for how specifically it claims the route; the longest is mounted.
   */
  private Mono<?> askAll(
      List<RemoteMenu> remotes, AppShell app, RunActionCommand command, HttpRequest httpRequest) {
    var route = removeQueryParamsFromRoute(command.route());
    return reactor.core.publisher.Flux.range(0, remotes.size())
        .flatMap(
            index ->
                remoteMenuHandler
                    .claim(remotes.get(index), route, httpRequest, command)
                    .map(length -> new int[] {index, length}))
        .filter(claim -> claim[1] >= 0)
        .reduce((a, b) -> b[1] > a[1] || (b[1] == a[1] && b[0] < a[0]) ? b : a)
        .flatMap(
            best ->
                remoteMenuHandler.tryResolveRoute(
                    remotes.get(best[0]), command.route(), app, httpRequest, command));
  }

  /**
   * The length of a remote's mount prefix when the route lives under it, -1 otherwise. The prefix
   * is the remote's own path (its field name), whatever group it sits in — the same one the menu
   * sends the renderer as {@code routePrefix}.
   */
  static int prefixClaim(RemoteMenu remote, String route) {
    var prefix = remote.path();
    if (prefix == null || prefix.isBlank() || route == null) {
      return -1;
    }
    prefix = prefix.startsWith("/") ? prefix : "/" + prefix;
    var path = route.startsWith("/") ? route : "/" + route;
    return path.equals(prefix) || path.startsWith(prefix + "/") ? prefix.length() : -1;
  }

  /**
   * Every {@link RemoteMenu} in the tree, at whatever depth it sits. A shell that groups its remote
   * sections under one entry — "Admin", holding Workflow, Forms and Worker — nests them below an
   * ordinary {@link Menu}, so a deep link into one of them (a reloaded or bookmarked {@code
   * /workflow/processes}) was never offered to the remote that owns it: this looked at the top
   * level only, found nothing, and let the route fall through to the shell as "Not found". The
   * frontend's menu completion already descends the same way (see {@code
   * ConnectedElement.getRemoteMenus}).
   *
   * <p>A RemoteMenu is NOT descended into: whatever it has underneath is the remote app's to
   * declare, and it has not answered yet.
   */
  private static List<RemoteMenu> remoteMenusIn(List<Actionable> menu) {
    if (menu == null) {
      return List.of();
    }
    return menu.stream()
        .flatMap(
            option -> {
              if (option instanceof RemoteMenu remoteMenu) {
                return java.util.stream.Stream.of(remoteMenu);
              }
              if (option instanceof Menu group) {
                return remoteMenusIn(group.submenu()).stream();
              }
              return java.util.stream.Stream.empty();
            })
        .toList();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Builds a section-index page for a menu group route (e.g. {@code /workflow}): the group's label
   * as the page title and a clickable list of its child options, so an intermediate menu route
   * lands on a usable page instead of "Not found". Child links are absolutised against the group
   * route; {@link RemoteMenu} children keep their own route.
   */
  private static Object buildSectionIndex(Menu group, String route) {
    var base = route.endsWith("/") ? route.substring(0, route.length() - 1) : route;
    var title =
        group.label() != null && !group.label().isBlank()
            ? group.label()
            : io.mateu.uidl.Humanizer.toUpperCaseFirst(base.substring(base.lastIndexOf('/') + 1));
    List<Component> links =
        group.submenu().stream()
            .filter(child -> !(child instanceof MenuSeparator))
            .map(
                child -> {
                  String target =
                      (child instanceof RemoteMenu remoteMenu)
                          ? remoteMenu.route()
                          : base + child.path();
                  return (Component) new Anchor(labelOf(child), target);
                })
            .toList();
    return PageView.builder()
        .title(title)
        .contentItem(
            VerticalLayout.builder().content(links).style("gap: .5rem; padding: .5rem 0;").build())
        .build();
  }

  /**
   * A child's label for the section index. A remote section may have none — the remote answers with
   * its own — so it falls back to its path's last segment, as the menu does.
   */
  private static String labelOf(Actionable child) {
    if (child.label() != null && !child.label().isBlank()) {
      return child.label();
    }
    var path = child.path() == null ? "" : child.path();
    return io.mateu.uidl.Humanizer.toUpperCaseFirst(path.substring(path.lastIndexOf('/') + 1));
  }

  AppShell toApp(
      Object potentialApp,
      String baseUrl,
      String consumedRoute,
      String initialComponentId,
      HttpRequest httpRequest) {
    if (potentialApp instanceof AppShell app) {
      return app;
    }
    return mapToAppComponent(
        potentialApp,
        baseUrl,
        getAppRoute(potentialApp),
        consumedRoute,
        initialComponentId,
        httpRequest);
  }
}
