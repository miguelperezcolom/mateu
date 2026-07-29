package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.Direction;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.data.Sort;
import java.util.List;

/**
 * Builds the {@link SearchRequest} for a listing search from the component state: free text (only
 * when the listing is {@link Searchable}), the hydrated filters object (only when it is {@link
 * Filterable}), and the {@link Pageable}. Sort entries accept both the {@code fieldId} key (sent by
 * the declarative listing grid) and the {@code field} key (sent by the CRUD grid). Criteria are not
 * extracted here — the CRUD engine adds them on its path.
 */
public final class SearchRequestBuilder {

  public static SearchRequest build(Object listing, HttpRequest httpRequest) {
    String searchText = null;
    if (listing instanceof Searchable) {
      searchText = httpRequest.getString("searchText");
    }
    Object filters = null;
    if (listing instanceof Filterable<?> filterable) {
      filters =
          MateuInstanceFactory.newInstance(
              filterable.filtersClass(),
              FilterStateAssembler.assemble(
                  filterable.filtersClass(), httpRequest.runActionRq().componentState()),
              httpRequest);
    }
    return new SearchRequest(searchText, filters, List.of(), pageable(httpRequest));
  }

  public static Pageable pageable(HttpRequest httpRequest) {
    return new Pageable(
        httpRequest.getInt("page"),
        httpRequest.getInt("size"),
        httpRequest.getListOfMaps("sort").stream()
            .filter(map -> map.containsKey("direction"))
            .map(
                map ->
                    new Sort(
                        (String)
                            (map.get("fieldId") != null ? map.get("fieldId") : map.get("field")),
                        Direction.valueOf((String) map.get("direction"))))
            .toList());
  }

  private SearchRequestBuilder() {}
}
