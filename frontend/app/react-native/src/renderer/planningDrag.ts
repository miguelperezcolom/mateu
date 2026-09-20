/**
 * Pure planning-board drag → move computation (parity with the web `mateu-planning-board` drag).
 * Given a block's origin (resource lane + start-day index + duration) and a pixel drag delta, work
 * out the drop target (clamped to the board) and the resulting move payload the backend expects:
 * `{ _blockId, _resourceId, _start, _end }` (dates as yyyy-mm-dd), or null for a no-op drop.
 *
 * Renderer-neutral and side-effect-free, so it is unit-tested (planningDrag.test.ts) independently
 * of the RN gesture layer that feeds it.
 */
export interface PlanningMoveInput {
  blockId: string;
  /** Index of the block's current resource lane among the drop-targetable resources. */
  originResourceIndex: number;
  /** Day index of the block's start within the board window (0 = window start). */
  originStartIdx: number;
  /** Inclusive day span of the block (start..end). */
  durationDays: number;
  deltaXpx: number;
  deltaYpx: number;
  dayWidthPx: number;
  laneHeightPx: number;
  /** Ordered resource ids of the drop-targetable lanes. */
  resourceIds: string[];
  /** The board window's first day (yyyy-mm-dd). */
  windowFromIso: string;
  /** Number of day columns in the window. */
  dayCount: number;
}

export interface PlanningMove {
  _blockId: string;
  _resourceId: string;
  _start: string;
  _end: string;
}

const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, n));

/** Add `days` to an ISO yyyy-mm-dd date, returning yyyy-mm-dd. UTC math → deterministic. */
export const addDaysIso = (iso: string, days: number): string => {
  const [y, m, d] = iso.split('-').map((s) => parseInt(s, 10));
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
};

export const computePlanningMove = (i: PlanningMoveInput): PlanningMove | null => {
  const dayShift = i.dayWidthPx > 0 ? Math.round(i.deltaXpx / i.dayWidthPx) : 0;
  const laneShift = i.laneHeightPx > 0 ? Math.round(i.deltaYpx / i.laneHeightPx) : 0;
  const maxStart = Math.max(0, i.dayCount - Math.max(1, i.durationDays));
  const targetStartIdx = clamp(i.originStartIdx + dayShift, 0, maxStart);
  const targetResourceIndex = clamp(
    i.originResourceIndex + laneShift,
    0,
    Math.max(0, i.resourceIds.length - 1),
  );
  // Dropped where it started → no move.
  if (targetStartIdx === i.originStartIdx && targetResourceIndex === i.originResourceIndex) return null;
  const start = addDaysIso(i.windowFromIso, targetStartIdx);
  const end = addDaysIso(start, Math.max(1, i.durationDays) - 1);
  return { _blockId: i.blockId, _resourceId: i.resourceIds[targetResourceIndex], _start: start, _end: end };
};
