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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * A proxied REST write against a live upstream: the server sends the request the source declares
 * (method, interpolated headers, a JSON body whose VALUES are escaped), reads back the JSON answer,
 * treats a 204 as success, reports an upstream status in the error, and runs a bulk call once per
 * selected row — succeeding only when every row did.
 */
class RestProxyRoundTripSyncTest {

  /** In S1's port block (F1). */
  static final int PORT = 19011;

  static final String BASE = "http://127.0.0.1:" + PORT;

  @SuppressWarnings("unused")
  @UI("/proxy-roundtrip")
  @Title("Proxy round trip")
  public static class PeopleForm {
    public String name;

    @RestAction(url = BASE + "/people/${state.id}", method = "DELETE", proxy = true)
    public void remove() {}

    @RestAction(
        url = BASE + "/people",
        method = "POST",
        headers = {"Content-Type: application/json", "X-Tenant: ${state.tenant}"},
        body = "{\"name\": \"${state.name}\"}",
        proxy = true)
    public void create() {}

    @RestAction(url = BASE + "/missing", method = "GET", proxy = true)
    public void lookup() {}
  }

  static TestMateu mateu;
  static HttpServer upstream;
  static final List<String> received = new CopyOnWriteArrayList<>();

  @BeforeAll
  static void boot() throws Exception {
    upstream = HttpServer.create(new InetSocketAddress("127.0.0.1", PORT), 0);
    upstream.createContext(
        "/people",
        exchange -> {
          var body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
          received.add(
              exchange.getRequestMethod()
                  + " "
                  + exchange.getRequestURI().getPath()
                  + " tenant="
                  + exchange.getRequestHeaders().getFirst("X-Tenant")
                  + " "
                  + body);
          if ("DELETE".equals(exchange.getRequestMethod())) {
            var status = exchange.getRequestURI().getPath().endsWith("/13") ? 500 : 204;
            exchange.sendResponseHeaders(status, -1);
            exchange.close();
            return;
          }
          var answer = ("{\"received\": " + body + "}").getBytes(StandardCharsets.UTF_8);
          exchange.getResponseHeaders().add("Content-Type", "application/json");
          exchange.sendResponseHeaders(201, answer.length);
          exchange.getResponseBody().write(answer);
          exchange.close();
        });
    upstream.createContext(
        "/missing",
        exchange -> {
          exchange.sendResponseHeaders(404, -1);
          exchange.close();
        });
    upstream.start();
    mateu = TestMateu.withUis(PeopleForm.class);
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

  @SuppressWarnings("unchecked")
  static Map<String, Object> fetch(
      String actionId, Map<String, Object> state, Map<String, Object> extra) {
    var parameters = new java.util.HashMap<String, Object>(extra);
    parameters.put("_sourceKind", "action");
    parameters.put("_sourceId", actionId);
    return (Map<String, Object>)
        mateu
            .run(
                RunActionRqDto.builder()
                    .route("/proxy-roundtrip")
                    .actionId("__restfetch__")
                    .parameters(parameters)
                    .componentState(state)
                    .build())
            .appData();
  }

  @Test
  @SuppressWarnings("unchecked")
  void aJsonBodyIsSentWithItsValuesEscapedAndTheAnswerComesBack() {
    var appData =
        fetch("create", Map.of("name", "Leia \"the\" Organa", "tenant", "rebels"), Map.of());
    assertThat(received)
        .singleElement()
        .isEqualTo("POST /people tenant=rebels {\"name\": \"Leia \\\"the\\\" Organa\"}");
    var answer = (Map<String, Object>) appData.get("_restfetch");
    assertThat((Map<String, Object>) answer.get("received"))
        .containsEntry("name", "Leia \"the\" Organa");
  }

  @Test
  void aNoContentAnswerIsASuccessNotAFailure() {
    var appData = fetch("remove", Map.of("id", 7), Map.of());
    assertThat(appData).containsEntry("_restfetch", Map.of()).doesNotContainKey("_restfetchError");
    assertThat(received).containsExactly("DELETE /people/7 tenant=null ");
  }

  @Test
  @SuppressWarnings("unchecked")
  void anUpstreamErrorCarriesItsStatus() {
    var error = (Map<String, Object>) fetch("lookup", Map.of(), Map.of()).get("_restfetchError");
    assertThat(error).containsEntry("status", 404);
    assertThat(String.valueOf(error.get("message"))).isEqualTo("Request failed (HTTP 404)");
  }

  @Test
  void aBulkCallRunsOncePerSelectedRowAndSucceedsWhenAllDid() {
    var appData =
        fetch(
            "remove",
            Map.of("crud_selected_items", List.of(Map.of("id", 1), Map.of("id", 2))),
            Map.of("_forEachSelectedRow", true));
    assertThat(appData).containsEntry("_restfetch", Map.of());
    assertThat(received)
        .containsExactly("DELETE /people/1 tenant=null ", "DELETE /people/2 tenant=null ");
  }

  @Test
  @SuppressWarnings("unchecked")
  void aBulkCallWithOneFailingRowSaysHowManyAndWhy() {
    var error =
        (Map<String, Object>)
            fetch(
                    "remove",
                    Map.of(
                        "crud_selected_items",
                        List.of(Map.of("id", 1), Map.of("id", 13), Map.of("id", 2))),
                    Map.of("_forEachSelectedRow", true))
                .get("_restfetchError");
    assertThat(error).containsEntry("status", 500);
    assertThat(String.valueOf(error.get("message"))).isEqualTo("1 of 3 failed (HTTP 500)");
    assertThat(received).hasSize(3);
  }

  @Test
  void aSourceThePageDoesNotDeclareFetchesNothing() {
    var appData = fetch("nonexistent", Map.of(), Map.of());
    assertThat(appData).containsEntry("_restfetch", Map.of());
    assertThat(received).isEmpty();
  }
}
