package io.mateu.mdd.demoadminpanel.infra.in.ui.datamanagement;

import io.mateu.core.infra.declarative.orchestrators.datamanagement.DataManagement;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.DrawerSize;
import io.mateu.uidl.data.Gantt;
import io.mateu.uidl.data.GanttTask;
import io.mateu.uidl.data.Grid;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Demo of the Redwood **Data management** template ({@link DataManagement}): the same project plan
 * shown two ways — a dense data grid and a Gantt timeline — with a toolbar switcher to flip between
 * them. Full width; the active view is kept in state and the page re-renders in place when you
 * switch.
 *
 * <p>The grid view is a real dense fluent {@link Grid}. Its first column is clickable
 * ({@code actionId="openRowDetail"}): a click dispatches the row to {@link #openRowDetail} which
 * opens a size-m detail {@link Drawer}. The clickable grid cell dispatches an {@code
 * action-requested} event whose {@code parameters} IS the whole row object (keyed by the column
 * ids — see the frontend {@code handleButtonColumnClick} in {@code menuColumnRenderer.ts}), so the
 * action reads the row's fields straight off {@code runActionRq().parameters()} (here {@code id}).
 */
@UI("/data-management-demo")
@Title("Plan del proyecto")
public class DataManagementDemo extends DataManagement {

  private record Row(String id, String name, LocalDate start, LocalDate end, int progress) {}

  /** Grid-cell row shape; field names match the {@link GridColumn} ids (id kept for the click). */
  private record GridRow(String id, String name, String start, String end, String progress) {}

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
    List<GridRow> rows = new ArrayList<>();
    for (Row r : ROWS) {
      rows.add(
          new GridRow(
              r.id(),
              r.name(),
              String.valueOf(r.start()),
              String.valueOf(r.end()),
              r.progress() + "%"));
    }
    return Grid.builder()
        .id("grid-view")
        .compact(true)
        .content(
            List.of(
                GridColumn.builder().id("name").label("Tarea").actionId("openRowDetail").build(),
                GridColumn.builder().id("start").label("Inicio").build(),
                GridColumn.builder().id("end").label("Fin").build(),
                GridColumn.builder().id("progress").label("%").build()))
        .page(new Page<Object>("", 20, 1, rows.size(), Arrays.asList(rows.toArray())))
        .build();
  }

  @Override
  protected Component ganttView(HttpRequest httpRequest) {
    List<GanttTask> tasks = new ArrayList<>();
    for (Row r : ROWS) {
      tasks.add(new GanttTask(r.id(), r.name(), r.start(), r.end(), r.progress(), null));
    }
    return Gantt.builder().id("gantt-view").tasks(tasks).build();
  }

  /**
   * Opens a detail drawer for the row whose "Tarea" cell was clicked. The clicked row travels as
   * the action parameters (the whole row map, keyed by column ids); we read its {@code id} to look
   * up the task.
   */
  @Action
  public Object openRowDetail(HttpRequest httpRequest) {
    Object clickedId = httpRequest.runActionRq().parameters().get("id");
    String id = clickedId != null ? String.valueOf(clickedId) : null;
    Row row =
        ROWS.stream().filter(r -> r.id().equals(id)).findFirst().orElse(ROWS.get(0));
    return Drawer.builder()
        .id("row-detail-drawer")
        .headerTitle(row.name())
        .subtitle("Detalle de la tarea")
        .size(DrawerSize.m)
        .content(
            new Text(
                "Inicio: "
                    + row.start()
                    + " · Fin: "
                    + row.end()
                    + " · Progreso: "
                    + row.progress()
                    + "%"))
        .build();
  }
}
