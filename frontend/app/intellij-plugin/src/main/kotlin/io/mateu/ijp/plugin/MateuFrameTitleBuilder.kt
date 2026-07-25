package io.mateu.ijp.plugin

import com.intellij.openapi.project.Project
import com.intellij.openapi.util.Key
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.openapi.wm.WindowManager
import com.intellij.openapi.wm.impl.FrameTitleBuilder

/**
 * Standalone-app window title: the frame shows the Mateu app/screen title (or the configured product
 * name) instead of the IDE's `"<project> — IntelliJ IDEA"`, so no "workspace"/IDE tell leaks through.
 *
 * The live title is pushed by [setFrameTitle] whenever a `SetWindowTitle` command arrives; the
 * platform also asks this builder to recompute on its own project events, and we answer with the same
 * stored value (falling back to the product name), so a recompute never resurrects the project name.
 */
class MateuFrameTitleBuilder : FrameTitleBuilder() {

    override fun getProjectTitle(project: Project): String =
        project.getUserData(TITLE_KEY) ?: loadMateuConfig().productName

    // Editor tabs already carry the Mateu view name; keep the frame title stable (no file path).
    override fun getFileTitle(project: Project, file: VirtualFile): String = getProjectTitle(project)

    companion object {
        private val TITLE_KEY = Key.create<String>("mateu.frame.title")

        /** Store [title] and refresh the window frame so it shows immediately. */
        fun setFrameTitle(project: Project, title: String) {
            if (title.isBlank()) return
            project.putUserData(TITLE_KEY, title)
            // Force the platform to re-read the title via this builder.
            WindowManager.getInstance().getFrame(project)?.title = title
        }
    }
}
