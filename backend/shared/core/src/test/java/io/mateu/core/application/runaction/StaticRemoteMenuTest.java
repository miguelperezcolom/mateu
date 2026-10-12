package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.out.MateuHttpClient;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.data.RemoteMenu;
import io.mateu.uidl.fluent.AppShell;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.Test;

/**
 * A federated remote that is a STATIC bundle (its {@code baseUrl} names the bundle's manifest): the
 * server has nothing to ask — POSTing to it answered the host page, which failed to parse, so every
 * deep link into a static remote was a 500 — and mounts it for the browser to load from the
 * manifest instead.
 */
class StaticRemoteMenuTest {

  private static final RemoteMenu CATALOG =
      new RemoteMenu("http://localhost:18482/manifest.json")
          .withLabel("Catalog")
          .withPath("/catalog");

  private final List<String> asked = new ArrayList<>();

  private final MateuHttpClient client =
      new MateuHttpClient() {
        @Override
        public CompletableFuture<UIIncrementDto> send(String baseUrl, RunActionRqDto rq) {
          return send(baseUrl, rq, null);
        }

        @Override
        public CompletableFuture<UIIncrementDto> send(
            String baseUrl, RunActionRqDto rq, String authorization) {
          asked.add(baseUrl);
          return CompletableFuture.failedFuture(new IllegalStateException("not a server"));
        }
      };

  private final RemoteMenuHandler handler =
      new RemoteMenuHandler(client, new RemoteAppDescriptorCache(() -> 0L, 60_000));

  private static RunActionCommand load(String route) {
    var request = new FakeHttpRequest(RunActionRqDto.builder().initiatorComponentId("c").build());
    return new RunActionCommand(
        "", "", route, "_empty", "", Map.of(), Map.of(), "c", request, "", null);
  }

  @Test
  void aBaseUrlNamingAManifestIsAStaticRemote() {
    assertThat(RemoteMenuHandler.isStaticBundle(CATALOG)).isTrue();
    assertThat(RemoteMenuHandler.isStaticBundle(new RemoteMenu("https://cdn/x/MANIFEST.JSON?v=2")))
        .isTrue();
    assertThat(RemoteMenuHandler.isStaticBundle(new RemoteMenu("http://localhost:18481/orders")))
        .isFalse();
    assertThat(RemoteMenuHandler.isStaticBundle(null)).isFalse();
  }

  @Test
  void aDeepLinkIntoAStaticRemoteIsMountedForTheBrowserWithoutAskingIt() {
    var command = load("/catalog/products");
    var shell =
        (AppShell)
            handler
                .handleRemoteMenuActionable(
                    CATALOG, AppShell.builder().build(), command.httpRequest(), command)
                .block();

    assertThat(asked).isEmpty();
    assertThat(shell.homeBaseUrl()).isEqualTo("http://localhost:18482/manifest.json");
    // the route WITHIN the remote, loaded as content (not a fresh load, which is its own shell)
    assertThat(shell.homeRoute()).isEqualTo("/products");
    assertThat(shell.homeConsumedRoute()).isEmpty();
  }

  @Test
  void itsRootIsItsHome() {
    var command = load("/catalog");
    var shell =
        (AppShell)
            handler
                .handleRemoteMenuActionable(
                    CATALOG, AppShell.builder().build(), command.httpRequest(), command)
                .block();
    assertThat(shell.homeRoute()).isEmpty();
    assertThat(asked).isEmpty();
  }

  @Test
  void itClaimsNothingItWouldHaveToBeAskedFor() {
    var command = load("/products");
    assertThat(handler.claim(CATALOG, "/products", command.httpRequest(), command).block())
        .isEqualTo(-1);
    assertThat(
            handler
                .tryResolveRoute(
                    CATALOG,
                    "/products",
                    AppShell.builder().build(),
                    command.httpRequest(),
                    command)
                .blockOptional())
        .isEmpty();
    assertThat(asked).isEmpty();
  }
}
