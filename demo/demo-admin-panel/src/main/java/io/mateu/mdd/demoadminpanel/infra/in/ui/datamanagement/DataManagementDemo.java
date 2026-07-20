package io.mateu.mdd.demoadminpanel.infra.in.ui.datamanagement;

import io.mateu.core.infra.declarative.orchestrators.datamanagement.DataManagement;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Gantt;
import io.mateu.uidl.data.GanttTask;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Demo of the Redwood **Data management** template ({@link DataManagement}): the same project plan
 * shown two ways — a data grid and a Gantt timeline — with a toolbar switcher to flip between them.
 * Full width; the active view is kept in state and the page re-renders in place when you switch.
 */
@UI("/data-management-demo")
@Title("Plan del proyecto")
public class DataManagementDemo extends DataManagement {

  private record Row(String id, String name, LocalDate start, LocalDate end, int progress) {}

  private static final List<Row> ROWS =
      List.of(
          new Row("t1", "Análisis", LocalDate.of(2026, 1, 5), LocalDate.of(2026, 1, 16), 100),
          new Row("t2", "Diseño", LocalDate.of(2026, 1, 12), LocalDate.of(2026, 1, 30), 80),
          new Row("t3", "Desarrollo", LocalDate.of(2026, 1, 26), LocalDate.of(2026, 3, 6), 45),
          new Row("t4", "Pruebas", LocalDate.of(2026, 3, 2), LocalDate.of(2026, 3, 20), 10),
          new Row("t5", "Despliegue", LocalDate.of(2026, 3, 18), LocalDate.of(2026, 3, 27), 0));

  @Override
  protected String gridLabel() {
    return "Tabla";
  }

  @Override
  protected Component gridView(HttpRequest httpRequest) {
    List<Component> lines = new ArrayList<>();
    for (Row r : ROWS) {
      lines.add(
          new Text(r.name() + "  ·  " + r.start() + " → " + r.end() + "  ·  " + r.progress() + "%"));
    }
    return VerticalLayout.builder().id("grid-view").content(lines).build();
  }

  @Override
  protected Component ganttView(HttpRequest httpRequest) {
    List<GanttTask> tasks = new ArrayList<>();
    for (Row r : ROWS) {
      tasks.add(new GanttTask(r.id(), r.name(), r.start(), r.end(), r.progress(), null));
    }
    return Gantt.builder().id("gantt-view").tasks(tasks).build();
  }
}
