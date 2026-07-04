package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A responsive grid of dashboard tiles ({@link Scoreboard}, {@link DashboardPanel}, {@link
 * MetricCard} or any other component). {@code columns} fixes the number of grid columns; 0 (the
 * default) lets the renderer pick a responsive column count.
 */
@Builder
public record DashboardLayout(
    String id, int columns, List<Component> items, String style, String cssClasses)
    implements Component {}
