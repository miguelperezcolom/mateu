package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;

/**
 * Persists a single row edited in place in the listing grid (inline editing). The edited row
 * travels in the {@code _editedRow} action parameter.
 */
public class UpdateRowActionHandler implements CrudOrchestratorActionHandler {

  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return "update-row".equals(actionId);
  }

  @Override
  @SuppressWarnings("unchecked")
  public Object handleAction(String actionId, HttpRequest httpRequest, Crud orchestrator) {
    var parameters = httpRequest.runActionRq().parameters();
    var row = parameters != null ? parameters.get("_editedRow") : null;
    if (!(row instanceof Map<?, ?> rowMap)) {
      throw new IllegalArgumentException("update-row requires an _editedRow parameter");
    }
    try {
      return orchestrator.updateRow((Map<String, Object>) rowMap, httpRequest);
    } catch (
        io.mateu.core.infra.declarative.orchestrators.crud.OptimisticLock.StaleEditException
            conflict) {
      // inline-edit conflict: same reload/overwrite dialog; Overwrite re-sends the SAME edited row
      // (the button's parameters merge into the action request), Reload re-runs the search
      return io.mateu.core.infra.declarative.orchestrators.crud.OptimisticLock.conflictDialog(
          "This row changed while you were editing it. Reload to see the changes or overwrite"
              + " them with your version.",
          "search",
          "update-row",
          java.util.Map.of("_editedRow", rowMap),
          null,
          httpRequest);
    }
  }
}
