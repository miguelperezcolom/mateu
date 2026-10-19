package io.mateu;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.InetSocketAddress;
import java.security.Principal;
import org.junit.jupiter.api.Test;
import org.springframework.http.server.reactive.SslInfo;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

/**
 * The WebFlux {@link SpringHttpRequest}: the principal is read off the exchange before the action
 * runs, and the server's own base url — what a relative {@code RemoteMenu} is resolved against —
 * comes from the local socket, never from anything the client sends.
 */
class SpringHttpRequestTest {

  @Test
  void attachesTheExchangesPrincipalBeforeTheCallRuns() {
    Principal alice = () -> "alice";
    var exchange =
        MockServerWebExchange.builder(MockServerHttpRequest.post("/app/mateu/v3/sync/x").build())
            .principal(alice)
            .build();
    var request = new SpringHttpRequest(exchange.getRequest());

    StepVerifier.create(
            SpringHttpRequest.withPrincipalOf(
                exchange, request, () -> Flux.just(request.getUserPrincipal().getName())))
        .expectNext("alice")
        .verifyComplete();
  }

  @Test
  void runsTheCallAnonymouslyWhenNobodyIsAuthenticated() {
    var exchange = MockServerWebExchange.from(MockServerHttpRequest.post("/app").build());
    var request = new SpringHttpRequest(exchange.getRequest()).withPrincipal(() -> "stale");

    StepVerifier.create(
            SpringHttpRequest.withPrincipalOf(
                exchange, request, () -> Flux.just(String.valueOf(request.getUserPrincipal()))))
        .expectNext("null")
        .verifyComplete();
  }

  @Test
  void aCallThatThrowsBecomesAnErrorSignalNotAnExceptionOnTheEventLoop() {
    var exchange = MockServerWebExchange.from(MockServerHttpRequest.post("/app").build());
    var failure = new IllegalStateException("boom");

    StepVerifier.create(
            SpringHttpRequest.withPrincipalOf(
                exchange,
                new SpringHttpRequest(exchange.getRequest()),
                () -> {
                  throw failure;
                }))
        .expectErrorMatches(error -> error == failure)
        .verify();
  }

  @Test
  void theSelfBaseUrlIsTheLocalSocketOverPlainHttpOnly() {
    var plain =
        MockServerHttpRequest.get("/app")
            .header("Host", "attacker.example")
            .localAddress(new InetSocketAddress("10.0.0.5", 8123))
            .build();
    assertThat(new SpringHttpRequest(plain).getSelfBaseUrl()).isEqualTo("http://localhost:8123");

    var tls =
        MockServerHttpRequest.get("/app")
            .localAddress(new InetSocketAddress("10.0.0.5", 8443))
            .sslInfo(new NoSslInfo())
            .build();
    assertThat(new SpringHttpRequest(tls).getSelfBaseUrl()).isNull();

    var unknownSocket = MockServerHttpRequest.get("/app").build();
    assertThat(new SpringHttpRequest(unknownSocket).getSelfBaseUrl()).isNull();
  }

  @Test
  void theRemoteAddressIsThePeersIpOrNothingWhenItIsUnknown() {
    var known =
        MockServerHttpRequest.get("/app")
            .remoteAddress(new InetSocketAddress("192.168.1.7", 54321))
            .build();
    assertThat(new SpringHttpRequest(known).getRemoteAddress()).isEqualTo("192.168.1.7");

    var noSocket = MockServerHttpRequest.get("/app").build();
    assertThat(new SpringHttpRequest(noSocket).getRemoteAddress()).isNull();

    var unresolved =
        MockServerHttpRequest.get("/app")
            .remoteAddress(InetSocketAddress.createUnresolved("peer.invalid", 54321))
            .build();
    assertThat(new SpringHttpRequest(unresolved).getRemoteAddress()).isNull();
  }

  @Test
  void anAbsentQueryParameterOrHeaderReadsAsNothing() {
    var request = new SpringHttpRequest(MockServerHttpRequest.get("/app?q=1").build());
    assertThat(request.getParameterValue("q")).isEqualTo("1");
    assertThat(request.getParameterValue("absent")).isNull();
    assertThat(request.getParameterValues("absent")).isEmpty();
    assertThat(request.getHeaderValues("X-Absent")).isEmpty();
    assertThat(request.path()).isEqualTo("/app");
  }

  private static final class NoSslInfo implements SslInfo {
    @Override
    public String getSessionId() {
      return "session";
    }

    @Override
    public java.security.cert.X509Certificate[] getPeerCertificates() {
      return new java.security.cert.X509Certificate[0];
    }
  }
}
