package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static io.mateu.core.infra.declarative.CrudAdapterHelper.toView;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
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
        List<Object> args = new ArrayList<>();
        for (int i = 0; i < method.getParameterCount(); i++) {
          if (item != null && method.getParameterTypes()[i].isAssignableFrom(item.getClass())) {
            args.add(item);
          }
          if (method.getParameterTypes()[i].isAssignableFrom(httpRequest.getClass())) {
            args.add(httpRequest);
          }
        }
        try {
          return method.invoke(crudOrchestrator, args.toArray());
        } catch (Throwable e) {
          if (e instanceof InvocationTargetException invocationTargetException
              && invocationTargetException.getCause() != null) {
            throw invocationTargetException.getCause();
          }
          throw e;
        }
      }
    }
    return null;
  }
}
