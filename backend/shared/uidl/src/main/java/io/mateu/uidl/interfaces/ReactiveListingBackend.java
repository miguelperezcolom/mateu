package io.mateu.uidl.interfaces;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Direction;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Sort;
import java.util.Map;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Reactive (Project Reactor) counterpart of {@link ListingBackend} for non-blocking listings.
 * Implement {@link #search(String, Object, Pageable, HttpRequest)} to return a {@link Mono} of a
 * {@link ListingData} page of {@code Row} objects for the given {@code searchText}, {@code Filters}
 * and {@link Pageable}; the default {@link #handleAction} wires the {@code "search"} action to it.
 * Override {@link #selectionEnabled()} to allow row selection.
 *
 * @param <Filters> the type carrying the listing's filter fields
 * @param <Row> the type of each row in the listing
 */
public interface ReactiveListingBackend<Filters, Row> extends ActionHandler {

  @Override
  default boolean supportsAction(String actionId) {
    return "search".equals(actionId);
  }

  @Override
  default Flux<Object> handleAction(String actionId, HttpRequest httpRequest) {
    var searchText = httpRequest.getString("searchText");
    Filters filters =
        MateuInstanceFactory.newInstance(
            filtersClass(),
            FilterStateAssembler.assemble(
                filtersClass(), httpRequest.runActionRq().componentState()),
            httpRequest);

    return search(
            searchText,
            filters,
            new Pageable(
                httpRequest.getInt("page"),
                httpRequest.getInt("size"),
                httpRequest.getListOfMaps("sort").stream()
                    .filter(map -> map.containsKey("direction"))
                    .map(
                        map ->
                            new Sort(
                                (String) map.get("fieldId"),
                                Direction.valueOf((String) map.get("direction"))))
                    .toList()),
            httpRequest)
        .map(
            crudlData ->
                (Object) new Data(Map.of("crud", crudlData.withSynthesizedGroups(rowClass()))))
        .flux();
  }

  default Class<Filters> filtersClass() {
    return getGenericClass(this.getClass(), ReactiveListingBackend.class, "Filters");
  }

  default Class<Row> rowClass() {
    return getGenericClass(this.getClass(), ReactiveListingBackend.class, "Row");
  }

  Mono<ListingData<Row>> search(
      String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest);

  default boolean selectionEnabled() {
    return false;
  }
}
