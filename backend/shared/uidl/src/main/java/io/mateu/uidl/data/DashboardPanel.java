package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A titled tile inside a {@link DashboardLayout}. Wraps any component (a chart, a grid, a card…)
 * and can span several grid columns/rows via {@code colSpan}/{@code rowSpan}.
 */
@Builder
public record DashboardPanel(
    String id,
    String title,
    String subtitle,
    Component content,
    int colSpan,
    int rowSpan,
    String style,
    String cssClasses)
    implements Component {}
