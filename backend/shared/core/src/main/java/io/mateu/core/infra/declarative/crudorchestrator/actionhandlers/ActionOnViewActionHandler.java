package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static io.mateu.core.infra.declarative.CrudAdapterHelper.toView;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Method;
import lombok.SneakyThrows;

public class ActionOnViewActionHandler {

  @SneakyThrows
  public static Object handleActionOnView(
      CrudOrchestrator<?, ?, ?, ?, ?, ?> crudOrchestrator,
      String actionId,
      HttpRequest httpRequest) {
    String methodName = actionId.substring("action-on-view-".length());
    var item = toView(httpRequest, crudOrchestrator.viewClass());

    for (Method method : getAllMethods(crudOrchestrator.getClass())) {
      if (methodName.equals(method.getName())) {
        method.setAccessible(true);
        if (method.getParameterCount() == 1) {
          return method.invoke(crudOrchestrator, item);
        }
        if (method.getParameterCount() == 2) {
          return method.invoke(crudOrchestrator, item, httpRequest);
        }
      }
    }
    return null;
  }
}
