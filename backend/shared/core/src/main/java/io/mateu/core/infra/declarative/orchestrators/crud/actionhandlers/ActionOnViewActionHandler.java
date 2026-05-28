package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.CrudOrchestrator;
import io.mateu.core.infra.declarative.orchestrators.crudorchestrator.actionhandlers.CrudActionResult;
import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.SneakyThrows;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static io.mateu.core.infra.declarative.orchestrators.crudorchestrator.CrudAdapterHelper.toView;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

public class ActionOnViewActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return actionId.startsWith("action-on-view-");
  }

  @SneakyThrows
  @Override
  public Object handleAction(
      String actionId, HttpRequest httpRequest, CrudOrchestrator orchestrator) {
    String methodName = actionId.substring("action-on-view-".length());
    var item = toView(httpRequest, orchestrator.viewClass());
    var idField = orchestrator.getIdFieldForRow();
    var savedId = getValue(idField, item);

    for (Object subject : List.of(item, orchestrator)) {
      for (Method method : getAllMethods(subject.getClass())) {
        if (methodName.equals(method.getName())) {
          method.setAccessible(true);
          List<Object> args = new ArrayList<>();
          for (int i = 0; i < method.getParameterCount(); i++) {
            if (item != null && method.getParameterTypes()[i].isAssignableFrom(item.getClass())) {
              args.add(item);
            }
            if (method.getParameterTypes()[i].isAssignableFrom(orchestrator.getClass())) {
              args.add(orchestrator);
            }
            if (method.getParameterTypes()[i].isAssignableFrom(httpRequest.getClass())) {
              args.add(httpRequest);
            }
          }
          try {
            var result = method.invoke(subject, args.toArray());
            if (result != null) {
              return result;
            }
            return CrudActionResult.of(actionId).withRoute("/" + savedId)
                    .withState(new State(item))
                    .withTargetComponentId("ux_" + httpRequest.runActionRq().initiatorComponentId().substring(0, httpRequest.runActionRq().initiatorComponentId().length() - "_app".length()) + "_cs_view");
          } catch (Throwable e) {
            if (e instanceof InvocationTargetException invocationTargetException
                    && invocationTargetException.getCause() != null) {
              throw invocationTargetException.getCause();
            }
            throw e;
          }
        }
      }
    }
    return CrudActionResult.of(actionId).withRoute("/" + savedId)
            .withState(new State(item))
            .withTargetComponentId("ux_" + httpRequest.runActionRq().initiatorComponentId().substring(0, httpRequest.runActionRq().initiatorComponentId().length() - "_app".length()) + "_cs_view");
  }
}
