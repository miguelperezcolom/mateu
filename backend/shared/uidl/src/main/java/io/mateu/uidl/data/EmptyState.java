package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A friendly placeholder for "there is nothing here yet": an icon, a title, a description and an
 * optional call-to-action button. Listings render one automatically when empty; use this component
 * to build custom empty screens.
 */
@Builder
public record EmptyState(
    String id,
    String icon,
    String title,
    String description,
    String actionId,
    String actionLabel,
    String style,
    String cssClasses)
    implements Component {}
