package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A popover: the {@code wrapped} component, and the {@code content} shown in a small floating panel
 * next to it — on click by default, or on hover/focus with {@code trigger = hover} (read-only
 * details: a rate breakdown, a reservation summary).
 */
@Builder
public record Popover(
    String id,
    Component content,
    Component wrapped,
    @Experimental("hover popovers (3.0-alpha.409)") PopoverTrigger trigger,
    String style,
    String cssClasses)
    implements Component {

  public Popover(Component content, Component wrapped, String style, String cssClasses) {
    this(null, content, wrapped, null, style, cssClasses);
  }
}
