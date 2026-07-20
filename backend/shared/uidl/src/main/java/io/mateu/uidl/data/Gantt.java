package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A Gantt/timeline chart: one row per {@link GanttTask}, bars spanning the task's dates on a shared
 * time axis, with per-task progress and a today marker.
 */
@Builder
public record Gantt(
    String id,
    List<GanttTask> tasks,
    /**
     * When set, clicking a bar dispatches this action carrying the clicked task id as the {@code
     * _clickedTaskId} parameter (the interactive Gantt-page selection). {@code null} = read-only.
     */
    String onTaskSelectionActionId,
    String style,
    String cssClasses)
    implements Component {}
