package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.GlobalSearchResult;
import java.util.List;

/**
 * Implemented by the {@code @UI} app class to make the command palette (⌘K) search DATA, not just
 * the menu: while the user types, the palette also asks the server for matching entities through
 * the app-level {@code _globalsearch} action and shows the hits (grouped by category) alongside the
 * navigation results; picking one navigates to its route. Keep it fast — search indexes or top-N
 * per category — and resolve the user from the request when results are permission-scoped.
 */
public interface GlobalSearchSupplier {

  List<GlobalSearchResult> globalSearch(String searchText, HttpRequest httpRequest);
}
