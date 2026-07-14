package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A grouped work queue rail (e.g. "Llegadas hoy" / "Salidas hoy"): vertical {@code groups} ({@link
 * QueueGroup}) of clickable cards ({@link QueueItem}). Clicking a card dispatches the
 * component-level {@code actionId} with {@code { "_item": id }} and visually selects it.
 * Design-system neutral, dark-mode aware.
 */
@Builder
public record TaskQueue(
    String id, String actionId, List<QueueGroup> groups, String style, String cssClasses)
    implements Component {}
