package io.mateu.core.infra.declarative.orchestrators.crud;

import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.UICommand;
import java.util.ArrayList;
import java.util.List;

/**
 * Carries the mutable state that flows through CRUD action handling: the (possibly redirected)
 * route and the id of the entity that was saved.
 */
public record CrudActionResult(
    String route,
    Object savedId,
    List<Message> messages,
    Data data,
    String actionToRun,
    String targetComponentId,
    State state,
    List<UICommand> commands) {

  public static CrudActionResult of(String actionId) {
    return new CrudActionResult(
        actionId, null, new ArrayList<>(), null, null, null, null, new ArrayList<>());
  }

  public static CrudActionResult of(String actionId, Object savedId) {
    return new CrudActionResult(
        actionId, savedId, new ArrayList<>(), null, null, null, null, new ArrayList<>());
  }

  public CrudActionResult withRoute(String route) {
    return new CrudActionResult(
        route,
        this.savedId,
        this.messages,
        this.data,
        this.actionToRun,
        this.targetComponentId,
        this.state,
        this.commands);
  }

  public CrudActionResult withSavedId(Object newSavedId) {
    return new CrudActionResult(
        this.route,
        newSavedId,
        this.messages,
        this.data,
        this.actionToRun,
        this.targetComponentId,
        this.state,
        this.commands);
  }

  public CrudActionResult withActionToRun(String actionToRun) {
    return new CrudActionResult(
        this.route,
        this.savedId,
        this.messages,
        this.data,
        actionToRun,
        this.targetComponentId,
        this.state,
        this.commands);
  }

  public CrudActionResult withTargetComponentId(String targetComponentId) {
    return new CrudActionResult(
        this.route,
        this.savedId,
        this.messages,
        this.data,
        this.actionToRun,
        targetComponentId,
        this.state,
        this.commands);
  }

  public CrudActionResult withMessage(Message message) {
    var newMessages = new ArrayList<>(this.messages);
    newMessages.add(message);
    return new CrudActionResult(
        this.route,
        this.savedId,
        newMessages,
        this.data,
        this.actionToRun,
        this.targetComponentId,
        this.state,
        this.commands);
  }

  public CrudActionResult withData(Data data) {
    return new CrudActionResult(
        route,
        this.savedId,
        this.messages,
        data,
        this.actionToRun,
        this.targetComponentId,
        this.state,
        this.commands);
  }

  public CrudActionResult withState(State state) {
    return new CrudActionResult(
        route,
        this.savedId,
        this.messages,
        this.data,
        this.actionToRun,
        this.targetComponentId,
        state,
        this.commands);
  }

  public CrudActionResult withCommand(UICommand command) {
    var newCommands = new ArrayList<>(this.commands);
    newCommands.add(command);
    return new CrudActionResult(
        this.route,
        this.savedId,
        this.messages,
        this.data,
        this.actionToRun,
        this.targetComponentId,
        this.state,
        newCommands);
  }
}
