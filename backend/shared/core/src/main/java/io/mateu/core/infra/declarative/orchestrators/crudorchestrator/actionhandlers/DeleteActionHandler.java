package io.mateu.core.infra.declarative.orchestrators.crudorchestrator.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crudorchestrator.CrudOrchestrator;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

public class DeleteActionHandler implements CrudActionHandler {

  @Override
  public boolean supports(String actionId) {
    return "delete".equals(actionId);
  }

  @Override
  @SuppressWarnings("unchecked")
  public CrudActionResult handle(
      CrudOrchestrator<?, ?, ?, ?, ?, ?> orchestrator,
      CrudActionResult current,
      HttpRequest httpRequest) {
    List<?> selection = httpRequest.getSelectedRows(Map.class);
    if (selection != null) {
      var idField = orchestrator.getIdFieldForRow();
      List selectedIds =
          selection.stream().map(map -> ((Map<String, Object>) map).get(idField)).toList();
      orchestrator.adapter().deleteAllById(selectedIds, httpRequest);
    }
    return current.withRoute("/list").withActionToRun("search");
  }
}
