package io.mateu.uidl.data;

import java.util.List;

/**
 * Everything a listing search receives, in one object: the free-text {@code searchText} (populated
 * when the listing is {@link io.mateu.uidl.interfaces.Searchable}), the hydrated {@code filters}
 * object (when it is {@link io.mateu.uidl.interfaces.Filterable} — read it typed via {@code
 * Filterable.filters(request)}), the range/multi-select {@code criteria} the filters object cannot
 * carry (see {@link FilterCriterion}; populated on the CRUD path), and the {@link Pageable}
 * (page/size/sort).
 *
 * <p>Adding a new search input in the future means adding a component here — the {@code
 * search(SearchRequest, HttpRequest)} signature never changes.
 */
public record SearchRequest(
    String searchText, Object filters, List<FilterCriterion> criteria, Pageable pageable) {

  public SearchRequest {
    searchText = searchText != null ? searchText : "";
    criteria = criteria != null ? criteria : List.of();
  }
}
