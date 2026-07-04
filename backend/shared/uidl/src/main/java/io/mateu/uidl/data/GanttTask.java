package io.mateu.uidl.data;

import java.time.LocalDate;
import lombok.Builder;

/** One bar of a {@link Gantt}: a task with a date span, optional progress and color. */
@Builder
public record GanttTask(
    String id, String title, LocalDate start, LocalDate end, double progress, String color) {}
