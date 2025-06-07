package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.Actionable;

public record Button(String id, String label, String actionId, Actionable actionable)
    implements Component, UserTrigger {

  public Button(String label, String actionId) {
    this(null, label, actionId, null);
  }

  public Button(String label, Actionable actionable) {
    this(null, label, null, actionable);
  }
}
