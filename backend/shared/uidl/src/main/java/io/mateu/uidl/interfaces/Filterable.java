package io.mateu.uidl.interfaces;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.data.SearchRequest;

/**
 * Input capability: declaring it on a {@link Listing} shows the filter bar, built reflectively from
 * the {@code Filters} type — each field becomes a filter widget (range/multi-select widgets for
 * typed filters, see the filters-and-listing docs). The hydrated filters object travels inside the
 * {@link SearchRequest}; read it typed via {@link #filters(SearchRequest)}.
 *
 * <p>A listing that does not implement {@code Filterable} shows no filter bar and receives {@code
 * null} filters.
 *
 * @param <Filters> the type carrying the listing's filter fields
 */
public interface Filterable<Filters> {

  default Class<Filters> filtersClass() {
    return getGenericClass(this.getClass(), Filterable.class, "Filters");
  }

  /** The hydrated filters object carried by the request, typed. */
  @SuppressWarnings("unchecked")
  default Filters filters(SearchRequest request) {
    return (Filters) request.filters();
  }
}
