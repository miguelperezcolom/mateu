package io.mateu.ijp.hub

import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.DialogWrapper
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import com.intellij.util.ui.UIUtil
import io.mateu.ijp.ui.accessibleName
import io.mateu.ijp.ui.plain
import javax.swing.Action
import javax.swing.BoxLayout
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel

/**
 * "Sign in to <UI>": one "Continue with …" button per sign-in provider, the one used last first (and
 * said so). The mark beside each name is its initial or a key — never a brand's artwork. The first
 * button has the focus, Esc cancels. Returns the provider chosen, or null.
 */
class SignInChooserDialog(
    project: Project?,
    private val uiName: String,
    private val providers: List<HubManifest.Auth>,
    private val lastUsed: String?,
) : DialogWrapper(project) {

    var chosen: HubManifest.Auth? = null
        private set

    private val buttons = providers.map { p ->
        val name = SignInProviders.nameOf(p)
        val mark = SignInProviders.initialOf(p)?.let { "($it)  " } ?: "⚿  " // ⚿ squared key
        JButton(plain(mark + "Continue with $name")).apply {
            val last = p.id == lastUsed
            accessibleName("Continue with $name" + if (last) ", last used" else "")
            if (last) toolTipText = "Last used"
            addActionListener {
                chosen = p
                close(OK_EXIT_CODE)
            }
            alignmentX = JComponent.LEFT_ALIGNMENT
        }
    }

    init {
        title = "Sign in to $uiName"
        init()
    }

    override fun createCenterPanel(): JComponent = JPanel().apply {
        layout = BoxLayout(this, BoxLayout.Y_AXIS)
        border = JBUI.Borders.empty(8)
        add(JBLabel(plain("Choose how to sign in to $uiName. Mateu never sees your password.")).apply {
            alignmentX = JComponent.LEFT_ALIGNMENT
            border = JBUI.Borders.emptyBottom(8)
        })
        buttons.forEachIndexed { i, b ->
            if (i > 0) add(javax.swing.Box.createVerticalStrut(com.intellij.ui.scale.JBUIScale.scale(6)))
            add(b)
            if (b.toolTipText != null) {
                add(JBLabel("Last used").apply {
                    foreground = UIUtil.getContextHelpForeground()
                    alignmentX = JComponent.LEFT_ALIGNMENT
                })
            }
        }
    }

    override fun getPreferredFocusedComponent(): JComponent? = buttons.firstOrNull()

    /** No OK: a provider button IS the answer. */
    override fun createActions(): Array<Action> = arrayOf(cancelAction)

    companion object {
        /** Asks on the EDT; null when cancelled. */
        fun choose(project: Project?, uiName: String, providers: List<HubManifest.Auth>, lastUsed: String?): HubManifest.Auth? {
            if (providers.size <= 1) return providers.firstOrNull()
            val dialog = SignInChooserDialog(project, uiName, SignInProviders.ordered(providers, lastUsed), lastUsed)
            dialog.show()
            return dialog.chosen
        }
    }
}
