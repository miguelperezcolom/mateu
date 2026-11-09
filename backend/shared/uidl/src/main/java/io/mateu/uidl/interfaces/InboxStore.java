package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.data.AppNotification;
import java.util.List;

/**
 * Where the inbox entries Mateu creates are kept: every {@code Message} sent with persistence
 * {@code inbox} to a SIGNED-IN caller becomes an {@link AppNotification} of that caller's inbox
 * (the header bell), so it is still there after a reload, in the user's other tabs and devices.
 *
 * <p>Mateu ships UI only: storage is the app's. Out of the box an in-memory store is used — per
 * process, bounded (100 entries per principal, the newest kept; 10 000 principals, least recently
 * used first), lost on restart. Register a bean implementing this interface (a table, a cache, a
 * message broker) to replace it; Mateu then calls only these methods.
 *
 * <p>{@code principal} is the name of the identity the host framework authenticated — never a value
 * from the browser; an anonymous caller's inbox messages are not stored. The entries are merged
 * into the bell's list next to those of the app's {@link NotificationsSupplier} (if any); the ids
 * Mateu passes back to {@link #markRead}/{@link #dismiss} are always ids {@link #list} answered for
 * the same principal.
 */
@Experimental("progress and notifications (3.0)")
public interface InboxStore {

  /** Adds an entry to {@code principal}'s inbox; an entry with the same id replaces it. */
  void add(String principal, AppNotification entry);

  /** {@code principal}'s entries, newest first. */
  List<AppNotification> list(String principal);

  /** Marks these of {@code principal}'s entries read. */
  void markRead(String principal, List<String> ids);

  /** Removes these entries from {@code principal}'s inbox. */
  void dismiss(String principal, List<String> ids);
}
