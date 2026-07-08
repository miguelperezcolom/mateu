package io.mateu.ijp.plugin

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.openapi.actionSystem.ActionGroup
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.DefaultActionGroup
import com.intellij.openapi.actionSystem.Separator
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.ui.popup.JBPopup
import com.intellij.openapi.ui.popup.JBPopupFactory
import com.intellij.openapi.util.IconLoader
import com.intellij.openapi.wm.impl.ExpandableComboAction
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppSession

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

/** The app menu JSON → IDE actions: submenus as nested popup groups, leaves opening their view. */
internal fun appMenuActions(session: AppSession, menu: JsonNode): Array<AnAction> {
    if (!menu.isArray) return AnAction.EMPTY_ARRAY
    val actions = ArrayList<AnAction>()
    for (item in menu) {
        if (item.bool("separator")) {
            actions.add(Separator.getInstance())
            continue
        }
        val label = item.text("label")
        val submenus = item.path("submenus")
        if (submenus.isArray && !submenus.isEmpty) {
            actions.add(object : ActionGroup(label, true), DumbAware {
                override fun getChildren(e: AnActionEvent?): Array<AnAction> = appMenuActions(session, submenus)
            })
        } else {
            actions.add(MenuEntryAction(session, label, item))
        }
    }
    return actions.toTypedArray()
}

internal class MenuEntryAction(
    private val session: AppSession,
    label: String,
    private val item: JsonNode,
    description: String? = null,
    icon: javax.swing.Icon? = null,
) : AnAction(label, description, icon), DumbAware {
    override fun actionPerformed(e: AnActionEvent) {
        session.openViewHandler?.invoke(
            item.text("label"),
            item.text("route"),
            item.text("consumedRoute"),
            item.text("serverSideType"),
            item.text("actionId"),
        )
    }
}
