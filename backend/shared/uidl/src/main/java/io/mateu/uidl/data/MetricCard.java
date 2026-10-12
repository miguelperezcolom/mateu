package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A KPI tile for dashboards: a title, a prominent value, an optional trend indicator and an
 * optional drill-in action. Use inside a {@link Scoreboard} or a {@link DashboardLayout}.
 */
@Builder
public record MetricCard(
    String id,
    String title,
    String value,
    String unit,
    MetricTrend trend,
    String trendLabel,
    String icon,
    String description,
    String actionId,
    String style,
    String cssClasses,
    /**
     * The period the value covers ("Last 7 days", "This month", "Q3 2026"), shown under the value.
     * A number without its timeframe cannot be read; {@code null} shows nothing.
     */
    @Experimental("KPI timeframe (3.0-alpha.412)") String timeframe)
    implements Component {

  /** The 3.0-alpha.411 shape (no timeframe), kept so code compiled against it keeps linking. */
  public MetricCard(
      String id,
      String title,
      String value,
      String unit,
      MetricTrend trend,
      String trendLabel,
      String icon,
      String description,
      String actionId,
      String style,
      String cssClasses) {
    this(
        id,
        title,
        value,
        unit,
        trend,
        trendLabel,
        icon,
        description,
        actionId,
        style,
        cssClasses,
        null);
  }
}
