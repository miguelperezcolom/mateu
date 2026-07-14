package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A read-only calendar heatmap (GitHub-contributions style): one square per day, laid out in
 * week-columns, colored by intensity from 0 to the maximum value. Design-system neutral, dark-mode
 * aware, horizontally scrollable.
 */
@Builder
public record Heatmap(String id, List<HeatCell> cells, String style, String cssClasses)
    implements Component {}
