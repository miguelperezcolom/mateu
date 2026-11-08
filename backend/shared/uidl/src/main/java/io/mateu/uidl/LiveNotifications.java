package io.mateu.uidl;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.data.AppNotification;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Consumer;

/**
 * Pushes inbox changes to the open sessions of a user (or of everyone) — the realtime half of the
 * notification inbox ({@code NotificationsSupplier}). Apps opt in with {@code @App(liveUpdates =
 * true)}: each browser keeps one event stream open and its bell updates (badge, list, a toast for a
 * new unread entry) without polling.
 *
 * <p>Only sessions whose caller is {@code principal} (the name of the identity the host framework
 * authenticated) receive a change addressed to it; {@link #publishToAll} reaches every session.
 * Store the entry first (your supplier is still the source of truth: a session fetching the list
 * later must find it), then publish it.
 *
 * <p>In-process, like {@link LiveHeaderValues}: in a cluster, publish on every node.
 *
 * <pre>{@code
 * inbox.add(user, entry);
 * LiveNotifications.publish(user, entry);
 * }</pre>
 */
@Experimental("progress and notifications patterns (3.0)")
public final class LiveNotifications {

  /**
   * One change: an entry added or changed, one removed ({@code removedId}), or neither — "fetch the
   * list again". {@code principal} null = every session.
   */
  public record Change(String principal, AppNotification notification, String removedId) {}

  private static final List<Consumer<Change>> LISTENERS = new CopyOnWriteArrayList<>();

  private LiveNotifications() {}

  /** An entry added or changed in {@code principal}'s inbox (same id = replaces it). */
  public static void publish(String principal, AppNotification notification) {
    if (principal == null || principal.isBlank()) {
      throw new IllegalArgumentException(
          "a notification needs the principal it is for (publishToAll reaches everyone)");
    }
    deliver(new Change(principal, notification, null));
  }

  /** An entry added or changed in every user's inbox (a system-wide announcement). */
  public static void publishToAll(AppNotification notification) {
    deliver(new Change(null, notification, null));
  }

  /** An entry gone from {@code principal}'s inbox. */
  public static void remove(String principal, String id) {
    deliver(new Change(principal, null, id));
  }

  /** {@code principal}'s inbox changed in several ways: its sessions fetch the list again. */
  public static void refresh(String principal) {
    deliver(new Change(principal, null, null));
  }

  private static void deliver(Change change) {
    for (var listener : LISTENERS) {
      try {
        listener.accept(change);
      } catch (RuntimeException ignored) {
        // one broken stream must not stop the others
      }
    }
  }

  /**
   * Listens to every change until the returned handle is closed. Used by the framework's event
   * stream, which filters by the caller; an app does not normally need it.
   */
  @io.mateu.uidl.annotations.Internal("the framework's live-updates event stream")
  public static AutoCloseable subscribe(Consumer<Change> listener) {
    LISTENERS.add(listener);
    return () -> LISTENERS.remove(listener);
  }
}
