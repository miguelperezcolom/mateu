package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

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
        Object result = null;
        if (method.getParameterCount() == 0) {
          result = method.invoke(crudOrchestrator);
        } else {
          result = method.invoke(crudOrchestrator, httpRequest);
        }
        if (result != null) {
          return result;
        }
        break;
      }
    }
    return null;
  }
}
