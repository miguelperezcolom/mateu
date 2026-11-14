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
}
