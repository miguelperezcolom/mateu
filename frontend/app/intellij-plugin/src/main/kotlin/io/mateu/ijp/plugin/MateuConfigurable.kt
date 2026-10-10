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
import com.intellij.ui.layout.selectedValueIs
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
                        .comment("Endpoints are discovered from {issuer}/.well-known/openid-configuration.")
                }
                row("Client id:") { textField().bindText(settings::oidcClientId) }
                row("Scope:") { textField().bindText(settings::oidcScope).align(AlignX.FILL) }
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
    }

    override fun reset() {
        super.reset()
        rendererOnDisk = ProjectRenderer.rendererOf(project)
        rendererCombo.selectedItem = rendererOnDisk
        resetting = true
        tokenField.text = if (auth.isSignedIn() && settings.authMode == AuthMode.TOKEN) TOKEN_MASK else ""
        resetting = false
        tokenDirty = false
    }

    override fun isModified(): Boolean = super.isModified() || tokenDirty || selectedRenderer() != rendererOnDisk

    private fun selectedRenderer() = rendererCombo.selectedItem as? ProjectDescriptor.Renderer ?: ProjectDescriptor.Renderer.VAADIN

    override fun apply() {
        val wasConfigured = loadMateuConfig(project).configured
        super.apply()
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
            listOf("Mateu", "Mateu Results").forEach { id -> twm.getToolWindow(id)?.isAvailable = cfg.configured }
        }
        if (cfg.configured && !wasConfigured) project.service<MateuProjectService>().ensureBooted()
    }

    private companion object {
        /** Shown instead of the stored token, which is never read back into the UI. */
        const val TOKEN_MASK = "••••••••"
    }
}
