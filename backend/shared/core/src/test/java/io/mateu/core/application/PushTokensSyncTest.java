package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.PushRegistration;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PushTokenRegistry;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Push notifications on the Mateu mobile app: an app class implementing {@link PushTokenRegistry}
 * advertises {@code AppDto.pushNotifications}, and the {@code _push-register} / {@code
 * _push-unregister} app-level actions hand it a validated {@link PushRegistration} carrying the
 * caller the host framework authenticated — never one from the request body.
 */
class PushTokensSyncTest {

  static final List<String> calls = new CopyOnWriteArrayList<>();
  static final List<PushRegistration> received = new CopyOnWriteArrayList<>();

  static final String TOKEN = "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]";
  static final String KEY = "p0123456789abcdef";

  @SuppressWarnings("unused")
  @UI("/push-plain")
  @Title("Plain")
  @App
  public static class PlainApp {
    @Menu String home = "/";
  }

  @SuppressWarnings("unused")
  @UI("/push")
  @Title("Orders")
  @App
  public static class PushApp implements PushTokenRegistry {
    @Menu String orders = "/orders";

    @Override
    public void registerPushToken(PushRegistration registration, HttpRequest httpRequest) {
      calls.add("register");
      received.add(registration);
    }

    @Override
    public void unregisterPushToken(PushRegistration registration, HttpRequest httpRequest) {
      calls.add("unregister");
      received.add(registration);
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(PlainApp.class, PushApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void reset() {
    calls.clear();
    received.clear();
  }

  private AppDto app(String route) {
    return FullSyncPipelineTest.findMetadata(
        mateu.sync(route).fragments().get(0).component(), AppDto.class);
  }

  private static RunActionRqDto rq(String actionId, Class<?> app, Map<String, Object> parameters) {
    return RunActionRqDto.builder()
        .route(app == PushApp.class ? "/push" : "/push-plain")
        .serverSideType(app.getName())
        .actionId(actionId)
        .initiatorComponentId("push")
        .componentState(Map.of())
        .parameters(parameters)
        .build();
  }

  private static Map<String, Object> params() {
    var p = new HashMap<String, Object>();
    p.put("token", TOKEN);
    p.put("service", "expo");
    p.put("platform", "android");
    p.put("uiKey", KEY);
    return p;
  }

  @Test
  void anAppWithARegistryAdvertisesPush() {
    assertThat(app("/push").pushNotifications()).isTrue();
    assertThat(app("/push-plain").pushNotifications()).isFalse();
  }

  @Test
  void registerAndUnregisterReachTheAppsRegistryWithTheAuthenticatedCaller() {
    var body = params();
    // a principal in the body is never read
    body.put("principal", "someone-else");
    mateu.run(rq("_push-register", PushApp.class, body), TestIdentities.headersWithRoles("user"));
    mateu.run(rq("_push-unregister", PushApp.class, body), TestIdentities.headersWithRoles("user"));
    assertThat(calls).containsExactly("register", "unregister");
    var registration = received.get(0);
    assertThat(registration.token()).isEqualTo(TOKEN);
    assertThat(registration.service()).isEqualTo("expo");
    assertThat(registration.platform()).isEqualTo("android");
    assertThat(registration.uiKey()).isEqualTo(KEY);
    assertThat(registration.principal()).isNotNull().isNotEqualTo("someone-else");
  }

  @Test
  void anAnonymousCallerRegistersWithNoPrincipal() {
    mateu.run(rq("_push-register", PushApp.class, params()));
    assertThat(received).singleElement().extracting(PushRegistration::principal).isNull();
  }

  @Test
  void aMalformedRegistrationNeverReachesTheRegistry() {
    for (var bad :
        List.<Map.Entry<String, Object>>of(
            Map.entry("token", "not-a-token"),
            Map.entry("token", "ExponentPushToken[ab]"),
            Map.entry("service", "fcm"),
            Map.entry("platform", "web"),
            Map.entry("uiKey", "short"),
            Map.entry("uiKey", "../../etc/passwd"))) {
      var p = params();
      p.put(bad.getKey(), bad.getValue());
      try {
        var answer = mateu.run(rq("_push-register", PushApp.class, p));
        assertThat(answer.messages()).as(bad.toString()).isNotEmpty();
      } catch (RuntimeException refused) {
        // refused either way
      }
    }
    assertThat(calls).isEmpty();
  }

  @Test
  void anAppWithoutARegistryRefuses() {
    try {
      var answer = mateu.run(rq("_push-register", PlainApp.class, params()));
      assertThat(answer.messages()).isNotEmpty();
    } catch (RuntimeException refused) {
      assertThat(refused.getClass().getSimpleName()).contains("Forbidden");
    }
    assertThat(calls).isEmpty();
  }
}
