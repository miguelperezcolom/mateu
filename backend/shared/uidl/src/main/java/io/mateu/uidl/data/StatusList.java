package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A bordered list of rows with an icon, a title plus description, and a status chip and/or a small
 * action button on the right (see {@link StatusItem}) — incidents, side-effects checklists,
 * pending-tasks lists. An item's action dispatches its {@code actionId} with {@code { "_item": id
 * }}. {@code compact} tightens the row padding for dense screens; {@code frameless} keeps the
 * divider lines between rows but drops the outer border — for lists already framed by their host
 * (e.g. inside a section card). {@code rowActionId} makes every ROW clickable (search results, pick
 * lists): clicking one dispatches that action with {@code { "_item": id }}. Design-system neutral,
 * dark-mode aware.
 */
@Builder
public record StatusList(
    String id,
    List<StatusItem> items,
    boolean compact,
    boolean frameless,
    String rowActionId,
    String style,
    String cssClasses)
    implements Component {}
