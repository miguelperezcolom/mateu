package io.mateu.ijp.plugin

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.openapi.actionSystem.ActionGroup
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.DefaultActionGroup
import com.intellij.openapi.actionSystem.Separator
import com.intellij.openapi.project.DumbAware
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppSession

/**
 * The top-level **Mateu menu in the IDE menu bar**, backed by the running app's menu (like the VCS
 * menu is backed by the active VCS): once the navigator loads the app shell, the group renames to
 * the app's title and its children mirror the app menu — submenus as nested popup groups, leaves
 * opening their view through the standard [AppSession.openViewHandler] (listing → bottom tool
 * window, page → editor tab). The XML-declared entries (Show Mateu Window) stay at the bottom.
 */
class MateuAppMenuGroup : DefaultActionGroup(), DumbAware {

    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.EDT

    override fun update(e: AnActionEvent) {
        val title = e.project?.getUserData(MATEU_SESSION)?.appTitle
        if (!title.isNullOrBlank()) e.presentation.text = title
    }

    override fun getChildren(e: AnActionEvent?): Array<AnAction> {
        val statics = super.getChildren(e)
        val session = e?.project?.getUserData(MATEU_SESSION) ?: return statics
        val menu = session.appMenu ?: return statics
        val dynamic = menuActions(session, menu)
        if (dynamic.isEmpty()) return statics
        return dynamic + Separator.getInstance() + statics
    }

    private fun menuActions(session: AppSession, menu: JsonNode): Array<AnAction> {
        if (!menu.isArray) return EMPTY_ARRAY
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
                    override fun getChildren(e: AnActionEvent?): Array<AnAction> = menuActions(session, submenus)
                })
            } else {
                actions.add(MenuEntryAction(session, label, item))
            }
        }
        return actions.toTypedArray()
    }

    private class MenuEntryAction(
        private val session: AppSession,
        label: String,
        private val item: JsonNode,
    ) : AnAction(label), DumbAware {
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
}
