package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

/** One column of a {@link Kanban} board: a title, an optional accent color, and its cards. */
@Builder
public record KanbanColumn(String id, String title, String color, List<KanbanCard> cards) {}
