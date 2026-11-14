package io.mateu.ijp.ui

import com.intellij.ui.JBColor
import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import com.intellij.util.ui.UIUtil
import io.mateu.ijp.state.AppSession
import java.awt.BasicStroke
import java.awt.Component
import java.awt.FlowLayout
import java.awt.Font
import java.awt.Graphics
import java.awt.Graphics2D
import java.awt.Image
import java.awt.RenderingHints
import java.awt.geom.Ellipse2D
import java.awt.image.BufferedImage
import javax.swing.BoxLayout
import javax.swing.Icon
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JMenuItem
import javax.swing.JPanel
import javax.swing.JPopupMenu
import javax.swing.SwingUtilities

/**
 * The signed-in user at the top of the navigator (`AppDto.user`) — the desktop's counterpart of the
 * web's `mateu-user-menu`: a button with the avatar (the picture, read only through [SvgImages], else
 * the initials) and the name, opening a popup with the name, the e-mail and Sign out when the plugin
 * holds a sign-in for this UI. With no user named but a session held, a bare "Sign out" link
 * ([UserMenu.headerAccountControl]). Whether a session is held is read OFF the EDT (PasswordSafe).
 */
fun userMenuRow(session: AppSession, user: UserMenu.User?): JComponent {
    val row = JPanel(FlowLayout(FlowLayout.LEFT, 0, 0))
    row.isOpaque = false
    row.border = JBUI.Borders.empty(2, 4)
    val texts = UserMenu.texts(MoneyValues.uiLocale())

    fun draw(signOutAvailable: Boolean) {
        row.removeAll()
        when (UserMenu.headerAccountControl(user, signOutAvailable)) {
            UserMenu.Control.MENU -> row.add(userMenuButton(session, user!!, texts, signOutAvailable))
            UserMenu.Control.SIGN_OUT -> row.add(ActionLink(plain(texts.signOut)) { session.requestSignOut() }.accessibleName(texts.signOut))
            UserMenu.Control.NONE -> {}
        }
        row.revalidate()
        row.repaint()
    }

    draw(false)
    session.executor.submit {
        val available = runCatching { session.signOutAvailable() }.getOrDefault(false)
        if (available) SwingUtilities.invokeLater { draw(true) }
    }
    return row
}

private fun userMenuButton(session: AppSession, user: UserMenu.User, texts: UserMenu.Texts, signOutAvailable: Boolean): JButton {
    val label = texts.accountLabel(user.name)
    val size = JBUI.scale(22)
    val button = JButton(plain(user.name), InitialsIcon(UserMenu.initialsOf(user.name), size))
    button.isOpaque = false
    button.horizontalAlignment = javax.swing.SwingConstants.LEFT
    button.toolTipText = plainTip(label)
    button.accessibleName(label)
    button.putClientProperty("mateu.userMenu", true)
    // the picture, when the server named an http(s) one: read off the EDT, drawn in the circle
    UserMenu.pictureOf(user)?.let { url ->
        session.executor.submit {
            val image = runCatching { SvgImages.load(url) }.getOrNull() ?: return@submit
            SwingUtilities.invokeLater { button.icon = PictureIcon(image, size) }
        }
    }
    button.addActionListener {
        val popup = JPopupMenu()
        popup.getAccessibleContext().accessibleName = label
        val who = JPanel()
        who.layout = BoxLayout(who, BoxLayout.Y_AXIS)
        who.isOpaque = false
        who.border = JBUI.Borders.empty(6, 10)
        val name = JBLabel(plain(user.name))
        name.font = name.font.deriveFont(Font.BOLD)
        who.add(name)
        user.email?.let { email ->
            val e = JBLabel(plain(email))
            e.foreground = UIUtil.getContextHelpForeground()
            who.add(e)
        }
        popup.add(who)
        if (signOutAvailable) {
            popup.addSeparator()
            val out = JMenuItem(plain(texts.signOut))
            out.accessibleName(texts.signOut)
            out.addActionListener { session.requestSignOut() }
            popup.add(out)
        }
        popup.show(button, 0, button.height)
        // keyboard users land on Sign out, the one actionable entry (Escape closes the popup)
        if (signOutAvailable) SwingUtilities.invokeLater {
            javax.swing.MenuSelectionManager.defaultManager().selectedPath =
                arrayOf(popup, popup.getComponent(popup.componentCount - 1) as JMenuItem)
        }
    }
    return button
}

/** A circle with the user's initials — the avatar when there is no (readable) picture. */
private class InitialsIcon(private val initials: String, private val size: Int) : Icon {
    override fun getIconWidth() = size
    override fun getIconHeight() = size
    override fun paintIcon(c: Component?, g: Graphics, x: Int, y: Int) {
        val g2 = g.create() as Graphics2D
        try {
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON)
            g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON)
            g2.color = JBColor(0xDCE7F7, 0x2F3E52)
            g2.fill(Ellipse2D.Float(x.toFloat(), y.toFloat(), size.toFloat(), size.toFloat()))
            g2.color = JBColor(0x1A5FB4, 0xA9C7EE)
            g2.font = (c?.font ?: g2.font).deriveFont(Font.BOLD, size * 0.42f)
            val fm = g2.fontMetrics
            val w = fm.stringWidth(initials)
            g2.drawString(initials, x + (size - w) / 2, y + (size - fm.height) / 2 + fm.ascent)
        } finally {
            g2.dispose()
        }
    }
}

/** The user's picture, scaled and clipped to the avatar circle. */
private class PictureIcon(image: BufferedImage, private val size: Int) : Icon {
    private val scaled: Image = image.getScaledInstance(size, size, Image.SCALE_SMOOTH)
    override fun getIconWidth() = size
    override fun getIconHeight() = size
    override fun paintIcon(c: Component?, g: Graphics, x: Int, y: Int) {
        val g2 = g.create() as Graphics2D
        try {
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON)
            val circle = Ellipse2D.Float(x.toFloat(), y.toFloat(), size.toFloat(), size.toFloat())
            g2.clip(circle)
            g2.drawImage(scaled, x, y, null)
            g2.clip = null
            g2.color = JBColor(0xCCCCCC, 0x555555)
            g2.stroke = BasicStroke(1f)
            g2.draw(circle)
        } finally {
            g2.dispose()
        }
    }
}
