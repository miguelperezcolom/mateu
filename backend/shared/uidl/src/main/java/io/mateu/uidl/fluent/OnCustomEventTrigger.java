package io.mateu.uidl.fluent;

import io.mateu.uidl.annotations.SubscriptionSource;
import lombok.Builder;

@Builder
public record OnCustomEventTrigger(
    String actionId, String eventName, String condition, SubscriptionSource source, String from)
    implements Trigger {

  public OnCustomEventTrigger(String actionId, String eventName) {
    this(actionId, eventName, null, SubscriptionSource.SELF, null);
  }

  public OnCustomEventTrigger(String actionId, String eventName, String condition) {
    this(actionId, eventName, condition, SubscriptionSource.SELF, null);
  }
}
