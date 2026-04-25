package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.interfaces.HttpRequest;

public class CreateActionHandler implements CrudActionHandler {

  @Override
  public boolean supports(String actionId) {
    return "create".equals(actionId);
  }

  @Override
  public CrudActionResult handle(
      CrudOrchestrator<?, ?, ?, ?, ?, ?> orchestrator,
      CrudActionResult current,
      HttpRequest httpRequest) {
    var savedId = orchestrator.saveNew(httpRequest);
    return current
        .withSavedId(savedId)
        .withMessage(
            Message.builder()
                .variant(NotificationVariant.success)
                .text("Item saved successfully")
                .build())
        .withActionId("view");
  }
}
