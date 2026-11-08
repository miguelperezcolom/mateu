package io.mateu.explorer.examples.behaviour.inboxandtasks;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AppNotification;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.NotificationsSupplier;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * The notification inbox: the app class implements {@link NotificationsSupplier} and the header
 * gets a bell with the unread count; opening it lists them, a click follows the notification's
 * route, "mark as read" calls {@link #markNotificationsRead}.
 *
 * <p>Demo store: ONE inbox in memory for every visitor. A real app keeps one per user — resolve
 * the user from the request.
 */
@UI("/apps/inbox")
@Title("Inbox demo")
@App
public class InboxDemoApp implements NotificationsSupplier {

  static final List<AppNotification> INBOX =
      Collections.synchronizedList(
          new ArrayList<>(
              List.of(
                  new AppNotification("welcome", "Welcome", "This is the demo inbox", null, true, "now"))));

  @Menu Jobs jobs;

  /** Called by the jobs when they finish. */
  static void notify(String title, String text) {
    var when = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
    INBOX.add(0, new AppNotification("n" + System.nanoTime(), title, text, null, true, when));
  }

  @Override
  public List<AppNotification> notifications(HttpRequest httpRequest) {
    return List.copyOf(INBOX);
  }

  @Override
  public void markNotificationsRead(List<String> ids, HttpRequest httpRequest) {
    synchronized (INBOX) {
      INBOX.replaceAll(
          n ->
              ids.contains("all") || ids.contains(n.id())
                  ? new AppNotification(n.id(), n.title(), n.text(), n.route(), false, n.when())
                  : n);
    }
  }
}
