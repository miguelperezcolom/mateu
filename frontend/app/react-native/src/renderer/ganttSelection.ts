/**
 * What selecting a gantt task runs: the chart's `onTaskSelectionActionId` with the task id as
 * `_clickedTaskId` (the GanttPage opens that task's drawer), or nothing on a read-only chart.
 */
export const ganttSelection = (
  onTaskSelectionActionId: string | undefined | null,
  taskId: string | undefined | null,
): { actionId: string; parameters: { _clickedTaskId: string } } | null =>
  onTaskSelectionActionId && taskId
    ? { actionId: onTaskSelectionActionId, parameters: { _clickedTaskId: taskId } }
    : null;
