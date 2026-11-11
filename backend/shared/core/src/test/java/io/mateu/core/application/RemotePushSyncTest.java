package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.push.InMemoryPushTokenStore;
import io.mateu.core.infra.JsonSerializer;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.PushNotifications;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.MessageAction;
import io.mateu.uidl.data.MessagePersistence;
import io.mateu.uidl.interfaces.PushSender;
import io.mateu.uidl.push.PushMessage;
import io.mateu.uidl.push.PushResult;
import io.mateu.uidl.push.PushToken;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Remote push: a phone registers its token with {@code _push-register} (app-level), an inbox
 * message to a signed-in caller — or {@code PushNotifications.send} — reaches the app's {@code
 * PushSender} with that caller's tokens, a token the sender reports gone is unregistered, and the
 * app tells the renderer push is on ({@code AppDto.pushNotifications}).
 */
class RemotePushSyncTest {

  @SuppressWarnings("unused")
  @UI("/push-app")
  @App(inbox = true, osNotifications = true)
  public static class PushApp {

    @Menu String home = "/";
  }

  @UI("/push-senders")
  public static class Senders {

    @Button
    public Message exported() {
      return Message.success("Export ready")
          .withAction(MessageAction.open("Download", "/exports/7"))
          .withPersistence(MessagePersistence.inbox);
    }
  }

  /** Records what it is asked to send; reports the tokens in {@code gone} as unregistered. */
  static final class FakeSender implements PushSender {
    final LinkedBlockingQueue<Map.Entry<PushMessage, List<PushToken>>> sent =
        new LinkedBlockingQueue<>();
    final List<String> gone = new CopyOnWriteArrayList<>();

    @Override
    public PushResult send(PushMessage message, List<PushToken> tokens) {
      sent.add(Map.entry(message, tokens));
      return new PushResult(
          tokens.size(), tokens.stream().map(PushToken::token).filter(gone::contains).toList());
    }
  }

  static final FakeSender SENDER = new FakeSender();
  static final InMemoryPushTokenStore STORE = new InMemoryPushTokenStore();
  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(SENDER, STORE), PushApp.class, Senders.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void clean() {
    SENDER.sent.clear();
    SENDER.gone.clear();
  }

  private static final Map<String, String> USER = TestIdentities.headersWithRoles("user");

  private static RunActionRqDto app(String actionId, Map<String, Object> parameters) {
    return RunActionRqDto.builder()
        .route("/push-app")
        .consumedRoute("/push-app")
        .serverSideType(PushApp.class.getName())
        .actionId(actionId)
        .initiatorComponentId("_ux")
        .componentState(Map.of())
        .parameters(parameters)
        .build();
  }

  private static Map<String, Object> registration(String token, String deviceId) {
    var parameters = new HashMap<String, Object>();
    parameters.put("token", token);
    parameters.put("platform", "android");
    parameters.put("deviceId", deviceId);
    parameters.put("ui", "https://ops.example.com/push-app");
    return parameters;
  }

  @SuppressWarnings("unchecked")
  private static boolean registered(UIIncrementDto increment) {
    return increment.fragments().stream()
        .map(f -> f.data())
        .filter(d -> d instanceof Map<?, ?> m && m.containsKey("_push"))
        .map(d -> (Map<String, Object>) ((Map<String, Object>) d).get("_push"))
        .map(m -> Boolean.TRUE.equals(m.get("registered")))
        .findFirst()
        .orElseThrow();
  }

  @Test
  void theAppSaysPushIsOn() {
    var json = JsonSerializer.toJson(mateu.sync("/push-app")).replace(" ", "");
    assertThat(json).contains("\"osNotifications\":true").contains("\"pushNotifications\":true");
  }

  @Test
  void aRegisteredPhoneGetsAPushForEveryInboxMessage() throws Exception {
    var token = "ExponentPushToken[inbox-phone]";
    assertThat(registered(mateu.run(app("_push-register", registration(token, "dev-1")), USER)))
        .isTrue();
    assertThat(STORE.tokensFor("test-user"))
        .singleElement()
        .satisfies(
            t -> {
              assertThat(t.token()).isEqualTo(token);
              assertThat(t.platform()).isEqualTo("android");
              assertThat(t.ui()).isEqualTo("https://ops.example.com/push-app");
            });

    mateu.run(
        RunActionRqDto.builder()
            .route("/push-senders")
            .actionId("exported")
            .serverSideType(Senders.class.getName())
            .build(),
        USER);

    var push = SENDER.sent.poll(5, TimeUnit.SECONDS);
    assertThat(push).isNotNull();
    assertThat(push.getKey().title()).isEqualTo("Export ready");
    assertThat(push.getKey().route()).isEqualTo("/exports/7");
    assertThat(push.getKey().id()).startsWith("inbox-");
    assertThat(push.getValue()).extracting(PushToken::token).containsExactly(token);

    mateu.run(app("_push-unregister", Map.of("token", token)), Map.of());
    assertThat(STORE.tokensFor("test-user")).isEmpty();
  }

  @Test
  void theExplicitApiReachesTheUsersPhonesAndDropsTheGoneOnes() throws Exception {
    var token = "ExponentPushToken[gone-phone]";
    mateu.run(app("_push-register", registration(token, "dev-2")), USER);
    SENDER.gone.add(token);

    PushNotifications.send("test-user", PushMessage.of("Hi", "there").withRoute("/orders/1"));

    var push = SENDER.sent.poll(5, TimeUnit.SECONDS);
    assertThat(push).isNotNull();
    assertThat(push.getKey().route()).isEqualTo("/orders/1");
    // the sender said the phone is gone: Mateu forgets it
    for (int i = 0; i < 50 && !STORE.tokensFor("test-user").isEmpty(); i++) {
      Thread.sleep(20);
    }
    assertThat(STORE.tokensFor("test-user")).isEmpty();
  }

  @Test
  void anAnonymousPhoneIsKeptUnderItsSessionOnly() throws Exception {
    var token = "ExponentPushToken[anon-phone]";
    mateu.run(app("_push-register", registration(token, "dev-3")), Map.of("X-Session-Id", "s-42"));
    assertThat(STORE.tokensFor(PushNotifications.sessionKey("s-42")))
        .extracting(PushToken::token)
        .containsExactly(token);

    PushNotifications.sendToSession("s-42", PushMessage.of("For you", null));
    assertThat(SENDER.sent.poll(5, TimeUnit.SECONDS)).isNotNull();
    mateu.run(app("_push-unregister", Map.of("token", token)), Map.of());
  }

  @Test
  void aNewTokenOfTheSameDeviceReplacesTheOldOne() {
    mateu.run(app("_push-register", registration("ExponentPushToken[old]", "dev-4")), USER);
    mateu.run(app("_push-register", registration("ExponentPushToken[new]", "dev-4")), USER);
    assertThat(STORE.tokensFor("test-user"))
        .extracting(PushToken::token)
        .containsExactly("ExponentPushToken[new]");
    mateu.run(app("_push-unregister", Map.of("token", "ExponentPushToken[new]")), USER);
  }

  @Test
  void aRegistrationNeedsAToken() {
    var answer = mateu.run(app("_push-register", Map.of("platform", "ios")), USER);
    assertThat(JsonSerializer.toJson(answer)).contains("A push token is needed.");
    assertThat(STORE.tokensFor("test-user")).isEmpty();
  }

  @Test
  void aNonWebUiIsNotKept() {
    var parameters = registration("ExponentPushToken[js]", "dev-5");
    parameters.put("ui", "javascript:alert(1)");
    mateu.run(app("_push-register", parameters), USER);
    assertThat(STORE.tokensFor("test-user"))
        .singleElement()
        .satisfies(t -> assertThat(t.ui()).isNull());
    mateu.run(app("_push-unregister", Map.of("token", "ExponentPushToken[js]")), USER);
  }
}
