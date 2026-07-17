package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.SearchTextField
import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import java.awt.Font
import javax.swing.JComponent
import javax.swing.SwingUtilities
import javax.swing.Timer
import javax.swing.event.DocumentEvent
import javax.swing.event.DocumentListener

/**
 * Global search (App.globalSearchEnabled — the ⌘K command palette on the web): a search field at
 * the top of the navigator whose results mix (a) client-side menu entry matches (navigate on
 * selection) and (b) entity hits from the app-level `_globalsearch` action (parameters
 * `{searchText}`, debounced ~300 ms; response `data._globalsearch: [{label, description, route,
 * category}]`). Results render inline below the field; selecting one opens the target route
 * through the plugin's normal navigation.
 */
fun globalSearch(ctx: AppContext, metadata: JsonNode): JComponent {
    val session = ctx.session
    val rootRoute = metadata.text("rootRoute", metadata.text("route"))
    val serverSideType = metadata.text("serverSideType")

    val field = SearchTextField(false)
    field.textEditor.emptyText.text = "Search everywhere in the app…"

    val results = verticalPanel(0)
    results.border = JBUI.Borders.empty(2, 8, 4, 0)
    results.isVisible = false

    val container = verticalPanel(0)
    container.border = JBUI.Borders.empty(4, 4, 0, 4)
    container.addStacked(field, 0)
    container.add(results)

    /** Leaf menu entries (label + navigation coordinates), flattened for client-side matching. */
    data class MenuHit(
        val label: String,
        val route: String,
        val consumedRoute: String,
        val serverSideType: String,
        val actionId: String,
    )

    fun collectMenuHits(menu: JsonNode, out: MutableList<MenuHit>) {
        if (!menu.isArray) return
        for (item in menu) {
            val submenus = item.path("submenus")
            if (submenus.isArray && !submenus.isEmpty) {
                collectMenuHits(submenus, out)
            } else {
                val label = item.text("label")
                if (label.isNotBlank()) {
                    out.add(
                        MenuHit(
                            label,
                            item.text("route"),
                            item.text("consumedRoute"),
                            item.text("serverSideType"),
                            item.text("actionId"),
                        ),
                    )
                }
            }
        }
    }
    val menuHits = ArrayList<MenuHit>()
    collectMenuHits(metadata.path("menu"), menuHits)

    var querySeq = 0

    fun renderResults(query: String, dataHits: List<JsonNode>) {
        results.removeAll()
        val matches = menuHits.filter { it.label.contains(query, ignoreCase = true) }
        for (hit in matches) {
            results.addStacked(
                ActionLink(hit.label) {
                    session.openViewHandler?.invoke(hit.label, hit.route, hit.consumedRoute, hit.serverSideType, hit.actionId)
                },
                2,
            )
        }
        var lastCategory: String? = null
        for (hit in dataHits) {
            val category = hit.text("category")
            if (category.isNotBlank() && category != lastCategory) {
                lastCategory = category
                results.addStacked(
                    JBLabel(category.uppercase()).apply {
                        font = font.deriveFont(Font.BOLD, font.size2D * 0.85f)
                        foreground = JBUI.CurrentTheme.Label.disabledForeground()
                    },
                    2,
                )
            }
            val label = hit.text("label")
            val description = hit.text("description")
            results.addStacked(
                ActionLink(if (description.isBlank()) label else "$label — $description") {
                    val route = hit.text("route")
                    if (route.isNotBlank()) session.openViewHandler?.invoke(label.ifBlank { route }, route, "", null, null)
                },
                2,
            )
        }
        if (matches.isEmpty() && dataHits.isEmpty()) {
            results.addStacked(
                JBLabel("No matches").apply { foreground = JBUI.CurrentTheme.Label.disabledForeground() },
                2,
            )
        }
        results.isVisible = true
        results.revalidate()
        results.repaint()
        container.revalidate()
        container.repaint()
    }

    fun search() {
        val query = field.text.trim()
        val seq = ++querySeq
        if (query.isEmpty()) {
            results.isVisible = false
            results.removeAll()
            container.revalidate()
            container.repaint()
            return
        }
        // Menu matches render right away; the _globalsearch hits land when the server answers.
        renderResults(query, emptyList())
        session.executor.submit {
            val hits = runCatching {
                val increment = session.apiClient.runAction(
                    rootRoute, "", "_globalsearch", serverSideType.ifBlank { null },
                    "cmd-palette", emptyMap(), session.appState, mapOf("searchText" to query),
                )
                increment.path("fragments").let { fragments ->
                    if (!fragments.isArray) null
                    else fragments.firstNotNullOfOrNull { f ->
                        f.path("data").path("_globalsearch").takeIf { it.isArray }?.toList()
                    }
                }
            }.getOrNull() ?: emptyList()
            SwingUtilities.invokeLater {
                // Stale responses (the user kept typing) are dropped.
                if (seq == querySeq && field.text.trim() == query) renderResults(query, hits)
            }
        }
    }

    // ~300 ms debounce while the user types.
    val debounce = Timer(300) { search() }.apply { isRepeats = false }
    field.textEditor.document.addDocumentListener(object : DocumentListener {
        override fun insertUpdate(e: DocumentEvent) = debounce.restart()
        override fun removeUpdate(e: DocumentEvent) = debounce.restart()
        override fun changedUpdate(e: DocumentEvent) = debounce.restart()
    })
    field.textEditor.addActionListener { debounce.stop(); search() }

    return container
}
