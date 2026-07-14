package io.mateu.uidl.data;

import lombok.Builder;

/**
 * One row of a {@link StatusList}: an {@code icon}, a {@code title} plus muted {@code description},
 * and on the right an optional status chip ({@code status} text with a badge-palette {@code
 * statusColor}) and/or a small action button ({@code actionLabel} + {@code actionId}, dispatched
 * with {@code { "_item": id }}).
 */
@Builder
public record StatusItem(
    String id,
    String icon,
    String title,
    String description,
    String status,
    String statusColor,
    String actionLabel,
    String actionId) {}
