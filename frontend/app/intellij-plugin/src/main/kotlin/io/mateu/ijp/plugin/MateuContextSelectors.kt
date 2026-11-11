package io.mateu.ijp.plugin

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.openapi.actionSystem.ActionGroup
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.DataContext
import com.intellij.openapi.actionSystem.DefaultActionGroup
import com.intellij.openapi.actionSystem.ToggleAction
import com.intellij.openapi.actionSystem.ex.ComboBoxAction
import com.intellij.openapi.project.DumbAware
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppSession
import io.mateu.ijp.ui.plain
import javax.swing.JComponent

/**
 * The UI's `@AppContext` selectors (active hotel, company, mode…) on the desktop app's MAIN TOOLBAR,
 * one combo each — "Hotel: Riu Palace ▾". They fix a value for every screen, so they belong with the
 * app-wide chrome, where the web shells put them (the header); at the top of the menu panel they
 * read as menu entries. Only in focused mode ([AppSession.contextSelectorsInToolbar]); a developer's
 * IDE keeps them in the navigator. Picking a value works exactly like the navigator's combo: the
 * appState sent with every request changes and the app shell reloads.
 */
class MateuContextSelectors : ActionGroup(), DumbAware {

    private val cache = HashMap<String, SelectorCombo>()

    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.EDT

    override fun update(e: AnActionEvent) {
        val session = e.project?.getUserData(MATEU_SESSION)
        e.presentation.isEnabledAndVisible = session != null && session.contextSelectorsInToolbar && session.contextSelectors != null
    }

    override fun getChildren(e: AnActionEvent?): Array<AnAction> {
        val session = e?.project?.getUserData(MATEU_SESSION) ?: return EMPTY_ARRAY
        if (!session.contextSelectorsInToolbar) return EMPTY_ARRAY
        val selectors = session.contextSelectors ?: return EMPTY_ARRAY
        return selectors.map { selector ->
            val field = selector.text("fieldName")
            cache.getOrPut(field) { SelectorCombo(field) }.also { it.bind(session, selector) }
        }.toTypedArray()
    }
}

/** One selector: the caption and the current value on the button, the options in its popup. */
private class SelectorCombo(private val fieldName: String) : ComboBoxAction(), DumbAware {

    private var session: AppSession? = null
    private var selector: JsonNode? = null

    fun bind(session: AppSession, selector: JsonNode) {
        this.session = session
        this.selector = selector
    }

    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.EDT

    override fun update(e: AnActionEvent) {
        val s = session
        val sel = selector
        e.presentation.isEnabledAndVisible = s != null && sel != null
        if (s == null || sel == null) return
        val caption = sel.text("label", fieldName)
        val current = AppContextValues.current(s, fieldName)
        val label = AppContextValues.labelOf(sel, current)
        e.presentation.text = plain("$caption: ${label ?: "—"}")
        e.presentation.description = plain(caption)
    }

    override fun createPopupActionGroup(button: JComponent, dataContext: DataContext): DefaultActionGroup {
        val group = DefaultActionGroup()
        val s = session ?: return group
        val sel = selector ?: return group
        group.add(OptionAction(s, fieldName, "", "—"))
        for (opt in sel.path("options")) {
            val v = opt.text("value")
            group.add(OptionAction(s, fieldName, v, opt.text("label", v)))
        }
        return group
    }
}

/** One option of a selector's popup, checked when it is the current value. */
private class OptionAction(
    private val session: AppSession,
    private val fieldName: String,
    private val value: String,
    label: String,
) : ToggleAction(plain(label)), DumbAware {
    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.EDT
    override fun isSelected(e: AnActionEvent): Boolean = AppContextValues.current(session, fieldName) == value
    override fun setSelected(e: AnActionEvent, state: Boolean) {
        if (AppContextValues.current(session, fieldName) == value) return
        if (value.isBlank()) session.appState.remove(fieldName) else session.appState[fieldName] = value
        session.onAppContextChanged?.invoke()
    }
}

/** Reading a selector's current value and its label (pure; unit-tested). */
internal object AppContextValues {
    fun current(session: AppSession, fieldName: String): String =
        session.appState[fieldName]?.let { if (it is JsonNode) it.asText() else it.toString() }.orEmpty()

    /** The label of [value] among the selector's options; the value itself when it is not listed, null when unset. */
    fun labelOf(selector: JsonNode, value: String): String? {
        if (value.isBlank()) return null
        return selector.path("options").firstOrNull { it.text("value") == value }?.text("label", value) ?: value
    }
}
