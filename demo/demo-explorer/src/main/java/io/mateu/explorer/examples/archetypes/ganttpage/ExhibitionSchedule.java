package io.mateu.explorer.examples.archetypes.ganttpage;

import io.mateu.core.infra.declarative.orchestrators.ganttpage.GanttPage;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.GanttTask;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.List;

/**
 * The {@code GanttPage} archetype: a full-bleed scheduling canvas with a detail panel docked under
 * it. A click on a bar opens a side drawer with the task ({@code taskDetail} is overridable).
 */
@Title("Exhibition schedule")
public class ExhibitionSchedule extends GanttPage {

  @Override
  protected List<GanttTask> tasks(HttpRequest httpRequest) {
    return List.of(
        new GanttTask("t1", "Research & loans", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 10, 15), 100, null),
        new GanttTask("t2", "Catalogue", LocalDate.of(2026, 10, 1), LocalDate.of(2026, 11, 30), 70, null),
        new GanttTask("t3", "Gallery build", LocalDate.of(2026, 11, 15), LocalDate.of(2026, 12, 20), 30, "#2c6e8f"),
        new GanttTask("t4", "Installation", LocalDate.of(2026, 12, 15), LocalDate.of(2027, 1, 10), 0, "#7b3f8c"));
  }

  @Override
  protected Component detail(HttpRequest httpRequest) {
    return new Text("Impressions of light · opens 12 January 2027 · click a bar for its details.");
  }

  @Override
  protected Component taskDetail(GanttTask task, HttpRequest httpRequest) {
    return new Text(task.title() + ": " + task.start() + " → " + task.end() + " · " + Math.round(task.progress()) + "% done");
  }
}
