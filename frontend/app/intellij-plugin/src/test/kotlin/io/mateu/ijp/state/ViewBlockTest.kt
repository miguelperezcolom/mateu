package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase
import java.util.Locale

/** A blocking task covers the view that started it — and only until it ends or is moved away. */
class ViewBlockTest : TestCase() {

    private val json = ObjectMapper()

    private fun task(id: String, state: String = "running", blocking: Boolean = true, extra: String = "") =
        ProgressTasks.of(json.readTree("""{"taskId":"$id","title":"Import $id","state":"$state","blocking":$blocking $extra}"""))!!

    fun testABlockingTaskCoversTheViewAndABackgroundOneDoesNot() {
        val block = ViewBlock()
        assertFalse(block.observe(task("bg", blocking = false)))
        assertFalse(block.isBlocked)
        assertTrue(block.observe(task("t1")))
        assertTrue(block.isBlocked)
    }

    fun testTheOverlayFollowsTheTaskAndTellsWhatItOffers() {
        val block = ViewBlock()
        block.observe(task("t1", extra = ""","fraction":0.25,"done":3,"total":12,"cancellable":true,"backgroundable":true"""))
        val overlay = block.overlay(Locale.ENGLISH)!!
        assertEquals("Import t1", overlay.title)
        assertEquals("3 of 12", overlay.detail)
        assertEquals(0.25, overlay.fraction)
        assertTrue(overlay.cancellable)
        assertTrue(overlay.movable)

        assertTrue("an update repaints", block.observe(task("t1", extra = ""","fraction":0.5,"backgroundable":true""")))
        assertEquals(0.5, block.overlay()!!.fraction)
        assertFalse("the same update does not", block.observe(task("t1", extra = ""","fraction":0.5,"backgroundable":true""")))
    }

    fun testATaskWithoutBarIsIndeterminateAndOffersOnlyWhatItAllows() {
        val block = ViewBlock()
        block.observe(task("t1"))
        val overlay = block.overlay()!!
        assertNull(overlay.fraction)
        assertFalse(overlay.cancellable)
        assertFalse(overlay.movable)
    }

    fun testTheEndOfTheTaskFreesTheView() {
        for (end in listOf("done", "failed", "cancelled")) {
            val block = ViewBlock()
            block.observe(task("t1"))
            assertTrue(block.observe(task("t1", state = end)))
            assertFalse(block.isBlocked)
            assertNull(block.overlay())
        }
    }

    fun testMovingToTheBackgroundFreesTheViewForGood() {
        val block = ViewBlock()
        block.observe(task("t1", extra = ""","backgroundable":true"""))
        assertTrue(block.moveToBackground("t1"))
        assertFalse(block.isBlocked)
        assertFalse("later updates of the moved task do not cover it again", block.observe(task("t1", extra = ",\"backgroundable\":true,\"text\":\"Row 2\"")))
        assertFalse(block.isBlocked)
    }

    fun testATaskThatMayNotBeMovedStays() {
        val block = ViewBlock()
        block.observe(task("t1"))
        assertFalse(block.moveToBackground("t1"))
        assertTrue(block.isBlocked)
        assertFalse(block.moveToBackground("unknown"))
    }

    fun testTheEndOfTheStreamFreesTheViewEvenWhenTheTaskGoesOn() {
        val block = ViewBlock()
        block.observe(task("t1"))
        block.observe(task("t2"))
        assertTrue(block.release(listOf("t1")))
        assertTrue("t2 is still covering it", block.isBlocked)
        assertTrue(block.release(listOf("t2", "other")))
        assertFalse(block.isBlocked)
        assertFalse(block.release(listOf("t2")))
    }

    fun testARunningTaskOnlyStartsCoveringFromAStream() {
        val block = ViewBlock()
        assertFalse("nothing could end this block", block.observe(task("t1"), fromStream = false))
        assertFalse(block.isBlocked)
        block.observe(task("t2"))
        assertTrue("but a task already covering it is followed", block.observe(task("t2", extra = ",\"text\":\"x\""), fromStream = false))
        assertTrue(block.observe(task("t2", state = "cancelled"), fromStream = false))
        assertFalse(block.isBlocked)
    }

    fun testATaskTheServerTurnsIntoABackgroundOneReleasesTheView() {
        val block = ViewBlock()
        block.observe(task("t1"))
        assertTrue(block.observe(task("t1", blocking = false)))
        assertFalse(block.isBlocked)
    }

    fun testTheNewestBlockingTaskIsTheOneShown() {
        val block = ViewBlock()
        block.observe(task("t1"))
        block.observe(task("t2"))
        assertEquals("t2", block.overlay()!!.taskId)
        block.observe(task("t2", state = "done"))
        assertEquals("t1", block.overlay()!!.taskId)
    }

    fun testDataIsNeverLiveHtmlOnTheOverlay() {
        val block = ViewBlock()
        block.observe(ProgressTasks.of(json.readTree("""{"taskId":"t1","title":"<html><img src=x>","blocking":true}"""))!!)
        assertFalse(block.overlay()!!.title.contains("<img"))
    }
}
