package io.mateu.ijp.plugin

import com.intellij.openapi.components.service
import com.intellij.openapi.options.BoundSearchableConfigurable
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.DialogPanel
import com.intellij.openapi.wm.ToolWindowManager
import com.intellij.ui.components.JBPasswordField
import com.intellij.ui.dsl.builder.AlignX
import com.intellij.ui.dsl.builder.bindItem
import com.intellij.ui.dsl.builder.bindText
import com.intellij.ui.dsl.builder.panel
import com.intellij.ui.layout.selected
import com.intellij.ui.layout.selectedValueIs
import io.mateu.ijp.ui.accessibleName
import io.mateu.ijp.ui.plain
import io.mateu.ijp.auth.MateuAuthService
import io.mateu.ijp.newfile.ProjectDescriptor
import io.mateu.ijp.newfile.ProjectRenderer
import io.mateu.ijp.plugin.MateuSettings.AuthMode
import javax.swing.JComboBox

/**
 * Settings | Tools | Mateu — per project: which backend this project talks to (base URL, or an app
 * registry + app id), the start route, and how to authenticate (none / bearer token / OIDC device
 * sign-in). Secrets go to the IDE credential store, not to `.idea/mateu.xml`. Values forced with
 * `-Dmateu.*` win and are listed at the top so a setting that "does nothing" is explained.
 */
class MateuConfigurable(private val project: Project) :
    BoundSearchableConfigurable("Mateu", "io.mateu.settings", "io.mateu.settings") {

    private val settings get() = MateuSettings.getInstance(project).state
    private val auth get() = MateuAuthService.getInstance(project)
    private val tokenField = JBPasswordField()
    private var tokenDirty = false
    private var resetting = false

    init {
        tokenField.document.addDocumentListener(object : com.intellij.ui.DocumentAdapter() {
            override fun textChanged(e: javax.swing.event.DocumentEvent) {
                if (!resetting) tokenDirty = true
            }
        })
    }
    private lateinit var authCombo: JComboBox<AuthMode>

    /**
     * The renderer as on screen. Not a persisted setting: specs/ui/project.yaml is the truth — it is
     * read on [reset] and written on [apply].
     */
    private val rendererCombo = JComboBox(ProjectDescriptor.Renderer.entries.toTypedArray())
    private var rendererOnDisk: ProjectDescriptor.Renderer = ProjectDescriptor.Renderer.VAADIN

    override fun createPanel(): DialogPanel = panel {
        val overrides = systemOverrides()
        if (overrides.isNotEmpty()) {
            row {
                comment("Overridden by JVM system properties: ${overrides.joinToString { "-D$it" }}")
            }
        }
        group("Project") {
            row("Renderer:") {
                cell(rendererCombo).comment(
                    "Saved in <code>specs/ui/project.yaml</code> (<code>type: Project</code>), the project's truth: the visual " +
                        "editor and Play open in it and the static bundle ships it. A served app renders with its Maven " +
                        "dependency (${ProjectDescriptor.Renderer.entries.joinToString(" / ") { it.coordinates }}); " +
                        "the server warns at startup when the two disagree.",
                )
            }
        }
        group("Backend") {
            row("Base URL:") {
                textField().bindText(settings::baseUrl).align(AlignX.FILL)
                    .comment("The Mateu backend serving this project's UI, e.g. $DEFAULT_BASE_URL. " +
                        "Leave empty (and no registry) to keep Mateu off for this project.")
            }
            row("Start route:") {
                textField().bindText(settings::route).comment("Route opened on boot (default /).")
            }
            row("Registry URL:") {
                textField().bindText(settings::registryUrl).align(AlignX.FILL)
                    .comment("Optional app registry; with an app id it supplies the base URL and launch parameters.")
            }
            row("App id:") { textField().bindText(settings::appId) }
        }
        group("Authentication") {
            row("Mode:") {
                authCombo = comboBox(AuthMode.entries).bindItem(
                    { settings.authMode },
                    { settings.authMode = it ?: AuthMode.NONE },
                ).component
            }
            row("Bearer token:") {
                cell(tokenField).align(AlignX.FILL)
                    .comment("Stored in the IDE credential store, never in the project files. Sent as Authorization: Bearer.")
            }.visibleIf(authCombo.selectedValueIs(AuthMode.TOKEN))
            rowsRange {
                row("Issuer:") {
                    textField().bindText(settings::oidcIssuer).align(AlignX.FILL)
                        .comment("Endpoints are discovered from {issuer}/.well-known/openid-configuration. With a device " +
                            "endpoint the IDE signs in with a code; without one, in the browser through a loopback redirect " +
                            "(<code>http://127.0.0.1:&lt;any port&gt;/callback</code>, to be allowed for this client).")
                }
                row("Client id:") { textField().bindText(settings::oidcClientId) }
                row("Scope:") { textField().bindText(settings::oidcScope).align(AlignX.FILL) }
                row("Audience:") {
                    textField().bindText(settings::oidcAudience).align(AlignX.FILL)
                        .comment("Optional: the API audience some providers (Auth0) need to mint a JWT access token.")
                }
                row("Device endpoint:") {
                    textField().bindText(settings::oidcDeviceEndpoint).align(AlignX.FILL).comment("Optional override.")
                }
                row("Token endpoint:") {
                    textField().bindText(settings::oidcTokenEndpoint).align(AlignX.FILL).comment("Optional override.")
                }
                row {
                    button("Sign In…") {
                        apply() // sign in against what is on screen
                        auth.signIn()
                    }
                    button("Sign Out") { auth.signOut() }
                }
            }.visibleIf(authCombo.selectedValueIs(AuthMode.OIDC))
        }
        agentGroup()
    }

    // ── AI agents (the desktop app's own MCP server, io.mateu.ijp.mcp) — app-wide, OFF by default ──

    private val mcp get() = io.mateu.ijp.mcp.DesktopMcpService.getInstance()
    private val mcpTexts = io.mateu.ijp.mcp.McpTexts.of(io.mateu.ijp.ui.MoneyValues.uiLocale())
    private val mcpEnabled = com.intellij.ui.components.JBCheckBox(plain(mcpTexts.enable))
    private val mcpPort = com.intellij.ui.components.JBTextField(6)
    private val mcpAddress = com.intellij.ui.components.JBTextField().apply { isEditable = false }
    private val mcpTokenShown = com.intellij.ui.components.JBTextField().apply { isEditable = false }
    private val mcpClaude = com.intellij.ui.components.JBTextArea(2, 60).apply { isEditable = false; lineWrap = true }
    private val mcpJson = com.intellij.ui.components.JBTextArea(9, 60).apply { isEditable = false }
    private val mcpNote = javax.swing.JLabel("")

    private fun com.intellij.ui.dsl.builder.Panel.agentGroup() {
        val t = mcpTexts
        mcpEnabled.accessibleName(t.enable)
        mcpPort.accessibleName(t.port.removeSuffix(":").trim())
        mcpAddress.accessibleName(t.address.removeSuffix(":").trim())
        mcpTokenShown.accessibleName(t.token.removeSuffix(":").trim())
        mcpClaude.accessibleName(t.claudeCode.removeSuffix(":").trim())
        mcpJson.accessibleName(t.anyClient.removeSuffix(":").trim())
        group(t.group) {
            row { cell(mcpEnabled).comment(t.enableHelp) }
            rowsRange {
                row(t.port) { cell(mcpPort) }
                row(t.address) { cell(mcpAddress).align(AlignX.FILL) }
                row(t.token) {
                    cell(mcpTokenShown).align(AlignX.FILL)
                    button(t.copy) { copy(mcp.token()) }.applyToComponent { accessibleName("${t.copy} ${t.token.removeSuffix(":").trim()}") }
                    button(t.regenerate) {
                        mcp.regenerateToken()
                        refreshMcp()
                        mcpNote.text = t.regenerated
                    }
                }
                row(t.claudeCode) {
                    cell(mcpClaude).align(AlignX.FILL)
                    button(t.copy) { copy(io.mateu.ijp.mcp.McpHttpServer.claudeCodeSnippet(mcp.port, mcp.token())) }
                        .applyToComponent { accessibleName("${t.copy} ${t.claudeCode.removeSuffix(":").trim()}") }
                }
                row(t.anyClient) {
                    cell(mcpJson).align(AlignX.FILL)
                    button(t.copy) { copy(io.mateu.ijp.mcp.McpHttpServer.jsonSnippet(mcp.port, mcp.token())) }
                        .applyToComponent { accessibleName("${t.copy} ${t.anyClient.removeSuffix(":").trim()}") }
                }
                row { cell(mcpNote) }
            }.visibleIf(mcpEnabled.selected)
        }
    }

    private fun copy(text: String) {
        com.intellij.openapi.ide.CopyPasteManager.getInstance().setContents(java.awt.datatransfer.StringSelection(text))
        mcpNote.text = mcpTexts.copied
    }

    /** What the agent fields show. The token itself only ever goes to the clipboard: on screen, dots. */
    private fun refreshMcp() {
        val masked = "••••••••••••"
        val port = mcp.port
        mcpAddress.text = io.mateu.ijp.mcp.McpHttpServer.urlOf(port)
        mcpTokenShown.text = masked
        mcpClaude.text = io.mateu.ijp.mcp.McpHttpServer.claudeCodeSnippet(port, masked)
        mcpJson.text = io.mateu.ijp.mcp.McpHttpServer.jsonSnippet(port, masked)
    }

    private fun mcpPortTyped(): Int =
        mcpPort.text.trim().toIntOrNull()?.takeIf { it in 1024..65535 } ?: mcp.state.port

    private fun resetMcp() {
        mcpEnabled.isSelected = mcp.enabled
        mcpPort.text = mcp.state.port.toString()
        mcpNote.text = ""
        refreshMcp()
    }

    private fun mcpModified(): Boolean = mcpEnabled.isSelected != mcp.enabled || mcpPortTyped() != mcp.state.port

    private fun applyMcp() {
        if (!mcpModified()) return
        val note = runCatching { mcp.setEnabled(mcpEnabled.isSelected, mcpPortTyped()) }
            .getOrElse { throw com.intellij.openapi.options.ConfigurationException(it.message ?: "The MCP server did not start") }
        refreshMcp()
        mcpNote.text = note.orEmpty()
    }

    override fun reset() {
        super.reset()
        rendererOnDisk = ProjectRenderer.rendererOf(project)
        rendererCombo.selectedItem = rendererOnDisk
        resetting = true
        tokenField.text = if (auth.isSignedIn() && settings.authMode == AuthMode.TOKEN) TOKEN_MASK else ""
        resetting = false
        tokenDirty = false
        resetMcp()
    }

    override fun isModified(): Boolean = super.isModified() || tokenDirty || selectedRenderer() != rendererOnDisk || mcpModified()

    private fun selectedRenderer() = rendererCombo.selectedItem as? ProjectDescriptor.Renderer ?: ProjectDescriptor.Renderer.VAADIN

    override fun apply() {
        val wasConfigured = loadMateuConfig(project).configured
        super.apply()
        applyMcp()
        val renderer = selectedRenderer()
        if (renderer != rendererOnDisk) {
            ProjectRenderer.setRenderer(project, renderer)?.let { throw com.intellij.openapi.options.ConfigurationException(it) }
            rendererOnDisk = renderer
        }
        if (tokenDirty) {
            val typed = String(tokenField.password)
            if (typed != TOKEN_MASK) auth.setManualToken(typed)
            tokenDirty = false
        }
        // A project that just got a backend: make the Mateu tool windows available and boot the app.
        val cfg = loadMateuConfig(project)
        ToolWindowManager.getInstance(project).let { twm ->
            twm.getToolWindow("Mateu")?.isAvailable = cfg.configured
        }
        if (cfg.configured && !wasConfigured) project.service<MateuProjectService>().ensureBooted()
    }

    private companion object {
        /** Shown instead of the stored token, which is never read back into the UI. */
        const val TOKEN_MASK = "••••••••"
    }
}
