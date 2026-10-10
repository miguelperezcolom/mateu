package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import java.util.Map;
import lombok.Builder;

/**
 * A place to DROP dragged listing rows (a listing marked {@code @DragRows(type)}): a titled area —
 * a card, a column, an item of a list of destinations — wrapping any {@code content}. When rows of
 * the {@code accept}ed type are dropped on it, it runs {@code actionId} with its {@code parameters}
 * plus {@code _draggedIds} (the dragged rows' ids) and {@code _dragType}: the action knows the
 * origin and the destination.
 */
@Builder
public record DropZone(
    String id,
    String accept,
    String actionId,
    Map<String, Object> parameters,
    String title,
    String subtitle,
    List<Component> content,
    String style,
    String cssClasses)
    implements Component {}
