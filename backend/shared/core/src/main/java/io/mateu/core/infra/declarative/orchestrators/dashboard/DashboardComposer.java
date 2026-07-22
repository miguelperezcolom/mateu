package io.mateu.core.infra.declarative.orchestrators.dashboard;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.data.DashboardLayout;
import io.mateu.uidl.data.DashboardPanel;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.Scoreboard;
import io.mateu.uidl.fluent.Component;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import lombok.SneakyThrows;

/**
 * The {@link Dashboard} composition, extracted so it works over ANY instance declaring the same
 * field conventions: consecutive {@link MetricCard} fields group into a {@link Scoreboard} band,
 * {@code @Panel} component fields become titled {@link DashboardPanel} tiles, other component
 * fields land on the grid as-is. Used by the {@link Dashboard} archetype (subclassing) and by
 * page-level inference ({@code @AutoPage}) to render a plain class as a dashboard.
 */
public final class DashboardComposer {

  @SneakyThrows
  public static Component compose(Object host, String id, int columns) {
    List<Component> items = new ArrayList<>();
    List<MetricCard> pendingMetrics = new ArrayList<>();
    for (Field field : host.getClass().getDeclaredFields()) {
      if (Modifier.isStatic(field.getModifiers())) {
        continue;
      }
      field.setAccessible(true);
      Object value = field.get(host);
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
    return DashboardLayout.builder().id(id).columns(columns).items(items).build();
  }

  private static void flushMetrics(List<MetricCard> pendingMetrics, List<Component> items) {
    if (!pendingMetrics.isEmpty()) {
      items.add(Scoreboard.builder().metrics(List.copyOf(pendingMetrics)).build());
      pendingMetrics.clear();
    }
  }

  private DashboardComposer() {}
}
