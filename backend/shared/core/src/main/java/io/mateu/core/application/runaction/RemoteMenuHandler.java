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
    var routeWithinApp = routeWithinApp(remoteMenu, route);
    return fetchRemoteAppDto(remoteMenu, httpRequest, command)
        .flatMap(
            appDto ->
                ownsRoute(appDto, routeWithinApp)
                    ? Mono.just(
                        app.withHomeRoute(routeWithinApp)
                            .withHomeBaseUrl(remoteMenu.baseUrl())
                            .withHomeServerSideType(appDto.homeServerSideType())
                            .withHomeConsumedRoute(appDto.homeConsumedRoute())
                            .withHomeUriPrefix(""))
                    : Mono.empty());
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
              var routeWithinApp = routeWithinApp(remoteMenu, command.route());
              var path = remoteMenu.path();
              boolean rootDeepLink = routeWithinApp.isEmpty();
              boolean haveMenuPath = path != null && !path.isBlank();
              // Root deep-link into the remote (the shell menu path itself, so nothing is left once
              // the prefix is stripped): mount so the remote renders its HOME CONTENT, not its full
              // app shell. Mounting the shell menu path as BOTH route and consumedRoute
              // (route "/distribucion", consumedRoute "/distribucion") makes the remote serve its
              // home content; mounting route "" / consumedRoute "_empty" instead makes it answer
              // with its whole app shell — its own chrome and menu nested inside the shell, and
              // navigating that nested app loops forever (and an empty mount route is downstream
              // stamped "_no_home_route"). A menu path is always set for a mounted remote menu;
              // fall back to the menu's own route/consumed route only if it is blank.
              String mountRoute;
              String mountConsumedRoute;
              if (rootDeepLink && haveMenuPath) {
                mountRoute = path;
                mountConsumedRoute = path;
              } else if (rootDeepLink) {
                mountRoute = routeWithinApp;
                mountConsumedRoute = remoteMenu.consumedRoute();
              } else {
                // Page route: resolves within the app with the AppDto's home consumed route.
                mountRoute = routeWithinApp;
                mountConsumedRoute = app.homeConsumedRoute();
              }
              return MicroFrontend.builder()
                  .route(mountRoute)
                  .consumedRoute(mountConsumedRoute)
                  .actionId("")
                  .baseUrl(remoteMenu.baseUrl())
                  .serverSideType(app.homeServerSideType())
                  .build();
            });
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
