package io.mateu.ijp.plugin

import com.intellij.openapi.actionSystem.ActionManager
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.application.ApplicationInfo
import com.intellij.openapi.ui.Messages

/**
 * The desktop app's About box (Help ▸ About): it names the APP — its product name, the Mateu
 * release — and says what it is built on, instead of IntelliJ IDEA's own About dialog (which reads
 * the platform's product info and presented the app as "IntelliJ IDEA"). Installed only in the
 * standalone desktop app (`mateu.focused=true`): the Marketplace plugin never touches a developer's
 * IDE. The IDE itself is not modified (NOTICE) — the platform's "About" action is replaced at run
 * time through the public [ActionManager.replaceAction].
 */
object MateuAbout {

    /** The platform's id of Help ▸ About. */
    const val ABOUT_ACTION_ID = "About"

    /** The dialog's title. */
    fun title(product: String): String = "About ${product.ifBlank { "Mateu" }}"

    /** The dialog's text: the app, its Mateu release, and the open-source IDE it runs on. */
    fun text(product: String, mateuVersion: String, ideName: String?, ideVersion: String?, ideBuild: String?): String {
        val name = product.ifBlank { "Mateu" }
        val lines = mutableListOf(name, "Mateu $mateuVersion")
        val base = listOfNotNull(ideName?.ifBlank { null }, ideVersion?.ifBlank { null }).joinToString(" ")
        if (base.isNotBlank()) {
            lines += ""
            lines += "Built on $base" + (ideBuild?.ifBlank { null }?.let { " (build $it)" } ?: "") +
                " — open source, Apache License 2.0."
            lines += "IntelliJ IDEA is a trademark of JetBrains s.r.o.; this app is not a JetBrains product."
        }
        lines += ""
        lines += "https://mateu.io"
        return lines.joinToString("\n")
    }

    @Volatile private var installed = false

    /** Replaces the platform's About action with the app's (once per application). */
    fun install(product: String) {
        if (installed) return
        installed = true
        runCatching { ActionManager.getInstance().replaceAction(ABOUT_ACTION_ID, AboutAction(product)) }
    }

    private class AboutAction(private val product: String) : AnAction(title(product)) {
        override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.BGT

        override fun actionPerformed(e: AnActionEvent) {
            val info = runCatching { ApplicationInfo.getInstance() }.getOrNull()
            val body = text(
                product,
                AppRegistry.installedPluginVersion(),
                runCatching { info?.versionName }.getOrNull(),
                runCatching { info?.fullVersion }.getOrNull(),
                AppRegistry.installedIdeBuild(),
            )
            Messages.showInfoMessage(e.project, body, title(product))
        }
    }
}
