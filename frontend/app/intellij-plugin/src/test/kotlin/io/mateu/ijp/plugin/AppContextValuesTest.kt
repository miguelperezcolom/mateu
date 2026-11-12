package io.mateu.ijp.plugin

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** What the desktop app's toolbar combo for an @AppContext selector says ("Hotel: Riu Palace"). */
class AppContextValuesTest : TestCase() {

    private val selector = ObjectMapper().readTree(
        """{"fieldName":"hotel","label":"Hotel","options":[{"value":"h1","label":"Riu Palace"},{"value":"h2"}]}""",
    )

    fun testTheCurrentValueShowsItsOptionsLabel() {
        assertEquals("Riu Palace", AppContextValues.labelOf(selector, "h1"))
        // an option without a label is named by its value, like the navigator's combo
        assertEquals("h2", AppContextValues.labelOf(selector, "h2"))
    }

    fun testAnUnlistedValueShowsItselfAndNoValueShowsNothing() {
        assertEquals("h9", AppContextValues.labelOf(selector, "h9"))
        assertNull(AppContextValues.labelOf(selector, ""))
    }
}
