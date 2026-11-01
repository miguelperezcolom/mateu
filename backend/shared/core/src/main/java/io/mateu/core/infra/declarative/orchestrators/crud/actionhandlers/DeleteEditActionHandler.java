package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

public class DeleteEditActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return "delete".equals(actionId);
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest, Crud orchestrator) {
    // the Delete button is not drawn for a crud that may not delete — and a crafted request is
    // refused too (403), not just undrawn
    io.mateu.core.infra.declarative.orchestrators.crud.CrudWriteGate.checkDelete(orchestrator);
    List<?> selection = httpRequest.getSelectedRows(Map.class);
    if (selection != null) {
      var idField = orchestrator.getIdFieldForRow();
      // the rows carry their ids as JSON gave them (7, not "7"): handed over raw, a store keyed by
      // String deleted nothing (or failed on a cast) and a Deletable<Long> got Integers — each id
      // goes through the crud's own route-id conversion, to its declared id type
      List selectedIds =
          selection.stream()
              .map(map -> ((Map<String, Object>) map).get(idField))
              .filter(java.util.Objects::nonNull)
              .map(id -> orchestrator.toId(String.valueOf(id)))
              .toList();
      orchestrator.deleteAllById(selectedIds, httpRequest);
    }
    return CrudActionResult.listingChanged(actionId, orchestrator);
  }
}
