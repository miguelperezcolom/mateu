package io.mateu.uidl.interfaces;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.data.CrudlData;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Direction;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Sort;
import java.util.Map;

public interface CrudlBackend<Filters, Row> extends ActionHandler {

  @Override
  default boolean supportsAction(String actionId) {
    return "search".equals(actionId);
  }

  @Override
  default Object handleAction(String actionId, HttpRequest httpRequest) {
    var searchText = httpRequest.getString("searchText");
    Filters filters =
        MateuInstanceFactory.newInstance(
            filtersClass(), httpRequest.runActionRq().componentState(), httpRequest);

    return new Data(
        Map.of(
            getCrudId(httpRequest),
            search(
                searchText != null ? searchText : "",
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
                httpRequest)));
  }

  default String getCrudId(HttpRequest httpRequest) {
    if (httpRequest.runActionRq().parameters() != null
        && httpRequest.runActionRq().parameters().get("crudId") != null) {
      return (String) httpRequest.runActionRq().parameters().get("crudId");
    }
    return "crud";
  }

  default Class<Filters> filtersClass() {
    return getGenericClass(this.getClass(), CrudlBackend.class, "Filters");
  }

  CrudlData<Row> search(
      String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest);
}
