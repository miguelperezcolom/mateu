package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;

/**
 * The app header's notification inbox, fed by REST sources instead of a {@code
 * NotificationsSupplier} app class — the data twin of that interface.
 *
 * <p>{@code source} lists the inbox: the items (at its {@code itemsPath}) are read as {@code id},
 * {@code title}, {@code text}, {@code route}, {@code unread} and {@code when}, each through the
 * catalogue entry's field map when it has one. {@code markRead}, optional, is called when entries
 * are read, with {@code ${state.ids}} (comma-joined), {@code ${state.id}} (the first one) and
 * {@code ${state.all}} ({@code true} for "mark all read") to interpolate.
 *
 * @param source the inbox listing
 * @param markRead the "mark as read" call, or null for a read-only inbox
 */
@Experimental("YAML app shell extras (3.0 beta)")
public record AppNotificationsSource(RestDataSource source, RestDataSource markRead) {}
