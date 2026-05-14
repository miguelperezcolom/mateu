package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import io.mateu.uidl.data.Message;
import java.util.ArrayList;
import java.util.List;

/**
 * Carries the mutable state that flows through CRUD action handling: the (possibly redirected)
 * route and the id of the entity that was saved.
 */
public record CrudActionResult(String route, Object savedId, List<Message> messages) {

  public static CrudActionResult of(String actionId) {
    return new CrudActionResult(actionId, null, new ArrayList<>());
  }

  public static CrudActionResult of(String actionId, Object savedId) {
    return new CrudActionResult(actionId, savedId, new ArrayList<>());
  }

  public CrudActionResult withRoute(String route) {
    return new CrudActionResult(route, this.savedId, this.messages);
  }

  public CrudActionResult withSavedId(Object newSavedId) {
    return new CrudActionResult(this.route, newSavedId, this.messages);
  }

  public CrudActionResult withMessage(Message message) {
    var newMessages = new ArrayList<>(this.messages);
    newMessages.add(message);
    return new CrudActionResult(this.route, this.savedId, newMessages);
  }
}
