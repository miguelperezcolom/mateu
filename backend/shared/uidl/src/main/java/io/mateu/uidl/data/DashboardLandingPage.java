package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.FormTemplate;
import java.util.Collections;
import java.util.List;
import lombok.Builder;
import lombok.Singular;

/**
 * Redwood's Dashboard landing page template (Spectra {@code oj-sp-dashboard-landing-page}): a
 * scoreboard of key metrics over the page's panels. Its slot is the template's {@code kpi} — the
 * scoreboard's {@link MetricCard}s, in order —, and the {@link io.mateu.uidl.fluent.Form} that
 * carries it gives the rest: its title, subtitle, timestamp and toolbar are the page header's, and
 * its {@code content} is the dashboard's main area, typically one {@link DashboardPanel} per chart
 * or list.
 */
@Experimental("page templates (3.0 beta)")
@Builder
public record DashboardLandingPage(@Singular("kpiItem") List<Component> kpi)
    implements FormTemplate {

  public DashboardLandingPage {
    kpi = kpi != null ? kpi : Collections.emptyList();
  }
}
