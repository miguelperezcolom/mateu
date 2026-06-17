package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.write.RunMethodActionRunner.invoke;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Method;
import lombok.SneakyThrows;

public class ActionOnRowActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return actionId.startsWith("action-on-row-");
  }

  @SneakyThrows
  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest, Crud orchestrator) {
    String methodName = actionId.substring("action-on-row-".length());
    for (Method method : getAllMethods(orchestrator.getClass()).reversed()) {
      if (methodName.equals(method.getName())) {
        method.setAccessible(true);
        var rq = httpRequest.runActionRq();
        var command =
            new RunActionCommand(
                "base_url",
                "uiId",
                rq.route(),
                rq.consumedRoute(),
                rq.actionId(),
                rq.componentState(),
                rq.appState(),
                rq.initiatorComponentId(),
                httpRequest,
                rq.serverSideType(),
                rq.serverSideComponentRoute());
        Object result = invoke(method, orchestrator, command);
        if (result != null) {
          return result;
        }
        break;
      }
    }
    return CrudActionResult.of(actionId)
        .withRoute("/list")
        .withActionToRun("search")
        .withTargetComponentId(CrudTargetComponentId.list(httpRequest));
  }
}
