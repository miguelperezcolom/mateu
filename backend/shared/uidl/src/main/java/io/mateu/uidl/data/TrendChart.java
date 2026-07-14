package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A read-only lightweight line/area chart: a single series of {@code values} plotted as an SVG line
 * (optionally area-filled), with optional x-axis {@code labels}, min/max markers and a hover
 * tooltip. Dependency-free — for rich multi-series charts use the {@code Chart} component.
 * Design-system neutral, dark-mode aware.
 */
@Builder
public record TrendChart(
    String id,
    String title,
    List<Double> values,
    List<String> labels,
    String color,
    boolean area,
    String style,
    String cssClasses)
    implements Component {}
