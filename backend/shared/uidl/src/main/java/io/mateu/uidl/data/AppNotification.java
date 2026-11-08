package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import java.util.List;
import lombok.Builder;

/**
 * One entry of the app's notification inbox (the header bell): a short title, an optional longer
 * text, an optional route to navigate to when clicked, whether it is still unread, and a display
 * timestamp (already formatted — the server owns the locale/relative formatting).
 *
 * <p>An entry can also say what it is about and what can be done from it: a {@code category} the
 * inbox groups by, a {@code variant} (severity), {@code actions} the user can run from it (approve,
 * reject, assign… — run by {@code NotificationsSupplier#onNotificationAction}, which usually marks
 * it {@code resolved}), and {@code hasDetail} when clicking it should ask the server for its detail
 * ({@code NotificationsSupplier#notificationDetail}) instead of navigating to {@code route}. The
 * {@code id} deduplicates: an entry published again with the same id replaces the previous one.
 */
@Builder(toBuilder = true)
public record AppNotification(
    String id,
    String title,
    String text,
    String route,
    boolean unread,
    String when,
    @Experimental("progress and notifications patterns (3.0)") String category,
    @Experimental("progress and notifications patterns (3.0)") NotificationVariant variant,
    @Experimental("progress and notifications patterns (3.0)") boolean resolved,
    @Experimental("progress and notifications patterns (3.0)") List<MessageAction> actions,
    @Experimental("progress and notifications patterns (3.0)") boolean hasDetail) {

  public AppNotification {
    actions = actions != null ? List.copyOf(actions) : List.of();
  }

  /** The shape before category, variant, resolved, actions and detail (kept for callers). */
  public AppNotification(
      String id, String title, String text, String route, boolean unread, String when) {
    this(id, title, text, route, unread, when, null, null, false, List.of(), false);
  }

  public AppNotification(String id, String title, String text, String route) {
    this(id, title, text, route, true, null);
  }
}
