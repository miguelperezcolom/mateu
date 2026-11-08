package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.MessagePersistenceDto;
import io.mateu.dtos.NotificationsChangedDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.LiveNotifications;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AppNotification;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.MessageAction;
import io.mateu.uidl.data.MessagePersistence;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.NotificationsSupplier;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Notifications as a pattern: a message says its severity, persistence, actions and dedup key; an
 * inbox entry can be acted upon, dismissed and opened; and inbox changes are PUSHED to the sessions
 * of the user they are for — and only to them.
 */
class NotificationPatternsSyncTest {

  static final List<AppNotification> INBOX = new ArrayList<>();
  static final List<String> ACTED = new ArrayList<>();
  static final List<String> DISMISSED = new ArrayList<>();
  static final List<String> READ = new ArrayList<>();
  static final List<String> OPENED = new ArrayList<>();

  @SuppressWarnings("unused")
  @UI("/notification-patterns")
  @App(liveUpdates = true)
  public static class Desk implements NotificationsSupplier {

    @Menu String home = "/";

    @Override
    public List<AppNotification> notifications(HttpRequest httpRequest) {
      return List.copyOf(INBOX);
    }

    @Override
    public void markNotificationsRead(List<String> ids, HttpRequest httpRequest) {
      READ.addAll(ids);
    }

    @Override
    public Object onNotificationAction(String id, String actionId, HttpRequest httpRequest) {
      ACTED.add(id + ":" + actionId);
      INBOX.replaceAll(
          n -> n.id().equals(id) ? n.toBuilder().resolved(true).unread(false).build() : n);
      return Message.success("Approved");
    }

    @Override
    public void dismissNotifications(List<String> ids, HttpRequest httpRequest) {
      DISMISSED.addAll(ids);
      INBOX.removeIf(n -> ids.contains(n.id()));
    }

    @Override
    public Object notificationDetail(String id, HttpRequest httpRequest) {
      OPENED.add(id);
      return Drawer.builder().headerTitle("Expense " + id).content(new Text("Detail")).build();
    }
  }

  @UI("/notification-messages")
  public static class Messages {

    @Button
    public Message saved() {
      return Message.success("Saved")
          .withAction(MessageAction.open("View", "/orders/1"))
          .withAction(MessageAction.run("Share", "share", Map.of("id", 1)).withStyle("secondary"))
          .withPersistence(MessagePersistence.inbox)
          .withKey("order-1");
    }

    @Button
    public Message failed() {
      return Message.error("It failed");
    }

    @Button
    public Message deleted() {
      return Message.undoable("Deleted", "restore", Map.of("id", 7));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Desk.class, Messages.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void seed() {
    INBOX.clear();
    ACTED.clear();
    DISMISSED.clear();
    READ.clear();
    OPENED.clear();
    INBOX.add(
        AppNotification.builder()
            .id("e1")
            .title("Expense to approve")
            .unread(true)
            .category("Approvals")
            .variant(NotificationVariant.warning)
            .actions(
                List.of(
                    MessageAction.run("Approve", "approve").withStyle("primary"),
                    MessageAction.run("Reject", "reject").withStyle("danger")))
            .hasDetail(true)
            .build());
    INBOX.add(new AppNotification("e2", "Backup done", null, null, false, "yesterday"));
  }

  private static RunActionRqDto messageRq(String actionId) {
    return RunActionRqDto.builder()
        .route("/notification-messages")
        .actionId(actionId)
        .serverSideType(Messages.class.getName())
        .build();
  }

  private static RunActionRqDto rq(String actionId, Map<String, Object> parameters) {
    return RunActionRqDto.builder()
        .route("/notification-patterns")
        .consumedRoute("/notification-patterns")
        .serverSideType(Desk.class.getName())
        .actionId(actionId)
        .initiatorComponentId("_ux")
        .componentState(Map.of())
        .parameters(parameters)
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

  @Test
  void aMessageSaysItsPersistenceActionsAndKey() {
    var message = mateu.run(messageRq("saved")).messages().get(0);
    assertThat(message.persistence()).isEqualTo(MessagePersistenceDto.inbox);
    assertThat(message.key()).isEqualTo("order-1");
    assertThat(message.actions()).hasSize(2);
    assertThat(message.actions().get(0).route()).isEqualTo("/orders/1");
    assertThat(message.actions().get(1).actionId()).isEqualTo("share");
    assertThat(message.actions().get(1).parameters()).containsEntry("id", 1);
    assertThat(message.actions().get(1).style()).isEqualTo("secondary");
  }

  @Test
  void anErrorIsStickyAndAnythingElseAToast() {
    var error = mateu.run(messageRq("failed")).messages().get(0);
    assertThat(error.persistence()).isEqualTo(MessagePersistenceDto.sticky);
    assertThat(error.duration()).isZero();
    var undo = mateu.run(messageRq("deleted")).messages().get(0);
    assertThat(undo.persistence()).isEqualTo(MessagePersistenceDto.toast);
    // the undo is one of the actions, and still on the legacy fields
    assertThat(undo.undoActionId()).isEqualTo("restore");
    assertThat(undo.actions())
        .singleElement()
        .satisfies(
            a -> {
              assertThat(a.actionId()).isEqualTo("restore");
              assertThat(a.style()).isEqualTo(Message.STYLE_UNDO);
              assertThat(a.parameters()).containsEntry("id", 7);
            });
  }

  @Test
  void anInboxEntryIsActedUponAndResolved() {
    var increments =
        mateu.runAll(rq("_notifications-act", Map.of("id", "e1", "actionId", "approve")));
    assertThat(ACTED).containsExactly("e1:approve");
    assertThat(increments.stream().flatMap(i -> i.messages().stream()))
        .anySatisfy(m -> assertThat(m.text()).isEqualTo("Approved"));
    assertThat(listIn(increments).get(0).resolved()).isTrue();
  }

  @Test
  void anInboxEntryIsDismissed() {
    var increments = mateu.runAll(rq("_notifications-dismiss", Map.of("ids", List.of("e2"))));
    assertThat(listIn(increments)).extracting(AppNotification::id).containsExactly("e1");
  }

  @Test
  void anInboxEntryOpensItsDetail() {
    var increment = mateu.run(rq("_notifications-open", Map.of("id", "e1")));
    assertThat(increment.fragments()).isNotEmpty();
    assertThat(io.mateu.core.infra.JsonSerializer.toJson(increment)).contains("Expense e1");
  }

  // --- security: every id the panel sends back comes from the browser ---------------------------
  // The framework hands the supplier only ids that are in the CALLER's own list (what
  // notifications(rq) answers for this request) and only actions that entry offers, so an app
  // whose supplier looks entries up by id alone is not an IDOR.

  @Test
  void anActionOnAnEntryNotInTheCallersListIsRefused() {
    assertThatThrownBy(
            () ->
                mateu.run(
                    rq("_notifications-act", Map.of("id", "someone-elses", "actionId", "approve"))))
        .isInstanceOf(io.mateu.core.application.security.MateuForbiddenException.class);
    assertThat(ACTED).isEmpty();
  }

  @Test
  void anActionTheEntryDoesNotOfferIsRefused() {
    assertThatThrownBy(
            () -> mateu.run(rq("_notifications-act", Map.of("id", "e1", "actionId", "deleteAll"))))
        .isInstanceOf(io.mateu.core.application.security.MateuForbiddenException.class);
    // e2 offers no actions at all
    assertThatThrownBy(
            () -> mateu.run(rq("_notifications-act", Map.of("id", "e2", "actionId", "approve"))))
        .isInstanceOf(io.mateu.core.application.security.MateuForbiddenException.class);
    assertThat(ACTED).isEmpty();
  }

  @Test
  void dismissAndReadOnlyReachTheCallersOwnEntries() {
    mateu.runAll(rq("_notifications-dismiss", Map.of("ids", List.of("e2", "someone-elses"))));
    assertThat(DISMISSED).containsExactly("e2");
    mateu.runAll(rq("_notifications-read", Map.of("ids", List.of("e1", "someone-elses"))));
    assertThat(READ).containsExactly("e1");
  }

  @Test
  void onlyAnOwnEntryThatDeclaresADetailOpensIt() {
    mateu.runAll(rq("_notifications-open", Map.of("id", "someone-elses")));
    mateu.runAll(rq("_notifications-open", Map.of("id", "e2")));
    assertThat(OPENED).isEmpty();
    mateu.runAll(rq("_notifications-open", Map.of("id", "e1")));
    assertThat(OPENED).containsExactly("e1");
  }

  @Test
  void changesArePushedOnlyToTheSessionsOfTheirUser() throws Exception {
    var live = rq("_live-updates", Map.of());
    var mine = new CopyOnWriteArrayList<UIIncrementDto>();
    var theirs = new CopyOnWriteArrayList<UIIncrementDto>();
    var anonymous = new CopyOnWriteArrayList<UIIncrementDto>();
    var s1 = streamAs(live, "test-user").subscribe(mine::add);
    var s2 = streamAs(live, "someone-else").subscribe(theirs::add);
    var s3 = streamAs(live, null).subscribe(anonymous::add);
    try {
      await(() -> mine.size() >= 1 && theirs.size() >= 1 && anonymous.size() >= 1);
      LiveNotifications.publish("test-user", INBOX.get(0));
      LiveNotifications.publishToAll(
          new AppNotification("all", "Maintenance at 22:00", null, null));
      await(() -> changes(mine).size() >= 2);
      Thread.sleep(100);

      assertThat(changes(mine)).extracting(c -> c.notification().id()).containsExactly("e1", "all");
      assertThat(changes(mine).get(0).notification().actions()).hasSize(2);
      assertThat(changes(mine).get(0).notification().category()).isEqualTo("Approvals");
      assertThat(changes(theirs)).extracting(c -> c.notification().id()).containsExactly("all");
      assertThat(changes(anonymous)).extracting(c -> c.notification().id()).containsExactly("all");
    } finally {
      s1.dispose();
      s2.dispose();
      s3.dispose();
    }
  }

  /** A live-updates stream of a caller named {@code name} (null = anonymous). */
  private static reactor.core.publisher.Flux<UIIncrementDto> streamAs(
      RunActionRqDto rq, String name) {
    var request = new FakeHttpRequest(rq).withAttribute("baseUrl", "");
    if (name != null) {
      request.withPrincipal(
          new io.mateu.core.infra.security.AuthenticatedPrincipal(
              io.mateu.uidl.security.CallerIdentity.withRoles(name, List.of("user"))));
    }
    try {
      return mateu.service().runAction("", rq, "", request);
    } catch (Throwable t) {
      throw new AssertionError(t);
    }
  }

  private static List<NotificationsChangedDto> changes(List<UIIncrementDto> increments) {
    return increments.stream()
        .flatMap(i -> i.commands().stream())
        .filter(c -> c.type() == UICommandTypeDto.NotificationsChanged)
        .map(c -> (NotificationsChangedDto) c.data())
        .toList();
  }

  private static void await(java.util.function.BooleanSupplier condition) throws Exception {
    for (int i = 0; i < 200 && !condition.getAsBoolean(); i++) {
      Thread.sleep(20);
    }
    assertThat(condition.getAsBoolean()).as("condition met in time").isTrue();
  }

  @SuppressWarnings("unused")
  private static final Class<?> UNUSED = TestIdentities.class;
}
