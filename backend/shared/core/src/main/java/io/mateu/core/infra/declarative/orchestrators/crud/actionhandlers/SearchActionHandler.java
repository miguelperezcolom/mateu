package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Sort;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

public class SearchActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return "search".equals(actionId);
  }

  @Override
  public Object handleAction(
      String actionId, HttpRequest httpRequest, Crud orchestrator) {
    String searchText = (String) httpRequest.runActionRq().componentState().get("searchText");
    Pageable pageable =
        new Pageable(
            toInt(httpRequest.runActionRq().componentState().get("page"), 0),
            toInt(httpRequest.runActionRq().componentState().get("size"), 20),
            (List<Sort>) httpRequest.runActionRq().componentState().get("sort"));
    if (searchText == null) {
      searchText = "";
    }
    return new Data(Map.of("crud", orchestrator.search(searchText, null, pageable, httpRequest)));
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
