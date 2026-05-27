package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.CrudOrchestrator;
import io.mateu.core.infra.declarative.orchestrators.crudorchestrator.actionhandlers.CrudActionResult;
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
    public Object handleAction(String actionId, HttpRequest httpRequest, CrudOrchestrator orchestrator) {
        String searchText = (String) httpRequest.runActionRq().componentState().get("searchText");
        Pageable pageable =
                new Pageable(
                        (Integer) httpRequest.runActionRq().componentState().get("page"),
                        (Integer) httpRequest.runActionRq().componentState().get("size"),
                        (List<Sort>) httpRequest.runActionRq().componentState().get("sort"));
        if (searchText == null) {
            searchText = "";
        }
        return new Data(Map.of("crud", orchestrator.search(searchText, null, pageable, httpRequest)));
    }
}
