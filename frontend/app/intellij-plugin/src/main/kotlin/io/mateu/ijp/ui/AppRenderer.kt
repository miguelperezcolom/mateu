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
        // @HomeRoute coordinates: the standalone landing opens this route (like the web shells)
        session.homeRoute = metadata.text("homeRoute").ifBlank { null }
        session.homeConsumedRoute = metadata.text("homeConsumedRoute")
        session.homeServerSideType = metadata.text("homeServerSideType")
        // Keyboard access keys: views assign Alt+letter mnemonics to their buttons and tabs.
        session.accessKeys = metadata.bool("accessKeys")
        session.onAppMenuChanged?.invoke()
        com.intellij.ide.ActivityTracker.getInstance().inc()
    }
    val sidebar = verticalPanel(4)
    // ⌘K global search (App.globalSearchEnabled): a search field at the very top of the navigator
    // mixing menu-entry matches with the app-level _globalsearch entity hits.
    if (metadata.bool("globalSearchEnabled")) {
        sidebar.addStacked(globalSearch(r.ctx, metadata), 2)
    }
    // Notification inbox bell (App.notificationsEnabled), with its unread-count badge.
    if (metadata.bool("notificationsEnabled")) {
        sidebar.addStacked(notificationBell(r.ctx, metadata), 2)
    }
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
        if (MenuCards.isCardsGroup(item)) {
            addMenuCards(session, panel, item, depth)
        } else if (submenus.isArray && !submenus.isEmpty) {
            val header = JBLabel(if (depth == 0) label.uppercase() else label)
            header.font = header.font.deriveFont(Font.BOLD)
            header.border = JBUI.Borders.empty(6, depth * 12, 2, 0)
            panel.addStacked(header, 2)
            addMenuItems(session, panel, submenus, depth + 1)
        } else {
            val link = ActionLink(label) { openMenuEntry(session, item) }
            link.border = JBUI.Borders.emptyLeft(depth * 12)
            panel.addStacked(link, 2)
        }
    }
}

/** Opens a menu leaf exactly like a click on its navigator link. */
private fun openMenuEntry(session: AppSession, item: JsonNode) {
    session.openViewHandler?.invoke(
        item.text("label"),
        item.text("route"),
        item.text("consumedRoute"),
        item.text("serverSideType"),
        item.text("actionId"),
    )
}

/** Side of the square reserved for a card's icon/image, so a late image load never resizes the row. */
private const val CARD_ICON_SIZE = 32

/**
 * A `display: "cards"` group: its header as usual, then one bordered card per entry — icon/image
 * on the left, the bold title (a link when the entry is navigable) over the secondary description,
 * and, for an entry with submenus, its actions as a row of small links under the text.
 */
private fun addMenuCards(session: AppSession, panel: javax.swing.JPanel, group: JsonNode, depth: Int) {
    val groupLabel = group.text("label")
    if (groupLabel.isNotBlank()) {
        val header = JBLabel(if (depth == 0) groupLabel.uppercase() else groupLabel)
        header.font = header.font.deriveFont(Font.BOLD)
        header.border = JBUI.Borders.empty(6, depth * 12, 2, 0)
        panel.addStacked(header, 2)
    }
    for (card in MenuCards.cardsOf(group, session.baseUrl)) {
        panel.addStacked(menuCard(session, card, depth), 4)
    }
}

private fun menuCard(session: AppSession, card: MenuCards.Card, depth: Int): JComponent {
    val box = javax.swing.JPanel(java.awt.BorderLayout(JBUI.scale(8), 0))
    box.isOpaque = false
    box.border = JBUI.Borders.compound(
        JBUI.Borders.emptyLeft(depth * 12),
        JBUI.Borders.compound(JBUI.Borders.customLine(com.intellij.ui.JBColor.border(), 1), JBUI.Borders.empty(8)),
    )

    menuCardVisual(card)?.let { box.add(it, java.awt.BorderLayout.WEST) }

    val text = verticalPanel(0)
    val title: JComponent = if (card.target != null) {
        ActionLink(card.title) { openMenuEntry(session, card.target) }
    } else {
        JBLabel(card.title)
    }
    title.font = title.font.deriveFont(Font.BOLD)
    title.accessibleName(card.title).accessibleDescription(card.description)
    text.addStacked(title, 2)
    card.description?.let { description ->
        val secondary = JBLabel(description)
        secondary.foreground = com.intellij.util.ui.UIUtil.getContextHelpForeground()
        secondary.font = JBUI.Fonts.smallFont()
        text.addStacked(secondary, 2)
    }
    if (card.actions.isNotEmpty()) {
        val actions = javax.swing.JPanel(java.awt.FlowLayout(java.awt.FlowLayout.LEFT, JBUI.scale(8), 0))
        actions.isOpaque = false
        for (action in card.actions) {
            val actionLabel = action.text("label")
            val link = ActionLink(actionLabel) { openMenuEntry(session, action) }
            link.font = JBUI.Fonts.smallFont()
            // the action label alone ("New", "List") is ambiguous out of the card's visual context
            link.accessibleName("${card.title}: $actionLabel")
            actions.add(link)
        }
        text.addStacked(actions, 0)
    }
    box.add(text, java.awt.BorderLayout.CENTER)

    // the whole card is clickable for a navigable entry (the title link stays the keyboard target)
    if (card.target != null) {
        box.cursor = java.awt.Cursor.getPredefinedCursor(java.awt.Cursor.HAND_CURSOR)
        box.addMouseListener(object : java.awt.event.MouseAdapter() {
            override fun mouseClicked(e: java.awt.event.MouseEvent) = openMenuEntry(session, card.target)
        })
    }
    box.accessibleName(card.title).accessibleDescription(card.description)
    return box
}

/** The card's image (loaded off the EDT, scaled into a fixed square) or icon; null for neither. */
private fun menuCardVisual(card: MenuCards.Card): JComponent? {
    val size = JBUI.scale(CARD_ICON_SIZE)
    val uri = card.imageUri
    if (uri != null) {
        val label = JBLabel()
        label.preferredSize = java.awt.Dimension(size, size)
        label.verticalAlignment = javax.swing.SwingConstants.TOP
        com.intellij.openapi.application.ApplicationManager.getApplication().executeOnPooledThread {
            val img = runCatching {
                if (uri.startsWith("data:")) {
                    val base64 = uri.substringAfter("base64,", "")
                    if (base64.isNotBlank()) javax.imageio.ImageIO.read(java.util.Base64.getDecoder().decode(base64).inputStream()) else null
                } else {
                    javax.imageio.ImageIO.read(java.net.URI.create(uri).toURL())
                }
            }.getOrNull() ?: return@executeOnPooledThread
            val scale = minOf(size.toDouble() / img.width, size.toDouble() / img.height)
            val icon = javax.swing.ImageIcon(img.getScaledInstance(
                (img.width * scale).toInt().coerceAtLeast(1), (img.height * scale).toInt().coerceAtLeast(1), java.awt.Image.SCALE_SMOOTH))
            javax.swing.SwingUtilities.invokeLater { label.icon = icon }
        }
        return label
    }
    val name = card.icon ?: return null
    val ideIcon = uxActionIcon(name)
    return when {
        ideIcon != null -> JBLabel(ideIcon).apply { verticalAlignment = javax.swing.SwingConstants.TOP }
        // a glyph (emoji) is shown as text; an unmapped design-system name (`vaadin:…`) is dropped
        !name.contains(':') -> JBLabel(name).apply {
            font = font.deriveFont(font.size2D * 1.5f)
            verticalAlignment = javax.swing.SwingConstants.TOP
        }
        else -> null
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
