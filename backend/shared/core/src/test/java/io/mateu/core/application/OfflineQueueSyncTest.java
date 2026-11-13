package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.idempotency.IdempotencyKeys;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.OfflinePolicy;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.security.CallerIdentity;
import io.mateu.uidl.security.PrincipalResolver;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * The offline send queue's contract on the server: {@code @Action(offline = QUEUE)} travels on the
 * action DTO, and a request carrying an {@code Idempotency-Key} runs once per caller, action and
 * key — a repeat answers with the first run.
 */
class OfflineQueueSyncTest {

  static final AtomicInteger COUNTS = new AtomicInteger();

  @SuppressWarnings("unused")
  @UI("/offline-count")
  public static class StockCount {

    int counted;

    @Action(offline = OfflinePolicy.QUEUE)
    String save() {
      return "Saved " + COUNTS.incrementAndGet();
    }

    @Action
    String other() {
      return "Other " + COUNTS.incrementAndGet();
    }

    @Action
    String fail() {
      COUNTS.incrementAndGet();
      throw new IllegalStateException("boom");
    }

    @Action(offline = OfflinePolicy.QUEUE)
    String mine(HttpRequest httpRequest) {
      COUNTS.incrementAndGet();
      return "Saved for " + httpRequest.getHeaderValue("X-App-User");
    }

    @Action(offline = OfflinePolicy.QUEUE)
    @EyesOnly(permissions = "stock.write")
    String guarded() {
      return "Guarded " + COUNTS.incrementAndGet();
    }
  }

  /**
   * The app's own identity provider: the user and permissions its gateway put in headers. Mateu
   * reads it through IdentityResolver, for access checks AND the idempotency scope alike.
   */
  public static class GatewayResolver implements PrincipalResolver {
    @Override
    public Optional<CallerIdentity> resolve(HttpRequest httpRequest) {
      var user = httpRequest.getHeaderValue("X-App-User");
      if (user == null) {
        return Optional.empty();
      }
      var permissions = httpRequest.getHeaderValue("X-App-Permissions");
      return Optional.of(
          new CallerIdentity(
              user,
              List.of(),
              List.of(),
              List.of(),
              permissions == null ? List.of() : List.of(permissions.split(","))));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new GatewayResolver()), StockCount.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void reset() {
    COUNTS.set(0);
    IdempotencyKeys.clear();
  }

  @Test
  void theOfflinePolicyTravelsOnTheActionDto() {
    var component =
        (ServerSideComponentDto) mateu.sync("/offline-count").fragments().get(0).component();
    assertThat(action(component, "save").offline()).isEqualTo("queue");
    assertThat(action(component, "other").offline()).isNull();
  }

  @Test
  void aRepeatedKeyAnswersWithTheFirstRunAndNeverRunsTwice() {
    var first = message(mateu.run(rq("save"), keyed("key-0001-aaaa")));
    var second = message(mateu.run(rq("save"), keyed("key-0001-aaaa")));
    assertThat(first).isEqualTo("Saved 1");
    assertThat(second).isEqualTo("Saved 1");
    assertThat(COUNTS.get()).isEqualTo(1);
  }

  @Test
  void anotherKeyOrNoKeyRunsAgain() {
    mateu.run(rq("save"), keyed("key-0001-aaaa"));
    mateu.run(rq("save"), keyed("key-0002-bbbb"));
    mateu.run(rq("save"));
    mateu.run(rq("save"));
    assertThat(COUNTS.get()).isEqualTo(4);
  }

  @Test
  void theKeyIsScopedToTheAction() {
    mateu.run(rq("save"), keyed("key-0001-aaaa"));
    var other = message(mateu.run(rq("other"), keyed("key-0001-aaaa")));
    assertThat(other).isEqualTo("Other 2");
  }

  @Test
  void theKeyIsScopedToTheCaller() {
    var asClerk = new HashMap<>(TestIdentities.headersWithRoles("clerk"));
    asClerk.put(IdempotencyKeys.HEADER, "key-0001-aaaa");
    var asManager = new HashMap<>(TestIdentities.headersWithRoles("manager"));
    asManager.put(IdempotencyKeys.HEADER, "key-0001-aaaa");
    mateu.run(rq("save"), asClerk);
    var manager = message(mateu.run(rq("save"), asManager));
    assertThat(manager).isEqualTo("Saved 2");
  }

  @Test
  void aFailedRunIsForgottenSoTheKeyCanBeSentAgain() {
    try {
      mateu.run(rq("fail"), keyed("key-0003-cccc"));
    } catch (RuntimeException | AssertionError expected) {
      // the error boundary may answer or throw: either way the run failed
    }
    try {
      mateu.run(rq("fail"), keyed("key-0003-cccc"));
    } catch (RuntimeException | AssertionError expected) {
      // same
    }
    assertThat(COUNTS.get()).isEqualTo(2);
  }

  @Test
  void aMalformedKeyIsIgnored() {
    mateu.run(rq("save"), keyed("short"));
    mateu.run(rq("save"), keyed("short"));
    assertThat(COUNTS.get()).isEqualTo(2);
  }

  @Test
  void twoUsersOfTheAppsOwnIdentityProviderNeverShareAKey() {
    var alice = message(mateu.run(rq("mine"), user("alice", null, "key-0004-dddd")));
    var bob = message(mateu.run(rq("mine"), user("bob", null, "key-0004-dddd")));
    assertThat(alice).isEqualTo("Saved for alice");
    assertThat(bob).isEqualTo("Saved for bob");
    assertThat(COUNTS.get()).isEqualTo(2);
  }

  @Test
  void aCallerWhosePermissionWasRevokedIsRefusedNotServedFromMemory() {
    var first = message(mateu.run(rq("guarded"), user("alice", "stock.write", "key-0005-eeee")));
    assertThat(first).isEqualTo("Guarded 1");
    // same user, same key, the permission gone: the action's own check refuses it
    var refused = false;
    try {
      var second = mateu.run(rq("guarded"), user("alice", null, "key-0005-eeee"));
      refused = second.messages().stream().noneMatch(m -> "Guarded 1".equals(m.text()));
    } catch (RuntimeException expected) {
      refused = true;
    }
    assertThat(refused).isTrue();
    assertThat(COUNTS.get()).isEqualTo(1);
  }

  private static Map<String, String> user(String name, String permissions, String key) {
    var headers = new HashMap<String, String>();
    headers.put("X-App-User", name);
    if (permissions != null) {
      headers.put("X-App-Permissions", permissions);
    }
    headers.put(IdempotencyKeys.HEADER, key);
    return headers;
  }

  private static Map<String, String> keyed(String key) {
    return Map.of(IdempotencyKeys.HEADER, key);
  }

  private static RunActionRqDto rq(String actionId) {
    return RunActionRqDto.builder()
        .route("/offline-count")
        .actionId(actionId)
        .serverSideType(StockCount.class.getName())
        .initiatorComponentId("cmp-1")
        .componentState(Map.of("counted", 3))
        .build();
  }

  private static String message(io.mateu.dtos.UIIncrementDto increment) {
    assertThat(increment.messages()).isNotEmpty();
    return increment.messages().get(0).text();
  }

  private static ActionDto action(ServerSideComponentDto component, String id) {
    return component.actions().stream().filter(a -> id.equals(a.id())).findFirst().orElseThrow();
  }
}
