package io.mateu.ijp.plugin

import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.DefaultActionGroup
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.ui.popup.JBPopup
import com.intellij.openapi.ui.popup.JBPopupFactory
import com.intellij.openapi.util.IconLoader
import com.intellij.openapi.wm.impl.ExpandableComboAction

/**
 * The app's menu as a **new-UI main-toolbar widget** — a combo button with the app title and a
 * chevron, right where the Version Control widget sits (the classic menu bar is collapsed behind
 * the hamburger icon in the new UI, so a MainMenu group alone is effectively invisible). Clicking
 * it pops the same action tree as the menu-bar group ([appMenuActions]). Hidden until the Mateu
 * navigator boots the app and publishes its menu.
 */
class MateuToolbarWidget : ExpandableComboAction(), DumbAware {

    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.EDT

    override fun update(e: AnActionEvent) {
        val session = e.project?.getUserData(MATEU_SESSION)
        val menu = session?.appMenu
        val hasMenu = menu != null && menu.isArray && !menu.isEmpty
        e.presentation.isEnabledAndVisible = hasMenu
        if (hasMenu) {
            e.presentation.text = session.appTitle?.takeIf { it.isNotBlank() } ?: "Mateu"
            e.presentation.icon = ICON
        }
    }

    override fun createPopup(event: AnActionEvent): JBPopup {
        val session = event.project?.getUserData(MATEU_SESSION)
        val group = DefaultActionGroup()
        val menu = session?.appMenu
        if (session != null && menu != null) appMenuActions(session, menu).forEach { group.add(it) }
        return JBPopupFactory.getInstance().createActionGroupPopup(
            null, group, event.dataContext, JBPopupFactory.ActionSelectionAid.SPEEDSEARCH, true,
        )
    }

    companion object {
        private val ICON = IconLoader.getIcon("/icons/mateu.svg", MateuToolbarWidget::class.java)
    }
}
