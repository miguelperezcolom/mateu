package io.mateu.ijp.hub

import com.intellij.ide.CliResult
import com.intellij.ide.ProtocolHandler
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.project.ProjectManager
import io.mateu.ijp.plugin.MateuProjectService
import io.mateu.ijp.plugin.loadMateuConfig

/**
 * `mateu://add?u=…` / `mateu://import?d=…` opened anywhere on the machine (a browser, a chat, the
 * mateu.io/add page's "Open in the Mateu app" button) reaches the desktop app: the installer registers
 * the scheme for the HUB variant only (macOS Info.plist, the Windows registry, a Linux .desktop file)
 * and the platform hands the link to the `com.intellij.protocolHandler` extensions by scheme.
 *
 * The link is NOT trusted here: it goes through the same add flow as a scanned code (parse, look the
 * UI up, confirm with the domain shown big). A build without the hub refuses it.
 */
class MateuProtocolHandler : ProtocolHandler {

    override val scheme: String = SCHEME

    override suspend fun process(query: String): CliResult {
        val link = asLink(query)
        val project = ProjectManager.getInstance().openProjects.firstOrNull { loadMateuConfig(it).hub }
            ?: return CliResult(1, "This Mateu app does not add UIs from links.")
        ApplicationManager.getApplication().invokeLater {
            project.getService(MateuProjectService::class.java).handleHubLink(link)
        }
        return CliResult.OK
    }

    companion object {
        const val SCHEME = "mateu"

        /** The platform hands over the part after `mateu://` (or, depending on the path it took, the whole link). */
        fun asLink(query: String): String = if (query.startsWith("$SCHEME:", ignoreCase = true)) query else "$SCHEME://${query.removePrefix("//")}"
    }
}
