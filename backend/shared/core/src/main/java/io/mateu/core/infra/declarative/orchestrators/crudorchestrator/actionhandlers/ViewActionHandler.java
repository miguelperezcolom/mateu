package io.mateu.core.infra.declarative.orchestrators.crudorchestrator.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crudorchestrator.CrudOrchestrator;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;

public class ViewActionHandler implements CrudActionHandler {

  @Override
  public boolean supports(String actionId) {
    return "view".equals(actionId);
  }

  @Override
  @SuppressWarnings("unchecked")
  public CrudActionResult handle(
      CrudOrchestrator<?, ?, ?, ?, ?, ?> orchestrator,
      CrudActionResult current,
      HttpRequest httpRequest) {
    var idField = orchestrator.getIdFieldForRow();
    var savedId = httpRequest.getComponentState(Map.class).get(idField);
    if (savedId == null) {
      savedId = httpRequest.runActionRq().parameters().get(idField);
    }
    return current.withSavedId(savedId).withRoute("/" + savedId);
  }
}
