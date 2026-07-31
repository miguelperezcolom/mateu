package io.mateu.mdd.demoadminpanel.infra.in.ui.ganttpage;

import io.mateu.core.infra.declarative.orchestrators.ganttpage.GanttPage;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.GanttTask;
import io.mateu.uidl.data.Grid;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * Demo of the Redwood **Gantt page** template ({@link GanttPage}): a full-bleed scheduling canvas
 * — the project's tasks on a shared time axis, laid out edge to edge — with a detail panel docked
 * below the canvas AND a PERSISTENT bottom drawer of supporting data.
 *
 * <p>The bottom drawer ({@link #bottomPanel}) is a dense fluent {@link Grid} of the five tasks; it
 * stays docked (collapsible, modeless) while clicking a bar opens the side task drawer over the
 * canvas — so both drawers coexist, exactly as the Redwood Gantt page does.
 */
@UI("/gantt-page-demo")
@Title("Plan del proyecto")
public class GanttPageDemo extends GanttPage {

  /** One row of the bottom-drawer grid; field names match the {@link GridColumn} ids. */
  private record TaskRow(String name, String start, String end, String progress) {}

  @Override
  protected List<GanttTask> tasks(HttpRequest httpRequest) {
    return List.of(
        new GanttTask("t1", "Análisis", LocalDate.of(2026, 1, 5), LocalDate.of(2026, 1, 16), 100, null),
        new GanttTask("t2", "Diseño", LocalDate.of(2026, 1, 12), LocalDate.of(2026, 1, 30), 80, null),
        new GanttTask("t3", "Desarrollo", LocalDate.of(2026, 1, 26), LocalDate.of(2026, 3, 6), 45, null),
        new GanttTask("t4", "Pruebas", LocalDate.of(2026, 3, 2), LocalDate.of(2026, 3, 20), 10, null),
        new GanttTask("t5", "Despliegue", LocalDate.of(2026, 3, 18), LocalDate.of(2026, 3, 27), 0, null));
  }

  @Override
  protected Component detail(HttpRequest httpRequest) {
    return new Text(
        "5 tareas · del 5 de enero al 27 de marzo de 2026. Panel de detalle acoplado bajo el "
            + "canvas Gantt (el panel inferior del template Redwood).");
  }

  @Override
  protected String bottomPanelTitle() {
    return "Tareas";
  }

  @Override
  protected Component bottomPanel(HttpRequest httpRequest) {
    List<TaskRow> rows =
        tasks(httpRequest).stream()
            .map(
                t ->
                    new TaskRow(
                        t.title(),
                        String.valueOf(t.start()),
                        String.valueOf(t.end()),
                        Math.round(t.progress()) + "%"))
            .toList();
    return Grid.builder()
        .compact(true)
        .content(
            List.of(
                GridColumn.builder().id("name").label("Tarea").build(),
                GridColumn.builder().id("start").label("Inicio").build(),
                GridColumn.builder().id("end").label("Fin").build(),
                GridColumn.builder().id("progress").label("%").build()))
        .page(new Page<Object>("", 20, 1, rows.size(), Arrays.asList(rows.toArray())))
        .build();
  }
}
