package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBScrollPane
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppSession
import java.awt.Font
import javax.swing.JComponent
import javax.swing.JSeparator

/**
 * App shell in the plugin: the main "Mateu" tool window is a **navigator** — the recursive menu read
 * from `metadata.menu`. Each leaf opens its view through [AppSession.openViewHandler], which (in the
 * plugin) spawns an independent, dockable tool window per view (see `MateuViewManager`).
 */
fun renderApp(r: ComponentRenderer, component: JsonNode, metadata: JsonNode): JComponent {
    val session = r.ctx.session
    // Through the CONTEXT: the navigator's App title reaches the tool window (session fallback),
    // while a crud MEDIATOR's App title stays within its view (its tab title), not the navigator's.
    r.ctx.setWindowTitle(metadata.text("title", "Mateu App"))
    if (r.ctx.appShell) {
        // Publish the app menu/title for the IDE hosts (toolbar widget, Search Everywhere actions)
        // and nudge the action system so they pick it up.
        session.appMenu = metadata.path("menu")
        session.appTitle = metadata.text("title")
        session.onAppMenuChanged?.invoke()
        com.intellij.ide.ActivityTracker.getInstance().inc()
    }
    val sidebar = verticalPanel(4)
    // @AppContext selectors: one combo per selector at the top of the navigator; picking a value
    // fixes it in the appState sent with every request and reloads the app shell.
    val selectors = metadata.path("contextSelectors")
    if (selectors.isArray && !selectors.isEmpty) {
        for (selector in selectors) {
            val fieldName = selector.text("fieldName")
            val row = javax.swing.JPanel(java.awt.BorderLayout(JBUI.scale(6), 0))
            row.isOpaque = false
            row.border = JBUI.Borders.empty(4, 8)
            row.add(JBLabel(selector.text("label", fieldName)), java.awt.BorderLayout.WEST)
            val combo = com.intellij.openapi.ui.ComboBox<Pair<String, String>>()
            combo.renderer = javax.swing.DefaultListCellRenderer().let { base ->
                javax.swing.ListCellRenderer<Any> { list, value, index, isSelected, cellHasFocus ->
                    @Suppress("UNCHECKED_CAST")
                    val pair = value as? Pair<String, String>
                    base.getListCellRendererComponent(list, pair?.second ?: "—", index, isSelected, cellHasFocus)
                }
            }
            combo.addItem("" to "—")
            val current = session.appState[fieldName]?.let { if (it is JsonNode) it.asText() else it.toString() } ?: ""
            var selectedIndex = 0
            selector.path("options").forEachIndexed { i, opt ->
                val v = opt.text("value")
                combo.addItem(v to opt.text("label", v))
                if (v == current) selectedIndex = i + 1
            }
            combo.selectedIndex = selectedIndex
            combo.addActionListener {
                @Suppress("UNCHECKED_CAST")
                val picked = combo.selectedItem as? Pair<String, String> ?: return@addActionListener
                if (picked.first.isBlank()) session.appState.remove(fieldName) else session.appState[fieldName] = picked.first
                session.onAppContextChanged?.invoke()
            }
            row.add(combo, java.awt.BorderLayout.CENTER)
            sidebar.addStacked(row, 2)
        }
        sidebar.addStacked(JSeparator(), 4)
    }
    sidebar.addStacked(buildSidebar(session, metadata.path("menu")), 0)
    // AI chat (App.sseUrl): the assistant opens in a modeless dialog from the navigator.
    val sseUrl = metadata.text("sseUrl")
    if (sseUrl.isNotBlank()) {
        val chat = ActionLink("💬 Assistant") { openChatDialog(sseUrl) }
        chat.border = JBUI.Borders.empty(8)
        sidebar.addStacked(chat, 2)
    }
    return JBScrollPane(sidebar)
}

private fun buildSidebar(session: AppSession, menu: JsonNode): JComponent {
    val panel = verticalPanel(4)
    panel.border = JBUI.Borders.empty(8)
    addMenuItems(session, panel, menu, 0)
    return panel
}

private fun addMenuItems(session: AppSession, panel: javax.swing.JPanel, menu: JsonNode, depth: Int) {
    if (!menu.isArray) return
    for (item in menu) {
        if (item.bool("separator")) {
            panel.addStacked(JSeparator(), 4)
            continue
        }
        val label = item.text("label")
        val submenus = item.path("submenus")
        if (submenus.isArray && !submenus.isEmpty) {
            val header = JBLabel(if (depth == 0) label.uppercase() else label)
            header.font = header.font.deriveFont(Font.BOLD)
            header.border = JBUI.Borders.empty(6, depth * 12, 2, 0)
            panel.addStacked(header, 2)
            addMenuItems(session, panel, submenus, depth + 1)
        } else {
            val link = ActionLink(label) {
                session.openViewHandler?.invoke(
                    label,
                    item.text("route"),
                    item.text("consumedRoute"),
                    item.text("serverSideType"),
                    item.text("actionId"),
                )
            }
            link.border = JBUI.Borders.emptyLeft(depth * 12)
            panel.addStacked(link, 2)
        }
    }
}

/** Minimal assistant dialog speaking the mateu-chat contract: POST {message, sessionId} to the
 *  SSE endpoint and show the accumulated `data:` payloads as the agent reply. */
private fun openChatDialog(sseUrl: String) {
    val dialog = javax.swing.JDialog(null as java.awt.Frame?, "Assistant", false)
    val messages = javax.swing.JTextArea()
    messages.isEditable = false
    messages.lineWrap = true
    messages.wrapStyleWord = true
    val input = com.intellij.ui.components.JBTextField()
    val sessionId = "chat-" + java.util.UUID.randomUUID().toString().take(8)
    val client = java.net.http.HttpClient.newHttpClient()
    val mapper = com.fasterxml.jackson.databind.ObjectMapper()

    fun send() {
        val text = input.text.trim()
        if (text.isBlank()) return
        input.text = ""
        messages.append("You: $text\n")
        Thread {
            val reply = runCatching {
                val body = mapper.writeValueAsString(mapOf("message" to text, "sessionId" to sessionId))
                val request = java.net.http.HttpRequest.newBuilder(java.net.URI.create(sseUrl))
                    .header("Accept", "text/event-stream")
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(body))
                    .build()
                val response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString())
                response.body().lineSequence()
                    .filter { it.startsWith("data:") }
                    .map { it.removePrefix("data:").trim() }
                    .filter { it.isNotBlank() && !it.startsWith("{") }
                    .joinToString("")
            }.getOrElse { "⚠️ ${it.message}" }
            javax.swing.SwingUtilities.invokeLater { messages.append("Agent: $reply\n\n") }
        }.apply { isDaemon = true }.start()
    }
    input.addActionListener { send() }

    val root = javax.swing.JPanel(java.awt.BorderLayout(0, JBUI.scale(6)))
    root.border = JBUI.Borders.empty(10)
    root.add(JBScrollPane(messages), java.awt.BorderLayout.CENTER)
    root.add(input, java.awt.BorderLayout.SOUTH)
    dialog.contentPane = root
    dialog.setSize(420, 480)
    dialog.setLocationRelativeTo(null)
    dialog.isVisible = true
}
