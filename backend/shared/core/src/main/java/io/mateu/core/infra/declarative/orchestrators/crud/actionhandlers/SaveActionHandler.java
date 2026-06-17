package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.interfaces.HttpRequest;

public class SaveActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return "save".equals(actionId);
  }

  @Override
  public Object handleAction(
      String actionId, HttpRequest httpRequest, Crud orchestrator) {
    var savedId = orchestrator.save(httpRequest);
    return CrudActionResult.of(actionId)
        .withSavedId(savedId)
        .withMessage(
            Message.builder()
                .variant(NotificationVariant.success)
                .text("Item saved successfully")
                .build())
        .withRoute("/" + savedId);
  }
}
