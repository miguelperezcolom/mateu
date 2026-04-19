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
    boolean pill,
    String style,
    String cssClasses)
    implements Component {

  public Badge(String text) {
    this(text, "", "", null, false, false, false, "", "");
  }

  @Override
  public BadgeColor color() {
    return color != null ? color : BadgeColor.normal;
  }
}
