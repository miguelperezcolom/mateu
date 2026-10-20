package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import static io.mateu.core.infra.declarative.orchestrators.crud.CrudAdapterHelper.toView;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Collection;
import java.util.List;

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
    var messages = messagesOnly(result);
    if (messages != null) {
      // The button acted on the record (a "Return loan" changed it in the store) and only has
      // something to SAY: show the record again RELOADED, with the message. Answering just the
      // message left the view on the values it had before the action.
      var reloaded = orchestrator.view(orchestrator.toId(String.valueOf(savedId)), httpRequest);
      var refreshed =
          CrudActionResult.of(actionId)
              .withRoute("/" + savedId)
              .withState(new State(reloaded != null ? reloaded : item))
              .withTargetComponentId(CrudTargetComponentId.view(httpRequest));
      for (var message : messages) {
        refreshed = refreshed.withMessage(message);
      }
      return refreshed;
    }
    if (result != null) {
      // anything else (a navigation, an overlay, a download…) decides what happens next itself
      return result;
    }
    return CrudActionResult.of(actionId)
        .withRoute("/" + savedId)
        .withState(new State(item))
        .withTargetComponentId(CrudTargetComponentId.view(httpRequest));
  }

  /**
   * The messages of an answer made only of messages ({@code Message} or a list of them), else null.
   */
  private static List<Message> messagesOnly(Object result) {
    if (result instanceof Message message) {
      return List.of(message);
    }
    if (result instanceof Collection<?> items
        && !items.isEmpty()
        && items.stream().allMatch(Message.class::isInstance)) {
      return items.stream().map(Message.class::cast).toList();
    }
    return null;
  }
}
