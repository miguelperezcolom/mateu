package io.mateu.explorer.examples.components.gantt;

import io.mateu.uidl.data.Gantt;
import io.mateu.uidl.data.GanttTask;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.List;

/**
 * A Gantt whose bars are clickable: {@code onTaskSelectionActionId} names the method to run, and the
 * clicked task's id arrives in {@code _clickedTaskId}.
 */
public class ExhibitionPlan implements ComponentTreeSupplier {

  static final List<GanttTask> TASKS =
      List.of(
          new GanttTask("t1", "Select the works", LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 20), 100, null),
          new GanttTask("t2", "Negotiate the loans", LocalDate.of(2026, 10, 10), LocalDate.of(2026, 11, 15), 70, null),
          new GanttTask("t3", "Design the rooms", LocalDate.of(2026, 11, 1), LocalDate.of(2026, 11, 30), 30, "#7c3aed"),
          new GanttTask("t4", "Opening night", LocalDate.of(2026, 12, 18), LocalDate.of(2026, 12, 18), 0, "#dc2626"));

  @Override
  public Component component(HttpRequest httpRequest) {
    return Gantt.builder().tasks(TASKS).onTaskSelectionActionId("taskClicked").build();
  }

  public Message taskClicked(HttpRequest httpRequest) {
    var id = httpRequest.runActionRq().parameters().get("_clickedTaskId");
    var task = TASKS.stream().filter(t -> t.id().equals(id)).findFirst().orElseThrow();
    return new Message(task.title() + ": " + task.start() + " → " + task.end() + " (" + (int) task.progress() + "% done)");
  }
}
