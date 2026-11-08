package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;

/**
 * How long a {@link Message} stays. An error is {@link #sticky} unless it says otherwise.
 *
 * <ul>
 *   <li>{@link #toast} — goes away on its own after its duration;
 *   <li>{@link #sticky} — stays until the user dismisses it;
 *   <li>{@link #inbox} — a toast that also lands in the notification inbox, so it can be found
 *       later.
 * </ul>
 */
@Experimental("progress and notifications patterns (3.0)")
public enum MessagePersistence {
  toast,
  sticky,
  inbox
}
