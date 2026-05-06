package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.write.RunMethodActionRunner.invoke;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Method;
import lombok.SneakyThrows;

public class ActionOnRowActionHandler {

  @SneakyThrows
  public static Object handleActionOnRow(
      CrudOrchestrator<?, ?, ?, ?, ?, ?> crudOrchestrator,
      String actionId,
      HttpRequest httpRequest) {
    String methodName = actionId.substring("action-on-row-".length());
    for (Method method : getAllMethods(crudOrchestrator.getClass()).reversed()) {
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
                rq.serverSideComponentRoute(),
                rq.appServerSideType());
        Object result = invoke(method, crudOrchestrator, command);
        if (result != null) {
          return result;
        }
        break;
      }
    }
    return null;
  }
}
