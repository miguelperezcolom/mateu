// The day-based layout shared by the Gantt and the planning board (DisplayRenderer.tsx,
// PlanningBoardRenderer.tsx): which days are on screen, where each bar/block sits in pixels, the
// month ticks and the today marker. Pure TypeScript, tested by node's runner; the .tsx draw it.
import type { GanttTask, PlanningBlock, PlanningResource } from '../api/metadata.ts';

export const DAY_MS = 86400000;

/** An ISO date (YYYY-MM-DD) as a UTC day number; null when absent or unparseable. */
export const parseDay = (s?: string): number | null => {
  if (!s) return null;
  const t = Date.parse(`${s}T00:00:00Z`);
  return isNaN(t) ? null : Math.floor(t / DAY_MS);
};

export const todayDayNumber = (now: number = Date.now()): number => Math.floor(now / DAY_MS);

/** The x offset of today's marker, or null when today is outside the window. */
export function todayOffset(todayDay: number, minDay: number, maxDay: number, dayW: number): number | null {
  return todayDay >= minDay && todayDay <= maxDay ? (todayDay - minDay) * dayW : null;
}

export type BoardRow =
  | { kind: 'group'; label: string }
  | { kind: 'resource'; resource: PlanningResource };

/** Resources in declaration order, with a swimlane caption row wherever `group` changes. */
export function planningRows(resources: PlanningResource[]): BoardRow[] {
  const rows: BoardRow[] = [];
  let lastGroup: string | undefined;
  for (const resource of resources) {
    const group = resource.group ?? '';
    if (group && group !== lastGroup) rows.push({ kind: 'group', label: group });
    lastGroup = group;
    rows.push({ kind: 'resource', resource });
  }
  return rows;
}

/** The board's day window: from/to on the wire, falling back to the blocks' min/max dates; null
 *  when there is nothing to draw (the renderer shows its empty state). */
export function planningWindow(
  blocks: PlanningBlock[],
  from?: string,
  to?: string,
): { minDay: number; maxDay: number; totalDays: number } | null {
  const blockDays = blocks
    .flatMap((b) => [parseDay(b.start), parseDay(b.end)])
    .filter((d): d is number => d != null);
  const minDay = parseDay(from) ?? (blockDays.length > 0 ? Math.min(...blockDays) : null);
  const maxDay = parseDay(to) ?? (blockDays.length > 0 ? Math.max(...blockDays) : null);
  if (minDay == null || maxDay == null || maxDay < minDay) return null;
  return { minDay, maxDay, totalDays: maxDay - minDay + 1 };
}

/** A resource's blocks clamped to the visible window (start/end inclusive), at least a day wide. */
export function laneBlocks(
  blocks: PlanningBlock[],
  resourceId: string | undefined,
  minDay: number,
  maxDay: number,
  dayW: number,
): { block: PlanningBlock; left: number; width: number }[] {
  return blocks
    .map((block) => {
      if (block.resourceId !== resourceId) return null;
      const start = parseDay(block.start);
      const end = parseDay(block.end);
      if (start == null || end == null || end < minDay || start > maxDay) return null;
      const first = Math.max(start, minDay);
      const last = Math.min(end, maxDay);
      return { block, left: (first - minDay) * dayW, width: Math.max(dayW, (last - first + 1) * dayW) };
    })
    .filter((b): b is { block: PlanningBlock; left: number; width: number } => b != null);
}

export interface GanttLayout {
  tasks: GanttTask[];
  minDay: number;
  maxDay: number;
  dayW: number;
  laneW: number;
  months: { label: string; left: number }[];
  bars: { task: GanttTask; left: number; width: number; progress: number }[];
}

/** The Gantt's layout: tasks without both dates are dropped; the day width fits ~560px between
 *  4 and 16 px; a month tick wherever a month starts inside the range. Null = "No tasks.". */
export function ganttLayout(all: GanttTask[]): GanttLayout | null {
  const tasks = all.filter((t) => parseDay(t.start) != null && parseDay(t.end) != null);
  if (tasks.length === 0) return null;
  const minDay = Math.min(...tasks.map((t) => parseDay(t.start)!));
  const maxDay = Math.max(...tasks.map((t) => parseDay(t.end)!));
  const totalDays = Math.max(1, maxDay - minDay + 1);
  const dayW = Math.max(4, Math.min(16, Math.round(560 / totalDays)));
  const months: { label: string; left: number }[] = [];
  const cursor = new Date(minDay * DAY_MS);
  cursor.setUTCDate(1);
  while (Math.floor(cursor.getTime() / DAY_MS) <= maxDay) {
    const day = Math.floor(cursor.getTime() / DAY_MS);
    if (day >= minDay) months.push({ label: cursor.toISOString().slice(0, 7), left: (day - minDay) * dayW });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  const bars = tasks.map((task) => {
    const start = parseDay(task.start)!;
    const end = parseDay(task.end)!;
    return {
      task,
      left: (start - minDay) * dayW,
      width: Math.max(dayW, (end - start + 1) * dayW),
      progress: Math.max(0, Math.min(100, task.progress ?? 0)),
    };
  });
  return { tasks, minDay, maxDay, dayW, laneW: totalDays * dayW, months, bars };
}
