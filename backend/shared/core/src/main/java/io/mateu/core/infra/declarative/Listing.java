package io.mateu.core.infra.declarative;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.write.RunMethodActionRunner.invoke;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ListingBackend;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import lombok.SneakyThrows;

public abstract class Listing<Filters, Row>
    implements ListingBackend<Filters, Row>, ActionSupplier {

  @Override
  public List<Action> actions(HttpRequest httpRequest) {
    var actions = new ArrayList<Action>();
    actions.addAll(ListingBackend.super.actions(httpRequest));
    getAllMethods(getClass()).stream()
        .filter(method -> method.isAnnotationPresent(Toolbar.class))
        .forEach(
            method -> {
              actions.add(Action.builder().id(method.getName()).build());
            });
    return actions;
  }

  @SneakyThrows
  @Override
  public Object handleActionOnRow(String methodName, HttpRequest httpRequest) {
    for (Method method : getAllMethods(getClass()).reversed()) {
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
        Object result = invoke(method, this, command);
        if (result != null) {
          return result;
        }
        break;
      }
    }
    return null;
  }
}
