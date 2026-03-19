package io.mateu.uidl.fluent;

public record OnSuccessTrigger(
    String actionId, String calledActionId, String condition, int timeoutMillis)
    implements Trigger {

  public OnSuccessTrigger(String actionId, String calledActionId) {
    this(actionId, calledActionId, "", 0);
  }

  public OnSuccessTrigger(String actionId, String calledActionId, String condition) {
    this(actionId, calledActionId, condition, 0);
  }
}
