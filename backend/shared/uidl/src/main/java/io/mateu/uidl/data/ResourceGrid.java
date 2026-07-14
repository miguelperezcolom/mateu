package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * An availability/selection grid (e.g. a room picker): a CSS grid of {@link ResourceItem} cards
 * with a fixed {@code columns} count (0/absent → responsive auto-fill). A {@code recommended} item
 * shows the floating {@code recommendedLabel} mini-tag (default {@code "Recommended"}). Clicking an
 * enabled item dispatches {@code actionId} with {@code { "_item": id }}. Design-system neutral,
 * dark-mode aware.
 */
@Builder
public record ResourceGrid(
    String id,
    String actionId,
    int columns,
    String recommendedLabel,
    List<ResourceItem> items,
    String style,
    String cssClasses)
    implements Component {}
