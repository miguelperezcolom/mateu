package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.PeerNav;

/**
 * Implemented by a page to supply lateral navigation across peer objects — the previous/next arrows
 * shown in the page header (the Oracle Redwood "next/previous object" header element). {@link
 * #peers(HttpRequest)} returns the {@link PeerNav} for the current record (labels + routes for the
 * previous and next peers); return {@code null} to show no arrows, or a {@code PeerNav} with a
 * {@code null} route on a side to disable that arrow (e.g. the first or last record).
 */
public interface PeerNavigationSupplier {

  PeerNav peers(HttpRequest httpRequest);
}
