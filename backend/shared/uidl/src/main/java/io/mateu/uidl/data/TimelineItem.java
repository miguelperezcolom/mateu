package io.mateu.uidl.data;

import lombok.Builder;

/**
 * One entry on a {@link Timeline}: {@code timestamp} is a free-form label (e.g. "2h ago", "Mar 3
 * 14:20"); {@code icon} is an emoji shown in the rail dot; {@code color} tints the dot; {@code
 * actionId} — when set — makes the entry clickable.
 */
@Builder
public record TimelineItem(
    String id,
    String title,
    String description,
    String timestamp,
    String icon,
    String color,
    String actionId) {}
