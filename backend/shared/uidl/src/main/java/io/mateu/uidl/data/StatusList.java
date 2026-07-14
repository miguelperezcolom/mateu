package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A bordered list of rows with an icon, a title plus description, and a status chip and/or a small
 * action button on the right (see {@link StatusItem}) — incidents, side-effects checklists,
 * pending-tasks lists. An item's action dispatches its {@code actionId} with {@code { "_item": id
 * }}. Design-system neutral, dark-mode aware.
 */
@Builder
public record StatusList(String id, List<StatusItem> items, String style, String cssClasses)
    implements Component {}
