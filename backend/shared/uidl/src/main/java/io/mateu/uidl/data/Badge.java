package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Badge(
    String text,
    String iconOnLeft,
    String iconOnRight,
    BadgeColor color,
    boolean primary,
    boolean small,
    boolean pill)
    implements Component {

  @Override
  public BadgeColor color() {
    return color != null ? color : BadgeColor.normal;
  }
}
