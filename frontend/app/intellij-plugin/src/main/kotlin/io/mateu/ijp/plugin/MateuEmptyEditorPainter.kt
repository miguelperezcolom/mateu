package io.mateu.ijp.plugin

import com.intellij.openapi.fileEditor.impl.EditorEmptyTextPainter
import java.awt.Graphics
import javax.swing.JComponent

/**
 * Standalone-app editors: don't paint IntelliJ's "Drop files here to open them / Search Everywhere"
 * tips in the empty editor area — a Mateu app has no files to drop, and the tips read as an IDE tell.
 * The main area is normally filled by the home screen (see MateuProjectService.openHomeView); when
 * no view is open the area is simply left blank. Registered as an overriding application service.
 */
class MateuEmptyEditorPainter : EditorEmptyTextPainter() {
    override fun paintEmptyText(splitters: JComponent, g: Graphics) {
        // Intentionally paint nothing.
    }
}
