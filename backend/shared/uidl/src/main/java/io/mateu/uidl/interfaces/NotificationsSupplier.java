package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.AppNotification;
import java.util.List;

/**
 * Implemented by the {@code @UI} app class to give the shell a NOTIFICATION INBOX: a bell on the
 * header with the unread count, opening a panel that lists {@link AppNotification}s. The list is
 * fetched per request (the {@code _notifications-list} app-level action), so it can be per-user —
 * resolve the user from the request's Bearer token. Clicking an entry navigates to its route and
 * marks it read; the panel's "mark all read" calls {@link #markNotificationsRead} with all the
 * unread ids.
 */
public interface NotificationsSupplier {

  List<AppNotification> notifications(HttpRequest httpRequest);

  void markNotificationsRead(List<String> ids, HttpRequest httpRequest);
}
