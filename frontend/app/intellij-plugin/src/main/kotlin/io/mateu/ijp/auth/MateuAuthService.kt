package io.mateu.ijp.auth

import com.intellij.ide.BrowserUtil
import com.intellij.notification.NotificationAction
import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.Service
import com.intellij.openapi.options.ShowSettingsUtil
import com.intellij.openapi.progress.ProgressIndicator
import com.intellij.openapi.progress.ProgressManager
import com.intellij.openapi.progress.Task
import com.intellij.openapi.project.Project
import io.mateu.ijp.api.TokenProvider
import io.mateu.ijp.plugin.MateuConfigurable
import io.mateu.ijp.plugin.MateuSettings
import io.mateu.ijp.plugin.MateuSettings.AuthMode
import io.mateu.ijp.plugin.loadMateuConfig

/**
 * The project's credentials for its Mateu backend — the [TokenProvider] every Mateu HTTP call of the
 * project uses (app shell, views, contract lookups, the visual editor's proxy, the assistant).
 *
 * Modes (Settings | Tools | Mateu): no auth; a manual bearer token; or OpenID Connect sign-in with
 * the device flow (the refresh token is kept in PasswordSafe, the access token only in memory and
 * refreshed on demand). `-Dmateu.token=…` overrides everything (CI, probes).
 *
 * On a 401 an OIDC session first tries a silent refresh; when that is not possible the user gets ONE
 * notification (throttled) offering to sign in / open the settings, and the call fails.
 */
@Service(Service.Level.PROJECT)
class MateuAuthService(private val project: Project) : TokenProvider {

    @Volatile private var accessToken: String? = null
    @Volatile private var lastPrompt = 0L

    private val settings get() = MateuSettings.getInstance(project).state
    private val backend get() = loadMateuConfig(project).baseUrl

    override fun accessToken(): String? {
        System.getProperty("mateu.token")?.ifBlank { null }?.let { return it }
        return when (settings.authMode) {
            AuthMode.NONE -> null
            AuthMode.TOKEN -> MateuCredentials.get(MateuCredentials.Kind.TOKEN, backend)
            AuthMode.OIDC -> accessToken ?: refreshSilently()
        }
    }

    override fun onUnauthorized(rejected: String?): Boolean {
        if (settings.authMode == AuthMode.OIDC) {
            if (rejected != null && rejected == accessToken) accessToken = null
            if (refreshSilently() != null) return true
        }
        promptForCredentials()
        return false
    }

    /** OIDC: exchange the stored refresh token for a new access token (null when there is none / refused). */
    @Synchronized
    private fun refreshSilently(): String? {
        accessToken?.let { return it }
        val refresh = MateuCredentials.get(MateuCredentials.Kind.REFRESH_TOKEN, backend) ?: return null
        val tokens = runCatching { OidcDeviceFlow(oidcConfig()).refresh(refresh) }.getOrNull() ?: return null
        accessToken = tokens.accessToken
        tokens.refreshToken?.let { MateuCredentials.set(MateuCredentials.Kind.REFRESH_TOKEN, backend, it) }
        return tokens.accessToken
    }

    fun oidcConfig(): OidcConfig = settings.let {
        OidcConfig(
            issuer = it.oidcIssuer,
            clientId = it.oidcClientId,
            scope = it.oidcScope,
            deviceAuthorizationEndpoint = it.oidcDeviceEndpoint,
            tokenEndpoint = it.oidcTokenEndpoint,
        )
    }

    fun isSignedIn(): Boolean = when (settings.authMode) {
        AuthMode.NONE -> false
        AuthMode.TOKEN -> MateuCredentials.get(MateuCredentials.Kind.TOKEN, backend) != null
        AuthMode.OIDC -> accessToken != null || MateuCredentials.get(MateuCredentials.Kind.REFRESH_TOKEN, backend) != null
    }

    /** Store (or clear, with blank) the manual bearer token for the current backend. */
    fun setManualToken(token: String?) = MateuCredentials.set(MateuCredentials.Kind.TOKEN, backend, token)

    fun signOut() {
        accessToken = null
        MateuCredentials.clear(backend)
    }

    /**
     * OIDC device sign-in as a cancellable background task: show the user code, open the browser on
     * the verification page, poll until approved. [onDone] runs on the EDT with the outcome.
     */
    fun signIn(onDone: (Boolean) -> Unit = {}) {
        val flow = OidcDeviceFlow(oidcConfig())
        val target = backend
        ProgressManager.getInstance().run(object : Task.Backgroundable(project, "Signing in to Mateu", true) {
            private var ok = false
            private var error: String? = null

            override fun run(indicator: ProgressIndicator) {
                try {
                    val endpoints = flow.endpoints()
                    val code = flow.start(endpoints)
                    indicator.text = "Confirm code ${code.userCode} in your browser"
                    notify(
                        "Mateu sign-in",
                        "Confirm the code <b>${code.userCode}</b> at ${code.verificationUri}",
                        NotificationType.INFORMATION,
                    )
                    BrowserUtil.browse(code.browseUri)
                    val tokens = flow.poll(endpoints, code) { indicator.isCanceled }
                    accessToken = tokens.accessToken
                    MateuCredentials.set(MateuCredentials.Kind.REFRESH_TOKEN, target, tokens.refreshToken)
                    ok = true
                } catch (e: Exception) {
                    error = e.message ?: e.toString()
                }
            }

            override fun onFinished() {
                if (ok) {
                    notify("Mateu", "Signed in.", NotificationType.INFORMATION)
                } else {
                    error?.let { notify("Mateu sign-in failed", it, NotificationType.ERROR) }
                }
                onDone(ok)
            }
        })
    }

    /** One balloon at most every 30 s, so a screen firing several calls does not stack them. */
    private fun promptForCredentials() {
        val now = System.currentTimeMillis()
        if (now - lastPrompt < 30_000) return
        lastPrompt = now
        ApplicationManager.getApplication().invokeLater({
            val n = NotificationGroupManager.getInstance().getNotificationGroup("Mateu").createNotification(
                "Mateu: authentication required",
                when (settings.authMode) {
                    AuthMode.NONE -> "The backend at $backend requires authentication. Configure it in Settings | Tools | Mateu."
                    AuthMode.TOKEN -> "The backend at $backend rejected the configured token."
                    AuthMode.OIDC -> "Your session with $backend has expired."
                },
                NotificationType.WARNING,
            )
            if (settings.authMode == AuthMode.OIDC) {
                n.addAction(NotificationAction.createSimpleExpiring("Sign in…") { signIn() })
            }
            n.addAction(NotificationAction.createSimpleExpiring("Open settings") {
                ShowSettingsUtil.getInstance().showSettingsDialog(project, MateuConfigurable::class.java)
            })
            n.notify(project)
        }, project.disposed)
    }

    private fun notify(title: String, text: String, type: NotificationType) =
        ApplicationManager.getApplication().invokeLater({
            NotificationGroupManager.getInstance().getNotificationGroup("Mateu")
                .createNotification(title, text, type).notify(project)
        }, project.disposed)

    companion object {
        fun getInstance(project: Project): MateuAuthService = project.getService(MateuAuthService::class.java)
    }
}
