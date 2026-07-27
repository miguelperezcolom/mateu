package io.mateu.uidl.data;

import lombok.Builder;

/**
 * One row of a {@link StatusList}: an {@code icon} (or an {@code avatar} — a short text like a
 * person's initials rendered inside a circular avatar, taking precedence over the icon), a {@code
 * title} plus muted {@code description}, and on the right an optional status chip ({@code status}
 * text with a badge-palette {@code statusColor}) and/or up to three small action buttons ({@code
 * actionLabel} + {@code actionId}, and optionally {@code actionLabel2}/{@code actionId2} and {@code
 * actionLabel3}/{@code actionId3} — e.g. "scan document" / "fill in manually" / "no show" on a
 * guest row), each dispatched with {@code { "_item": id }}.
 */
@Builder
public record StatusItem(
    String id,
    String icon,
    String avatar,
    String title,
    String description,
    String status,
    String statusColor,
    String actionLabel,
    String actionId,
    String actionLabel2,
    String actionId2,
    String actionLabel3,
    String actionId3) {}
