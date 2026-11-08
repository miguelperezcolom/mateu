package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.data.AppNotification;
import java.util.List;

/**
 * Implemented by the {@code @UI} app class to give the shell a NOTIFICATION INBOX: a bell on the
 * header with the unread count, opening a panel that lists {@link AppNotification}s. The list is
 * fetched per request (the {@code _notifications-list} app-level action), so it can be per-user —
 * resolve the user from the request's identity. Clicking an entry navigates to its route (or opens
 * its detail) and marks it read; the panel's "mark all read" calls {@link #markNotificationsRead}
 * with all the unread ids.
 *
 * <p>The inbox groups entries by {@code category}, filters them (unread / all / resolved), lets the
 * user dismiss them ({@link #dismissNotifications}) and run their {@code actions} ({@link
 * #onNotificationAction}). New or changed entries can be pushed to open sessions with {@code
 * LiveNotifications.publish} (apps with {@code @App(liveUpdates = true)}).
 *
 * <p>Every id the panel sends back comes from the browser. Mateu hands the methods below only ids
 * that are in the list {@link #notifications} answers for the SAME request (the caller's own), and
 * {@link #onNotificationAction} only an action id that entry offers — anything else is refused
 * before your code runs. That makes {@link #notifications} the caller's authority: scope it to the
 * user, and keep checking ownership in your own store too.
 */
public interface NotificationsSupplier {

  List<AppNotification> notifications(HttpRequest httpRequest);

  void markNotificationsRead(List<String> ids, HttpRequest httpRequest);

  /**
   * Runs one of an entry's {@code actions} (the {@code _notifications-act} app-level action) — the
   * place to approve, reject, assign… and mark the entry {@code resolved}. What it returns is
   * answered like any action's result (a {@code Message}, a {@code UICommand}, a component); the
   * refreshed list follows. Not overridden: the action is refused.
   */
  @Experimental("progress and notifications patterns (3.0)")
  default Object onNotificationAction(String id, String actionId, HttpRequest httpRequest) {
    throw new io.mateu.uidl.UserFacingException("This notification has no actions");
  }

  /** Removes entries from the caller's inbox (the per-item dismiss). Not overridden: nothing. */
  @Experimental("progress and notifications patterns (3.0)")
  default void dismissNotifications(List<String> ids, HttpRequest httpRequest) {}

  /**
   * The detail of an entry that declares {@code hasDetail} (the {@code _notifications-open}
   * app-level action): typically a {@code Drawer} or a {@code Dialog} with the entry's content and
   * its actions. Null: nothing opens.
   */
  @Experimental("progress and notifications patterns (3.0)")
  default Object notificationDetail(String id, HttpRequest httpRequest) {
    return null;
  }
}
