package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A checklist with a progress bar: a list of {@link ChecklistItem}s (done/undone) and a header
 * showing how many are complete. Toggling an item with an {@code actionId} dispatches the standard
 * {@code action-requested} event so a developer method can persist it. Design-system neutral,
 * dark-mode aware.
 */
@Builder
public record Checklist(
    String id, String title, List<ChecklistItem> items, String style, String cssClasses)
    implements Component {}
