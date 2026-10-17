package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import io.mateu.ijp.state.AppSession
import io.mateu.ijp.state.HeaderValues
import javax.swing.JLabel
import javax.swing.JPanel

/**
 * The live header values in the navigator follow every change while shown — and a navigator taken
 * out of the window (a hidden tool window) shows the values that changed meanwhile when it comes
 * back. It used to stop listening for good on the first change it saw while not displayable, so
 * it kept showing stale values until the whole navigator was re-rendered.
 */
class HeaderValuesPanelTest : BasePlatformTestCase() {

    private val app = ObjectMapper().readTree(
        """{"headerValues":[{"id":"businessDate","label":"Business date","value":"12 Oct 2026"},{"id":"shift","value":"Night"}]}""",
    )

    private fun texts(panel: java.awt.Container) = panel.components.filterIsInstance<JLabel>().map { it.text }

    fun testTheValuesFollowChangesAndCatchUpAfterBeingHidden() {
        val session = AppSession("http://127.0.0.1:9")
        session.seedHeaderValues(HeaderValues.of(app))
        val navigator = JPanel()
        val panel = headerValuesPanel(session)
        assertEquals(listOf("Business date: 12 Oct 2026", "Night"), texts(panel))

        navigator.add(panel)
        navigator.addNotify() // shown
        session.updateHeaderValue("businessDate", "13 Oct 2026")
        assertEquals(listOf("Business date: 13 Oct 2026", "Night"), texts(panel))

        navigator.removeNotify() // the tool window is hidden
        session.updateHeaderValue("businessDate", "14 Oct 2026")
        navigator.addNotify() // and shown again
        assertEquals(listOf("Business date: 14 Oct 2026", "Night"), texts(panel))
        session.updateHeaderValue("shift", "Day")
        assertEquals(listOf("Business date: 14 Oct 2026", "Day"), texts(panel))

        navigator.removeNotify()
        session.dispose()
    }
}
