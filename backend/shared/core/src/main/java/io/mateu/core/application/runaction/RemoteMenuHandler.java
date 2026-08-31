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
  private final RemoteAppDescriptorCache descriptorCache;

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
              var claimed = claimedRoute(appDto, remoteMenu, route);
              return claimed == null
                  ? Mono.empty()
                  : Mono.just(
                      app.withHomeRoute(claimed)
                          .withHomeBaseUrl(remoteMenu.baseUrl())
                          .withHomeServerSideType(appDto.homeServerSideType())
                          .withHomeConsumedRoute(appDto.homeConsumedRoute())
                          .withHomeUriPrefix(""));
            });
  }

  /**
   * Which of the two candidate routes the remote actually claims, or null if neither: the route
   * with the shell's menu path stripped ({@code /forms/tasks} → {@code /tasks}, the convention) or
   * the route VERBATIM — a remote may declare its own routes already prefixed with the same path
   * ({@code /forms/tasks} is literally what its menu says, which is also what the frontend sends
   * when the user clicks that menu entry). Stripping by convention alone mounts a route the remote
   * does not have, and the page renders "Not found" — the deep-link half of a screen that works
   * fine through the menu.
   */
  private String claimedRoute(AppDto appDto, RemoteMenu remoteMenu, String route) {
    if (route == null) {
      return null;
    }
    var routeWithinApp = routeWithinApp(remoteMenu, route);
    if (ownsRoute(appDto, routeWithinApp)) {
      return routeWithinApp;
    }
    return ownsRoute(appDto, route) ? route : null;
  }

  /**
   * Does the remote app claim this route? Every remote answers ANY route with its app shell (a
   * fallback home with that route stamped), so "anything but the Not-found text" is too weak a test
   * — the route must be one of the app's own menu routes, or live UNDER one.
   *
   * <p>Under one, because a menu route names a SCREEN and a link often names something inside it:
   * {@code /workflow/processes/5f7b6ac6…} is one record of the {@code /workflow/processes} listing,
   * and {@code /new} or {@code /{id}/edit} are the crud's own sub-routes. Asking for an exact match
   * left every one of them unclaimed, so the stripped route was mounted by default and the remote —
   * whose routes carry the prefix — answered "Not found." The {@code /} boundary is what keeps
   * {@code /forms-archive} from being claimed by a remote that only owns {@code /forms}.
   */
  private boolean ownsRoute(AppDto app, String route) {
    var path = withoutQuery(route);
    return menuRoutes(app.menu())
        .filter(menuRoute -> menuRoute != null && !menuRoute.isBlank())
        .anyMatch(menuRoute -> path.equals(menuRoute) || path.startsWith(menuRoute + "/"));
  }

  /** The route alone: a deep link may carry query params, and no menu route ever does. */
  private static String withoutQuery(String route) {
    var query = route.indexOf('?');
    return query < 0 ? route : route.substring(0, query);
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

  /**
   * The remote app's descriptor (title, menu, home wiring), asked at its home route.
   *
   * <p>Asked once per remote per caller per TTL rather than once per navigation: this is an HTTP
   * round trip that lands on the remote's home, so the remote renders its home just to say what its
   * menu is. See {@link RemoteAppDescriptorCache} for what the TTL bounds.
   */
  private Mono<AppDto> fetchRemoteAppDto(
      RemoteMenu remoteMenu, HttpRequest httpRequest, RunActionCommand command) {
    var authorization = httpRequest.getHeaderValue("authorization");
    var cached = descriptorCache.get(remoteMenu.baseUrl(), remoteMenu.route(), authorization);
    if (cached != null) {
      return Mono.just(cached);
    }
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

    return Mono.fromFuture(mateuHttpClient.send(baseUrl, request, authorization))
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
                        .findFirst()))
        .doOnNext(
            appDto ->
                descriptorCache.put(
                    remoteMenu.baseUrl(), remoteMenu.route(), authorization, appDto));
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
                // Page route: resolves within the app with the AppDto's home consumed route. Which
                // route the remote actually claims is asked, not assumed — see claimedRoute; when
                // it claims neither, the stripped one keeps the previous behaviour.
                var claimed = claimedRoute(app, remoteMenu, command.route());
                mountRoute = claimed != null ? claimed : routeWithinApp;
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
