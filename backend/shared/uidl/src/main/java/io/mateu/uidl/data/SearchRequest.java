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
 * <p>{@code ids} is the framework's reserved id-set filter: {@code ?ids=A,B,C} on ANY listing's URL
 * (no declaration needed) asks for exactly those rows — what an assistant or a link uses to show a
 * concrete set of records found elsewhere. Empty when not set. The framework applies it itself
 * wherever it controls the query ({@code AutoCrud}/{@code CrudStore}); a hand-written {@code
 * search} should honour it in its query (e.g. {@code WHERE id IN (:ids)}). As a fallback the
 * framework also narrows the page a search returns to those ids, which is exact only when every
 * requested row fits in that page.
 *
 * <p>Adding a new search input in the future means adding a component here — the {@code
 * search(SearchRequest, HttpRequest)} signature never changes.
 */
public record SearchRequest(
    String searchText,
    Object filters,
    List<FilterCriterion> criteria,
    Pageable pageable,
    List<String> ids) {

  /** The reserved URL/component-state key of the id-set filter. */
  public static final String IDS = "ids";

  public SearchRequest {
    searchText = searchText != null ? searchText : "";
    criteria = criteria != null ? criteria : List.of();
    ids = ids != null ? List.copyOf(ids) : List.of();
  }

  public SearchRequest(
      String searchText, Object filters, List<FilterCriterion> criteria, Pageable pageable) {
    this(searchText, filters, criteria, pageable, List.of());
  }

  /** True when the request asks for a concrete set of rows ({@code ?ids=…}). */
  public boolean hasIds() {
    return !ids.isEmpty();
  }

  /** The same request narrowed to these row ids. */
  public SearchRequest withIds(List<String> ids) {
    return new SearchRequest(searchText, filters, criteria, pageable, ids);
  }
}
