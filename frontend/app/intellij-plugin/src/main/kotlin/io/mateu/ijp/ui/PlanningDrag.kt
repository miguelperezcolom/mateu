package io.mateu.ijp.ui

import java.time.LocalDate

/**
 * Pure planning-board drag → move computation (parity with the web `mateu-planning-board` and the RN
 * `planningDrag.ts`). Given a block's origin (resource lane + start-day index + duration) and a pixel
 * drag delta, work out the drop target (clamped to the board) and the move payload the backend
 * expects: `{_blockId, _resourceId, _start, _end}` (dates as yyyy-mm-dd), or null for a no-op drop.
 *
 * Side-effect-free, so it is unit-tested (PlanningDragTest) independently of the Swing canvas that
 * feeds it hit-test + geometry values.
 */
object PlanningDrag {

    data class Input(
        val blockId: String,
        /** Index of the block's current lane among the drop-targetable resources. */
        val originResourceIndex: Int,
        /** Day index of the block's start within the window (0 = window start). */
        val originStartIdx: Int,
        /** Inclusive day span (start..end). */
        val durationDays: Int,
        val deltaXpx: Int,
        val deltaYpx: Int,
        val dayWidthPx: Int,
        val laneHeightPx: Int,
        val resourceIds: List<String>,
        val windowFromIso: String,
        val dayCount: Int,
    )

    data class Move(val blockId: String, val resourceId: String, val start: String, val end: String)

    /** Add [days] to an ISO yyyy-mm-dd date, returning yyyy-mm-dd. */
    fun addDaysIso(iso: String, days: Int): String = LocalDate.parse(iso).plusDays(days.toLong()).toString()

    fun computeMove(i: Input): Move? {
        val dayShift = if (i.dayWidthPx > 0) Math.round(i.deltaXpx.toDouble() / i.dayWidthPx).toInt() else 0
        val laneShift = if (i.laneHeightPx > 0) Math.round(i.deltaYpx.toDouble() / i.laneHeightPx).toInt() else 0
        val maxStart = maxOf(0, i.dayCount - maxOf(1, i.durationDays))
        val targetStartIdx = (i.originStartIdx + dayShift).coerceIn(0, maxStart)
        val targetResourceIndex = (i.originResourceIndex + laneShift).coerceIn(0, maxOf(0, i.resourceIds.size - 1))
        // Dropped where it started → no move.
        if (targetStartIdx == i.originStartIdx && targetResourceIndex == i.originResourceIndex) return null
        val start = addDaysIso(i.windowFromIso, targetStartIdx)
        val end = addDaysIso(start, maxOf(1, i.durationDays) - 1)
        return Move(i.blockId, i.resourceIds[targetResourceIndex], start, end)
    }
}
