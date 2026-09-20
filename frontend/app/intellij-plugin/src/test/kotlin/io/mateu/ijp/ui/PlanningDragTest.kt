package io.mateu.ijp.ui

import junit.framework.TestCase

/** Unit tests for the pure planning-board drag → move computation (mirrors the RN planningDrag tests). */
class PlanningDragTest : TestCase() {

    private fun base() = PlanningDrag.Input(
        blockId = "b1",
        originResourceIndex = 1,
        originStartIdx = 2,
        durationDays = 3,
        deltaXpx = 0,
        deltaYpx = 0,
        dayWidthPx = 40,
        laneHeightPx = 48,
        resourceIds = listOf("r0", "r1", "r2"),
        windowFromIso = "2026-03-01",
        dayCount = 10,
    )

    fun testAddDaysIsoRollsOverMonths() {
        assertEquals("2026-03-04", PlanningDrag.addDaysIso("2026-03-01", 3))
        assertEquals("2026-04-02", PlanningDrag.addDaysIso("2026-03-30", 3))
        assertEquals("2026-03-04", PlanningDrag.addDaysIso("2026-03-04", 0))
    }

    fun testNoOpDropReturnsNull() {
        assertNull(PlanningDrag.computeMove(base()))
        // a sub-half-day / sub-half-lane jiggle rounds back to origin → still no-op
        assertNull(PlanningDrag.computeMove(base().copy(deltaXpx = 15, deltaYpx = 10)))
    }

    fun testDragRightShiftsStartAndEndKeepingResource() {
        val m = PlanningDrag.computeMove(base().copy(deltaXpx = 80))!! // 80 / 40 = +2 days
        assertEquals("b1", m.blockId)
        assertEquals("r1", m.resourceId)
        assertEquals("2026-03-05", m.start)
        assertEquals("2026-03-07", m.end)
    }

    fun testDragDownRetargetsResource() {
        val m = PlanningDrag.computeMove(base().copy(deltaYpx = 48))!! // +1 lane → r2
        assertEquals("r2", m.resourceId)
        assertEquals("2026-03-03", m.start) // start unchanged
    }

    fun testClampsToBoardStartAndFirstLane() {
        val m = PlanningDrag.computeMove(base().copy(deltaXpx = -400, deltaYpx = -400))!!
        assertEquals("2026-03-01", m.start) // clamped to window start
        assertEquals("r0", m.resourceId) // clamped to the first lane
    }

    fun testClampsEndWithinWindow() {
        val m = PlanningDrag.computeMove(base().copy(deltaXpx = 4000))!!
        // maxStart = dayCount(10) - duration(3) = 7 → start 2026-03-08, end 2026-03-10
        assertEquals("2026-03-08", m.start)
        assertEquals("2026-03-10", m.end)
    }
}
