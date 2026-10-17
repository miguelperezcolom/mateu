package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** A LongTask's progress dialog: opened from its initialData, moved by the state steps aimed at it. */
class OverlayStateTest : TestCase() {

    private val json = ObjectMapper()

    private val meta = json.readTree(
        """{"type": "Dialog", "id": "p1", "headerTitle": "${'$'}{state.title}",
            "initialData": {"title": "Processing", "progressValue": 0.0, "progressText": "Starting"}}""",
    )

    fun testTheDialogOpensWithItsInitialDataAndAnInterpolatedTitle() {
        val state = OverlayState.seed(json.nullNode(), meta)
        assertEquals("Starting", state.path("progressText").asText())
        assertEquals("Processing", OverlayState.title(meta, state))
    }

    fun testEachStepIsMergedOverWhatTheDialogShows() {
        var state = OverlayState.seed(null, meta)
        state = OverlayState.merge(state, json.readTree("""{"progressValue": 0.4, "progressText": "Step 2 of 5"}"""))
        assertEquals("Step 2 of 5", state.path("progressText").asText())
        assertEquals(0.4, state.path("progressValue").asDouble())
        assertEquals("Processing", OverlayState.title(meta, state))
        state = OverlayState.merge(state, json.readTree("""{"title": "Long task finished"}"""))
        assertEquals("Long task finished", OverlayState.title(meta, state))
    }

    fun testAFragmentStateWinsOverInitialData() {
        val state = OverlayState.seed(json.readTree("""{"title": "Other"}"""), meta)
        assertEquals("Other", OverlayState.title(meta, state))
    }
}
