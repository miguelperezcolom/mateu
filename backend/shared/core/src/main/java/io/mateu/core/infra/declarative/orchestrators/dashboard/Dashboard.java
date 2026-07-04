package io.mateu.core.infra.declarative.orchestrators.dashboard;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.data.DashboardLayout;
import io.mateu.uidl.data.DashboardPanel;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.Scoreboard;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import lombok.SneakyThrows;

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
  @SneakyThrows
  public Component component(HttpRequest httpRequest) {
    List<Component> items = new ArrayList<>();
    List<MetricCard> pendingMetrics = new ArrayList<>();
    for (Field field : getClass().getDeclaredFields()) {
      if (Modifier.isStatic(field.getModifiers())) {
        continue;
      }
      field.setAccessible(true);
      Object value = field.get(this);
      if (value instanceof MetricCard metricCard) {
        pendingMetrics.add(metricCard);
        continue;
      }
      flushMetrics(pendingMetrics, items);
      if (!(value instanceof Component component)) {
        continue;
      }
      Panel panel = MetaAnnotations.find(field, Panel.class);
      if (panel != null) {
        items.add(
            DashboardPanel.builder()
                .id(field.getName())
                .title(!panel.title().isEmpty() ? panel.title() : getLabel(field))
                .subtitle(!panel.subtitle().isEmpty() ? panel.subtitle() : null)
                .colSpan(panel.colSpan())
                .rowSpan(panel.rowSpan())
                .content(component)
                .build());
      } else {
        items.add(component);
      }
    }
    flushMetrics(pendingMetrics, items);
    return DashboardLayout.builder().id(id()).columns(columns()).items(items).build();
  }

  private void flushMetrics(List<MetricCard> pendingMetrics, List<Component> items) {
    if (!pendingMetrics.isEmpty()) {
      items.add(Scoreboard.builder().metrics(List.copyOf(pendingMetrics)).build());
      pendingMetrics.clear();
    }
  }
}
