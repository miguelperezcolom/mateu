package io.mateu.ijp.plugin

import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.WindowManager

/**
 * Standalone-distribution window title: the frame shows the Mateu app/screen title instead of the
 * IDE's `"<project> — IntelliJ IDEA"`. Only ever called when [MateuConfig.standalone] is true —
 * a Marketplace install inside a developer's IDE never touches the frame title.
 *
 * Public API only (`WindowManager.getFrame(project).title`); the former `FrameTitleBuilder`
 * registration targeted an internal application service (not an extension point) and was dropped.
 */
object MateuFrameTitle {
    fun set(project: Project, title: String) {
        if (title.isBlank()) return
        WindowManager.getInstance().getFrame(project)?.title = title
    }
}
