package io.mateu.ijp.plugin

import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.project.Project
import io.mateu.ijp.state.AppSession

/**
 * Opens each Mateu view as a tab in the **central editor area** (`FileEditorManager.openFile` on a
 * [MateuVirtualFile]). The editor area gives native per-view docking — tabs that can be split and
 * dragged out to floating windows. The main "Mateu" tool window stays a navigator (the menu).
 */
class MateuViewManager(private val project: Project, private val session: AppSession) {

    // Cache one virtual file per view so re-selecting a menu entry re-focuses its existing tab.
    private val openByKey = HashMap<String, MateuVirtualFile>()

    fun openView(label: String, route: String?, consumedRoute: String?, serverSideType: String?, actionId: String?) {
        val key = "${serverSideType.orEmpty()}::${route.orEmpty()}"
        val file = openByKey.getOrPut(key) {
            MateuVirtualFile(session, label.ifBlank { route ?: "View" }, route, consumedRoute, serverSideType, actionId)
        }
        FileEditorManager.getInstance(project).openFile(file, true)
    }
}
