package io.mateu.uidl.data;

import lombok.Builder;

/**
 * One cell of a {@link ResourceGrid}: a big {@code title} (e.g. the room number), a muted {@code
 * subtitle}, a status chip ({@code statusLabel} + badge-palette {@code statusColor}), an optional
 * {@code note} line with a colored dot ({@code noteColor}), and the {@code disabled} (reduced
 * opacity, not clickable), {@code recommended} (accent border + floating tag) and {@code selected}
 * (accent border + tint) flags. Clicking an enabled cell dispatches the grid-level actionId with
 * {@code { "_item": id }}.
 */
@Builder
public record ResourceItem(
    String id,
    String title,
    String subtitle,
    String statusLabel,
    String statusColor,
    String note,
    String noteColor,
    boolean disabled,
    boolean recommended,
    boolean selected) {}
