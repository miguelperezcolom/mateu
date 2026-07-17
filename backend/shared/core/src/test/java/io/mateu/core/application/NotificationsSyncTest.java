package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AppNotification;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.NotificationsSupplier;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Notification inbox: an app class implementing {@link NotificationsSupplier} gets the header bell
 * ({@code AppDto.notificationsEnabled}); the bell's panel fetches through the app-level {@code
 * _notifications-list} action and marks entries read through {@code _notifications-read} (specific
 * ids or "all") — both answering the refreshed list under {@code _notifications}.
 */
class NotificationsSyncTest {

  static final List<AppNotification> INBOX = new ArrayList<>();

  @SuppressWarnings("unused")
  @UI("/inbox-app")
  @Title("Inbox demo")
  public static class InboxApp implements NotificationsSupplier {

    @Menu String home = "/";

    @Override
    public List<AppNotification> notifications(HttpRequest httpRequest) {
      return List.copyOf(INBOX);
    }

    @Override
    public void markNotificationsRead(List<String> ids, HttpRequest httpRequest) {
      INBOX.replaceAll(
          notification ->
              ids.contains(notification.id())
                  ? new AppNotification(
                      notification.id(),
                      notification.title(),
                      notification.text(),
                      notification.route(),
                      false,
                      notification.when())
                  : notification);
    }
  }

  @SuppressWarnings("unused")
  @UI("/no-inbox-app")
  @Title("No inbox")
  public static class NoInboxApp {
    @Menu String home = "/";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(InboxApp.class, NoInboxApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void seed() {
    INBOX.clear();
    INBOX.add(
        new AppNotification(
            "n1", "Factura aprobada", "F-2026-001", "/invoices/1", true, "hace 2 min"));
    INBOX.add(new AppNotification("n2", "Nuevo comentario", null, "/tasks/7", true, "hace 1 h"));
    INBOX.add(new AppNotification("n3", "Backup completado", null, null, false, "ayer"));
  }

  private io.mateu.dtos.UIIncrementDto run(String actionId, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/inbox-app")
            .consumedRoute("/inbox-app")
            .serverSideType(InboxApp.class.getName())
            .actionId(actionId)
            .initiatorComponentId("_ux")
            .componentState(Map.of())
            .parameters(parameters)
            .build());
  }

  @SuppressWarnings("unchecked")
  private List<AppNotification> notificationsFrom(io.mateu.dtos.UIIncrementDto increment) {
    var data = (Map<String, Object>) increment.fragments().get(0).data();
    return (List<AppNotification>) data.get("_notifications");
  }

  @Test
  void theAppAdvertisesTheInboxOnlyWhenTheSupplierIsImplemented() {
    var withInbox =
        FullSyncPipelineTest.findMetadata(
            mateu.sync("/inbox-app").fragments().get(0).component(), AppDto.class);
    assertThat(withInbox.notificationsEnabled()).isTrue();
    var without =
        FullSyncPipelineTest.findMetadata(
            mateu.sync("/no-inbox-app").fragments().get(0).component(), AppDto.class);
    assertThat(without.notificationsEnabled()).isFalse();
  }

  @Test
  void theListActionReturnsTheInboxEntries() {
    var notifications = notificationsFrom(run("_notifications-list", null));
    assertThat(notifications).hasSize(3);
    assertThat(notifications.get(0).title()).isEqualTo("Factura aprobada");
    assertThat(notifications.stream().filter(AppNotification::unread).count()).isEqualTo(2);
  }

  @Test
  void markingSpecificIdsReadAnswersTheRefreshedList() {
    var notifications = notificationsFrom(run("_notifications-read", Map.of("ids", List.of("n1"))));
    assertThat(notifications.stream().filter(AppNotification::unread).count()).isEqualTo(1);
    assertThat(
            notifications.stream()
                .filter(n -> n.id().equals("n1"))
                .findFirst()
                .orElseThrow()
                .unread())
        .isFalse();
  }

  @Test
  void markingAllReadClearsEveryUnreadFlag() {
    var notifications = notificationsFrom(run("_notifications-read", Map.of("ids", "all")));
    assertThat(notifications.stream().filter(AppNotification::unread).count()).isZero();
  }
}
