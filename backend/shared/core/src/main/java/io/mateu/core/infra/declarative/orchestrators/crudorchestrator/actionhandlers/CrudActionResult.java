package io.mateu.core.infra.declarative.orchestrators.crudorchestrator.actionhandlers;

import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Message;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Carries the mutable state that flows through CRUD action handling: the (possibly redirected)
 * route and the id of the entity that was saved.
 */
public record CrudActionResult(String route, Object savedId, List<Message> messages, Data data) {

  public static CrudActionResult of(String actionId) {
    return new CrudActionResult(actionId, null, new ArrayList<>(), null);
  }

  public static CrudActionResult of(String actionId, Object savedId) {
    return new CrudActionResult(actionId, savedId, new ArrayList<>(), null);
  }

  public CrudActionResult withRoute(String route) {
    return new CrudActionResult(route, this.savedId, this.messages, this.data);
  }

  public CrudActionResult withSavedId(Object newSavedId) {
    return new CrudActionResult(this.route, newSavedId, this.messages, this.data);
  }

  public CrudActionResult withMessage(Message message) {
    var newMessages = new ArrayList<>(this.messages);
    newMessages.add(message);
    return new CrudActionResult(this.route, this.savedId, newMessages, this.data);
  }

    public CrudActionResult withData(Data data) {
        return new CrudActionResult(route, this.savedId, this.messages, data);
    }
}
