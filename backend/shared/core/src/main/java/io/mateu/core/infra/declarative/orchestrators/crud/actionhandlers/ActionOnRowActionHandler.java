package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.write.RunMethodActionRunner.invoke;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.application.security.ActionMethods;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Method;
import java.util.Collection;
import java.util.List;

public class ActionOnRowActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return actionId.startsWith("action-on-row-");
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest, Crud orchestrator) {
    String methodName = actionId.substring("action-on-row-".length());
    var behaviour = orchestrator.behaviourSource();
    for (Method method : getAllMethods(behaviour.getClass()).reversed()) {
      if (methodName.equals(method.getName())) {
        if (!ActionMethods.isInvocable(method, behaviour, httpRequest)) {
          throw ActionMethods.notAnAction(behaviour.getClass(), "action-on-row-" + methodName);
        }
        ActionMethods.checkAccess(method, behaviour.getClass(), httpRequest);
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
        Object result = invoke(method, behaviour, command);
        // a method that only TELLS the user something (a Message, or a list of them) changed the
        // rows all the same: the listing refreshes and the message is shown — it used to keep
        // showing the stale rows. Anything else (a navigation, a view, commands) is the method's
        // own answer and is returned as it is.
        var messages = messagesOnly(result);
        if (messages != null) {
          var refreshed = CrudActionResult.listingChanged(actionId, orchestrator);
          for (var message : messages) {
            refreshed = refreshed.withMessage(message);
          }
          return refreshed;
        }
        if (result != null) {
          return result;
        }
        break;
      }
    }
    return CrudActionResult.listingChanged(actionId, orchestrator);
  }

  /** The messages when the result is nothing but messages; null otherwise. */
  static List<Message> messagesOnly(Object result) {
    if (result instanceof Message message) {
      return List.of(message);
    }
    if (result instanceof Collection<?> collection
        && !collection.isEmpty()
        && collection.stream().allMatch(Message.class::isInstance)) {
      return collection.stream().map(Message.class::cast).toList();
    }
    return null;
  }
}
