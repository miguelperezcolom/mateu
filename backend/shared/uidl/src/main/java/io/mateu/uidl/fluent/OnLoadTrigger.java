package io.mateu.uidl.fluent;

public record OnLoadTrigger(String actionId, int timeoutMillis, int times, String condition)
    implements Trigger {

  public OnLoadTrigger(String actionId) {
    this(actionId, 0, 1, null);
  }
}
