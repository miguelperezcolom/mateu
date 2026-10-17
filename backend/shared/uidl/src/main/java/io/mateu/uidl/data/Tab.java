package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * One tab of a {@link TabLayout}: a {@code label} (with an optional {@code badge}) and the {@code
 * content} it shows. {@code active} makes it the tab selected on first render; {@code shortcut}
 * (e.g. {@code "alt+1"}) selects it from the keyboard.
 */
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
