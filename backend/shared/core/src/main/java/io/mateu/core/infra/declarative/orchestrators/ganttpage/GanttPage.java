package io.mateu.core.infra.declarative.orchestrators.ganttpage;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.PageWidthStyle;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.DrawerSize;
import io.mateu.uidl.data.Gantt;
import io.mateu.uidl.data.GanttTask;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PageWidthSupplier;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Gantt page (the Oracle Redwood "Gantt page" template): a full-bleed scheduling canvas — a {@link
 * Gantt} tape chart of tasks across a shared time axis — laid out edge to edge, with an optional
 * detail panel docked below it (the Redwood bottom panel).
 *
 * <p>Extend it and implement {@link #tasks(HttpRequest)} to supply the bars; override {@link
 * #detail(HttpRequest)} to dock a component (a table, a card…) under the canvas. The page declares
 * {@link PageWidthStyle#EDGE_TO_EDGE} so the canvas uses the full width. Pure composition of
 * existing components, so it renders on every renderer without renderer work.
 */
public abstract class GanttPage implements ComponentTreeSupplier, PageWidthSupplier {

  @Override
  public PageWidthStyle pageWidth() {
    return PageWidthStyle.EDGE_TO_EDGE;
  }

  /** The bars of the scheduling canvas — one {@link GanttTask} per row. */
  protected abstract List<GanttTask> tasks(HttpRequest httpRequest);

  /**
   * An optional detail panel docked below the canvas (the Redwood bottom panel) — a table, card or
   * any component. {@code null} (default) means no detail panel.
   */
  protected Component detail(HttpRequest httpRequest) {
    return null;
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    List<Component> content = new ArrayList<>();
    content.add(
        Gantt.builder()
            .id("gantt")
            .tasks(tasks(httpRequest))
            .onTaskSelectionActionId("selectGanttTask")
            .build());
    Component detail = detail(httpRequest);
    if (detail != null) {
      content.add(Card.builder().id("gantt-detail").content(detail).build());
    }
    return VerticalLayout.builder()
        .id("gantt-page")
        .content(content)
        .fullWidth(true)
        .spacing(true)
        .build();
  }

  /**
   * Clicking a bar opens the selected task in a side {@link Drawer}. Reads the clicked task id from
   * the {@code _clickedTaskId} parameter, looks it up in {@link #tasks(HttpRequest)} and hands it
   * to {@link #taskDrawer(GanttTask, HttpRequest)}.
   */
  @Action
  public Object selectGanttTask(HttpRequest httpRequest) {
    Object clicked = httpRequest.runActionRq().parameters().get("_clickedTaskId");
    String taskId = clicked != null ? String.valueOf(clicked) : null;
    GanttTask task =
        tasks(httpRequest).stream()
            .filter(t -> Objects.equals(t.id(), taskId))
            .findFirst()
            .orElse(null);
    if (task == null) {
      return this;
    }
    return taskDrawer(task, httpRequest);
  }

  /**
   * The drawer opened when a task bar is clicked — a side General Drawer with the task title and
   * {@link #taskDetail(GanttTask, HttpRequest)} as content. Override to customise (size, position,
   * peer navigation…).
   */
  protected Drawer taskDrawer(GanttTask task, HttpRequest httpRequest) {
    return Drawer.builder()
        .id("gantt-task-drawer")
        .headerTitle(task.title())
        .size(DrawerSize.m)
        .content(taskDetail(task, httpRequest))
        .build();
  }

  /**
   * The content shown for a clicked task inside {@link #taskDrawer}. Defaults to the task's dates
   * and progress; override to show a richer detail (a form, a table…).
   */
  protected Component taskDetail(GanttTask task, HttpRequest httpRequest) {
    String line =
        task.start() + " → " + task.end() + " · " + Math.round(task.progress()) + "% completado";
    return new Text(line);
  }

  /**
   * Edge-to-edge: no centered max-width cap (overrides the default ComponentTreeSupplier style).
   */
  @Override
  public String style() {
    return null;
  }
}
