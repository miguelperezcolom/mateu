package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.core.application.notifications.InMemoryInboxStore;
import io.mateu.core.infra.JsonSerializer;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.LiveNotifications;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AppNotification;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.MessageAction;
import io.mateu.uidl.data.MessagePersistence;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * An {@code inbox} message to a signed-in caller is KEPT (Mateu's in-memory {@code InboxStore},
 * unless the app registers its own), pushed to the caller's other sessions, and listed by the bell
 * of an app that declares {@code @App(inbox = true)} — with no NotificationsSupplier at all.
 */
class InboxStoreSyncTest {

  @SuppressWarnings("unused")
  @UI("/inbox-store")
  @App(inbox = true, osNotifications = true)
  public static class Office {

    @Menu String home = "/";
  }

  @UI("/inbox-senders")
  public static class Senders {

    @Button
    public Message exported() {
      return Message.success("Export ready")
          .withAction(MessageAction.open("Download", "/exports/7"))
          .withAction(MessageAction.run("Share", "share"))
          .withPersistence(MessagePersistence.inbox);
    }

    @Button
    public Message keyed() {
      return Message.success("Nightly close done")
          .withPersistence(MessagePersistence.inbox)
          .withKey("nightly-close");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Office.class, Senders.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static RunActionRqDto rq(String actionId, Map<String, Object> parameters) {
    return RunActionRqDto.builder()
        .route("/inbox-store")
        .consumedRoute("/inbox-store")
        .serverSideType(Office.class.getName())
        .actionId(actionId)
        .initiatorComponentId("_ux")
        .componentState(Map.of())
        .parameters(parameters)
        .build();
  }

  private static RunActionRqDto send(String actionId) {
    return RunActionRqDto.builder()
        .route("/inbox-senders")
        .actionId(actionId)
        .serverSideType(Senders.class.getName())
        .build();
  }

  @SuppressWarnings("unchecked")
  private static List<AppNotification> listIn(List<UIIncrementDto> increments) {
    return increments.stream()
        .flatMap(i -> i.fragments().stream())
        .map(f -> f.data())
        .filter(d -> d instanceof Map<?, ?> m && m.containsKey("_notifications"))
        .map(d -> (List<AppNotification>) ((Map<String, Object>) d).get("_notifications"))
        .findFirst()
        .orElseThrow();
  }

  private static List<AppNotification> listAs(Map<String, String> headers) {
    return listIn(List.of(mateu.run(rq("_notifications-list", Map.of()), headers)));
  }

  private static final Map<String, String> USER = TestIdentities.headersWithRoles("user");

  @Test
  void anInboxMessageOfASignedInCallerIsKeptKeyedAndPushed() throws Exception {
    var pushed = new CopyOnWriteArrayList<LiveNotifications.Change>();
    try (var ignored = LiveNotifications.subscribe(pushed::add)) {
      var message = mateu.run(send("exported"), USER).messages().get(0);

      // the stored entry's id is stamped on the wire message: the browser's own entry is the same
      assertThat(message.key()).startsWith("inbox-");
      var entry =
          listAs(USER).stream().filter(n -> n.id().equals(message.key())).findFirst().orElseThrow();
      assertThat(entry.title()).isEqualTo("Export ready");
      assertThat(entry.unread()).isTrue();
      assertThat(entry.when()).matches("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}");
      // only the actions that still make sense later: a route (an actionId needs the screen)
      assertThat(entry.actions())
          .singleElement()
          .satisfies(a -> assertThat(a.route()).isEqualTo("/exports/7"));

      assertThat(pushed)
          .anySatisfy(
              c -> {
                assertThat(c.principal()).isEqualTo("test-user");
                assertThat(c.notification().id()).isEqualTo(message.key());
              });
    }
  }

  @Test
  void aKeyedMessageReplacesItsEntry() {
    mateu.run(send("keyed"), USER);
    mateu.run(send("keyed"), USER);
    assertThat(listAs(USER).stream().filter(n -> n.id().equals("nightly-close"))).hasSize(1);
  }

  @Test
  void anAnonymousCallersInboxMessageIsNotKept() {
    var message = mateu.run(send("exported"), Map.of()).messages().get(0);
    assertThat(message.key()).isNull();
    assertThat(listAs(Map.of())).isEmpty();
  }

  @Test
  void theStoredEntriesAreReadAndDismissedThroughTheBell() {
    var key = mateu.run(send("exported"), USER).messages().get(0).key();

    mateu.run(rq("_notifications-read", Map.of("ids", List.of(key))), USER);
    assertThat(listAs(USER).stream().filter(n -> n.id().equals(key)).findFirst().orElseThrow())
        .satisfies(n -> assertThat(n.unread()).isFalse());

    // a stored entry offers no actionId action and no detail: refused like any such entry
    assertThatThrownBy(
            () -> mateu.run(rq("_notifications-act", Map.of("id", key, "actionId", "share")), USER))
        .isNotNull();
    assertThat(JsonSerializer.toJson(mateu.run(rq("_notifications-open", Map.of("id", key)), USER)))
        .doesNotContain("Drawer");

    mateu.run(rq("_notifications-dismiss", Map.of("ids", List.of(key))), USER);
    assertThat(listAs(USER)).noneMatch(n -> n.id().equals(key));
  }

  @Test
  void theAppHasABellAndOptsInToOsNotifications() {
    var json = JsonSerializer.toJson(mateu.sync("/inbox-store"));
    assertThat(json.replace(" ", ""))
        .contains("\"notificationsEnabled\":true")
        .contains("\"osNotifications\":true");
  }

  @Test
  void theInMemoryStoreKeepsEachPrincipalsOwnEntriesBounded() {
    var store = new InMemoryInboxStore();
    for (int i = 0; i < 150; i++) {
      store.add("ann", new AppNotification("a" + i, "A " + i, null, null));
    }
    store.add("bob", new AppNotification("b1", "B", null, null));
    assertThat(store.list("ann")).hasSize(100);
    // newest first, the oldest dropped
    assertThat(store.list("ann").get(0).id()).isEqualTo("a149");
    assertThat(store.list("ann")).noneMatch(n -> n.id().equals("a0"));
    assertThat(store.list("bob")).extracting(AppNotification::id).containsExactly("b1");
    // a principal's ids never reach another's entries
    store.dismiss("bob", List.of("a149"));
    store.markRead("bob", List.of("a148"));
    assertThat(store.list("ann").get(0).id()).isEqualTo("a149");
    assertThat(store.list("ann").get(1).unread()).isTrue();
    assertThat(store.list("nobody")).isEmpty();
  }
}
