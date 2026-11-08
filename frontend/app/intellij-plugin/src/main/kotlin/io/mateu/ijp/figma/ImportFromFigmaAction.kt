package io.mateu.ijp.figma

import com.intellij.credentialStore.CredentialAttributes
import com.intellij.credentialStore.Credentials
import com.intellij.credentialStore.generateServiceName
import com.intellij.ide.passwordSafe.PasswordSafe
import com.intellij.notification.NotificationAction
import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.actionSystem.LangDataKeys
import com.intellij.openapi.extensions.PluginId
import com.intellij.ide.plugins.PluginManagerCore
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.progress.ProgressIndicator
import com.intellij.openapi.progress.Task
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.DialogWrapper
import com.intellij.openapi.ui.Messages
import com.intellij.openapi.ui.ValidationInfo
import com.intellij.openapi.util.SystemInfo
import com.intellij.openapi.vfs.LocalFileSystem
import com.intellij.openapi.vfs.VfsUtil
import com.intellij.ui.components.JBCheckBox
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBTextField
import com.intellij.util.ui.FormBuilder
import io.mateu.ijp.newfile.MateuNewFiles
import io.mateu.ijp.newfile.MateuRoutes
import io.mateu.ijp.newfile.SpecsWorkspace
import io.mateu.ijp.ui.plain
import java.io.File
import javax.swing.JComponent

/** The Figma token in the IDE's credential store (Keychain / KWallet / KeePass) — never in a file. */
object FigmaToken {
    private val attributes = CredentialAttributes(generateServiceName("Mateu", "figma-token"))

    fun stored(): String? = PasswordSafe.instance.getPassword(attributes)?.ifBlank { null }

    fun store(token: String?) = PasswordSafe.instance.set(attributes, token?.ifBlank { null }?.let { Credentials("figma", it) })
}

/**
 * Import from Figma… (New › Mateu and Tools): the file's URL and the frames → the bundled converter
 * run with node writes the pages into the module's specs/ui; each new page is registered in its
 * routes file (before `# __ROUTES__`, else at the end — Add Route…'s minimal append), the VFS is
 * refreshed and a notification carries the summary and the converter's warnings.
 */
class ImportFromFigmaAction : AnAction("Import from Figma…", "Write specs/ui YAML pages from a Figma file designed with the Mateu library", null), DumbAware {

    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.BGT

    override fun update(e: AnActionEvent) {
        e.presentation.isEnabledAndVisible = e.project?.basePath != null
    }

    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val base = project.basePath ?: return
        val selected = e.getData(LangDataKeys.IDE_VIEW)?.directories?.firstOrNull()?.virtualFile?.path
            ?: e.getData(CommonDataKeys.VIRTUAL_FILE)?.let { if (it.isDirectory) it.path else it.parent?.path }
            ?: base
        val out = MateuNewFiles.targetDir(selected, base) { LocalFileSystem.getInstance().findFileByPath(it)?.isDirectory == true }

        val dialog = ImportFromFigmaDialog(project, out)
        if (!dialog.showAndGet()) return
        val input = dialog.input
        val args = ArrayList<String>()
        var token: String? = null
        if (FigmaImport.isPayload(input)) {
            args += listOf("--json", input.trim())
        } else {
            token = tokenFor(project) ?: return
            args += listOf("--key", FigmaImport.fileKey(input))
        }
        args += listOf("--out", out)
        FigmaImport.framesOf(dialog.frames).takeIf { it.isNotEmpty() }?.let { args += listOf("--frames", it.joinToString(",")) }
        if (dialog.force) args += "--force"

        object : Task.Backgroundable(project, "Importing from Figma…", true) {
            var report: FigmaImport.Report? = null
            var failure: String? = null

            override fun run(indicator: ProgressIndicator) {
                indicator.isIndeterminate = true
                try {
                    val runner = FigmaImportRunner()
                    val node = runner.findNode(nodeCandidates(project))
                    report = runner.run(node, args, token)
                } catch (ex: FigmaImportRunner.ImportFailure) {
                    failure = ex.message
                } catch (ex: Exception) {
                    failure = ex.message ?: ex.toString()
                }
            }

            override fun onFinished() {
                val r = report
                if (r == null) {
                    notify(project, "Figma import failed", failure ?: "Unknown error", NotificationType.ERROR)
                    return
                }
                finish(project, out, r)
            }
        }.queue()
    }

    private fun tokenFor(project: Project): String? {
        FigmaToken.stored()?.let { return it }
        FigmaImport.tokenFromEnvOrFiles(System.getenv(), System.getProperty("user.home")) { p ->
            runCatching { File(p).takeIf { it.isFile }?.readText() }.getOrNull()
        }?.let { return it }
        val typed = Messages.showPasswordDialog(
            project,
            "Figma personal access token.\n${FigmaImport.TOKEN_HELP}",
            "Import from Figma",
            null,
        )?.trim()?.ifEmpty { null } ?: return null
        val save = Messages.showYesNoDialog(
            project,
            "Remember the token in the IDE's password store?",
            "Import from Figma",
            "Remember",
            "This Time Only",
            null,
        )
        if (save == Messages.YES) FigmaToken.store(typed)
        return typed
    }

    /** The IDE's configured node (JavaScript plugin, when installed), then PATH and the usual folders. */
    private fun nodeCandidates(project: Project): List<String> {
        val fromPath = FigmaImport.nodeCandidates(null, System.getenv(), System.getProperty("user.home"), SystemInfo.isWindows)
        return listOfNotNull(ideNode(project)) + fromPath
    }

    /** Reflective, so the plugin keeps working without the (Ultimate-only) JavaScript plugin. */
    private fun ideNode(project: Project): String? = runCatching {
        val loader = PluginManagerCore.getPlugin(PluginId.getId("JavaScript"))?.pluginClassLoader ?: return null
        val manager = Class.forName("com.intellij.javascript.nodejs.interpreter.NodeJsInterpreterManager", true, loader)
        val instance = manager.getMethod("getInstance", Project::class.java).invoke(null, project)
        val interpreter = manager.getMethod("getInterpreter").invoke(instance) ?: return null
        interpreter.javaClass.methods.firstOrNull { it.name == "getInterpreterSystemDependentPath" && it.parameterCount == 0 }
            ?.invoke(interpreter) as? String
    }.getOrNull()

    private fun finish(project: Project, out: String, report: FigmaImport.Report) {
        LocalFileSystem.getInstance().refreshAndFindFileByPath(out)?.let { VfsUtil.markDirtyAndRefresh(false, true, true, it) }
        val root = MateuRoutes.specsRoot(out)
        val prefix = out.trimEnd('/').removePrefix(root).trimStart('/')
        val ws = SpecsWorkspace.scan(root)
        val routesRel = FigmaImport.routesFileFor(ws.ofKind(MateuRoutes.SpecKind.ROUTES).map { it.path })
        val current = routesRel?.let { ws.text(it) } ?: MateuRoutes.routesFileText()
        val (text, added) = FigmaImport.registerAll(current, report, prefix)
        var routesError: String? = null
        if (text != current) {
            val rel = routesRel ?: "routes.yaml"
            routesError = SpecsWorkspace.write(project, "Register Figma Pages") {
                if (routesRel == null) {
                    val dir = VfsUtil.createDirectoryIfMissing(root) ?: error("$root cannot be created")
                    dir.findChild(rel) ?: dir.createChildData(this, rel)
                }
                SpecsWorkspace.edit(ws.abs(rel)) { text }
            }
        }
        val summary = FigmaImport.summaryOf(report, added)
        val body = buildString {
            append(summary)
            if (routesError != null) append("<br/>The routes were not registered: ").append(routesError)
            if (report.warnings.isNotEmpty()) {
                append("<br/><br/>")
                report.warnings.take(10).forEach { append("• ").append(escape(it)).append("<br/>") }
                if (report.warnings.size > 10) append("… and ${report.warnings.size - 10} more")
            }
        }
        val type = if (report.warnings.isEmpty() && routesError == null) NotificationType.INFORMATION else NotificationType.WARNING
        val notification = NotificationGroupManager.getInstance().getNotificationGroup("Mateu")
            .createNotification("Imported from Figma", body, type)
        report.files.firstOrNull { it.status == "created" || it.status == "updated" }?.let { first ->
            notification.addAction(NotificationAction.createSimpleExpiring("Open ${first.path}") {
                LocalFileSystem.getInstance().refreshAndFindFileByPath("${out.trimEnd('/')}/${first.path}")
                    ?.let { FileEditorManager.getInstance(project).openFile(it, true) }
            })
        }
        notification.notify(project)
    }

    private fun escape(s: String) = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    private fun notify(project: Project, title: String, message: String, type: NotificationType) =
        NotificationGroupManager.getInstance().getNotificationGroup(if (type == NotificationType.ERROR) "Mateu errors" else "Mateu")
            .createNotification(title, escape(message), type).notify(project)
}

/** File URL (or a downloaded payload) + frames, validated inline. */
class ImportFromFigmaDialog(project: Project, private val out: String) : DialogWrapper(project) {
    private val url = JBTextField().apply { emptyText.text = "https://www.figma.com/design/<key>/…" }
    private val framesField = JBTextField().apply { emptyText.text = "every screen frame" }
    private val forceBox = JBCheckBox("Overwrite pages that were not generated from Figma")

    val input: String get() = url.text.trim()
    val frames: String get() = framesField.text
    val force: Boolean get() = forceBox.isSelected

    init {
        title = "Import from Figma"
        init()
    }

    override fun createCenterPanel(): JComponent = FormBuilder.createFormBuilder()
        .addLabeledComponent("Figma file URL:", url)
        .addTooltip("Share › Copy link, a file key, or a downloaded GET /v1/files/:key payload (.json)")
        .addLabeledComponent("Frames:", framesField)
        .addTooltip("Comma-separated names or slugs; empty = all")
        .addComponent(forceBox)
        .addComponent(JBLabel(plain("Pages are written to $out")).apply { foreground = com.intellij.util.ui.UIUtil.getContextHelpForeground() })
        .panel

    override fun getPreferredFocusedComponent(): JComponent = url

    override fun doValidate(): ValidationInfo? = FigmaImport.inputProblem(url.text)?.let { ValidationInfo(it, url) }
}

/** Forget the Figma token kept in the IDE's password store. */
class ForgetFigmaTokenAction : AnAction("Forget the Figma Token"), DumbAware {
    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.BGT

    override fun update(e: AnActionEvent) {
        e.presentation.isEnabledAndVisible = true
    }

    override fun actionPerformed(e: AnActionEvent) {
        FigmaToken.store(null)
        e.project?.let {
            NotificationGroupManager.getInstance().getNotificationGroup("Mateu")
                .createNotification("The Figma token was removed from the IDE.", NotificationType.INFORMATION).notify(it)
        }
    }
}
