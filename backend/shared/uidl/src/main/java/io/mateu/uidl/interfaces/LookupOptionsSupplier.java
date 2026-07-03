package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;

/**
 * Supplies the paginated, searchable list of selectable {@link Option}s for a lookup field.
 * Implement {@link #search(String, String, Pageable, HttpRequest)} to return the matching options
 * for the field {@code fieldName} filtered by {@code searchText} and paged via {@link Pageable};
 * used by lookup/autocomplete widgets to lazily fetch their choices from a backend.
 */
public interface LookupOptionsSupplier {

  ListingData<Option> search(
      String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest);
}
