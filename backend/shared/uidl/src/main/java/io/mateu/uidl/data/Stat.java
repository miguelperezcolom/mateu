package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A compact KPI stat: a label, a big value (with optional unit), a delta with a trend direction
 * ({@code "up"} / {@code "down"} / {@code "flat"}) and an inline sparkline drawn from {@code
 * spark}. An {@code actionId} makes the whole tile clickable (drill-in). Design-system neutral,
 * dark-mode aware. Complements {@code MetricCard} — this one adds the trend sparkline.
 */
@Builder
public record Stat(
    String id,
    String label,
    String value,
    String unit,
    String delta,
    String trend,
    List<Double> spark,
    String actionId,
    String style,
    String cssClasses)
    implements Component {}
