package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import io.mateu.uidl.data.Message;
import java.util.ArrayList;
import java.util.List;

/**
 * Carries the mutable state that flows through CRUD action handling: the (possibly redirected)
 * actionId and the id of the entity that was saved.
 */
public record CrudActionResult(String actionId, Object savedId, List<Message> messages) {

  public static CrudActionResult of(String actionId) {
    return new CrudActionResult(actionId, null, new ArrayList<>());
  }

  public static CrudActionResult of(String actionId, Object savedId) {
    return new CrudActionResult(actionId, savedId, new ArrayList<>());
  }

  public CrudActionResult withActionId(String newActionId) {
    return new CrudActionResult(newActionId, this.savedId, this.messages);
  }

  public CrudActionResult withSavedId(Object newSavedId) {
    return new CrudActionResult(this.actionId, newSavedId, this.messages);
  }

  public CrudActionResult withMessage(Message message) {
    var newMessages = new ArrayList<>(this.messages);
    newMessages.add(message);
    return new CrudActionResult(this.actionId, this.savedId, newMessages);
  }
}
