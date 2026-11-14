package io.mateu.ijp.plugin

import com.intellij.openapi.actionSystem.ActionManager
import com.intellij.testFramework.fixtures.BasePlatformTestCase

/**
 * The desktop app's menu bar is a whitelist (MateuFocusedModeActivity.stripMainMenu): File, Edit,
 * Help — and every action it names must exist on the platform, or the menu silently loses it.
 */
class AppMenuBarTest : BasePlatformTestCase() {

    fun `test the menu bar is an app's - File, Edit and Help only`() {
        assertEquals(listOf("File", "Edit", "Help"), MateuFocusedModeActivity.appMenuSections().map { it.first })
    }

    fun `test every action of the menu bar is registered on the platform`() {
        val am = ActionManager.getInstance()
        val missing = MateuFocusedModeActivity.appMenuSections()
            .flatMap { (_, groups) -> groups.flatten() }
            .filter { am.getAction(it) == null }
        assertEquals("not registered: $missing", emptyList<String>(), missing)
    }

    fun `test none of the IDE's own menus is kept`() {
        val ids = MateuFocusedModeActivity.appMenuSections().flatMap { (_, groups) -> groups.flatten() }
        for (ide in listOf("ProjectStructure", "InvalidateCaches", "FindUsages", "CloseProject", "OpenFile", "NewGroup")) {
            assertFalse(ide, ide in ids)
        }
    }

    fun `test a disabled build action keeps its id resolvable - the run widget asserts it is there`() {
        val am = ActionManager.getInstance()
        val original = am.getAction("Run") ?: return // not registered on this platform build
        try {
            am.replaceAction("Run", MateuFocusedModeActivity.DisabledAction())
            assertNotNull("the run widget looks Run up by id and asserts non-null", am.getAction("Run"))
            val presentation = com.intellij.openapi.actionSystem.Presentation()
            val event = com.intellij.openapi.actionSystem.AnActionEvent.createEvent(
                com.intellij.openapi.actionSystem.DataContext.EMPTY_CONTEXT, presentation, "test",
                com.intellij.openapi.actionSystem.ActionUiKind.NONE, null)
            am.getAction("Run").update(event)
            assertFalse(presentation.isEnabledAndVisible)
        } finally {
            am.replaceAction("Run", original)
        }
    }
}
