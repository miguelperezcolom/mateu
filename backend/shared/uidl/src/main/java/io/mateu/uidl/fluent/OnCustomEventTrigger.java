package io.mateu.uidl.fluent;

import lombok.Builder;

@Builder
public record OnCustomEventTrigger(String actionId, String eventName, String condition)
    implements Trigger {

  public OnCustomEventTrigger(String actionId, String eventName) {
    this(actionId, eventName, null);
  }
}
