package io.mateu.ijp.debug

import com.intellij.openapi.Disposable
import com.intellij.openapi.wm.IdeGlassPane
import java.awt.Cursor
import java.awt.event.MouseListener
import java.awt.event.MouseMotionListener
import javax.swing.JPanel

/**
 * The probe frame's glass pane. In the IDE every frame's glass pane is an [IdeGlassPane], and the
 * platform's splitters (a crud's master-detail `OnePixelSplitter`) look it up when they are shown —
 * a plain JFrame's JPanel made them throw "Glass pane should be IdeGlassPane" and the whole entry
 * went unrendered. Nothing here is interactive: the preprocessors and painters are accepted and
 * ignored, which is all a screenshot needs.
 */
internal class ProbeGlassPane : JPanel(), IdeGlassPane {
    init {
        isOpaque = false
        isVisible = false
    }

    override fun addMousePreprocessor(listener: MouseListener, parent: Disposable) {}
    override fun addMouseMotionPreprocessor(listener: MouseMotionListener, parent: Disposable) {}
    override fun addPainter(component: java.awt.Component?, painter: com.intellij.openapi.ui.Painter, parent: Disposable) {}
    override fun setCursor(cursor: Cursor?, requestor: Any) {}
    override fun addMouseListener(listener: MouseListener, coroutineScope: kotlinx.coroutines.CoroutineScope) {}
}
