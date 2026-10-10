package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.data.RecordSwitcher;

/**
 * Implemented by a page to put a record/context switcher in its header (the Redwood {@code
 * selectObject}/{@code selectContext} element) — the sibling of {@link PeerNavigationSupplier}:
 * peer navigation steps to the previous/next record, the switcher jumps to any of them.
 *
 * <p>{@link #switcher} builds it for the current request (null = no switcher); picking an entry
 * dispatches {@link #ACTION_ID} with the picked value in {@link #VALUE_PARAMETER}, which runs
 * {@link #switchTo} — return {@code this} to re-render in place (after pointing the page at the new
 * record), or a {@code URI} to navigate to the record's own route.
 */
@Experimental("record switcher (3.0-alpha.409)")
public interface RecordSwitcherSupplier {

  /** The action a pick dispatches. */
  String ACTION_ID = "_switchRecord";

  /** The action parameter carrying the picked value. */
  String VALUE_PARAMETER = "_record";

  RecordSwitcher switcher(HttpRequest httpRequest);

  Object switchTo(String value, HttpRequest httpRequest);
}
