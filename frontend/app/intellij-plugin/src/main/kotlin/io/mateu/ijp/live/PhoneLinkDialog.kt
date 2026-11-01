package io.mateu.ijp.live

import com.intellij.openapi.ide.CopyPasteManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.DialogWrapper
import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.ui.plainTip
import java.awt.BorderLayout
import java.awt.Color
import java.awt.Dimension
import java.awt.Graphics
import java.awt.datatransfer.StringSelection
import javax.swing.JComponent
import javax.swing.JPanel

/**
 * The phone target: the QR code of the Mateu app's add link (`https://mateu.io/add?u=<LAN url>`) — the
 * phone's camera opens the Mateu app on it, as with `mateu-bundle:dev`'s terminal QR.
 */
class PhoneLinkDialog(project: Project, private val link: String) : DialogWrapper(project, false) {

    init {
        title = "Open on a Phone"
        setOKButtonText("Close")
        init()
    }

    override fun createActions() = arrayOf(okAction)

    override fun createCenterPanel(): JComponent {
        val panel = JPanel(BorderLayout(0, JBUI.scale(12)))
        panel.add(
            JBLabel(
                "<html>Scan it with the phone's camera: it opens the Mateu app on this running app.<br>" +
                    "The phone must be on this network, and a plain <code>http</code> address needs a " +
                    "development build of the app.</html>",
            ),
            BorderLayout.NORTH,
        )
        panel.add(QrPanel(link, "QR code of the link that opens the app on a phone"), BorderLayout.CENTER)
        panel.add(
            ActionLink("Copy link") { CopyPasteManager.getInstance().setContents(StringSelection(link)) }.apply {
                toolTipText = plainTip(link)
            },
            BorderLayout.SOUTH,
        )
        return panel
    }
}

/** Draws the QR symbol of [text] dark on white with a 4-module quiet zone, whatever the IDE theme
 *  (also the desktop hub's "Share" and "Export" codes). */
internal class QrPanel(text: String, name: String) : JPanel() {
    private val qr: QrCode = QrCode.encode(text, QrCode.Ecc.M)
    private val quiet = 4
    private val cell = JBUI.scale(6)

    init {
        val side = (qr.size + quiet * 2) * cell
        preferredSize = Dimension(side, side)
        getAccessibleContext().accessibleName = name
    }

    override fun paintComponent(g: Graphics) {
        super.paintComponent(g)
        val side = (qr.size + quiet * 2) * cell
        val x0 = (width - side) / 2
        val y0 = (height - side) / 2
        g.color = Color.WHITE
        g.fillRect(x0, y0, side, side)
        g.color = Color.BLACK
        for (y in 0 until qr.size) {
            for (x in 0 until qr.size) {
                if (qr.modules[y][x]) g.fillRect(x0 + (x + quiet) * cell, y0 + (y + quiet) * cell, cell, cell)
            }
        }
    }
}
