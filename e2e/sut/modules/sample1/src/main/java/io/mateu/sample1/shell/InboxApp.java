package io.mateu.sample1.shell;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AppNotification;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.MessageAction;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.NotificationsSupplier;
import java.util.ArrayList;
import java.util.List;

/**
 * The notification inbox fixture (backs notification-inbox.spec.ts): a server-side inbox an
 * anonymous visitor can act on — unread counts, an entry with a detail and actions, resolve,
 * dismiss — next to {@link InboxDesk}, whose buttons produce what arrives while the page is open: a
 * live push, an {@code inbox} message and a background task that notifies when done.
 *
 * <p>The list is deliberately one per server (no per-user scoping here: the SUT has no sign-in), so
 * the spec resets it and runs serially.
 */
@UI("/inbox")
@Title("Inbox walk")
@App(value = AppVariant.MENU_ON_TOP, liveUpdates = true)
public class InboxApp implements NotificationsSupplier {

  /** The inbox, newest first. */
  private static final List<AppNotification> INBOX = new ArrayList<>();

  static {
    seed();
  }

  @Menu InboxDesk desk;

  static synchronized void seed() {
    INBOX.clear();
    INBOX.add(
        AppNotification.builder()
            .id("e1")
            .title("Expense to approve")
            .text("Taxi to the airport")
            .unread(true)
            .category("Approvals")
            .variant(NotificationVariant.warning)
            .actions(
                List.of(
                    MessageAction.run("Approve", "approve").withStyle("primary"),
                    MessageAction.run("Reject", "reject").withStyle("danger")))
            .hasDetail(true)
            .build());
    INBOX.add(new AppNotification("e2", "Booking confirmed", "Booking 42", null, true, null));
    INBOX.add(new AppNotification("e3", "Backup done", null, null, false, "yesterday"));
  }

  /** Adds an entry on top, or replaces the one with its id where it is. */
  static synchronized void upsert(AppNotification entry) {
    for (int i = 0; i < INBOX.size(); i++) {
      if (INBOX.get(i).id().equals(entry.id())) {
        INBOX.set(i, entry);
        return;
      }
    }
    INBOX.add(0, entry);
  }

  private static synchronized List<AppNotification> snapshot() {
    return List.copyOf(INBOX);
  }

  private static synchronized void markRead(List<String> ids) {
    INBOX.replaceAll(n -> ids.contains(n.id()) ? n.toBuilder().unread(false).build() : n);
  }

  private static synchronized void resolve(String id) {
    INBOX.replaceAll(
        n -> n.id().equals(id) ? n.toBuilder().resolved(true).unread(false).build() : n);
  }

  private static synchronized void remove(List<String> ids) {
    INBOX.removeIf(n -> ids.contains(n.id()));
  }

  @Override
  public List<AppNotification> notifications(HttpRequest httpRequest) {
    return snapshot();
  }

  @Override
  public void markNotificationsRead(List<String> ids, HttpRequest httpRequest) {
    markRead(ids);
  }

  @Override
  public Object onNotificationAction(String id, String actionId, HttpRequest httpRequest) {
    resolve(id);
    return Message.success("approve".equals(actionId) ? "Expense approved" : "Expense rejected");
  }

  @Override
  public void dismissNotifications(List<String> ids, HttpRequest httpRequest) {
    remove(ids);
  }

  @Override
  public Object notificationDetail(String id, HttpRequest httpRequest) {
    return Drawer.builder()
        .headerTitle("Expense " + id)
        .content(new Text("Paid with the company card"))
        .build();
  }
}
