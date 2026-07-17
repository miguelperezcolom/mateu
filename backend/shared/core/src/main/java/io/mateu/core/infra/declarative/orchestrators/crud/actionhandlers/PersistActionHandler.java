package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class PersistActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return "save".equals(actionId) || "create".equals(actionId);
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest, Crud orchestrator) {
    Object savedId;
    try {
      savedId =
          "save".equals(actionId)
              ? orchestrator.save(httpRequest)
              : orchestrator.saveNew(httpRequest);
    } catch (
        io.mateu.core.infra.declarative.orchestrators.crud.OptimisticLock.StaleEditException
            conflict) {
      // concurrent edit: don't persist — open the conflict dialog instead (its buttons bubble to
      // the editor component, which advertises save and cancel-edit)
      return io.mateu.core.infra.declarative.orchestrators.crud.OptimisticLock.conflictDialog(
          "Este registro ha cambiado mientras lo editabas. Puedes recargar para ver los cambios"
              + " (perdiendo los tuyos) o sobrescribir con tu versión.",
          "cancel-edit",
          actionId,
          null);
    }
    var result =
        CrudActionResult.of(actionId)
            .withSavedId(savedId)
            .withMessage(
                Message.builder()
                    .variant(NotificationVariant.success)
                    .text("Item saved successfully")
                    .build());
    if (orchestrator.editInDrawer()) {
      // drawer mode: persist, then close the drawer EMITTING the saved event — the listing
      // (which subscribes to it, see CrudTriggersBuilder) re-runs its search in place. No
      // navigation/re-render happens in this response: re-rendering the host here would kill
      // the drawer's owner before the close command finds the overlay.
      return List.of(
          result.messages().get(0),
          io.mateu.uidl.data.UICommand.markAsClean(),
          io.mateu.uidl.data.UICommand.closeModal(Crud.SAVED_IN_DRAWER_EVENT));
    }
    return result.withRoute("/" + savedId);
  }
}
