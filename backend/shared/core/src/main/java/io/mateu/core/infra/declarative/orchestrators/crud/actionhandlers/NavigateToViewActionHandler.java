package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class NavigateToViewActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return "view".equals(actionId) || "cancel-edit".equals(actionId);
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest, Crud orchestrator) {
    if (orchestrator.editInDrawer()) {
      if ("cancel-edit".equals(actionId)) {
        // dismissing the edit drawer: close it and clear the unsaved-changes flag the drawer's
        // form set — the listing underneath was never left, so there is nothing to navigate to
        return List.of(UICommand.closeModal(), UICommand.markAsClean());
      }
      if (!orchestrator.readOnly()) {
        // drawer mode has no separate view page: clicking a row opens the edit drawer directly
        return new EditActionHandler().handleAction("edit", httpRequest, orchestrator);
      }
    }
    var id = CrudIdExtractor.extractId(orchestrator, httpRequest);
    return CrudActionResult.of(actionId).withSavedId(id).withRoute("/" + id);
  }
}
