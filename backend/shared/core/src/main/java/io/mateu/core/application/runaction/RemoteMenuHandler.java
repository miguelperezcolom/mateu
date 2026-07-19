package io.mateu.core.application.runaction;

import io.mateu.core.application.out.MateuHttpClient;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.TextDto;
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
   * Deep-link resolution: asks the remote app whether it owns the given route. Returns the
   * MicroFrontend to mount when it does (the remote answered something other than "Not found."),
   * empty otherwise — so the shell can try the next remote menu.
   */
  Mono<?> tryResolveRoute(
      RemoteMenu remoteMenu, String route, HttpRequest httpRequest, RunActionCommand command) {
    return resolveRemoteMenu(remoteMenu, httpRequest, command)
        .flatMap(
            result ->
                !(result instanceof MicroFrontend microFrontend)
                    ? Mono.empty()
                    : probeRoute(remoteMenu, route, httpRequest)
                        .flatMap(
                            owns ->
                                owns
                                    ? Mono.just(
                                        MicroFrontend.builder()
                                            .route(route)
                                            .consumedRoute(microFrontend.consumedRoute())
                                            .baseUrl(microFrontend.baseUrl())
                                            .serverSideType(microFrontend.serverSideType())
                                            .actionId("")
                                            .build())
                                    : Mono.empty()));
  }

  /** True when the remote app resolves the route (its answer is not the "Not found." text). */
  private Mono<Boolean> probeRoute(RemoteMenu remoteMenu, String route, HttpRequest httpRequest) {
    var baseUrl = remoteMenu.baseUrl();
    if (!baseUrl.startsWith("http")) {
      baseUrl = httpRequest.getHeaderValue("origin") + baseUrl;
    }
    var request =
        RunActionRqDto.builder()
            .actionId("")
            .consumedRoute(remoteMenu.consumedRoute())
            .route(route)
            .serverSideType(remoteMenu.serverSideType())
            .initiatorComponentId(httpRequest.runActionRq().initiatorComponentId())
            .build();
    return Mono.fromFuture(
            mateuHttpClient.send(baseUrl, request, httpRequest.getHeaderValue("authorization")))
        .map(
            uiIncrementDto ->
                uiIncrementDto.fragments().stream()
                    .map(UIFragmentDto::component)
                    .filter(java.util.Objects::nonNull)
                    .noneMatch(
                        component ->
                            component instanceof ClientSideComponentDto clientSide
                                && clientSide.metadata() instanceof TextDto text
                                && "Not found.".equals(text.text())));
  }

  private Mono<?> resolveRemoteMenu(
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

    var remoteBaseUrl = remoteMenu.baseUrl();
    if (remoteBaseUrl.startsWith("http")) {
      remoteBaseUrl = remoteBaseUrl.substring(remoteBaseUrl.indexOf("/") + 1);
      remoteBaseUrl = remoteBaseUrl.substring(remoteBaseUrl.indexOf("/") + 1);
      remoteBaseUrl = remoteBaseUrl.substring(remoteBaseUrl.indexOf("/"));
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
                            .findFirst())
                    .map(app -> (AppDto) app)
                    .map(
                        app ->
                            MicroFrontend.builder()
                                .route(command.route())
                                .consumedRoute(app.homeConsumedRoute())
                                .actionId("")
                                .baseUrl(remoteMenu.baseUrl())
                                .serverSideType(app.homeServerSideType())
                                .build()));
  }
}
