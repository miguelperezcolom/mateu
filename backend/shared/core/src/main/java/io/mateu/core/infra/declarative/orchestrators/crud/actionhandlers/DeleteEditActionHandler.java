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
    // the write gate passed: a repeated Idempotency-Key may now answer from memory
    io.mateu.core.infra.idempotency.IdempotencyKeys.checkpoint(httpRequest);
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
      // the audit trail's "on what" (never the rows' values)
      io.mateu.core.infra.observability.RequestObservation.recordIds(httpRequest, selectedIds);
      if (orchestrator.restorable() && !selectedIds.isEmpty()) {
        // a delete that can be undone tells what it did and offers the way back
        // (W-V-DELETE-FEEDBACK); the Undo runs restore-deleted with the same ids
        return CrudActionResult.listingChanged(actionId, orchestrator)
            .withMessage(
                io.mateu.uidl.data.Message.undoable(
                    deletedText(selectedIds.size(), httpRequest),
                    io.mateu.uidl.interfaces.Restorable.RESTORE_ACTION,
                    Map.of(
                        io.mateu.uidl.interfaces.Restorable.RESTORE_IDS,
                        selectedIds.stream().map(String::valueOf).toList())));
      }
    }
    return CrudActionResult.listingChanged(actionId, orchestrator);
  }

  /** "1 record deleted" / "3 records deleted", in the UI's language. */
  static String deletedText(int count, HttpRequest httpRequest) {
    return count == 1
        ? io.mateu.core.infra.declarative.BuiltInTexts.translate("1 record deleted", httpRequest)
        : io.mateu.core.infra.declarative.BuiltInTexts.translate("{0} records deleted", httpRequest)
            .replace("{0}", String.valueOf(count));
  }
}
