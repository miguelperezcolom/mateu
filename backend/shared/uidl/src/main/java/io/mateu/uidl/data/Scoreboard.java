package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A horizontal band of {@link MetricCard}s summarising essential status information, typically
 * placed at the top of a dashboard.
 */
@Builder
public record Scoreboard(String id, List<MetricCard> metrics, String style, String cssClasses)
    implements Component {}
