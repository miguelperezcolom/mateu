package io.mateu.ijp.mcp

import com.intellij.credentialStore.CredentialAttributes
import com.intellij.credentialStore.Credentials
import com.intellij.credentialStore.generateServiceName
import com.intellij.ide.passwordSafe.PasswordSafe
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.PersistentStateComponent
import com.intellij.openapi.components.RoamingType
import com.intellij.openapi.components.Service
import com.intellij.openapi.components.Storage
import com.intellij.openapi.diagnostic.Logger
import java.util.concurrent.CopyOnWriteArrayList

/**
 * The desktop app's own MCP server (NOT JetBrains' IDE MCP server, which drives the IDE itself):
 * lets an AI agent operate the Mateu UIs open in this app, as the user, on screen.
 *
 * OFF by default ([State.enabled]); turned on in Settings › Tools › Mateu. When on it listens on
 * 127.0.0.1 only ([McpHttpServer]), and every request needs the token — 32 random bytes generated
 * when it is turned on, kept in PasswordSafe (never in mateu-desktop-mcp.xml, never logged),
 * regenerable. While an agent is calling it, [AgentActivityNotice] says so in the app window, with
 * Stop (= turn it off). Each tool call is logged at INFO (tool + route / action ids, never values).
 */
@Service(Service.Level.APP)
@com.intellij.openapi.components.State(
    name = "MateuDesktopMcp",
    storages = [Storage(value = "mateu-desktop-mcp.xml", roamingType = RoamingType.DISABLED)],
)
class DesktopMcpService : PersistentStateComponent<DesktopMcpService.State>, com.intellij.openapi.Disposable {

    class State {
        var enabled: Boolean = false
        var port: Int = McpHttpServer.DEFAULT_PORT
    }

    private var state = State()

    override fun getState(): State = state

    override fun loadState(loaded: State) {
        state = State().also { com.intellij.util.xmlb.XmlSerializerUtil.copyBean(loaded, it) }
    }

    @Volatile private var cachedToken: String? = null

    private val protocol = McpProtocol(LiveUi(), onUnexpected = { reference, error ->
        LOG.warn("MCP call failed (reference $reference)", error)
    })

    private val server = McpHttpServer(protocol, token = { cachedToken }, onRequest = { touch() })

    @Volatile var lastCallAt: Long = 0
        private set

    private val listeners = CopyOnWriteArrayList<() -> Unit>()

    /** Called on any change: turned on/off, a new token, an agent call (EDT not guaranteed). */
    fun subscribe(listener: () -> Unit): () -> Unit {
        listeners.add(listener)
        return { listeners.remove(listener) }
    }

    private fun changed() = listeners.forEach { runCatching { it() } }

    val enabled: Boolean get() = state.enabled
    val running: Boolean get() = server.running

    /** The port the server listens on, else the configured one. */
    val port: Int get() = server.port.takeIf { it > 0 } ?: state.port

    val url: String get() = McpHttpServer.urlOf(port)

    /** The token (from PasswordSafe), generating one if there is none. Never log it. */
    fun token(): String {
        cachedToken?.let { return it }
        val stored = PasswordSafe.instance.getPassword(TOKEN_ATTRIBUTES)?.ifBlank { null }
        val token = stored ?: McpRequestGuard.newToken().also(::storeToken)
        cachedToken = token
        return token
    }

    /** A new token: agents holding the old one are refused from the next request on. */
    fun regenerateToken(): String {
        val token = McpRequestGuard.newToken()
        storeToken(token)
        cachedToken = token
        changed()
        return token
    }

    private fun storeToken(token: String) = PasswordSafe.instance.set(TOKEN_ATTRIBUTES, Credentials("mateu", token))

    /**
     * Turns it on or off (persisted). On: a token exists and the server listens.
     * @return null, or a note for the user (the preferred port was busy).
     */
    fun setEnabled(on: Boolean, port: Int = state.port): String? {
        state.enabled = on
        state.port = port
        return if (on) start() else { stop(); null }
    }

    /** Starts the server when enabled (app start); null or the busy-port note. */
    fun startIfEnabled(): String? = if (state.enabled && !server.running) start() else null

    private fun start(): String? {
        token()
        val actual = server.start(state.port)
        LOG.info("Mateu desktop MCP server listening on ${McpHttpServer.urlOf(actual)}")
        changed()
        return if (actual != state.port) McpTexts.of(io.mateu.ijp.ui.MoneyValues.uiLocale()).portBusy.format(actual) else null
    }

    private fun stop() {
        if (server.running) LOG.info("Mateu desktop MCP server stopped")
        server.stop()
        lastCallAt = 0
        changed()
    }

    /** Stop pressed on the activity notice: the server goes off, and stays off. */
    fun stopByUser() {
        state.enabled = false
        stop()
    }

    private fun touch() {
        lastCallAt = System.currentTimeMillis()
        changed()
    }

    /** An agent called in the last [ACTIVE_WINDOW_MS]. */
    fun agentActive(now: Long = System.currentTimeMillis()): Boolean =
        server.running && lastCallAt > 0 && now - lastCallAt < ACTIVE_WINDOW_MS

    override fun dispose() = server.stop()

    companion object {
        private val LOG = Logger.getInstance(DesktopMcpService::class.java)
        const val ACTIVE_WINDOW_MS = 2 * 60 * 1000L
        private val TOKEN_ATTRIBUTES = CredentialAttributes(generateServiceName("Mateu", "desktop-mcp-token"))

        fun getInstance(): DesktopMcpService = ApplicationManager.getApplication().getService(DesktopMcpService::class.java)
    }
}
