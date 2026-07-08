package io.mateu.ijp.plugin

import com.intellij.icons.AllIcons
import com.intellij.openapi.actionSystem.ActionGroup
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.project.DumbAware
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.ToolbarSpec
import javax.swing.Icon

/**
 * A live [ActionGroup] over [AppContext.viewActions]: the Mateu view's toolbar buttons surfaced as
 * native IDE actions — an ActionToolbar in the editor-tab header for form/page views, the tool
 * window title bar for Crud listings. Children are re-read on every action-update cycle, so a
 * navigation inside the view (e.g. view → edit) swaps the buttons automatically; instances are
 * cached per spec so the toolbar doesn't rebuild when nothing changed.
 */
fun viewActionGroup(ctx: AppContext): ActionGroup = object : ActionGroup(), DumbAware {
    private val cache = HashMap<ToolbarSpec, AnAction>()
    override fun getChildren(e: AnActionEvent?): Array<AnAction> =
        ctx.viewActions.map { spec -> cache.getOrPut(spec) { MateuToolbarAction(ctx, spec) } }.toTypedArray()
}

private class MateuToolbarAction(
    private val ctx: AppContext,
    private val spec: ToolbarSpec,
) : AnAction(spec.label.ifBlank { spec.actionId }, null, iconFor(spec.actionId)), DumbAware {
    /** Icon-only toolbar buttons would hide the (often dynamic) Mateu labels — always show text. */
    override fun displayTextInToolbar(): Boolean = true
    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.EDT
    override fun update(e: AnActionEvent) {
        e.presentation.isEnabled = !spec.disabled
    }
    override fun actionPerformed(e: AnActionEvent) = ctx.runAction(spec.actionId, null)
}

/** Platform icons for the well-known CRUD action ids; unknown actions render as text-only buttons. */
private fun iconFor(actionId: String): Icon? = when (actionId.lowercase()) {
    "edit" -> AllIcons.Actions.Edit
    "new" -> AllIcons.General.Add
    "save" -> AllIcons.Actions.MenuSaveall
    "cancel", "cancel-edit" -> AllIcons.Actions.Cancel
    "cancel-view" -> AllIcons.Actions.Back // the CRUD detail's "Back to list"
    "delete" -> AllIcons.Actions.GC
    "import" -> AllIcons.ToolbarDecorator.Import
    "export", "excel", "exporttoexcel" -> AllIcons.ToolbarDecorator.Export
    "history" -> AllIcons.Vcs.History
    "search", "refresh" -> AllIcons.Actions.Refresh
    else -> null
}
