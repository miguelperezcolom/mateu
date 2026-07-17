package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class CancelToListActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return "cancel-new".equals(actionId) || "cancel-view".equals(actionId);
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest, Crud orchestrator) {
    if (orchestrator.editInDrawer() && "cancel-new".equals(actionId)) {
      // dismissing the creation drawer: the listing underneath was never left
      return List.of(UICommand.closeModal(), UICommand.markAsClean());
    }
    return CrudActionResult.of(actionId).withRoute("/list");
  }
}
