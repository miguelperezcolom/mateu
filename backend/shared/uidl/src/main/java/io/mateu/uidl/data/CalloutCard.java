package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A highlighted call-to-action block: an icon, a title, a description and an optional CTA button
 * ({@code ctaLabel} + {@code actionId}). {@code theme} tints it — one of {@code "info"}, {@code
 * "success"}, {@code "warning"} or {@code "danger"} (default info). Design-system neutral,
 * dark-mode aware.
 */
@Builder
public record CalloutCard(
    String id,
    String title,
    String description,
    String icon,
    String ctaLabel,
    String actionId,
    String theme,
    String style,
    String cssClasses)
    implements Component {}
