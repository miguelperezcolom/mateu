package io.mateu.uidl.interfaces;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import java.util.Map;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Reactive (Project Reactor) counterpart of {@link Listing} for non-blocking listings. Implement
 * {@link #search(SearchRequest, HttpRequest)} to return a {@link Mono} of a {@link ListingData}
 * page of {@code Row} objects; the default {@link #handleAction} wires the {@code "search"} action
 * to it. The same input capabilities apply: {@link Searchable} shows the search box, {@link
 * Filterable} the filter bar. Override {@link #selectionEnabled()} to allow row selection.
 *
 * @param <Row> the type of each row in the listing
 */
public interface ReactiveListing<Row> extends ActionHandler {

  @Override
  default boolean supportsAction(String actionId) {
    return "search".equals(actionId);
  }

  @Override
  default Flux<Object> handleAction(String actionId, HttpRequest httpRequest) {
    return search(SearchRequestBuilder.build(this, httpRequest), httpRequest)
        .map(
            crudlData ->
                (Object)
                    new Data(
                        Map.of(
                            "crud",
                            GroupActions.applyVisibility(
                                this, crudlData.withSynthesizedGroups(rowClass()), httpRequest))))
        .flux();
  }

  default Class<Row> rowClass() {
    return getGenericClass(this.getClass(), ReactiveListing.class, "Row");
  }

  Mono<ListingData<Row>> search(SearchRequest request, HttpRequest httpRequest);

  default boolean selectionEnabled() {
    return false;
  }
}
