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

  @SuppressWarnings("unused")
  public static class Note {
    String text = "first";
  }

  static final AtomicInteger SAVES = new AtomicInteger();
  static volatile boolean locked;

  /** An editable view whose read-only gate is app logic (a switch), not the caller's identity. */
  @UI("/offline-note")
  @io.mateu.uidl.annotations.Title("Note")
  public static class NoteView
      extends io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView<Note> {
    @Override
    public Note load(HttpRequest httpRequest) {
      return new Note();
    }

    @Override
    public void persist(Note entity, HttpRequest httpRequest) {
      SAVES.incrementAndGet();
    }

    @Override
    public boolean readOnly() {
      return locked;
    }
  }

  public static class Part implements io.mateu.uidl.interfaces.Identifiable {
    String id;
    String name;

    public Part() {}

    Part(String id, String name) {
      this.id = id;
      this.name = name;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Part> PARTS = new java.util.ArrayList<>();
  static final AtomicInteger PART_SAVES = new AtomicInteger();
  static volatile boolean partsEditable = true;

  /** A crud whose canEdit() is app logic (a switch), not the caller's identity: CrudWriteGate. */
  @UI("/offline-parts")
  @io.mateu.uidl.annotations.Title("Parts")
  public static class PartsCrud
      extends io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud<Part> {
    @Override
    public io.mateu.uidl.interfaces.CrudStore<Part> store() {
      return new io.mateu.uidl.interfaces.CrudStore<>() {
        @Override
        public Optional<Part> findById(String id) {
          return PARTS.stream().filter(p -> p.id.equals(id)).findFirst();
        }

        @Override
        public String save(Part entity) {
          PART_SAVES.incrementAndGet();
          PARTS.removeIf(p -> p.id.equals(entity.id));
          PARTS.add(entity);
          return entity.id;
        }

        @Override
        public List<Part> findAll() {
          return PARTS;
        }

        @Override
        public void deleteAllById(List<String> ids) {
          PARTS.removeIf(p -> ids.contains(p.id));
        }
      };
    }

    @Override
    public boolean canEdit() {
      return partsEditable;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUisAndBeans(
            List.of(new GatewayResolver()),
            StockCount.class,
            OtherStockCount.class,
            NoteView.class,
            PartsCrud.class);
  }

  /** Another view with the same queued action id. */
  @UI("/offline-count-2")
  public static class OtherStockCount extends StockCount {}

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
  void theKeyIsScopedToTheView() {
    var first = message(mateu.run(rq("save"), keyed("key-0010-jjjj")));
    var otherView =
        RunActionRqDto.builder()
            .route("/offline-count-2")
            .actionId("save")
            .serverSideType(OtherStockCount.class.getName())
            .initiatorComponentId("cmp-1")
            .componentState(Map.of("counted", 3))
            .build();
    var second = message(mateu.run(otherView, keyed("key-0010-jjjj")));
    assertThat(first).isEqualTo("Saved 1");
    assertThat(second).isEqualTo("Saved 2");
    assertThat(COUNTS.get()).isEqualTo(2);
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

  @Test
  void aReplayRefusedByANonIdentityRuleIsRefusedNotServedFromMemory() {
    // the view's read-only gate is app logic, not identity: the caller scope is the same, so only
    // claiming the key at the checkpoint (after the gate) keeps the remembered answer back
    locked = false;
    SAVES.set(0);
    try {
      saveNote("key-0006-ffff");
      assertThat(SAVES.get()).isEqualTo(1);
      locked = true;
      assertThat(forbidden(() -> saveNote("key-0006-ffff"))).isTrue();
      // the gate allowing it again: the same key answers from memory, no second save
      locked = false;
      saveNote("key-0006-ffff");
      assertThat(SAVES.get()).isEqualTo(1);
    } finally {
      locked = false;
    }
  }

  @Test
  void aRequestRefusedBeforeItsCheckpointNeverClaimsTheKey() {
    locked = true;
    SAVES.set(0);
    try {
      assertThat(forbidden(() -> saveNote("key-0007-gggg"))).isTrue();
      locked = false;
      saveNote("key-0007-gggg");
      assertThat(SAVES.get()).isEqualTo(1);
    } finally {
      locked = false;
    }
  }

  @Test
  void aCrudSaveReplayRefusedByItsWriteGateIsRefusedNotServedFromMemory() {
    PARTS.clear();
    PARTS.add(new Part("1", "bolt"));
    PART_SAVES.set(0);
    partsEditable = true;
    try {
      savePart("key-0009-iiii");
      assertThat(PART_SAVES.get()).isEqualTo(1);
      partsEditable = false;
      assertThat(forbidden(() -> savePart("key-0009-iiii"))).isTrue();
      partsEditable = true;
      savePart("key-0009-iiii");
      assertThat(PART_SAVES.get()).isEqualTo(1);
    } finally {
      partsEditable = true;
    }
  }

  private void savePart(String key) {
    mateu.run(
        RunActionRqDto.builder()
            .route("/offline-parts")
            .consumedRoute("/offline-parts")
            .serverSideType(PartsCrud.class.getName())
            .actionId("save")
            .initiatorComponentId("c1_app")
            .componentState(Map.of("id", "1", "name", "nut"))
            .build(),
        keyed(key));
  }

  private void saveNote(String key) {
    mateu.run(
        RunActionRqDto.builder()
            .route("/offline-note/edit")
            .consumedRoute("/offline-note")
            .serverSideType(NoteView.class.getName())
            .actionId("save")
            .initiatorComponentId("note")
            .componentState(Map.of("text", "second"))
            .build(),
        keyed(key));
  }

  private static boolean forbidden(Runnable call) {
    try {
      call.run();
      return false;
    } catch (RuntimeException e) {
      return io.mateu.core.application.security.MateuForbiddenException.find(e) != null;
    }
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
