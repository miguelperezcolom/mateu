package io.mateu.core.application.runaction;

import io.mateu.core.application.out.MateuHttpClient;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.data.RemoteMenu;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Named
@Singleton
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class RemoteMenuHandler {

  private final MateuHttpClient mateuHttpClient;

  Mono<?> handleRemoteMenuActionable(
      RemoteMenu remoteMenu, AppShell app, HttpRequest httpRequest, RunActionCommand command) {
    return resolveRemoteMenu(remoteMenu, httpRequest, command)
        .map(
            result -> {
              if (result instanceof MicroFrontend microFrontend) {
                return app.withHomeRoute(microFrontend.route())
                    .withHomeBaseUrl(microFrontend.baseUrl())
                    .withHomeServerSideType(microFrontend.serverSideType())
                    .withHomeConsumedRoute(microFrontend.consumedRoute())
                    .withHomeUriPrefix("");
              }
              return result;
            })
        .switchIfEmpty((Mono) Mono.just(Text.builder().text("Remote menu not resolved").build()));
  }

  /**
   * Deep-link resolution: mounts the remote app for the route if it claims it. Returns the SHELL
   * with the micro-frontend mounted as its home, empty otherwise — so the shell can try the next
   * remote menu.
   */
  Mono<?> tryResolveRoute(
      RemoteMenu remoteMenu,
      String route,
      AppShell app,
      HttpRequest httpRequest,
      RunActionCommand command) {
    return fetchRemoteAppDto(remoteMenu, httpRequest, command)
        .flatMap(
            appDto -> {
              // Same prefix correction as resolveRemoteMenu: strip the shell menu prefix, then
              // restore the remote's own @UI route so ownsRoute and the mount both use the route
              // the remote actually resolves.
              var mountRoute =
                  prependRemoteRoute(appDto.route(), routeWithinApp(remoteMenu, route));
              return ownsRoute(appDto, mountRoute)
                  ? Mono.just(
                      app.withHomeRoute(mountRoute)
                          .withHomeBaseUrl(remoteMenu.baseUrl())
                          .withHomeServerSideType(appDto.homeServerSideType())
                          .withHomeConsumedRoute(appDto.homeConsumedRoute())
                          .withHomeUriPrefix(""))
                  : Mono.empty();
            });
  }

  /**
   * Does the remote app claim this route? Every remote answers ANY route with its app shell (a
   * fallback home with that route stamped), so "anything but the Not-found text" is too weak a test
   * — the route must be one of the app's own menu routes.
   */
  private boolean ownsRoute(AppDto app, String route) {
    return menuRoutes(app.menu()).anyMatch(route::equals);
  }

  private java.util.stream.Stream<String> menuRoutes(
      java.util.List<io.mateu.dtos.MenuOptionDto> menu) {
    return (menu == null ? java.util.List.<io.mateu.dtos.MenuOptionDto>of() : menu)
        .stream()
            .flatMap(
                option ->
                    java.util.stream.Stream.concat(
                        java.util.stream.Stream.ofNullable(option.route()),
                        menuRoutes(option.submenus())));
  }

  /** The remote app's descriptor (title, menu, home wiring), asked at its home route. */
  private Mono<AppDto> fetchRemoteAppDto(
      RemoteMenu remoteMenu, HttpRequest httpRequest, RunActionCommand command) {
    RunActionRqDto request =
        RunActionRqDto.builder()
            .actionId("")
            .consumedRoute(remoteMenu.consumedRoute())
            .route(remoteMenu.route())
            .serverSideType(remoteMenu.serverSideType())
            .initiatorComponentId(httpRequest.runActionRq().initiatorComponentId())
            .build();

    var baseUrl = remoteMenu.baseUrl();
    if (!baseUrl.startsWith("http")) {
      baseUrl = httpRequest.getHeaderValue("origin") + baseUrl;
    }

    return Mono.fromFuture(
            mateuHttpClient.send(baseUrl, request, httpRequest.getHeaderValue("authorization")))
        .flatMap(
            uiIncrementDto ->
                Mono.justOrEmpty(
                    uiIncrementDto.fragments().stream()
                        .filter(fragment -> fragment.component() != null)
                        .map(UIFragmentDto::component)
                        .filter(componentDto -> componentDto instanceof ClientSideComponentDto)
                        .map(componentDto -> (ClientSideComponentDto) componentDto)
                        .map(ClientSideComponentDto::metadata)
                        .filter(metadata -> metadata instanceof AppDto)
                        .map(metadata -> (AppDto) metadata)
                        .findFirst()));
  }

  private Mono<?> resolveRemoteMenu(
      RemoteMenu remoteMenu, HttpRequest httpRequest, RunActionCommand command) {
    return fetchRemoteAppDto(remoteMenu, httpRequest, command)
        .map(
            app -> {
              var within = routeWithinApp(remoteMenu, command.route());
              // Strip the shell menu prefix, then restore the remote app's OWN route prefix: the
              // remote resolves its pages under its @UI route (e.g. "/distribucion/x"). A remote
              // whose @UI route coincides with the shell menu path would otherwise be asked for
              // the un-prefixed "/x", which it cannot resolve → it answers with its app-shell
              // fallback and the mount reloads forever (nested loop).
              var mountRoute = prependRemoteRoute(app.route(), within);
              return MicroFrontend.builder()
                  .route(mountRoute)
                  // The consumed route the mount's ux travels with: the app home resolves with
                  // the menu's own ("_empty" = root consumed); page routes resolve with the
                  // AppDto's home one.
                  .consumedRoute(
                      within.isEmpty() ? remoteMenu.consumedRoute() : app.homeConsumedRoute())
                  .actionId("")
                  .baseUrl(remoteMenu.baseUrl())
                  .serverSideType(app.homeServerSideType())
                  .build();
            });
  }

  /**
   * Restores the remote app's own route prefix after {@link #routeWithinApp} stripped the shell
   * menu prefix. Root remotes ({@code @UI("")}) keep the stripped route; path-prefixed remotes
   * ({@code @UI("/x")}) get their prefix back so the mounted route matches what the remote actually
   * resolves (otherwise a remote whose @UI route coincides with the shell menu path is asked for a
   * route it cannot resolve → app-shell fallback → reload loop).
   */
  private static String prependRemoteRoute(String remoteAppRoute, String routeWithinApp) {
    if (remoteAppRoute == null || remoteAppRoute.isBlank()) {
      return routeWithinApp;
    }
    if (routeWithinApp == null || routeWithinApp.isEmpty()) {
      return remoteAppRoute;
    }
    if (routeWithinApp.equals(remoteAppRoute) || routeWithinApp.startsWith(remoteAppRoute + "/")) {
      return routeWithinApp; // already carries the remote prefix
    }
    return remoteAppRoute + routeWithinApp;
  }

  /** Strips the remote menu's path prefix: /disponibilidad/x → /x (its route inside the app). */
  private static String routeWithinApp(RemoteMenu remoteMenu, String route) {
    if (route == null || remoteMenu.path() == null || remoteMenu.path().isBlank()) {
      return route;
    }
    if (route.equals(remoteMenu.path())) {
      return "";
    }
    if (route.startsWith(remoteMenu.path() + "/")) {
      return route.substring(remoteMenu.path().length());
    }
    return route;
  }
}
