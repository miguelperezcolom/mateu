package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import io.mateu.core.application.runaction.RunActionUseCase;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.RestAction;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.SecretsProvider;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * End to end over the PROXIED leg, against a real upstream: what the server SENDS (secret headers,
 * an escaped JSON body), what it ANSWERS (the upstream body, or an error for a 4xx/5xx) and — the
 * point of the proxy — that a resolved secret travels upstream only, never back to the browser.
 *
 * <p>The url's origin reaches the annotation through {@code ${secret.UPSTREAM}} because an
 * annotation needs a constant and the upstream's port is ephemeral.
 */
class RestProxySecretsSyncTest {

  static final String API_KEY = "test-key-" + java.util.UUID.randomUUID();

  static HttpServer upstream;
  static final List<Map<String, String>> received = new CopyOnWriteArrayList<>();
  static final Map<String, Integer> statusFor = new ConcurrentHashMap<>();
  static TestMateu mateu;

  @SuppressWarnings("unused")
  @UI("/proxysecrets")
  @Title("Proxy secrets")
  public static class ProxySecretsForm {
    @RestAction(
        url = "${secret.UPSTREAM}/people",
        method = "POST",
        headers = {"X-Api-Key: ${secret.API_KEY}", "Content-Type: application/json"},
        body = "{\"name\":\"${state.name}\"}",
        proxy = true)
    public void create() {}

    // HOME is set in every process environment: it must NOT be what ${secret.HOME} resolves to.
    @RestAction(
        url = "${secret.UPSTREAM}/leak",
        method = "GET",
        headers = {"X-Home: ${secret.HOME}"},
        proxy = true)
    public void leak() {}

    @RestAction(url = "${secret.UPSTREAM}/fail", method = "PUT", proxy = true)
    public void fail() {}

    @RestAction(url = "${secret.UPSTREAM}/gone", method = "DELETE", proxy = true)
    public void remove() {}
  }

  static class TestSecrets implements SecretsProvider {
    @Override
    public String getSecret(String key) {
      return switch (key) {
        case "UPSTREAM" -> "http://127.0.0.1:" + upstream.getAddress().getPort();
        case "API_KEY" -> API_KEY;
        default -> null;
      };
    }
  }

  @BeforeAll
  static void boot() throws Exception {
    upstream = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    upstream.createContext(
        "/",
        exchange -> {
          var body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
          var headers = new java.util.HashMap<String, String>();
          exchange.getRequestHeaders().forEach((k, v) -> headers.put(k.toLowerCase(), v.get(0)));
          headers.put(":path", exchange.getRequestURI().getRawPath());
          headers.put(":method", exchange.getRequestMethod());
          headers.put(":body", body);
          received.add(headers);
          int status = statusFor.getOrDefault(exchange.getRequestURI().getRawPath(), 200);
          if (status == 204) {
            exchange.sendResponseHeaders(204, -1);
          } else {
            var out =
                ("{\"id\":42,\"echo\":" + (body.isBlank() ? "null" : body) + "}")
                    .getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(status, out.length);
            exchange.getResponseBody().write(out);
          }
          exchange.close();
        });
    upstream.start();
    statusFor.put("/fail", 500);
    statusFor.put("/gone", 204);
    mateu = TestMateu.withUisAndBeans(List.of(new TestSecrets()), ProxySecretsForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
    upstream.stop(0);
  }

  @BeforeEach
  void clear() {
    received.clear();
  }

  private UIIncrementDto fetch(String sourceId, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/proxysecrets")
            .actionId("__restfetch__")
            .parameters(Map.of("_sourceKind", "action", "_sourceId", sourceId))
            .componentState(state)
            .build());
  }

  @Test
  void theSecretHeaderIsResolvedOnTheServerAndNeverTravelsBack() throws Exception {
    var increment = fetch("create", Map.of("name", "Ana"));

    assertThat(received).hasSize(1);
    var rq = received.get(0);
    assertThat(rq.get(":method")).isEqualTo("POST");
    assertThat(rq.get(":path")).isEqualTo("/people");
    assertThat(rq.get("x-api-key")).as("the provider's secret reached upstream").isEqualTo(API_KEY);

    @SuppressWarnings("unchecked")
    var appData = (Map<String, Object>) increment.appData();
    assertThat(appData).containsKey("_restfetch").doesNotContainKey("_restfetchError");
    assertThat(((Map<?, ?>) appData.get("_restfetch")).get("id")).isEqualTo(42);

    var wire = new ObjectMapper().writeValueAsString(increment);
    assertThat(wire).as("the resolved secret never reaches the browser").doesNotContain(API_KEY);
  }

  @Test
  void aJsonBodyCarriesStateValuesEscaped() throws Exception {
    fetch("create", Map.of("name", "Ana \"la\" O'Neil\nsecond line"));

    var body = received.get(0).get(":body");
    @SuppressWarnings("unchecked")
    var parsed = (Map<String, Object>) new ObjectMapper().readValue(body, Map.class);
    assertThat(parsed)
        .as("the quote and the newline did not break the template's JSON")
        .containsEntry("name", "Ana \"la\" O'Neil\nsecond line")
        .hasSize(1);
  }

  @Test
  void aSecretFallsBackOnlyToItsMateuSecretVariableNeverToAnyEnvVariable() {
    assertThat(System.getenv("HOME")).as("precondition: HOME is set").isNotBlank();

    fetch("leak", Map.of());

    var sent = received.get(0).get("x-home");
    assertThat(sent == null ? "" : sent)
        .as("${secret.HOME} reads MATEU_SECRET_HOME, never HOME")
        .doesNotContain(System.getenv("HOME"));
    assertThat(RunActionUseCase.secretEnvName("HOME")).isEqualTo("MATEU_SECRET_HOME");
    assertThat(RunActionUseCase.secretEnvName("MATEU_SECRET_X")).isEqualTo("MATEU_SECRET_X");
  }

  @Test
  void anUpstreamErrorSurfacesItsStatusInsteadOfAnEmptySuccess() {
    var increment = fetch("fail", Map.of());

    @SuppressWarnings("unchecked")
    var appData = (Map<String, Object>) increment.appData();
    assertThat(appData).doesNotContainKey("_restfetch");
    @SuppressWarnings("unchecked")
    var error = (Map<String, Object>) appData.get("_restfetchError");
    assertThat(error).containsEntry("status", 500);
    assertThat(String.valueOf(error.get("message"))).isEqualTo("Request failed (HTTP 500)");
  }

  @Test
  void aNoContentAnswerIsASuccess() {
    var increment = fetch("remove", Map.of());

    @SuppressWarnings("unchecked")
    var appData = (Map<String, Object>) increment.appData();
    assertThat(received.get(0).get(":method")).isEqualTo("DELETE");
    assertThat(appData).containsEntry("_restfetch", Map.of()).doesNotContainKey("_restfetchError");
  }
}
