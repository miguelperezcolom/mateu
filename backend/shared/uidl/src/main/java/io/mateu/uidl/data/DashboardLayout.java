package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A responsive grid of dashboard tiles ({@link Scoreboard}, {@link DashboardPanel}, {@link
 * MetricCard} or any other component). {@code columns} fixes the number of grid columns; 0 (the
 * default) lets the renderer pick a responsive column count.
 *
 * @deprecated (coherence-plan #9) Prefer {@link ResponsiveGrid} — {@code N} columns become {@code
 *     N} {@link GridTrack#fill()} tracks (0 → auto-fit), and the tiles carry their own {@code
 *     colSpans}. As of Phase 4 no archetype produces a {@code DashboardLayout} any more (the
 *     Dashboard and Welcome archetypes both compose a {@code ResponsiveGrid}); it is retained only
 *     for direct authoring and backward compatibility.
 */
@Deprecated(since = "3.0-alpha", forRemoval = false)
@Builder
public record DashboardLayout(
    String id, int columns, List<Component> items, String style, String cssClasses)
    implements Component {}
