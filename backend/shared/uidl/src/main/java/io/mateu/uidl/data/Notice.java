package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A compact inline banner: a rounded, theme-tinted strip with a small severity icon and one line of
 * text — for notices like "2 quejas pendientes" embedded anywhere in the UI (inside cards, columns,
 * forms). Smaller than a {@link CalloutCard} (no title/CTA block) and independent of the page-level
 * banners. {@code theme} is one of {@code "info"}, {@code "success"}, {@code "warning"} or {@code
 * "danger"} (default info); {@code icon} overrides the theme's default glyph; an optional {@code
 * actionLabel} + {@code actionId} renders a small action on the right (dispatched through the
 * standard action mechanism). Design-system neutral, dark-mode aware.
 */
@Builder
public record Notice(
    String id,
    String text,
    String theme,
    String icon,
    String actionLabel,
    String actionId,
    boolean slim,
    boolean fullWidth,
    java.util.List<Component> content,
    String style,
    String cssClasses)
    implements Component {

  public Notice(String text, String theme) {
    this(null, text, theme, null, null, null, false, false, java.util.List.of(), "", "");
  }
}
