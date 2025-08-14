package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.CrudlData;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Direction;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Sort;
import java.util.Map;
import reactor.core.publisher.Mono;

public interface ReactiveCrudlBackend<Filters, Row> extends ReactiveHandlesActions {

  @Override
  default boolean supportsAction(String actionId) {
    return "search".equals(actionId);
  }

  @Override
  default Mono<?> handleAction(String actionId, HttpRequest httpRequest) {
    var searchText = httpRequest.getString("searchText");
    Filters filters =
        MateuInstanceFactory.newInstance(
            filtersClass(), httpRequest.runActionRq().componentState());

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
        .map(crudlData -> new Data(Map.of("crud", crudlData)));
  }

  Class<Filters> filtersClass();

  Mono<CrudlData<Row>> search(
      String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest);
}
