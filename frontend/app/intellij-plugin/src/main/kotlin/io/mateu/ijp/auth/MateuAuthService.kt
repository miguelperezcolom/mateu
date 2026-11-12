package io.mateu.ijp.auth

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
 * OIDC sessions are PER UI ([OidcSessions], keyed by backend + issuer + client): the desktop hub
 * switching the project to another UI reads that UI's session, so coming back to a UI finds you still
 * signed in, and no UI's token ever reaches another backend or another identity provider.
 *
 * On a 401 an OIDC session first tries a silent refresh; when that is not possible the user gets ONE
 * notification (throttled) offering to sign in / open the settings, and the call fails.
 */
@Service(Service.Level.PROJECT)
class MateuAuthService(private val project: Project) : TokenProvider {

    @Volatile private var lastPrompt = 0L
    private val sessions get() = MateuCredentials.sessions

    private val settings get() = MateuSettings.getInstance(project).state
    private val backend get() = loadMateuConfig(project).baseUrl

    override fun accessToken(): String? = tokenOf(backend)

    override fun onUnauthorized(rejected: String?): Boolean = reauthenticate(backend, rejected)

    override fun sessionScope(): String? {
        if (!System.getProperty("mateu.token").isNullOrBlank()) return MANUAL_TOKEN_SCOPE
        return when (settings.authMode) {
            AuthMode.NONE -> null
            AuthMode.TOKEN -> MANUAL_TOKEN_SCOPE
            AuthMode.OIDC -> sessionKey().let { "${it.issuer}|${it.clientId}" }
        }
    }

    /**
     * The credentials for an [io.mateu.ijp.state.AppSession] of the UI the project points at NOW. The
     * project's own provider follows the settings, and the hub rewrites those on every switch: anything
     * of the previous UI still running (an island's timer, a 401 retry, the chat) would pick up the next
     * UI's token. This one stays with its UI and answers nothing once the project has moved on.
     */
    fun forCurrentUi(): TokenProvider =
        SessionBoundTokens(backend, { backend }, sessionScope(), ::tokenOf, ::reauthenticate)

    private fun tokenOf(backend: String): String? {
        System.getProperty("mateu.token")?.ifBlank { null }?.let { return it }
        return when (settings.authMode) {
            AuthMode.NONE -> null
            AuthMode.TOKEN -> MateuCredentials.get(MateuCredentials.Kind.TOKEN, backend)
            AuthMode.OIDC -> keyOf(backend).let { key -> sessions.accessToken(key) ?: refreshSilently(key) }
        }
    }

    private fun reauthenticate(backend: String, rejected: String?): Boolean {
        if (settings.authMode == AuthMode.OIDC) {
            val key = keyOf(backend)
            sessions.evict(key, rejected)
            if (refreshSilently(key) != null) return true
        }
        promptForCredentials()
        return false
    }

    private fun keyOf(backend: String): OidcSessions.SessionKey =
        OidcSessions.SessionKey.of(backend, settings.oidcIssuer, settings.oidcClientId)

    /** The OIDC session of the UI the project points at now. */
    fun sessionKey(): OidcSessions.SessionKey = keyOf(backend)

    /** OIDC: exchange the stored refresh token for a new access token (null when there is none / refused). */
    private fun refreshSilently(key: OidcSessions.SessionKey): String? =
        sessions.refreshing(key) { refreshLocked(key) }

    private fun refreshLocked(key: OidcSessions.SessionKey): String? {
        sessions.accessToken(key)?.let { return it }
        val refresh = sessions.refreshToken(key) ?: return null
        val config = oidcConfig()
        // the settings moved between reading the key and the config: this token is not for that provider
        if (OidcSessions.SessionKey.of(key.backend, config.issuer.orEmpty(), config.clientId) != key) return null
        val tokens = try {
            OidcDeviceFlow(config).refresh(refresh)
        } catch (revoked: OidcDeviceFlow.RefreshTokenRevoked) {
            sessions.storeRefreshToken(key, null)
            null
        } catch (e: Exception) {
            null
        } ?: return null
        sessions.rememberAccessToken(key, tokens.accessToken)
        tokens.refreshToken?.let { sessions.storeRefreshToken(key, it) }
        return tokens.accessToken
    }

    fun oidcConfig(): OidcConfig = settings.let {
        OidcConfig(
            issuer = it.oidcIssuer,
            clientId = it.oidcClientId,
            scope = it.oidcScope,
            deviceAuthorizationEndpoint = it.oidcDeviceEndpoint,
            tokenEndpoint = it.oidcTokenEndpoint,
            audience = it.oidcAudience.ifBlank { null },
        )
    }

    fun isSignedIn(): Boolean = when (settings.authMode) {
        AuthMode.NONE -> false
        AuthMode.TOKEN -> MateuCredentials.get(MateuCredentials.Kind.TOKEN, backend) != null
        AuthMode.OIDC -> sessions.isSignedIn(sessionKey())
    }

    /** Store (or clear, with blank) the manual bearer token for the current backend. */
    fun setManualToken(token: String?) = MateuCredentials.set(MateuCredentials.Kind.TOKEN, backend, token)

    /** Sign out of the UI the project points at now — the other UIs keep their sessions. */
    fun signOut() {
        when (settings.authMode) {
            AuthMode.OIDC -> sessions.signOut(sessionKey())
            else -> MateuCredentials.clear(backend)
        }
    }

    /**
     * OIDC sign-in. A UI with several sign-in providers (the desktop hub's entry) first asks which one
     * ([io.mateu.ijp.hub.SignInChooserDialog], on the EDT); cancelling it ends here with false.
     */
    fun signIn(onDone: (Boolean) -> Unit = {}) {
        val hub = project.getService(io.mateu.ijp.plugin.MateuProjectService::class.java)
        val providers = hub?.signInProviders().orEmpty()
        if (providers.size > 1) {
            val chosen = io.mateu.ijp.hub.SignInChooserDialog.choose(project, hub!!.signInUiName(), providers, hub.lastSignInProvider())
            if (chosen == null) {
                onDone(false)
                return
            }
            hub.useSignInProvider(chosen)
        }
        startSignIn { ok ->
            if (ok) hub?.signedInWith(settings.oidcProviderId)
            onDone(ok)
        }
    }

    /**
     * The sign-in itself as a cancellable background task. With a device grant (RFC 8628): show the user
     * code, open the verification page, poll until approved. Without one (Google's web clients, Apple,
     * most social IdPs): Authorization Code + PKCE with a loopback redirect to this machine (RFC 8252),
     * the provider's page opened in the system browser. [onDone] runs on the EDT with the outcome.
     */
    private fun startSignIn(onDone: (Boolean) -> Unit) {
        val flow = OidcDeviceFlow(oidcConfig())
        val target = sessionKey()
        ProgressManager.getInstance().run(object : Task.Backgroundable(project, "Signing in to Mateu", true) {
            private var ok = false
            private var error: String? = null

            override fun run(indicator: ProgressIndicator) {
                try {
                    val discovery = flow.discovery()
                    if (discovery.device == null) {
                        indicator.text = "Continue the sign-in in your browser"
                        val tokens = flow.loopback(discovery, browse = { io.mateu.ijp.ui.SafeHtml.browse(it) }, cancelled = { indicator.isCanceled })
                        sessions.rememberAccessToken(target, tokens.accessToken)
                        sessions.storeRefreshToken(target, tokens.refreshToken)
                        ok = true
                        return
                    }
                    val endpoints = OidcDeviceFlow.Endpoints(
                        discovery.device,
                        discovery.token ?: throw OidcDeviceFlow.OidcException("The provider at ${flow.issuer} does not advertise a token_endpoint."),
                    )
                    val code = flow.start(endpoints)
                    indicator.text = "Confirm code ${code.userCode} in your browser"
                    notify(
                        "Mateu sign-in",
                        "Confirm the code <b>${io.mateu.ijp.ui.SafeHtml.escape(code.userCode)}</b> at ${io.mateu.ijp.ui.SafeHtml.escape(code.verificationUri)}",
                        NotificationType.INFORMATION,
                    )
                    io.mateu.ijp.ui.SafeHtml.browse(code.browseUri)
                    val tokens = flow.poll(endpoints, code) { indicator.isCanceled }
                    sessions.rememberAccessToken(target, tokens.accessToken)
                    sessions.storeRefreshToken(target, tokens.refreshToken)
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
                    // not "your session has expired": the first visit to a UI that signs in lands here too
                    AuthMode.OIDC -> "Sign in to $backend to continue."
                },
                NotificationType.WARNING,
            )
            if (settings.authMode == AuthMode.OIDC) {
                // signed in: the UI loads again (what was refused is still blank otherwise)
                n.addAction(NotificationAction.createSimpleExpiring("Sign in…") {
                    signIn { ok -> if (ok) project.getService(io.mateu.ijp.plugin.MateuProjectService::class.java).reconnect() }
                })
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
        private const val MANUAL_TOKEN_SCOPE = "manual-token"

        fun getInstance(project: Project): MateuAuthService = project.getService(MateuAuthService::class.java)
    }
}

/**
 * Credentials tied to one backend: always asked for THAT backend, and nothing at all once the project
 * points at another one (finding: an island or a pending retry of a UI the hub left, sending the next
 * UI's token to wherever the old UI pointed). Pure, so it is unit-tested without the IDE.
 */
internal class SessionBoundTokens(
    private val boundBackend: String,
    private val currentBackend: () -> String,
    private val scope: String?,
    private val tokenFor: (String) -> String?,
    private val reauthenticateFor: (String, String?) -> Boolean,
) : TokenProvider {
    private fun stillCurrent() = currentBackend() == boundBackend

    override fun accessToken(): String? = if (stillCurrent()) tokenFor(boundBackend) else null

    override fun onUnauthorized(rejected: String?): Boolean =
        stillCurrent() && reauthenticateFor(boundBackend, rejected)

    override fun sessionScope(): String? = scope
}
