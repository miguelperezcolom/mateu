package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.sun.net.httpserver.HttpServer;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.RestAction;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A PROXIED source with a RELATIVE url ({@code /people/1}) is this app's own endpoint, as it is on
 * the browser's direct leg: the server resolves it against its own base url ({@code
 * mateu.self-base-url}). It used to reach {@code URI.create} as written and fail with "URI with
 * undefined scheme", so the Explorer had to spell the origin through a secret.
 */
class RestProxyRelativeUrlSyncTest {

  static HttpServer upstream;
  static final List<String> received = new CopyOnWriteArrayList<>();
  static TestMateu mateu;

  @SuppressWarnings("unused")
  @UI("/proxyrelative")
  @Title("Proxy relative")
  public static class ProxyRelativeForm {
    @RestAction(url = "/people/${state.id}", proxy = true)
    public void fetchPerson() {}
  }

  @BeforeAll
  static void boot() throws Exception {
    upstream = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    upstream.createContext(
        "/",
        exchange -> {
          received.add(exchange.getRequestURI().getRawPath());
          var body = "{\"name\":\"Luke\"}".getBytes(StandardCharsets.UTF_8);
          exchange.sendResponseHeaders(200, body.length);
          exchange.getResponseBody().write(body);
          exchange.close();
        });
    upstream.start();
    System.setProperty(
        "mateu.self-base-url", "http://127.0.0.1:" + upstream.getAddress().getPort() + "/");
    mateu = TestMateu.withUis(ProxyRelativeForm.class);
  }

  @AfterAll
  static void shutdown() {
    System.clearProperty("mateu.self-base-url");
    mateu.close();
    upstream.stop(0);
  }

  @Test
  @SuppressWarnings("unchecked")
  void aRelativeProxiedUrlIsCalledOnThisAppsOwnBaseUrl() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/proxyrelative")
                .actionId("__restfetch__")
                .parameters(Map.of("_sourceKind", "action", "_sourceId", "fetchPerson"))
                .componentState(Map.of("id", "1"))
                .build());
    assertThat(received).contains("/people/1");
    assertThat(String.valueOf(((Map<String, Object>) increment.appData()).get("_restfetch")))
        .contains("Luke");
  }
}
