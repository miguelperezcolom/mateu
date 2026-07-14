package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A read-only kanban board: columns of cards. Cards may carry an {@code actionId} so clicking one
 * dispatches the standard {@code action-requested} event. Design-system neutral (rendered with Lumo
 * CSS vars + fallbacks), so every renderer that claims the type shows it.
 */
@Builder
public record Kanban(String id, List<KanbanColumn> columns, String style, String cssClasses)
    implements Component {}
