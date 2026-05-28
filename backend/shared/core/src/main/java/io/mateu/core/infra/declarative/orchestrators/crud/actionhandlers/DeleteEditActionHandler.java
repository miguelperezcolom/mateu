package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudOrchestrator;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

public class DeleteEditActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return "delete".equals(actionId);
  }

  @Override
  public Object handleAction(
      String actionId, HttpRequest httpRequest, CrudOrchestrator orchestrator) {
    List<?> selection = httpRequest.getSelectedRows(Map.class);
    if (selection != null) {
      var idField = orchestrator.getIdFieldForRow();
      List selectedIds =
          selection.stream().map(map -> ((Map<String, Object>) map).get(idField)).toList();
      orchestrator.adapter().deleteAllById(selectedIds, httpRequest);
    }
    return CrudActionResult.of(actionId)
        .withRoute("/list")
        .withActionToRun("search")
        .withTargetComponentId(
            "ux_"
                + httpRequest
                    .runActionRq()
                    .initiatorComponentId()
                    .substring(
                        0,
                        httpRequest.runActionRq().initiatorComponentId().length() - "_app".length())
                + "_cs_list");
  }
}
