package io.mateu.ijp.plugin

import com.intellij.openapi.actionSystem.ActionManager
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.Presentation
import com.intellij.openapi.actionSystem.impl.SimpleDataContext
import com.intellij.testFramework.fixtures.BasePlatformTestCase

/**
 * Focused mode takes the IDE's build/run actions away, but the run EXECUTORS' ids stay registered:
 * the new UI's run widget does `getAction("Run")!!` / `getAction("Debug")!!` on every toolbar
 * update, and unregistering them threw "getAction(...) must not be null" in the action updater —
 * the "IDE Internal Errors" dialog of the desktop app.
 */
class FocusedModeBuildActionsTest : BasePlatformTestCase() {

    fun testTheExecutorIdsStayRegisteredButDoNothing() {
        val am = ActionManager.getInstance()
        val before = MateuFocusedModeActivity.EXECUTOR_ACTIONS.associateWith { am.getAction(it) }
        // a headless test platform may not register the executors: stand-ins, so the rule is exercised
        val placed = before.filterValues { it == null }.keys
        placed.forEach { am.registerAction(it, object : com.intellij.openapi.actionSystem.AnAction() {
            override fun actionPerformed(e: AnActionEvent) = Unit
        }) }
        try {
            assertTrue(MateuFocusedModeActivity.BUILD_ACTIONS.containsAll(MateuFocusedModeActivity.EXECUTOR_ACTIONS))
            MateuFocusedModeActivity().disableBuildActions(am)
            for (id in MateuFocusedModeActivity.EXECUTOR_ACTIONS) {
                val action = am.getAction(id)
                assertNotNull("$id must stay registered", action)
                assertTrue(action is MateuFocusedModeActivity.InertAction)
                val presentation = Presentation()
                action!!.update(AnActionEvent.createEvent(SimpleDataContext.EMPTY_CONTEXT, presentation, "test", com.intellij.openapi.actionSystem.ActionUiKind.NONE, null))
                assertFalse(presentation.isEnabledAndVisible)
            }
        } finally {
            // the platform's own executors back, for the tests that run after this one
            before.forEach { (id, a) -> if (a != null) am.replaceAction(id, a) }
            placed.forEach { am.unregisterAction(it) }
        }
    }
}
