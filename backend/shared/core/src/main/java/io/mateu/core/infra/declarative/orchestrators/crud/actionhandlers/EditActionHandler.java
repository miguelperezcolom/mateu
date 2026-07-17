package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.uidl.interfaces.HttpRequest;

public class EditActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return "edit".equals(actionId);
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest, Crud orchestrator) {
    var id = CrudIdExtractor.extractId(orchestrator, httpRequest);
    if (orchestrator.editInDrawer()) {
      var editor = orchestrator.edit(orchestrator.toId(String.valueOf(id)), httpRequest);
      httpRequest.setAttribute("selectedItem", editor);
      return CrudDrawerBuilder.build(
          false, orchestrator.editLabel(), editor, orchestrator, httpRequest);
    }
    return CrudActionResult.of(actionId).withSavedId(id).withRoute("/" + id + "/edit");
  }
}
