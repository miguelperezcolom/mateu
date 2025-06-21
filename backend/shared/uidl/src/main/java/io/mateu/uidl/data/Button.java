package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.Actionable;
import lombok.Builder;

@Builder
public record Button(
    String id,
    String label,
    String iconOnLeft,
    String iconOnRight,
    String image,
    ButtonColor color,
    boolean primary,
    boolean autofocus,
    boolean disabled,
    String actionId,
    Actionable actionable)
    implements Component, UserTrigger {

  @Override
  public ButtonColor color() {
    return color != null ? color : ButtonColor.normal;
  }
}
