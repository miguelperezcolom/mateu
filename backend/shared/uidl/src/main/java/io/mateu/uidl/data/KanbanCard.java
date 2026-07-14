package io.mateu.uidl.data;

import lombok.Builder;

/**
 * One card on a {@link Kanban} board. {@code badge} is a small chip (e.g. a tag or estimate);
 * {@code color} tints the card's left border; {@code actionId} — when set — makes the card
 * clickable, dispatching the standard {@code action-requested} event.
 */
@Builder
public record KanbanCard(
    String id, String title, String description, String badge, String color, String actionId) {}
