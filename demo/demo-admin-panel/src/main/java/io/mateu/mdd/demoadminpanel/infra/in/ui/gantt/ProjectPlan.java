package io.mateu.mdd.demoadminpanel.infra.in.ui.gantt;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Gantt;
import io.mateu.uidl.data.GanttTask;
import io.mateu.uidl.fluent.Component;
import java.time.LocalDate;
import java.util.List;

/** Demo of the {@link Gantt} component: a project schedule with progress and a today marker. */
@UI("/gantt-demo")
@Title("Website relaunch plan")
public class ProjectPlan {

  @Section("Schedule")
  Component plan =
      Gantt.builder()
          .tasks(
              List.of(
                  GanttTask.builder()
                      .title("Discovery & research")
                      .start(LocalDate.of(2026, 6, 1))
                      .end(LocalDate.of(2026, 6, 12))
                      .progress(100)
                      .build(),
                  GanttTask.builder()
                      .title("Information architecture")
                      .start(LocalDate.of(2026, 6, 10))
                      .end(LocalDate.of(2026, 6, 24))
                      .progress(100)
                      .build(),
                  GanttTask.builder()
                      .title("Visual design")
                      .start(LocalDate.of(2026, 6, 22))
                      .end(LocalDate.of(2026, 7, 10))
                      .progress(70)
                      .build(),
                  GanttTask.builder()
                      .title("Implementation")
                      .start(LocalDate.of(2026, 7, 1))
                      .end(LocalDate.of(2026, 8, 14))
                      .progress(25)
                      .build(),
                  GanttTask.builder()
                      .title("Content migration")
                      .start(LocalDate.of(2026, 7, 20))
                      .end(LocalDate.of(2026, 8, 21))
                      .progress(0)
                      .color("#f59e0b")
                      .build(),
                  GanttTask.builder()
                      .title("QA & launch")
                      .start(LocalDate.of(2026, 8, 17))
                      .end(LocalDate.of(2026, 8, 31))
                      .progress(0)
                      .color("#10b981")
                      .build()))
          .build();
}
