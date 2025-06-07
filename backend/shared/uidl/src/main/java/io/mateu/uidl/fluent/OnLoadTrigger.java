package io.mateu.uidl.fluent;

public record OnLoadTrigger(String actionId, int timeoutMillis, int times) implements Trigger {

  public OnLoadTrigger(String actionId) {
    this(actionId, 0, 1);
  }
}
