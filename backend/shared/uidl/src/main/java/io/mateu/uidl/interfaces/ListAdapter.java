package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;

/**
 * Backs a read-only listing that is not full CRUD: {@link #search(String, Object, Pageable)}
 * returns the {@link ListingData} of rows matching the free-text {@code searchText}, the {@code
 * filters} object and the requested {@link Pageable} (page, size and sort).
 *
 * @param <Filters> the filter object type driving the listing
 * @param <Row> the listing row type
 * @deprecated nothing reads it — the pre-capability listing contract. Implement {@link Listing}
 *     ({@code search(SearchRequest, HttpRequest)}) instead.
 */
@Deprecated(since = "3.0-alpha.410", forRemoval = true)
public interface ListAdapter<Filters, Row> {

  ListingData<Row> search(String searchText, Filters filters, Pageable pageable);
}
