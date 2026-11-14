package io.mateu.ijp.mcp

import com.intellij.openapi.diagnostic.Logger
import com.intellij.openapi.project.Project
import com.intellij.openapi.startup.ProjectActivity

/**
 * Starts the desktop MCP server when the user left it ON (it is off by default), and installs the
 * "an agent is operating" notice. Idempotent: the server and the notice are app-wide, the first
 * project to open starts them.
 */
class DesktopMcpStartup : ProjectActivity {
    override suspend fun execute(project: Project) {
        val service = DesktopMcpService.getInstance()
        AgentActivityNotice.install(service)
        runCatching { service.startIfEnabled() }
            .onFailure { Logger.getInstance(DesktopMcpStartup::class.java).warn("Mateu desktop MCP server did not start", it) }
    }
}
