package io.mateu.ijp.hub

import com.intellij.ide.CliResult
import com.intellij.ide.ProtocolHandler
import com.intellij.ide.impl.ProjectUtil
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.application.PathManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.project.ProjectManager
import io.mateu.ijp.plugin.MateuProjectService
import io.mateu.ijp.plugin.loadMateuConfig
import java.io.File

/**
 * `mateu://add?u=…` / `mateu://import?d=…` opened anywhere on the machine (a browser, a chat, the
 * mateu.io/add page's "Open in the Mateu app" button, a developer's IDE handing over the app it just
 * started) reaches the desktop app: the installer registers the scheme for the HUB variant only (macOS
 * Info.plist, the Windows registry, a Linux .desktop file) and the platform hands the link to the
 * `com.intellij.protocolHandler` extensions by scheme.
 *
 * The link is NOT trusted here: it goes through the same add flow as a scanned code (parse, look the
 * UI up, confirm with the domain shown big). A build without the hub refuses it.
 *
 * A link can also START the app: the platform then takes the URL as the whole command line and does
 * not open the workspace the launcher passes — the app sat on IntelliJ's welcome screen and refused
 * the link ("does not add UIs from links"). With no hub project open, the hub app opens its bundled
 * workspace first.
 */
class MateuProtocolHandler : ProtocolHandler {

    override val scheme: String = SCHEME

    override suspend fun process(query: String): CliResult {
        val link = asLink(query)
        val project = hubProject() ?: openBundledWorkspace()
            ?: return CliResult(1, "This Mateu app does not add UIs from links.")
        ApplicationManager.getApplication().invokeLater {
            project.getService(MateuProjectService::class.java).handleHubLink(link)
        }
        return CliResult.OK
    }

    private fun hubProject(): Project? =
        ProjectManager.getInstance().openProjects.firstOrNull { loadMateuConfig(it).hub }

    /** The hub app's own workspace, opened (only in the hub app: a developer's IDE never becomes one). */
    private suspend fun openBundledWorkspace(): Project? {
        if (System.getProperty("mateu.variant") != "hub") return null
        val dir = bundledWorkspaceOf(PathManager.getHomePath()) ?: return null
        val project = ProjectUtil.openOrImportAsync(dir.toPath()) ?: return null
        return project.takeIf { loadMateuConfig(it).hub }
    }

    companion object {
        const val SCHEME = "mateu"

        /** The platform hands over the part after `mateu://` (or, depending on the path it took, the whole link). */
        fun asLink(query: String): String = if (query.startsWith("$SCHEME:", ignoreCase = true)) query else "$SCHEME://${query.removePrefix("//")}"

        /**
         * The workspace the installers bundle next to the IDE: `Contents/Resources/workspace` in the
         * macOS app (whose IDE home is `Contents`), `<bundle>/workspace` in the Windows and Linux
         * bundles (the IDE home is the bundle). Null when there is none (a developer's IDE).
         */
        fun bundledWorkspaceOf(ideHome: String): File? =
            listOf(File(ideHome, "Resources/workspace"), File(ideHome, "workspace")).firstOrNull { it.isDirectory }
    }
}
