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
class RemoteMenuHandler {

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

    return Mono.fromFuture(mateuHttpClient.send(baseUrl, request))
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
