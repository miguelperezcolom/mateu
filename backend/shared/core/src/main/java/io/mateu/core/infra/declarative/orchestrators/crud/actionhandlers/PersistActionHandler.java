package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.interfaces.HttpRequest;

public class PersistActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return "save".equals(actionId) || "create".equals(actionId);
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest, Crud orchestrator) {
    var savedId =
        "save".equals(actionId)
            ? orchestrator.save(httpRequest)
            : orchestrator.saveNew(httpRequest);
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
