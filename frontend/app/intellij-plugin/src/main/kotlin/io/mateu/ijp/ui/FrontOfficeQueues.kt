package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.JBColor
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.int
import io.mateu.ijp.api.text
import java.awt.Color
import java.awt.Dimension
import java.awt.FlowLayout
import java.awt.Font
import javax.swing.BoxLayout
import javax.swing.JComponent
import javax.swing.JPanel

/** Front-office UX components for work queues and boards (Kanban, TaskQueue, ResourceGrid) on Swing. */

/** Kanban: a horizontal row of columns, each a header (title + count) and a stack of cards. The
 *  row never wraps — it scrolls sideways inside a [ContentHeightScrollPane] (as the web's board
 *  does), so the board keeps the height of its tallest column however little the page offers. */
fun renderKanban(r: ComponentRenderer, metadata: JsonNode, componentId: String = ""): JComponent {
    val board = JPanel()
    board.layout = BoxLayout(board, BoxLayout.X_AXIS)
    board.isOpaque = false
    val moveActionId = metadata.text("moveActionId")
    val cardRoute = metadata.text("cardRoute")
    val rowsSource = metadata.get("rowsSource")?.takeIf { it.isObject }
    // what is on screen: the live items (a rowsSource) or the declared cards, and a move in flight
    var shown: List<KanbanModel.Column> = if (rowsSource != null) KanbanModel.cardsFromRows(metadata, emptyList())
        else KanbanModel.declaredColumns(metadata)
    lateinit var paint: () -> Unit
    lateinit var load: () -> Unit

    fun commit(move: KanbanModel.Move) {
        val card = shown.firstOrNull { it.id == move.fromColumnId }?.cards?.firstOrNull { it.id == move.cardId } ?: return
        val before = shown
        shown = KanbanModel.moveCard(shown, move)
        paint()
        r.ctx.runAction(moveActionId, KanbanModel.moveParameters(r.ctx.mapper, card, move), onDone = { ok ->
            if (!ok) {
                shown = before
                paint()
                announce(board, "The card could not be moved; it is back where it was")
            } else if (rowsSource != null) {
                load()
            }
        })
    }

    fun movePopup(card: KanbanModel.Card, columnId: String): javax.swing.JPopupMenu {
        val popup = javax.swing.JPopupMenu("Move ${card.title}")
        for ((label, move) in KanbanModel.movesOf(shown, card.id, columnId)) {
            popup.add(javax.swing.JMenuItem(plain(label)).apply { addActionListener { commit(move) } })
        }
        return popup
    }

    fun open(card: KanbanModel.Card) {
        val route = KanbanModel.cardRouteOf(cardRoute, card)
        if (route != null) {
            if (RowOpen.isExternal(route)) SafeHtml.browse(if (route.startsWith("//")) "https:$route" else route)
            else r.ctx.navigate(route, null, null, null)
            return
        }
        if (card.actionId.isNotBlank()) {
            val params = KanbanModel.moveParameters(r.ctx.mapper, card, KanbanModel.Move(card.id, "", "", 0))
                .filterKeys { !it.startsWith("_") } + mapOf("_clickedCard" to mapOf("id" to card.id, "title" to card.title))
            r.ctx.runAction(card.actionId, params)
        }
    }

    paint = {
        board.removeAll()
        shown.forEachIndexed { i, column ->
            if (i > 0) board.add(javax.swing.Box.createHorizontalStrut(JBUI.scale(12)))
            // Fixed width, content height: the old `preferredSize = (220, preferredSize.height)` was
            // taken while the column was still EMPTY, which froze every column at its header's height.
            val col = object : JPanel() {
                override fun getPreferredSize() = Dimension(JBUI.scale(220), super.getPreferredSize().height)
                override fun getMinimumSize() = preferredSize
                override fun getMaximumSize() = Dimension(preferredSize.width, Int.MAX_VALUE)
            }
            col.layout = BoxLayout(col, BoxLayout.Y_AXIS)
            col.alignmentY = java.awt.Component.TOP_ALIGNMENT
            col.border = JBUI.Borders.empty(10)
            col.background = Color(0xF4, 0xF4, 0xF5)
            col.isOpaque = true
            val head = JBLabel(plain("${column.title}  (${column.cards.size})"))
            head.font = head.font.deriveFont(Font.BOLD)
            col.addStacked(head, 6)
            for (card in column.cards) {
                val cardPanel = verticalPanel(3)
                cardPanel.border = JBUI.Borders.empty(8)
                cardPanel.background = JBColor.background()
                cardPanel.isOpaque = true
                val titleRow = JPanel(java.awt.BorderLayout()).apply { isOpaque = false }
                titleRow.add(JBLabel(plain(card.title)).apply { font = font.deriveFont(Font.BOLD) }, java.awt.BorderLayout.CENTER)
                cardPanel.addStacked(titleRow, 2)
                if (card.description.isNotBlank()) {
                    cardPanel.addStacked(JBLabel(plain(card.description)).apply {
                        foreground = ToneColors.secondaryText()
                    }, 2)
                }
                if (card.badge.isNotBlank()) cardPanel.addStacked(JBLabel(plain(card.badge)), 0)
                if (card.actionId.isNotBlank() || KanbanModel.cardRouteOf(cardRoute, card) != null) {
                    cardPanel.activatable { open(card) }
                }
                if (moveActionId.isNotBlank() && card.id.isNotBlank() && column.id.isNotBlank()) {
                    // the ⋯ button, a right click or Shift+F10 open the Move popup (no drag on Swing yet)
                    val more = javax.swing.JButton("⋯").apply {
                        isBorderPainted = false
                        isContentAreaFilled = false
                        isFocusable = true
                        accessibleName("Move ${card.title}")
                        toolTipText = plainTip("Move ${card.title}")
                        addActionListener { movePopup(card, column.id).show(this, 0, height) }
                    }
                    titleRow.add(more, java.awt.BorderLayout.EAST)
                    cardPanel.componentPopupMenu = movePopup(card, column.id)
                }
                col.addStacked(cardPanel, 6)
            }
            board.add(col)
        }
        board.revalidate()
        board.repaint()
    }

    load = {
        if (rowsSource != null) {
            val ctx = r.ctx
            val exprCtx = mapOf<String, Any?>("state" to ctx.currentComponentState, "appState" to ctx.appState)
            val resolved = ctx.session.sources.resolveRestSource(rowsSource)
            ctx.session.executor.submit {
                try {
                    val json = if (ctx.session.sources.viaProxy(rowsSource)) ctx.fetchViaProxy("rows", componentId.ifBlank { "kanban" })
                               else RestFetch.fetch(ctx.apiClient, rowsSource, exprCtx, ctx.session.sources)
                    val items = KanbanModel.itemsOf(json, resolved.text("itemsPath"))
                    javax.swing.SwingUtilities.invokeLater {
                        shown = KanbanModel.cardsFromRows(metadata, items)
                        paint()
                    }
                } catch (t: Throwable) {
                    println("[Mateu] kanban items fetch failed: ${t.message}")
                }
            }
        }
    }

    paint()
    load()
    val scroll = ContentHeightScrollPane(board)
    scroll.border = JBUI.Borders.empty()
    scroll.isOpaque = false
    scroll.viewport.isOpaque = false
    scroll.verticalScrollBarPolicy = javax.swing.ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER
    return scroll
}

/** TaskQueue: grouped rail of clickable cards; clicking selects locally + fires the actionId. */
fun renderTaskQueue(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val actionId = metadata.text("actionId")
    val panel = verticalPanel(4)
    val cards = mutableListOf<Pair<String, JPanel>>()
    var selectedId = metadata.arr("groups").flatMap { it.arr("items") }
        .firstOrNull { it.bool("selected") }?.text("id") ?: ""
    fun restyle() {
        for ((id, card) in cards) {
            val sel = id.isNotBlank() && id == selectedId
            card.border =
                if (sel) JBUI.Borders.compound(JBUI.Borders.customLine(uxAccent(), 2), JBUI.Borders.empty(7))
                else JBUI.Borders.compound(JBUI.Borders.customLine(JBColor.border(), 1), JBUI.Borders.empty(8))
            card.isOpaque = sel
            card.background = uxTint(uxAccent())
            card.repaint()
        }
    }
    for (group in metadata.arr("groups")) {
        val label = group.text("label")
        if (label.isNotBlank()) panel.addStacked(JBLabel(plain(label.uppercase())).apply {
            font = font.deriveFont(Font.BOLD, 10f)
            foreground = uxMuted()
        }, 4)
        for (item in group.arr("items")) {
            val id = item.text("id")
            val card = verticalPanel(2)
            // The border BEFORE the card is stacked: addStacked caps its height at the preferred
            // height it has then, and restyle() adding the 9px frame afterwards clipped the caption
            // line (both frames — selected and not — are 9px a side, so the cap stays right).
            card.border = JBUI.Borders.compound(JBUI.Borders.customLine(JBColor.border(), 1), JBUI.Borders.empty(8))
            card.addStacked(JBLabel(plain(item.text("title"))).apply { font = font.deriveFont(Font.BOLD) }, 2)
            val foot = JPanel(FlowLayout(FlowLayout.LEFT, 6, 0)).apply { isOpaque = false }
            val caption = item.text("caption")
            if (caption.isNotBlank()) foot.add(JBLabel(plain(caption)).apply { foreground = uxMuted() })
            for (badge in item.arr("badges")) foot.add(uxChip(badge.text("label"), badge.text("color")))
            if (foot.componentCount > 0) card.addStacked(foot, 0)
            card.activatable {
                selectedId = id
                restyle()
                if (actionId.isNotBlank()) r.ctx.runAction(actionId, mapOf("_item" to id))
            }
            cards += id to card
            panel.addStacked(card, 6)
        }
    }
    restyle()
    return panel
}

/** ResourceGrid: a fixed-column grid of selectable resource cards (room picker). */
fun renderResourceGrid(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val actionId = metadata.text("actionId")
    val columns = metadata.int("columns").let { if (it > 0) it else 3 }
    val recommendedLabel = metadata.text("recommendedLabel", "Recommended")
    val grid = JPanel(java.awt.GridLayout(0, columns, 8, 8)).apply { isOpaque = false }
    val items = metadata.arr("items")
    val cards = mutableListOf<Triple<String, JPanel, Boolean>>() // id, card, recommended
    var selectedId = items.firstOrNull { it.bool("selected") }?.text("id") ?: ""
    fun restyle() {
        for ((id, card, recommended) in cards) {
            val sel = id.isNotBlank() && id == selectedId
            card.border =
                if (sel || recommended) JBUI.Borders.compound(JBUI.Borders.customLine(uxAccent(), 2), JBUI.Borders.empty(7))
                else JBUI.Borders.compound(JBUI.Borders.customLine(JBColor.border(), 1), JBUI.Borders.empty(8))
            card.isOpaque = sel
            card.background = uxTint(uxAccent())
            card.repaint()
        }
    }
    for (item in items) {
        val id = item.text("id")
        val disabled = item.bool("disabled")
        val recommended = item.bool("recommended")
        val card = verticalPanel(2)
        if (recommended) card.addStacked(JPanel(FlowLayout(FlowLayout.LEFT, 0, 0)).apply {
            isOpaque = false
            add(JBLabel(plain(recommendedLabel)).apply {
                foreground = Color.WHITE
                isOpaque = true
                background = uxAccent()
                border = JBUI.Borders.empty(0, 4)
                font = font.deriveFont(Font.BOLD, 8f)
            })
        }, 2)
        card.addStacked(JBLabel(plain(item.text("title"))).apply {
            font = font.deriveFont(Font.BOLD, 16f)
            if (disabled) foreground = uxMuted()
        }, 1)
        val subtitle = item.text("subtitle")
        if (subtitle.isNotBlank()) card.addStacked(JBLabel(plain(subtitle)).apply { foreground = uxMuted() }, 2)
        val statusLabel = item.text("statusLabel")
        if (statusLabel.isNotBlank()) card.addStacked(JPanel(FlowLayout(FlowLayout.LEFT, 0, 0)).apply {
            isOpaque = false
            add(uxChip(statusLabel, item.text("statusColor")))
        }, 2)
        val note = item.text("note")
        if (note.isNotBlank()) card.addStacked(JBLabel(plain("● $note")).apply {
            foreground = uxPaletteColor(item.text("noteColor"))
            font = font.deriveFont(10f)
        }, 0)
        if (!disabled) {
            card.activatable {
                selectedId = id
                restyle()
                if (actionId.isNotBlank()) r.ctx.runAction(actionId, mapOf("_item" to id))
            }
        }
        cards += Triple(id, card, recommended)
        grid.add(card)
    }
    restyle()
    return grid
}
