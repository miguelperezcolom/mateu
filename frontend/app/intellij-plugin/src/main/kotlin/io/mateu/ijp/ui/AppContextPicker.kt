package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBList
import com.intellij.ui.components.JBScrollPane
import com.intellij.ui.components.JBTextField
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppSession
import java.awt.BorderLayout
import java.awt.Dimension
import java.awt.event.KeyAdapter
import java.awt.event.KeyEvent
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent
import javax.swing.DefaultListModel
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.JPopupMenu
import javax.swing.SwingUtilities
import javax.swing.Timer

/**
 * The searchable `@AppContext` picker (more than [THRESHOLD] options), the web's
 * mateu-app-context-picker: typing filters the loaded options at once and, debounced (300 ms),
 * asks the server for matches beyond them through the app-level `_appcontext-search-<field>`
 * action (route = the app's root route, serverSideType = the app class, initiator
 * `appcontext-<field>`, parameters `{searchText}`); the answer is the page at
 * `fragments[].data._appcontext_<field>.content` (`{value, label}` options), which replaces the
 * loaded options while the search text is not blank. No answer → the client-side filter stays.
 */
object AppContextSearch {
    const val THRESHOLD = 7

    fun searchable(optionCount: Int) = optionCount > THRESHOLD

    fun actionId(fieldName: String) = "_appcontext-search-$fieldName"

    fun initiatorId(fieldName: String) = "appcontext-$fieldName"

    /** The server's options in an answer to [actionId], or null when it carried none. */
    fun optionsOf(increment: JsonNode, fieldName: String): List<Pair<String, String>>? {
        for (fragment in increment.path("fragments")) {
            val content = fragment.path("data").path("_appcontext_$fieldName").path("content")
            if (content.isArray) return content.map { o -> o.text("value") to o.text("label", o.text("value")) }
        }
        return null
    }

    /** What the list shows: [searched] (the server's answer) when there is one, filtered by [text]. */
    fun visible(loaded: List<Pair<String, String>>, searched: List<Pair<String, String>>?, text: String): List<Pair<String, String>> {
        val t = text.trim().lowercase()
        if (t.isEmpty()) return loaded
        return (searched ?: loaded).filter { it.second.lowercase().contains(t) }
    }
}

/** A button showing the picked option's label, opening [appContextSearchPanel] in a popup. */
fun appContextSearchPicker(
    session: AppSession,
    fieldName: String,
    label: String,
    options: List<Pair<String, String>>,
    current: String,
    rootRoute: String,
    serverSideType: String?,
    onPick: (String) -> Unit,
): JComponent {
    val button = JButton(plain(options.firstOrNull { it.first == current }?.second ?: current.ifBlank { "—" }))
    button.horizontalAlignment = javax.swing.SwingConstants.LEFT
    button.accessibleName(label)
    button.addActionListener {
        val popup = JPopupMenu()
        var search: JBTextField? = null
        val panel = appContextSearchPanel(session, fieldName, label, options, rootRoute, serverSideType, { search = it }) { picked ->
            button.text = plain(picked.second)
            popup.isVisible = false
            onPick(picked.first)
        }
        popup.add(panel)
        popup.show(button, 0, button.height)
        search?.requestFocusInWindow()
    }
    return button
}

/** The search box + option list; [onPicked] gets the chosen (value, label). */
fun appContextSearchPanel(
    session: AppSession,
    fieldName: String,
    label: String,
    options: List<Pair<String, String>>,
    rootRoute: String,
    serverSideType: String?,
    searchBox: (JBTextField) -> Unit = {},
    onPicked: (Pair<String, String>) -> Unit,
): JComponent {
    val panel = JPanel(BorderLayout(0, 4))
    panel.border = JBUI.Borders.empty(6)
    panel.preferredSize = Dimension(JBUI.scale(300), JBUI.scale(260))
    val search = JBTextField().apply { emptyText.text = "Search…"; accessibleName("Search $label") }
    searchBox(search)
    val model = DefaultListModel<Pair<String, String>>()
    val list = JBList(model).apply { accessibleName(label) }
    list.setCellRenderer { _, entry, _, isSelected, _ ->
        JBLabel(plain(entry.second)).apply {
            border = JBUI.Borders.empty(4, 6)
            isOpaque = isSelected
            if (isSelected) background = list.selectionBackground
        }
    }
    var searched: List<Pair<String, String>>? = null
    var seq = 0
    fun show() {
        model.clear()
        AppContextSearch.visible(options, searched, search.text).forEach { model.addElement(it) }
    }
    val debounce = Timer(300) {
        val text = search.text
        if (text.isBlank()) return@Timer
        val mine = ++seq
        session.executor.submit {
            val found = runCatching {
                AppContextSearch.optionsOf(session.apiClient.runAction(
                    rootRoute, "", AppContextSearch.actionId(fieldName), serverSideType,
                    AppContextSearch.initiatorId(fieldName), emptyMap(), session.appState, mapOf("searchText" to text),
                ), fieldName)
            }.getOrNull()
            // server search unavailable: the client-side filter still applies
            if (found != null) SwingUtilities.invokeLater {
                if (mine == seq && search.text == text) { searched = found; show() }
            }
        }
    }.apply { isRepeats = false }
    search.document.addDocumentListener(object : javax.swing.event.DocumentListener {
        fun changed() {
            if (search.text.isBlank()) { searched = null; seq++ }
            show()
            debounce.restart()
        }
        override fun insertUpdate(e: javax.swing.event.DocumentEvent) = changed()
        override fun removeUpdate(e: javax.swing.event.DocumentEvent) = changed()
        override fun changedUpdate(e: javax.swing.event.DocumentEvent) = changed()
    })
    fun pick() {
        val picked = list.selectedValue ?: model.takeIf { !it.isEmpty }?.get(0) ?: return
        onPicked(picked)
    }
    list.addMouseListener(object : MouseAdapter() { override fun mouseClicked(e: MouseEvent) = pick() })
    val enter = object : KeyAdapter() {
        override fun keyPressed(e: KeyEvent) { if (e.keyCode == KeyEvent.VK_ENTER) pick() }
    }
    list.addKeyListener(enter)
    search.addKeyListener(enter)
    panel.add(search, BorderLayout.NORTH)
    panel.add(JBScrollPane(list), BorderLayout.CENTER)
    show()
    return panel
}
