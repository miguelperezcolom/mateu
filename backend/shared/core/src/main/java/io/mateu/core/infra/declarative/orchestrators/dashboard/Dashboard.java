package io.mateu.core.infra.declarative.orchestrators.dashboard;

import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.data.DashboardPanel;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.Scoreboard;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Declarative dashboard landing page. Declare fields holding components and Mateu lays them out as
 * a dashboard grid:
 *
 * <ul>
 *   <li>Consecutive {@link MetricCard} fields are grouped into a {@link Scoreboard} band.
 *   <li>Component fields annotated with {@link Panel} are wrapped in a titled {@link
 *       DashboardPanel} tile (title defaults to the field label).
 *   <li>Any other component field is placed on the grid as-is.
 * </ul>
 *
 * Populate the fields in the constructor or field initializers (query your use cases / repositories
 * there). Override {@link #columns()} to fix the number of grid columns; the default (0) lets the
 * renderer pick a responsive count.
 */
public abstract class Dashboard implements ComponentTreeSupplier {

  /** Number of grid columns; 0 (default) means responsive auto-fit. */
  protected int columns() {
    return 0;
  }

  @Override
  public String style() {
    return null;
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    return DashboardComposer.compose(this, id(), columns());
  }
}
