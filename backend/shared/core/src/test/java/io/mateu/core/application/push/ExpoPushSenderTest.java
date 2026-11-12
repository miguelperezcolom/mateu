package io.mateu.core.application.push;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import io.mateu.uidl.push.PushMessage;
import io.mateu.uidl.push.PushToken;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.IntStream;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** Mateu's Expo sender against a fake Expo push service (a real local HTTP server). */
class ExpoPushSenderTest {

  private static final ObjectMapper JSON = new ObjectMapper();

  private HttpServer server;
  private final List<JsonNode> batches = new CopyOnWriteArrayList<>();
  private final List<String> authorizations = new CopyOnWriteArrayList<>();
  private volatile int status = 200;

  @BeforeEach
  void start() throws IOException {
    server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    server.createContext(
        "/--/api/v2/push/send",
        exchange -> {
          var body = JSON.readTree(exchange.getRequestBody().readAllBytes());
          batches.add(body);
          authorizations.add(
              String.valueOf(exchange.getRequestHeaders().getFirst("Authorization")));
          // one ticket per message: a token containing "gone" is not registered any more
          var tickets = new ArrayList<String>();
          for (var message : body) {
            tickets.add(
                message.get("to").asText().contains("gone")
                    ? "{\"status\":\"error\",\"message\":\"not registered\","
                        + "\"details\":{\"error\":\"DeviceNotRegistered\"}}"
                    : "{\"status\":\"ok\",\"id\":\"t\"}");
          }
          var answer =
              ("{\"data\":[" + String.join(",", tickets) + "]}").getBytes(StandardCharsets.UTF_8);
          exchange.getResponseHeaders().add("Content-Type", "application/json");
          exchange.sendResponseHeaders(status, answer.length);
          exchange.getResponseBody().write(answer);
          exchange.close();
        });
    server.start();
  }

  @AfterEach
  void stop() {
    server.stop(0);
  }

  private String url() {
    return "http://127.0.0.1:" + server.getAddress().getPort() + "/--/api/v2/push/send";
  }

  private static PushToken token(String value) {
    return new PushToken(value, "android", "d-" + value, "https://ops.example.com/app");
  }

  @Test
  void sendsInBatchesOfAHundredAndReportsTheGoneTokens() {
    var tokens = new ArrayList<PushToken>();
    IntStream.range(0, 230).forEach(i -> tokens.add(token("ExponentPushToken[p" + i + "]")));
    tokens.add(token("ExponentPushToken[gone-1]"));

    var result =
        new ExpoPushSender(url(), "secret-token")
            .send(PushMessage.of("Export ready", "Your file").withRoute("/exports/7"), tokens);

    assertThat(batches).extracting(JsonNode::size).containsExactly(100, 100, 31);
    assertThat(result.accepted()).isEqualTo(230);
    assertThat(result.unregisteredTokens()).containsExactly("ExponentPushToken[gone-1]");
    assertThat(authorizations).allMatch("Bearer secret-token"::equals);

    var first = batches.get(0).get(0);
    assertThat(first.get("to").asText()).isEqualTo("ExponentPushToken[p0]");
    assertThat(first.get("title").asText()).isEqualTo("Export ready");
    assertThat(first.get("body").asText()).isEqualTo("Your file");
    assertThat(first.get("channelId").asText()).isEqualTo("mateu");
    assertThat(first.get("data").get("ui").asText()).isEqualTo("https://ops.example.com/app");
    assertThat(first.get("data").get("route").asText()).isEqualTo("/exports/7");
  }

  @Test
  void noAccessTokenSendsNoAuthorization() {
    new ExpoPushSender(url(), null)
        .send(PushMessage.of("Hi", null), List.of(token("ExponentPushToken[a]")));
    assertThat(authorizations).containsExactly("null");
    assertThat(batches.get(0).get(0).has("body")).isFalse();
  }

  @Test
  void aServiceErrorSendsNothingAndThrowsNothing() {
    status = 500;
    var result =
        new ExpoPushSender(url(), null)
            .send(PushMessage.of("Hi", null), List.of(token("ExponentPushToken[a]")));
    assertThat(result.accepted()).isZero();
    assertThat(result.unregisteredTokens()).isEmpty();
  }

  @Test
  void anUnreachableServiceThrowsNothing() {
    var result =
        new ExpoPushSender("http://127.0.0.1:1/--/api/v2/push/send", null)
            .send(PushMessage.of("Hi", null), List.of(token("ExponentPushToken[a]")));
    assertThat(result.accepted()).isZero();
  }

  @Test
  void theInMemoryStoreIsBounded() {
    var store = new InMemoryPushTokenStore();
    for (int i = 0; i < InMemoryPushTokenStore.MAX_PER_PRINCIPAL + 5; i++) {
      store.register("ana", token("ExponentPushToken[t" + i + "]"));
    }
    assertThat(store.tokensFor("ana")).hasSize(InMemoryPushTokenStore.MAX_PER_PRINCIPAL);
    // the same token registered by another user moves to that user
    store.register("bob", token("ExponentPushToken[t14]"));
    assertThat(store.tokensFor("ana")).noneMatch(t -> t.token().equals("ExponentPushToken[t14]"));
    assertThat(store.tokensFor("bob")).hasSize(1);
    store.unregister("ExponentPushToken[t14]");
    assertThat(store.tokensFor("bob")).isEmpty();
    assertThat(store.tokensFor(null)).isEmpty();
  }

  @Test
  void deliveryUnregistersWhatTheSenderReportsGone() {
    var store = new InMemoryPushTokenStore();
    store.register("ana", token("ExponentPushToken[gone-2]"));
    store.register("ana", token("ExponentPushToken[ok]"));
    Push.deliverNow("ana", PushMessage.of("Hi", null), new ExpoPushSender(url(), null), store);
    assertThat(store.tokensFor("ana"))
        .extracting(PushToken::token)
        .containsExactly("ExponentPushToken[ok]");
  }
}
