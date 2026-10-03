package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Tab(
    String label,
    Component content,
    String style,
    String cssClasses,
    String shortcut,
    boolean active,
    String routeKey,
    String badge)
    implements Component {

  public Tab(String label, Component content) {
    this(label, content, "", "", "", false, null, null);
  }

  public Tab(
      String label,
      Component content,
      String style,
      String cssClasses,
      String shortcut,
      boolean active) {
    this(label, content, style, cssClasses, shortcut, active, null, null);
  }
}
