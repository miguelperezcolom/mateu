package io.mateu.ijp.plugin

import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory

/**
 * Declares the bottom "Mateu Results" tool window that hosts CRUD-listing tabs. It is registered
 * DECLARATIVELY (plugin.xml `<toolWindow>`) rather than via `ToolWindowManager.registerToolWindow`,
 * whose `RegisterToolWindowTask` overload is `@ApiStatus.OverrideOnly` — calling it (even through the
 * inline Kotlin DSL, which leaks the call into the caller's bytecode) is an override-only violation
 * flagged by the plugin verifier. Content is added on demand by [MateuViewManager.placeCrudList]
 * through the tool window's own content manager, so this factory intentionally creates none.
 */
class MateuResultsToolWindowFactory : ToolWindowFactory, DumbAware {
    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        // No-op: CRUD result tabs are added dynamically by MateuViewManager as views open.
    }
}
