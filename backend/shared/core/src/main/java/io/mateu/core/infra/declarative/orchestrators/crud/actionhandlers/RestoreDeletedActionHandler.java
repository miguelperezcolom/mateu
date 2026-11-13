package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.BuiltInTexts;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudWriteGate;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Restorable;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

/**
 * The Undo of a delete (W-V-DELETE-FEEDBACK): {@link Restorable#RESTORE_ACTION} with the ids the
 * delete's toast carried. Gated like the delete it reverses (a crud that may not delete may not
 * restore), refused when the crud declares no {@link Restorable}; the listing searches again.
 */
public class RestoreDeletedActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return Restorable.RESTORE_ACTION.equals(actionId);
  }

  @Override
  @SuppressWarnings({"rawtypes", "unchecked"})
  public Object handleAction(String actionId, HttpRequest httpRequest, Crud orchestrator) {
    CrudWriteGate.checkDelete(orchestrator);
    if (!orchestrator.restorable()) {
      throw new io.mateu.core.application.security.MateuForbiddenException(
          "restore is not offered by " + orchestrator.getClass().getSimpleName());
    }
    // the gates passed: a repeated Idempotency-Key may now answer from memory
    io.mateu.core.infra.idempotency.IdempotencyKeys.checkpoint(httpRequest);
    var raw =
        httpRequest.runActionRq().parameters() == null
            ? null
            : httpRequest.runActionRq().parameters().get(Restorable.RESTORE_IDS);
    List ids =
        raw instanceof Collection<?> values
            ? values.stream()
                .filter(Objects::nonNull)
                .map(id -> orchestrator.toId(String.valueOf(id)))
                .toList()
            : List.of();
    if (!ids.isEmpty()) {
      orchestrator.restoreDeleted(ids, httpRequest);
      io.mateu.core.infra.observability.RequestObservation.recordIds(httpRequest, ids);
    }
    var text =
        ids.size() == 1
            ? BuiltInTexts.translate("1 record restored", httpRequest)
            : BuiltInTexts.translate("{0} records restored", httpRequest)
                .replace("{0}", String.valueOf(ids.size()));
    return CrudActionResult.listingChanged(actionId, orchestrator)
        .withMessage(Message.success(text));
  }
}
