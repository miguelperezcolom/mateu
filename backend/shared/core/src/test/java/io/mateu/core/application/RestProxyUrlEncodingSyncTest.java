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
 * End to end over the PROXIED leg: what the upstream server receives when a value from the client
 * state lands in the url. It must be one encoded path segment, never a path traversal — the server
 * is the one making this call, so a steerable url is an SSRF.
 */
class RestProxyUrlEncodingSyncTest {

  static HttpServer upstream;
  static final List<String> received = new CopyOnWriteArrayList<>();
  static TestMateu mateu;

  @SuppressWarnings("unused")
  @UI("/proxyencoding")
  @Title("Proxy encoding")
  public static class ProxyEncodingForm {
    @RestAction(url = "${secret.UPSTREAM}/people/${state.id}?q=${state.q}", proxy = true)
    public void fetchPerson() {}
  }

  @BeforeAll
  static void boot() throws Exception {
    upstream = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    upstream.createContext(
        "/",
        exchange -> {
          received.add(
              exchange.getRequestURI().getRawPath() + "?" + exchange.getRequestURI().getRawQuery());
          var body = "{\"ok\":true}".getBytes(StandardCharsets.UTF_8);
          exchange.sendResponseHeaders(200, body.length);
          exchange.getResponseBody().write(body);
          exchange.close();
        });
    upstream.start();
    mateu = TestMateu.withUisAndBeans(List.of(new PortSecrets()), ProxyEncodingForm.class);
  }

  /**
   * The annotation needs a constant url, so the ephemeral port reaches it through a configured
   * origin — which also pins that a ${secret.X} origin is substituted raw.
   */
  static class PortSecrets implements io.mateu.uidl.interfaces.SecretsProvider {
    @Override
    public String getSecret(String key) {
      return "UPSTREAM".equals(key) ? "http://127.0.0.1:" + upstream.getAddress().getPort() : null;
    }
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
    upstream.stop(0);
  }

  @Test
  void aTraversalInTheStateReachesUpstreamAsOneEncodedSegment() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/proxyencoding")
                .actionId("__restfetch__")
                .parameters(Map.of("_sourceKind", "action", "_sourceId", "fetchPerson"))
                .componentState(Map.of("id", "1/../../admin", "q", "x&admin=true"))
                .build());
    assertThat(received).isNotEmpty();
    assertThat(received.get(received.size() - 1))
        .isEqualTo("/people/1%2F..%2F..%2Fadmin?q=x%26admin%3Dtrue");
    assertThat((Map<String, Object>) increment.appData()).containsKey("_restfetch");
  }
}
