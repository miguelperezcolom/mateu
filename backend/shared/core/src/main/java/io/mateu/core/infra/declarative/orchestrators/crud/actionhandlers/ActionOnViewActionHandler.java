package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import static io.mateu.core.infra.declarative.orchestrators.crud.CrudAdapterHelper.toView;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;

public class ActionOnViewActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return actionId.startsWith("action-on-view-");
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest, Crud orchestrator) {
    String methodName = actionId.substring("action-on-view-".length());
    var item = toView(httpRequest, orchestrator.viewClass());
    var idField = orchestrator.getIdFieldForRow();
    Object savedId;
    try {
      savedId = getValue(idField, item);
    } catch (ReflectiveOperationException e) {
      throw new RuntimeException(e);
    }

    var result = CrudViewMethodInvoker.invoke(methodName, item, orchestrator, httpRequest);
    if (result != null) {
      return result;
    }
    return CrudActionResult.of(actionId)
        .withRoute("/" + savedId)
        .withState(new State(item))
        .withTargetComponentId(CrudTargetComponentId.view(httpRequest));
  }
}
