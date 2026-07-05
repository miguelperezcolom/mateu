package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Sort;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import java.util.List;
import java.util.Map;

public class SearchActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return "search".equals(actionId);
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest, Crud orchestrator) {
    String searchText = (String) httpRequest.runActionRq().componentState().get("searchText");
    Pageable pageable =
        new Pageable(
            toInt(httpRequest.runActionRq().componentState().get("page"), 0),
            toInt(httpRequest.runActionRq().componentState().get("size"), 20),
            toSorts(httpRequest.runActionRq().componentState().get("sort")));
    if (searchText == null) {
      searchText = "";
    }
    // The filter values only travel inside the component state — materialize them into the
    // orchestrator's filters type (same as ExportActionRunner) instead of passing null.
    Object filters =
        MateuInstanceFactory.newInstance(
            orchestrator.filtersClass(), httpRequest.runActionRq().componentState(), httpRequest);
    return new Data(
        Map.of("crud", orchestrator.search(searchText, filters, pageable, httpRequest)));
  }

  /**
   * The sort criteria arrive from the wire as a JSON list of maps, not as {@link Sort} records —
   * the old unchecked cast let them through and the default in-memory repository blew up with a
   * ClassCastException on the first sorted search.
   */
  private List<Sort> toSorts(Object raw) {
    if (!(raw instanceof List<?> list)) {
      return List.of();
    }
    return list.stream()
        .map(
            item -> {
              if (item instanceof Sort sort) {
                return sort;
              }
              if (item instanceof Map<?, ?> map && map.get("field") != null) {
                var direction = map.get("direction");
                return new Sort(
                    map.get("field").toString(),
                    direction == null
                        ? io.mateu.uidl.data.Direction.ascending
                        : io.mateu.uidl.data.Direction.valueOf(direction.toString()));
              }
              return null;
            })
        .filter(sort -> sort != null)
        .toList();
  }

  private int toInt(Object value, int defaultValue) {
    if (value == null) return defaultValue;
    if (value instanceof Integer i) return i;
    try {
      return Integer.parseInt(value.toString());
    } catch (NumberFormatException e) {
      return defaultValue;
    }
  }
}
