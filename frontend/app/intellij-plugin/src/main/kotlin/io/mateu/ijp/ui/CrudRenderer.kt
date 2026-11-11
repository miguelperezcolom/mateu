package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.openapi.ui.JBMenuItem
import com.intellij.openapi.ui.JBPopupMenu
import com.intellij.ui.SearchTextField
import com.intellij.ui.TableSpeedSearch
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBScrollPane
import com.intellij.ui.table.JBTable
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.displayString
import io.mateu.ijp.api.text
import java.awt.BorderLayout
import java.awt.Color
import java.awt.Component
import java.awt.FlowLayout
import java.awt.Font
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.JTable
import javax.swing.table.AbstractTableModel
import javax.swing.table.DefaultTableCellRenderer
import javax.swing.table.TableCellRenderer

/**
 * Crud — port of the JavaFX `CrudRenderer`. A [JBTable] whose columns come from `metadata.columns`
 * and whose rows come from the data fragment (`data.content[]`). Each column renders per its
 * `dataType`: `status` → a coloured badge, `actionGroup`/`menu`/`action` → row-action buttons, a
 * column carrying an `actionId` → a link, everything else → plain text. A double-click on a row
 * dispatches the row link action (e.g. `view`) which — on a listing hosted in the bottom tool window
 * — opens the detail in a central editor tab (see `AppContext.detailOpener`). Toolbar, search bar and
 * a pagination bar drive the usual `search`/`prevPage`/`nextPage` actions.
 */
fun renderCrud(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    // GridLayout.tree: hierarchical rows carrying a self-referential `children` list render as a
    // real JTree (double-click = the row link/select action). cards/list variants stay tables on
    // the desktop — the richer widget is the platform-appropriate adaptation.
    if (metadata.text("gridLayout") == "tree") return renderTreeCrud(r, component, metadata, data)
    val ctx = r.ctx
    // the list slot of a Collection Detail page: the collection, beside the record it opens
    val inCollectionList = r.inCollectionList
    val panel = JPanel(BorderLayout(0, JBUI.scale(JBGap)))
    panel.border = JBUI.Borders.empty(16)

    // ── header: title/subtitle + toolbar ──
    val header = verticalPanel(4)
    val title = metadata.text("title")
    if (title.isNotBlank()) {
        val l = JBLabel(plain(title))
        l.font = l.font.deriveFont(Font.BOLD, PageChrome.fontSize(18f))
        header.addStacked(l, 2)
    }
    val subtitle = metadata.text("subtitle")
    if (subtitle.isNotBlank()) {
        val l = JBLabel(plain(subtitle))
        l.foreground = ToneColors.secondaryText()
        header.addStacked(l, 4)
    }
    // Crud toolbar (New, export…) → the native host toolbar when available (tool window title).
    val toolbar = metadata.arr("toolbar")
    // A listing inside a page keeps its buttons on its own header: the host toolbar is the page's.
    if (toolbar.isNotEmpty() && (r.enclosingPages > 0 || !ctx.publishToolbar(toolbar))) header.addStacked(buttonRow(r, toolbar), 4)
    panel.add(header, BorderLayout.NORTH)

    // ── column specs ──
    val allSpecs = metadata.leafColumns().map { col ->
        val cm = col.path("metadata")
        val id = cm.text("id", col.text("id"))
        val label = cm.text("label", id)
        val dataType = cm.text("dataType")
        val actionId = cm.text("actionId")
        val text = cm.text("text")
        val kind = when {
            dataType == "status" -> ColKind.STATUS
            dataType == "actionGroup" || dataType == "menu" || dataType == "action" -> ColKind.ACTIONS
            actionId.isNotBlank() -> ColKind.LINK
            else -> ColKind.TEXT
        }
        ColSpec(
            id, label, kind, dataType, actionId, text, cm.bool("editable"), cm.text("editorType"),
            cm.text("stereotype"), cm.text("aggregate"),
            // @Tooltip("otherField") / a fixed width: the row field the cell shows on hover.
            tooltipPath = cm.text("tooltipPath"),
            // a field type's `tones` (value → success|warning|danger|info|neutral) for a status cell
            tones = StatusTones.tonesOf(cm),
            // an enum column's labels (IN_HOUSE → "In house"); the row keeps the raw value
            valueLabels = StatusTones.valueLabelsOf(cm),
        )
    }
    // The action id used to open a row's detail: the first link column (e.g. the id column's "view").
    val rowLinkActionId = allSpecs.firstOrNull { it.kind == ColKind.LINK }?.actionId ?: ""
    // Row actions live in the right-click context menu (the IDE way) — no button column in the table.
    val actionSpecs = allSpecs.filter { it.kind == ColKind.ACTIONS }
    val specs = allSpecs.filterNot { it.kind == ColKind.ACTIONS }
    // each shown column's wire metadata (width / autoWidth / flexGrow), by model index like specs
    val specColumns = metadata.leafColumns().map { c -> c.path("metadata").takeIf { it.isObject } ?: c }.filterIndexed { i, _ -> allSpecs[i].kind != ColKind.ACTIONS }

    // @RestListing: the rows are fetched WHOLE (the plugin does not honour totalPath, and a source
    // answered from its SAMPLE cannot honour `${'$'}{state.page}` either), so search, filters, sort and
    // page apply in memory over the component state — the web's mateu-table-crud unpaged path.
    // `showRestPage` is bound once the data handler exists (below).
    val isRestListing = metadata.path("rowsSource").isObject
    val restPageSize = metadata.path("pageSize").asInt(0)
    val restServerPaged = isRestListing && ctx.session.sources.serverTotalPath(metadata.path("rowsSource")) != null && restPageSize > 0
    var restRowsAll: List<JsonNode> = emptyList()
    var showRestPage: () -> Unit = {}
    // What a search / filter / sort / page change does to a REST listing: ask the source again when
    // it pages on the SERVER (it declares a totalPath), re-slice the rows held otherwise.
    var refreshRest: () -> Unit = {}

    // Inline editing (@InlineEditing crud): committing an edited cell persists its row right away
    // through the crud's `update-row` action, like the web's renderEditableCell.
    val model = CrudTableModel(specs) { updatedRow ->
        ctx.runAction("update-row", mapOf("_editedRow" to updatedRow))
    }
    // Group headers / totals footer (synthetic, presentation-only rows) render bold on a tinted
    // background through a dedicated renderer, bypassing the per-column renderers/editors.
    val syntheticRenderer = SyntheticRowRenderer()
    val numberRenderer = NumberCellRenderer(money = false)
    val table = object : JBTable(model) {
        override fun getCellRenderer(row: Int, column: Int): TableCellRenderer {
            val m = getModel() as? CrudTableModel
            if (m != null && m.isSynthetic(convertRowIndexToModel(row))) return syntheticRenderer
            val own = super.getCellRenderer(row, column)
            // a numeric VALUE in a column typed as text: right-aligned and formatted (IJ-07)
            if (m != null && own !is NumberCellRenderer &&
                m.isNumberAt(convertRowIndexToModel(row), convertColumnIndexToModel(column))) return numberRenderer
            return own
        }

        // A column with a tooltipPath shows that field of the row on hover (multi-line as HTML);
        // the rest keep the default (the renderer's own tooltip, if any).
        override fun getToolTipText(e: MouseEvent): String? {
            val viewRow = rowAtPoint(e.point)
            val viewCol = columnAtPoint(e.point)
            if (viewRow >= 0 && viewCol >= 0) {
                val spec = specs.getOrNull(convertColumnIndexToModel(viewCol))
                if (spec != null && spec.tooltipPath.isNotBlank()) {
                    val row = (getModel() as? CrudTableModel)?.rowAt(convertRowIndexToModel(viewRow))
                    return Popovers.tooltipHtml(Popovers.cellTooltipText(row, spec.tooltipPath))
                }
            }
            return super.getToolTipText(e)
        }
    }
    table.plainCells()
    table.setShowGrid(true)
    table.rowHeight = JBUI.scale(30)
    table.putClientProperty("terminateEditOnFocusLost", true)
    // Speed search: type over the table to jump to matching rows (guarded: needs no full IDE, but
    // keep the render probe safe).
    runCatching { TableSpeedSearch.installOn(table) }

    // Empty listings show the wire's emptyStateMessage through the IDE's StatusText.
    table.emptyText.text = plain(metadata.text("emptyStateMessage").ifBlank { "No data" })

    // Per-user column personalization (show/hide via header right-click + native drag-reorder,
    // persisted per crud route). The identity/row-open column (first link column) is protected.
    run {
        val colIds = specs.map { it.id }
        val protectedIds = setOfNotNull(specs.firstOrNull { it.kind == ColKind.LINK }?.id)
        ColumnChooser.install(table, colIds, protectedIds, ctx.currentRoute)
    }

    // Bulk row selection (@RowsSelection crud): native JTable multi-selection; the selected row
    // objects (as they came off the wire — synthetic group/totals rows excluded) travel in the
    // component state under `crud_selected_items`, where rowsSelectedRequired actions expect them.
    if (metadata.bool("rowsSelectionEnabled")) {
        table.rowSelectionAllowed = true
        table.selectionModel.selectionMode = javax.swing.ListSelectionModel.MULTIPLE_INTERVAL_SELECTION
        table.selectionModel.addListSelectionListener { e ->
            if (e.valueIsAdjusting) return@addListSelectionListener
            val items = table.selectedRows.toList()
                .mapNotNull { viewRow -> model.rowAt(table.convertRowIndexToModel(viewRow)) }
                .map { rowAsParams(ctx, it) }
            ctx.currentComponentState["crud_selected_items"] = items
        }
    }

    // @DragRows: the rows can be dragged onto a DropZone accepting this type (the selected rows,
    // or the one under the pointer); the zone runs its action with _draggedIds + _dragType.
    metadata.text("dragType").takeIf { it.isNotBlank() }?.let { dragType ->
        installRowDrag(table, dragType) { modelRow -> model.rowAt(modelRow) }
    }

    // Header click cycles the column sort (ascending → descending → none) and re-runs the search
    // with the Pageable shape [{field, direction}].
    run {
        val sortables = metadata.leafColumns().mapNotNull { col ->
            val cm = col.path("metadata")
            val id = cm.text("id", col.text("id"))
            if (cm.bool("sortable")) id to cm.text("sortingProperty").ifBlank { id } else null
        }.toMap()
        var sortField = ""
        var sortAscending = true
        table.tableHeader.addMouseListener(object : MouseAdapter() {
            override fun mouseClicked(e: MouseEvent) {
                val viewCol = table.columnModel.getColumnIndexAtX(e.x)
                if (viewCol < 0) return
                val spec = specs.getOrNull(table.convertColumnIndexToModel(viewCol)) ?: return
                val property = sortables[spec.id] ?: return
                when {
                    sortField != property -> { sortField = property; sortAscending = true }
                    sortAscending -> sortAscending = false
                    else -> sortField = ""
                }
                ctx.currentComponentState["sort"] =
                    if (sortField.isBlank()) emptyList<Any>()
                    else listOf(mapOf("field" to sortField, "direction" to if (sortAscending) "ascending" else "descending"))
                ctx.currentComponentState["page"] = 0
                if (isRestListing) refreshRest() else ctx.runAction("search", null, silent = true)
            }
        })
    }

    // Custom renderers only for STATUS/LINK; the rest use JTable's class-based defaults
    // (Boolean → checkbox, String → label), which also provide the inline-editing editors.
    for ((i, spec) in specs.withIndex()) {
        val column = table.columnModel.getColumn(i)
        when (spec.kind) {
            ColKind.STATUS -> column.cellRenderer = StatusCellRenderer(spec.tones, spec.valueLabels)
            ColKind.LINK -> column.cellRenderer = LinkCellRenderer(spec.text)
            else -> if (spec.stereotype == "image" && !spec.editable) {
                // an image column shows the picture, not its url (the museums' works listed the
                // "https://ima…" text): a thumbnail, and rows tall enough to see it
                column.cellRenderer = ImageCellRenderer(ctx.session.baseUrl)
                table.rowHeight = maxOf(table.rowHeight, JBUI.scale(ImageCellRenderer.THUMB + 8))
            } else if (isNumericColumn(spec.dataType, spec.stereotype) && !spec.editable) {
                column.cellRenderer = NumberCellRenderer(spec.dataType == "money" || spec.stereotype == "money")
            }
        }
    }
    // D-16: each header lines up with its cells (numbers to the end, checkboxes centred)
    ColumnAlign.alignHeaders(table) { modelCol -> specs.getOrNull(modelCol)?.headerAlign() ?: ColumnAlign.Align.START }

    // WHOLE-ROW OPEN (decision U1, see RowOpen): a navigable listing (rowRoute, or a `view`
    // column) opens the row's record from ANY non-display cell — a single click, or a double click
    // when the listing has multi-selection (there a single click means "select") — and with Enter
    // on the selected row. Display cells (an own-action link column, an inline editor) keep their
    // own click. A listing that is NOT navigable keeps the previous double-click: its first link
    // action, else the row's FIRST action — its primary (e.g. "Check-in" on the check-in board).
    val rowOpen = RowOpen.openOf(metadata.text("rowRoute"), allSpecs.map { it.rowOpenColumn() })
    val multiSelection = metadata.bool("rowsSelectionEnabled")
    val openRow: (JsonNode) -> Unit = { row ->
        when (val target = RowOpen.targetOf(rowOpen, row)) {
            // like a server NavigateTo: a listing in the results panel opens the record in a central
            // tab and stays where it is (navigated in place, the record replaced the listing)
            // in a Collection Detail list the record opens HERE, beside the list (the page is both)
            is RowOpen.Target.Route -> if (inCollectionList) ctx.navigateInPlace(target.route) else ctx.openRoute(target.route)
            is RowOpen.Target.Url -> SafeHtml.browse(target.url) // refuses anything but http(s)/mailto
            is RowOpen.Target.Action -> ctx.runAction(target.actionId, rowAsParams(ctx, row))
            null -> Unit
        }
    }
    val specAt = { viewCol: Int -> if (viewCol < 0) null else specs.getOrNull(table.convertColumnIndexToModel(viewCol)) }
    table.addMouseListener(object : MouseAdapter() {
        override fun mouseClicked(e: MouseEvent) {
            if (e.button != MouseEvent.BUTTON1) return
            val viewRow = table.rowAtPoint(e.point)
            if (viewRow < 0) return
            val row = model.rowAt(table.convertRowIndexToModel(viewRow)) ?: return
            val spec = specAt(table.columnAtPoint(e.point))
            val modified = e.isControlDown || e.isShiftDown || e.isMetaDown || e.isAltDown
            if (rowOpen != null) {
                // a link cell with its OWN action does that action (the web's button column)
                if (!modified && e.clickCount == 1 && spec != null && spec.kind == ColKind.LINK &&
                    spec.actionId != RowOpen.ROW_OPEN_ACTION_ID) {
                    ctx.runAction(spec.actionId, rowAsParams(ctx, row))
                    return
                }
                if (RowOpen.clickOpens(rowOpen, spec?.rowOpenColumn(), e.clickCount, modified, multiSelection)) openRow(row)
                return
            }
            if (e.clickCount < 2) return
            if (rowLinkActionId.isNotBlank()) {
                ctx.runAction(rowLinkActionId, rowAsParams(ctx, row))
                return
            }
            val firstAction = actionSpecs.firstNotNullOfOrNull { s ->
                collectActions(row.path(s.id), s.dataType).firstOrNull()
            } ?: return
            val method = firstAction.text("methodNameInCrud")
            if (method.isNotBlank()) ctx.runAction("action-on-row-$method", mapOf("_clickedRow" to row))
        }
    })
    if (rowOpen != null) {
        // the hand cursor over the cells that open the row, the default one over display cells
        table.addMouseMotionListener(object : java.awt.event.MouseMotionAdapter() {
            override fun mouseMoved(e: MouseEvent) {
                val opens = table.rowAtPoint(e.point) >= 0 && !RowOpen.isDisplayColumn(specAt(table.columnAtPoint(e.point))?.rowOpenColumn())
                table.cursor = java.awt.Cursor.getPredefinedCursor(if (opens) java.awt.Cursor.HAND_CURSOR else java.awt.Cursor.DEFAULT_CURSOR)
            }
        })
        // Enter opens the selected row (JTable's default would just move to the next row)
        val enter = javax.swing.KeyStroke.getKeyStroke(java.awt.event.KeyEvent.VK_ENTER, 0)
        table.getInputMap(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT).put(enter, "mateuOpenRow")
        table.actionMap.put("mateuOpenRow", object : javax.swing.AbstractAction() {
            override fun actionPerformed(e: java.awt.event.ActionEvent?) {
                if (table.isEditing) { table.cellEditor?.stopCellEditing(); return }
                val viewRow = table.selectionModel.leadSelectionIndex.takeIf { it >= 0 } ?: table.selectedRow
                if (viewRow < 0 || viewRow >= table.rowCount) return
                model.rowAt(table.convertRowIndexToModel(viewRow))?.let(openRow)
            }
        })
        table.accessibleDescription(
            if (multiSelection) "Double-click a row or press Enter to open it" else "Click a row or press Enter to open it",
        )
    }

    // Right-click a row → context menu with the row link ("Open") + the row's column actions
    // (e.g. "Set as blue") — the IDE-native way to reach row actions.
    table.addMouseListener(object : MouseAdapter() {
        override fun mousePressed(e: MouseEvent) = maybePopup(e)
        override fun mouseReleased(e: MouseEvent) = maybePopup(e)
        private fun maybePopup(e: MouseEvent) {
            if (!e.isPopupTrigger) return
            val viewRow = table.rowAtPoint(e.point)
            if (viewRow < 0) return
            table.setRowSelectionInterval(viewRow, viewRow)
            val row = model.rowAt(table.convertRowIndexToModel(viewRow)) ?: return
            val menu = JBPopupMenu()
            if (rowOpen != null && RowOpen.targetOf(rowOpen, row) != null) {
                menu.add(JBMenuItem("Open").apply { addActionListener { openRow(row) } })
            } else if (rowLinkActionId.isNotBlank()) {
                menu.add(JBMenuItem("Open").apply {
                    addActionListener { ctx.runAction(rowLinkActionId, rowAsParams(ctx, row)) }
                })
            }
            var hadRowActions = false
            for (spec in actionSpecs) {
                for (a in collectActions(row.path(spec.id), spec.dataType)) {
                    val method = a.text("methodNameInCrud")
                    val label = a.text("label", method)
                    if (label.isBlank()) continue
                    if (!hadRowActions && menu.componentCount > 0) menu.addSeparator()
                    hadRowActions = true
                    menu.add(JBMenuItem(plain(label)).apply {
                        isEnabled = !a.bool("disabled")
                        addActionListener { ctx.runAction("action-on-row-$method", mapOf("_clickedRow" to row)) }
                    })
                }
            }
            if (menu.componentCount > 0) menu.show(table, e.x, e.y)
        }
    })

    // ── pagination bar ──
    val pageInfo = JBLabel("")
    val stepRestPage = { delta: Int ->
        val current = (ctx.currentComponentState["page"] as? Number)?.toInt() ?: 0
        ctx.currentComponentState["page"] = (current + delta).coerceAtLeast(0)
        refreshRest()
    }
    // D-20: the platform's pager — square chevron icon buttons around "Page 1 of 20", each in the
    // Tab order with a name and a tooltip (a "‹ Prev" text button read as a web control)
    val prev = pagerButton(com.intellij.icons.AllIcons.General.ChevronLeft, "Previous page") {
        if (isRestListing) stepRestPage(-1) else ctx.runAction("prevPage", null)
    }
    val next = pagerButton(com.intellij.icons.AllIcons.General.ChevronRight, "Next page") {
        if (isRestListing) stepRestPage(1) else ctx.runAction("nextPage", null)
    }
    val pager = JPanel(FlushFlowLayout(JBUI.scale(JBGap))).apply {
        isOpaque = false
        add(prev); add(pageInfo); add(next)
    }

    val center = JPanel(BorderLayout(0, JBUI.scale(4)))
    center.isOpaque = false

    // ── search bar: the IDE's SearchTextField (magnifier, clear button, history popup) plus a
    //    collapsible "Filter by" panel with a type-specific widget per filter (smart search port) ──
    // a Filterable listing that is not Searchable still has its filter bar (no search box): the whole
    // bar used to hang on `searchable`, so its typed filters (ranges, multi-selects) had no widget
    val searchable = metadata.bool("searchable")
    if (searchable || metadata.arr("filters").isNotEmpty()) {
        val searchField = SearchTextField(true)
        searchField.textEditor.emptyText.text = "Search…"
        searchField.textEditor.columns = 24
        // IJ-03: empty text is not a name — the search box was announced as an unnamed edit field.
        val searchName = metadata.text("title").let { if (it.isBlank()) "Search" else "Search $it" }
        searchField.accessibleName(searchName)
        searchField.textEditor.accessibleName(searchName)

        var filterBar: FilterBar? = null
        val doSearch = {
            searchField.addCurrentTextToHistory()
            ctx.currentComponentState["searchText"] = searchField.text
            ctx.currentComponentState["page"] = 0
            ctx.currentComponentState["size"] = 10
            ctx.currentComponentState["sort"] = emptyList<Any>()
            filterBar?.collectInto(ctx.currentComponentState)
            if (isRestListing) {
                // the size the listing is served at, not the server listings' default
                if (restServerPaged) ctx.currentComponentState["size"] = restPageSize
                refreshRest()
            } else ctx.runAction("search", null)
        }
        searchField.textEditor.addActionListener { doSearch() }
        val searchBar = JPanel(FlushFlowLayout(JBUI.scale(JBGap))).apply {
            isOpaque = false
            if (searchable) add(searchField)
        }

        val north = verticalPanel(0)
        north.addStacked(searchBar, 2)
        val filtersMeta = metadata.arr("filters")
        if (filtersMeta.isNotEmpty()) {
            val bar = FilterBar(ctx, filtersMeta) { doSearch() }
            filterBar = bar
            searchBar.add(bar.toggle)
            north.addStacked(bar.panel, 2)
        }

        // Saved views: apply a named snapshot of {searchText + filters} into the widgets, then search.
        val viewScope = ctx.currentRoute
        val applyView = { view: SavedViews.View ->
            searchField.text = view.values["searchText"]?.toString() ?: ""
            filterBar?.applyValues(view.values)
            doSearch()
        }
        val viewsBtn = javax.swing.JButton("Views")
        viewsBtn.addActionListener {
            val menu = com.intellij.openapi.ui.JBPopupMenu()
            val views = SavedViews.list(viewScope)
            for (view in views) {
                val sub = javax.swing.JMenu(plain(view.name + if (view.isDefault) "  ★" else ""))
                sub.add(javax.swing.JMenuItem("Apply").apply { addActionListener { applyView(view) } })
                sub.add(
                    javax.swing.JMenuItem(plain(if (view.isDefault) "Unset default" else "Set as default"))
                        .apply { addActionListener { SavedViews.toggleDefault(viewScope, view.name) } },
                )
                sub.add(javax.swing.JMenuItem("Delete").apply { addActionListener { SavedViews.delete(viewScope, view.name) } })
                menu.add(sub)
            }
            if (views.isNotEmpty()) menu.addSeparator()
            menu.add(
                javax.swing.JMenuItem("Save current view…").apply {
                    addActionListener {
                        val name = com.intellij.openapi.ui.Messages.showInputDialog(
                            null as com.intellij.openapi.project.Project?, "View name:", "Save view", null,
                        )
                        if (name != null) {
                            val values = LinkedHashMap<String, Any?>()
                            if (searchField.text.isNotBlank()) values["searchText"] = searchField.text
                            filterBar?.collectInto(values)
                            SavedViews.save(viewScope, name, values)
                        }
                    }
                },
            )
            menu.show(viewsBtn, 0, viewsBtn.height)
        }
        searchBar.add(viewsBtn)

        center.add(north, BorderLayout.NORTH)

        // Auto-apply the default view once (guarded against the search re-render re-triggering it).
        if (ctx.currentComponentState["_defaultViewApplied"] != true) {
            SavedViews.default(viewScope)?.let {
                ctx.currentComponentState["_defaultViewApplied"] = true
                applyView(it)
            }
        }
    }
    // GridLayout.masterDetail: table on the left, a read-only detail form of the selected row on
    // the right (a JBSplitter). Every other layout keeps the plain full-width table.
    val resultsHost = JPanel(BorderLayout()).apply { isOpaque = false }
    if (metadata.text("gridLayout") == "masterDetail") {
        val detail = JPanel(BorderLayout())
        detail.border = JBUI.Borders.emptyLeft(12)
        val hint = JBLabel("Select a row to see its details.")
        hint.foreground = ToneColors.secondaryText()
        detail.add(hint, BorderLayout.NORTH)
        table.selectionModel.addListSelectionListener { e ->
            if (e.valueIsAdjusting) return@addListSelectionListener
            val viewRow = table.selectedRow
            detail.removeAll()
            if (viewRow >= 0) {
                val row = model.rowAt(table.convertRowIndexToModel(viewRow))
                if (row != null) {
                    val form = verticalPanel(6)
                    for (spec in specs) {
                        val cell = JBLabel(plain(row.path(spec.id).displayString()))
                        val cap = JBLabel(plain(spec.label))
                        cap.foreground = ToneColors.secondaryText()
                        form.addStacked(cap, 0)
                        form.addStacked(cell, 6)
                    }
                    detail.add(JBScrollPane(form), BorderLayout.CENTER)
                }
            } else {
                detail.add(hint, BorderLayout.NORTH)
            }
            detail.revalidate(); detail.repaint()
        }
        val splitter = com.intellij.ui.OnePixelSplitter(false, 0.55f)
        splitter.firstComponent = JBScrollPane(table)
        splitter.secondComponent = detail
        resultsHost.add(splitter, BorderLayout.CENTER)
    } else if (ListingCards.isCardLayout(metadata.text("gridLayout"))) {
        // GridLayout.cards / list: the rows as cards (a hero search's results); the table stays the
        // model, so search, paging and sort keep working on it
        val open: ((Int) -> Unit)? = when {
            rowOpen != null -> { i -> model.rowAt(i)?.let(openRow) }
            rowLinkActionId.isNotBlank() -> { i -> model.rowAt(i)?.let { ctx.runAction(rowLinkActionId, rowAsParams(ctx, it)) } }
            else -> null
        }
        val images = specs.withIndex().filter { it.value.stereotype == "image" }.map { it.index }.toSet()
        val cards = ListingCards.panel(model, metadata.text("gridLayout") == "list", { !model.isSynthetic(it) }, open, images, ctx.session.baseUrl)
        // inside a page the page scrolls: a scroll pane of its own collapsed to a strip there
        resultsHost.add(if (r.enclosingPages > 0) cards else JBScrollPane(cards).apply { border = null }, BorderLayout.CENTER)
    } else {
        resultsHost.add(RowsScrollPane(table), BorderLayout.CENTER)
    }
    // `preSearch` (the smart-search page's "dashboard"): shown IN PLACE of the results until this
    // listing's first search answers; from then on the results own the spot for good (a later
    // empty answer shows the normal empty state). Remembered in the component state so a
    // re-render of the crud does not bring it back.
    val preSearchKey = PageSlots.preSearchDoneKey(component.text("id"))
    var preSearchShown = PageSlots.showsPreSearch(metadata, ctx.currentComponentState[preSearchKey] == true)
    if (preSearchShown) {
        val pre = verticalPanel()
        for (node in metadata.arr("preSearch")) pre.addStacked(r.render(node, state, data), JBGap)
        center.add(JBScrollPane(pre).apply { border = null }, BorderLayout.CENTER)
        pager.isVisible = false
    } else {
        center.add(resultsHost, BorderLayout.CENTER)
    }
    center.add(pager, BorderLayout.SOUTH)
    panel.add(center, BorderLayout.CENTER)
    val leavePreSearch = {
        if (preSearchShown) {
            preSearchShown = false
            ctx.currentComponentState[preSearchKey] = true
            (center.layout as BorderLayout).getLayoutComponent(BorderLayout.CENTER)?.let { center.remove(it) }
            center.add(resultsHost, BorderLayout.CENTER)
            pager.isVisible = true
            center.revalidate()
            center.repaint()
        }
    }

    // ── data handler: initial data + async search results land here ──
    val groupBy = metadata.text("groupBy")
    val applyData = { d: JsonNode ->
        if (PageSlots.isListingAnswer(d)) leavePreSearch()
        // The listing envelope (the object carrying `page` — plus `aggregates`/`groups` when the
        // crud is grouped/aggregated); `eff` is the page itself.
        val crudNode = d.path("crud")
        val listing = if (!crudNode.path("page").isMissingNode && !crudNode.path("page").isNull) crudNode else d
        val eff = listing.path("page").let { if (!it.isMissingNode && !it.isNull) it else d }
        val rows = extractRows(eff)
        model.setEntries(buildEntries(rows, specs, groupBy, listing))
        // `width` / `@ColumnWidth("auto")` (autoWidth) / flexGrow 0 — the desktop ignored them all;
        // an auto column needs its rows to measure, so the plan is applied on every page
        GridTables.applyWidths(table, specColumns)
        // a listing stacked in a page froze its height when it was still empty: grow it to its rows
        regrowStacked(resultsHost)
        val total = eff.path("totalElements").asLong(rows.size.toLong())
        val pageNumber = eff.path("pageNumber").asInt(0)
        val pageSize = eff.path("pageSize").asInt(10).coerceAtLeast(1)
        val totalPages = if (total == 0L) 1 else ((total + pageSize - 1) / pageSize).toInt()
        pageInfo.text = pagerText(pageNumber, totalPages, total)
        prev.isEnabled = pageNumber > 0
        next.isEnabled = pageNumber + 1 < totalPages
    }
    ctx.registerDataHandler("crud") { applyData(it) }
    // inside a plain island the search answer targets the island: register under its id too, or
    // the last listing on the page took every island's rows
    ctx.currentIslandId?.let { islandId -> ctx.registerDataHandler(islandId) { applyData(it) } }
    // Seed with any data already present on this fragment.
    if (!data.isNull && !data.isMissingNode) applyData(data)

    // @RestListing: rows fetched CLIENT-SIDE from an arbitrary REST endpoint instead of the server
    // `search` action. Declarative listings get no server OnLoad trigger, so self-fetch on mount:
    // map each JSON item into a row object keyed by column id and feed it through applyData.
    val rowsSource = metadata.path("rowsSource")
    if (rowsSource.isObject) {
        // Resolve a catalogue `ref` so url, itemsPath and the proxy flag come from the resolved source.
        val rowsResolved = ctx.session.sources.resolveRestSource(rowsSource)
        val columnIds = metadata.leafColumns()
            .map { it.path("metadata").text("id", it.text("id")) }
            .filter { it.isNotBlank() }
        // The fields a row keeps: its columns, the fields a column reads beside its own (a primary
        // cell's caption and leading picture, a tooltip) and the ones the rowRoute needs — its record
        // id, which nobody declares as a column. Mapped to the columns alone, `artworks/${'$'}{row.id}`
        // never resolved and a click on a row opened nothing.
        val rowFields = LinkedHashSet<String>().apply {
            addAll(columnIds)
            for (col in metadata.leafColumns()) {
                val cm = col.path("metadata")
                for (k in listOf("captionPath", "leadingPath", "tooltipPath")) cm.text(k).takeIf { it.isNotBlank() }?.let(::add)
            }
            addAll(RowOpen.rowRouteFields(metadata.text("rowRoute")))
        }
        val mapper = ctx.session.mapper
        val crudId = component.text("id", "crud")
        val filtersMeta = metadata.arr("filters")
        val pageSize = restPageSize
        val totalPath = ctx.session.sources.serverTotalPath(rowsSource)
        showRestPage = {
            val p = RestListing.page(restRowsAll, columnIds, filtersMeta, ctx.currentComponentState, pageSize)
            applyData(restEnvelope(mapper, p.content, p.totalElements.toLong(), p.pageSize, p.pageNumber))
        }
        // the pager numbers its pages with the size the listing is served at: every request names it
        if (totalPath != null && pageSize > 0) ctx.currentComponentState.putIfAbsent("size", pageSize)
        // an answer to an older request (a fast second Next) is dropped
        var requestSeq = 0
        val fetchRows: () -> Unit = {
            val seq = ++requestSeq
            val listingState = if (inCollectionList) collectionListState(ctx.currentComponentState, filtersMeta) else ctx.currentComponentState
            val exprCtx = mapOf<String, Any?>("state" to listingState, "appState" to ctx.appState)
            ctx.session.executor.submit {
                try {
                    // Proxy mode: route through the Mateu server via __restfetch__ (no CORS, secrets
                    // server-side); direct fetch otherwise. Both resolve to the same JSON.
                    // A sampled source (sample mode) is never proxied: RestFetch.fetch answers it from the sample.
                    val json = if (ctx.session.sources.viaProxy(rowsSource)) ctx.fetchViaProxy("rows", crudId)
                               else RestFetch.fetch(ctx.apiClient, rowsSource, exprCtx, ctx.session.sources)
                    val arr = RestFetch.valueAtPath(json, rowsResolved.text("itemsPath"))
                    val rows = ArrayList<JsonNode>()
                    if (arr != null && arr.isArray) for (item in arr) {
                        val rowNode = mapper.createObjectNode()
                        for (f in rowFields) RestFetch.valueAtPath(item, f)?.let { rowNode.replace(f, it) }
                        rows.add(rowNode)
                    }
                    val total = totalPath?.let { RestFetch.valueAtPath(json, it) }
                        ?.takeIf { it.isNumber || it.isTextual }?.asText()?.toLongOrNull()
                    javax.swing.SwingUtilities.invokeLater {
                        if (seq != requestSeq) return@invokeLater
                        restRowsAll = rows
                        if (totalPath != null) {
                            // the server paged: these rows ARE the page, and the total is its answer
                            val page = (ctx.currentComponentState["page"] as? Number)?.toInt() ?: 0
                            applyData(restEnvelope(mapper, rows, total ?: rows.size.toLong(),
                                pageSize.takeIf { it > 0 } ?: rows.size.coerceAtLeast(1), page))
                        } else {
                            showRestPage()
                        }
                    }
                } catch (t: Throwable) {
                    println("[Mateu] external rows fetch failed: ${t.message}")
                }
            }
        }
        refreshRest = if (totalPath != null) fetchRows else ({ showRestPage() })
        fetchRows()
    }

    return panel
}

/** The listing envelope applyData reads: `{page: {content, totalElements, pageSize, pageNumber}}`. */
/**
 * What a Collection Detail list reads of the page state: ITS inputs — the search, the page, the size,
 * the sort and its own filters (a range's `_from` / `_to` too). The rest is the selected record's: the
 * artist's `name` was read by the artists source as its name filter, so the list showed that artist only.
 */
internal fun collectionListState(state: Map<String, Any?>, filtersMeta: List<JsonNode>): Map<String, Any?> {
    val filterIds = filtersMeta.map { it.text("fieldId") }.filter { it.isNotBlank() }
    val own = setOf("searchText", "page", "size", "sort") + filterIds.flatMap { listOf(it, "${it}_from", "${it}_to") }
    return state.filterKeys { it in own }
}

private fun restEnvelope(mapper: com.fasterxml.jackson.databind.ObjectMapper, rows: List<JsonNode>, total: Long, pageSize: Int, pageNumber: Int): JsonNode {
    val page = mapper.createObjectNode()
    page.replace("content", mapper.createArrayNode().also { arr -> rows.forEach { arr.add(it) } })
    page.put("totalElements", total)
    page.put("pageSize", pageSize)
    page.put("pageNumber", pageNumber)
    return mapper.createObjectNode().also { it.replace("page", page) }
}

@Suppress("UNCHECKED_CAST")
private fun rowAsParams(ctx: io.mateu.ijp.state.AppContext, row: JsonNode): Map<String, Any?> =
    ctx.mapper.convertValue(row, Map::class.java) as Map<String, Any?>

private enum class ColKind { TEXT, STATUS, LINK, ACTIONS }

private val NUMERIC_TYPES = setOf("integer", "int", "long", "number", "double", "float", "decimal", "BigDecimal", "money")

/** Whether a listing column holds numbers (by wire dataType / money stereotype). */
internal fun isNumericColumn(dataType: String, stereotype: String): Boolean =
    dataType in NUMERIC_TYPES || stereotype == "money" || stereotype == "currency"

/** The pager's caption: "Page 1 of 20 · 200 items" (it used to carry leading spaces as its gap). */
internal fun pagerText(pageNumber: Int, totalPages: Int, total: Long): String =
    "Page ${pageNumber + 1} of $totalPages · $total ${if (total == 1L) "item" else "items"}"

/**
 * A pager button the IntelliJ way: a square icon button (the L&F's 72 px minimum made "‹ Prev" a
 * wide web-style control), focusable — it sits in the Tab order and Space/Enter press it — named for
 * a screen reader and with a tooltip.
 */
internal fun pagerButton(icon: javax.swing.Icon, name: String, onPress: () -> Unit): JButton = JButton(icon).apply {
    putClientProperty("JButton.buttonType", "square")
    isFocusable = true
    toolTipText = plainTip(name)
    getAccessibleContext().accessibleName = name
    addActionListener { onPress() }
}

/**
 * The text of a numeric cell: grouped digits in the user's locale, no spurious ".0" on whole
 * numbers, two decimals for money. "650.0" (the raw double) made a column of prices read as code.
 */
internal fun formatNumberCell(raw: String, money: Boolean, locale: java.util.Locale = MoneyValues.uiLocale()): String {
    val n = raw.trim().toBigDecimalOrNull() ?: return raw
    val f = java.text.NumberFormat.getNumberInstance(locale)
    if (money) { f.minimumFractionDigits = 2; f.maximumFractionDigits = 2 } else { f.maximumFractionDigits = 6 }
    return f.format(n)
}

/**
 * IJ-07: numbers right-aligned so their magnitudes line up — a left-aligned column of numbers
 * cannot be compared at a glance (Few, "Show Me the Numbers": align numbers on the right) — and
 * formatted with [formatNumberCell].
 */
internal class NumberCellRenderer(private val money: Boolean) : DefaultTableCellRenderer() {
    init { horizontalAlignment = javax.swing.SwingConstants.RIGHT; htmlDisabled() }
    override fun setValue(value: Any?) {
        text = value?.toString()?.let { if (it.isBlank()) it else formatNumberCell(it, money) } ?: ""
    }
}

private data class ColSpec(
    val id: String,
    val label: String,
    val kind: ColKind,
    val dataType: String,
    val actionId: String,
    val text: String,
    val editable: Boolean = false,
    val editorType: String = "",
    val stereotype: String = "",
    val aggregate: String = "",
    val tooltipPath: String = "",
    val tones: Map<String, String> = emptyMap(),
    val valueLabels: Map<String, String> = emptyMap(),
) {
    /** What the whole-row-open rule reads of this column (RowOpen.isDisplayColumn). */
    fun rowOpenColumn() = RowOpen.Column(dataType = dataType, stereotype = stereotype, actionId = actionId, editable = editable)

    /** Where the header sits: where the cells sit (an inline-edited number keeps the text editor's start). */
    fun headerAlign(): ColumnAlign.Align = when {
        kind != ColKind.TEXT -> ColumnAlign.Align.START
        editable && isNumericColumn(dataType, stereotype) -> ColumnAlign.Align.START
        editorType == "boolean" -> ColumnAlign.Align.CENTER
        else -> ColumnAlign.of(dataType, stereotype)
    }
}

// ── listing groups + aggregates (replicates the web's listingGroups.ts rules) ────────────

/** A table row: real wire data, or a synthetic (presentation-only) group header / totals row. */
private sealed interface RowEntry
private class DataRow(val node: JsonNode) : RowEntry
private class SyntheticRow(val cells: Map<String, String>) : RowEntry

private fun JsonNode?.groupKeyString(): String =
    if (this == null || isNull || isMissingNode) "" else asText("")

/**
 * Formats an aggregate value like the matching cells do: money dataType/stereotype → the UI's
 * locale with exactly 2 fraction digits; 'count' → integer; else default locale, max 2 decimals.
 */
private fun formatAggregate(value: Double, spec: ColSpec): String {
    if (spec.dataType == "money" || spec.stereotype == "money") {
        return MoneyValues.numberText(value)
    }
    if (spec.aggregate == "count") {
        return java.text.NumberFormat.getIntegerInstance(MoneyValues.uiLocale()).format(Math.round(value))
    }
    val nf = java.text.NumberFormat.getNumberInstance(MoneyValues.uiLocale())
    nf.maximumFractionDigits = 2
    return nf.format(value)
}

/**
 * Walks the (group-sorted) page rows inserting a group header wherever the `groupBy` value
 * changes — "value (count)" in the label column (the groupBy column when visible, else the first
 * column), each group's formatted aggregate in aggregated columns — and appends a totals footer
 * when any column has an aggregate AND the listing data carries `aggregates`.
 */
private fun buildEntries(
    rows: List<JsonNode>,
    specs: List<ColSpec>,
    groupBy: String,
    listing: JsonNode,
): List<RowEntry> {
    val entries = ArrayList<RowEntry>()
    val groups = listing.arr("groups")
    if (groupBy.isNotBlank() && groups.isNotEmpty()) {
        val labelColId = if (specs.any { it.id == groupBy }) groupBy else specs.firstOrNull()?.id
        var lastKey: String? = null
        var started = false
        for (row in rows) {
            val key = row.path(groupBy).groupKeyString()
            if (!started || key != lastKey) {
                started = true
                lastKey = key
                val summary = groups.firstOrNull { it.path("value").groupKeyString() == key }
                val count = summary?.path("count")?.asLong()
                    ?: rows.count { it.path(groupBy).groupKeyString() == key }.toLong()
                val aggregates = summary?.path("aggregates")
                val cells = LinkedHashMap<String, String>()
                for (spec in specs) {
                    when {
                        spec.id == labelColId ->
                            cells[spec.id] = "${summary?.path("value")?.asText(key) ?: key} ($count)"
                        spec.aggregate.isNotBlank() && aggregates != null &&
                            aggregates.path(spec.id).isNumber ->
                            cells[spec.id] = formatAggregate(aggregates.path(spec.id).asDouble(), spec)
                    }
                }
                entries.add(SyntheticRow(cells))
            }
            entries.add(DataRow(row))
        }
    } else {
        rows.forEach { entries.add(DataRow(it)) }
    }
    // Totals footer: whole-filtered-set aggregates pinned as the last row of the table.
    val aggregates = listing.path("aggregates")
    if (aggregates.isObject && specs.any { it.aggregate.isNotBlank() }) {
        val cells = LinkedHashMap<String, String>()
        for (spec in specs) {
            if (spec.aggregate.isNotBlank() && aggregates.path(spec.id).isNumber) {
                cells[spec.id] = formatAggregate(aggregates.path(spec.id).asDouble(), spec)
            }
        }
        specs.firstOrNull()?.let { first ->
            if (cells[first.id] == null) {
                val totalRows = listing.path("page").path("totalElements")
                cells[first.id] = if (groupBy.isNotBlank() && first.id == groupBy && totalRows.isNumber) {
                    "Total (${totalRows.asLong()})"
                } else {
                    "Total"
                }
            }
        }
        entries.add(SyntheticRow(cells))
    }
    return entries
}

/** Bold text on a tinted band — group headers and the totals footer. */
private class SyntheticRowRenderer : DefaultTableCellRenderer() {
    init { htmlDisabled() }
    override fun getTableCellRendererComponent(
        table: JTable, value: Any?, isSelected: Boolean, hasFocus: Boolean, row: Int, column: Int,
    ): Component {
        val c = super.getTableCellRendererComponent(table, value, false, false, row, column) as JLabel
        c.font = c.font.deriveFont(Font.BOLD)
        c.background = com.intellij.ui.JBColor(Color(0xED, 0xF3, 0xFC), Color(0x2D, 0x33, 0x3B))
        c.foreground = table.foreground
        c.isOpaque = true
        return c
    }
}

private fun extractRows(node: JsonNode): List<JsonNode> {
    val content = node.path("content")
    return when {
        content.isArray -> content.toList()
        node.isArray -> node.toList()
        else -> emptyList()
    }
}

// ── cell renderers ─────────────────────────────────────────────────────────────────────

/** Link-styled cell (an identifier column with an `actionId`); the row double-click opens it. */
private class LinkCellRenderer(private val fixedText: String) : DefaultTableCellRenderer() {
    init { htmlDisabled() }
    override fun getTableCellRendererComponent(
        table: JTable, value: Any?, isSelected: Boolean, hasFocus: Boolean, row: Int, column: Int,
    ): Component {
        val node = value as? JsonNode
        val cellText = fixedText.ifBlank { node.displayString() }
        val c = super.getTableCellRendererComponent(table, cellText, isSelected, hasFocus, row, column) as JLabel
        if (!isSelected) c.foreground = JBUI.CurrentTheme.Link.Foreground.ENABLED
        return c
    }
}

/** Status column: renders the `{type,message,value}` object — or a plain word, toned by the
 *  column's declared `tones` first, then by the word's usual meaning — as a coloured badge. */
private class StatusCellRenderer(
    private val tones: Map<String, String> = emptyMap(),
    private val valueLabels: Map<String, String> = emptyMap(),
) : TableCellRenderer {
    override fun getTableCellRendererComponent(
        table: JTable, value: Any?, isSelected: Boolean, hasFocus: Boolean, row: Int, column: Int,
    ): Component {
        // D-17: the chip sits in the MIDDLE of the row (a FlowLayout hung it from the top) and
        // starts where the column's other cells start
        val wrapper = JPanel(java.awt.GridBagLayout())
        wrapper.background = if (isSelected) table.selectionBackground else table.background
        val node = value as? JsonNode
        if (node != null && !node.isNull && !node.isMissingNode) {
            // the badge reads as the value's label; its tone is picked by the RAW value
            val text = StatusTones.cellText(node, valueLabels)
            val type = StatusTones.statusType(node, tones)
            if (text.isNotBlank()) wrapper.add(statusBadge(text, type), java.awt.GridBagConstraints().apply {
                anchor = java.awt.GridBagConstraints.WEST
                weightx = 1.0
                insets = JBUI.insets(0, 4)
            })
        }
        return wrapper
    }
}

/**
 * A listing status cell: a solid chip whose text reaches AA on its fill (IJ-02). Rounded like the
 * platform's tags (a square fill read as a selected cell, D-17).
 */
internal fun statusBadge(text: String, type: String): JComponent {
    val (bg, fg) = ToneColors.solid(ToneColors.toneOf(type))
    val badge = RoundedChip(text)
    badge.foreground = fg
    badge.background = bg
    badge.border = JBUI.Borders.empty(1, 8)
    return badge
}

/** A label painted on a pill-shaped fill (the IntelliJ "tag" look). */
internal class RoundedChip(text: String) : JLabel(plain(text)) {
    init { isOpaque = false }

    override fun paintComponent(g: java.awt.Graphics) {
        val g2 = g.create() as java.awt.Graphics2D
        try {
            g2.setRenderingHint(java.awt.RenderingHints.KEY_ANTIALIASING, java.awt.RenderingHints.VALUE_ANTIALIAS_ON)
            g2.color = background
            val arc = JBUI.scale(8)
            g2.fillRoundRect(0, 0, width, height, arc, arc)
        } finally {
            g2.dispose()
        }
        super.paintComponent(g)
    }
}

/** The row-action nodes of an action-group/menu/action field (feeds the row context menu). */
private fun collectActions(fieldNode: JsonNode?, dataType: String): List<JsonNode> {
    if (fieldNode == null || fieldNode.isNull || fieldNode.isMissingNode) return emptyList()
    return if (dataType == "action") {
        if (fieldNode.has("methodNameInCrud")) listOf(fieldNode) else emptyList()
    } else {
        fieldNode.path("actions").let { if (it.isArray) it.toList() else emptyList() }
    }
}

/**
 * JTable model backed by a live list of row [JsonNode]s. STATUS/LINK cells return the row's field
 * node (their renderers inspect its shape); bool cells return Boolean (checkbox rendering/editor);
 * the rest return display strings. `editable` columns (an @InlineEditing crud) edit in place: a
 * committed change rebuilds the row map, updates the local node and invokes [onRowEdited] —
 * no-op commits are skipped (a checkbox editor fires on initialization).
 */
private class CrudTableModel(
    private val specs: List<ColSpec>,
    private val onRowEdited: (Map<String, Any?>) -> Unit = {},
) : AbstractTableModel() {
    private val entries = ArrayList<RowEntry>()
    private val mapper = com.fasterxml.jackson.databind.ObjectMapper()

    fun setEntries(newEntries: List<RowEntry>) {
        entries.clear()
        entries.addAll(newEntries)
        fireTableDataChanged()
    }

    /** The wire row node at [index] — null for synthetic (group header / totals) rows, so every
     *  caller (row click, context menu, selection) naturally skips them. */
    fun rowAt(index: Int): JsonNode? = (entries.getOrNull(index) as? DataRow)?.node

    fun isSynthetic(index: Int): Boolean = entries.getOrNull(index) is SyntheticRow

    /** Whether the wire value of a plain TEXT cell is a JSON number — the server may type a numeric
     *  column as "string" (e.g. a double price), so the VALUE decides its alignment (IJ-07). */
    fun isNumberAt(index: Int, column: Int): Boolean {
        val spec = specs.getOrNull(column) ?: return false
        if (spec.kind != ColKind.TEXT || spec.editable) return false
        return rowAt(index)?.path(spec.id)?.isNumber == true
    }

    override fun getRowCount(): Int = entries.size
    override fun getColumnCount(): Int = specs.size
    override fun getColumnName(column: Int): String = specs.getOrNull(column)?.label ?: ""
    override fun isCellEditable(rowIndex: Int, columnIndex: Int): Boolean =
        entries.getOrNull(rowIndex) is DataRow && specs.getOrNull(columnIndex)?.editable == true

    override fun getColumnClass(columnIndex: Int): Class<*> {
        val spec = specs.getOrNull(columnIndex) ?: return Any::class.java
        return when {
            spec.kind == ColKind.STATUS || spec.kind == ColKind.LINK -> JsonNode::class.java
            spec.dataType == "bool" || spec.editorType == "boolean" -> java.lang.Boolean::class.java
            else -> String::class.java
        }
    }

    override fun getValueAt(rowIndex: Int, columnIndex: Int): Any? {
        val spec = specs[columnIndex]
        val entry = entries.getOrNull(rowIndex) ?: return null
        if (entry is SyntheticRow) return entry.cells[spec.id] ?: ""
        val row = (entry as DataRow).node
        val node = row.path(spec.id)
        return when {
            spec.kind == ColKind.STATUS || spec.kind == ColKind.LINK -> node
            spec.dataType == "bool" || spec.editorType == "boolean" -> node.asBoolean(false)
            // an editable cell edits the RAW value; a read-only one shows its label
            spec.editable -> node.displayString()
            // a date reads in the user's locale, not as ISO (D-15)
            else -> DateValues.cellText(StatusTones.cellText(node, spec.valueLabels), spec.dataType)
        }
    }

    override fun setValueAt(aValue: Any?, rowIndex: Int, columnIndex: Int) {
        val spec = specs.getOrNull(columnIndex) ?: return
        if (!spec.editable) return
        val row = rowAt(rowIndex) ?: return
        val newValue: Any? = when (spec.editorType) {
            "boolean" -> aValue as? Boolean ?: false
            "integer" -> (aValue?.toString() ?: "").toLongOrNull() ?: return
            "number" -> (aValue?.toString() ?: "").replace(',', '.').toDoubleOrNull() ?: return
            else -> aValue?.toString() ?: ""
        }
        val oldNode = row.path(spec.id)
        val oldValue: Any? = when {
            oldNode.isMissingNode || oldNode.isNull -> null
            oldNode.isBoolean -> oldNode.asBoolean()
            oldNode.isIntegralNumber -> oldNode.asLong()
            oldNode.isNumber -> oldNode.asDouble()
            else -> oldNode.asText()
        }
        if (newValue == oldValue) return
        @Suppress("UNCHECKED_CAST")
        val updated = LinkedHashMap(mapper.convertValue(row, Map::class.java) as Map<String, Any?>)
        updated[spec.id] = newValue
        entries[rowIndex] = DataRow(mapper.valueToTree(updated))
        fireTableCellUpdated(rowIndex, columnIndex)
        onRowEdited(updated)
    }
}


/** GridLayout.tree — rows (and their nested `children`) as a JTree; double-click dispatches the
 *  first LINK/select action with the clicked row, which is how tree lookup selectors resolve. */
private fun renderTreeCrud(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, data: JsonNode): JComponent {
    val ctx = r.ctx
    val panel = JPanel(BorderLayout(0, JBUI.scale(8)))
    panel.border = JBUI.Borders.empty(16)
    val title = metadata.text("title")
    if (title.isNotBlank()) {
        val l = JBLabel(plain(title))
        l.font = l.font.deriveFont(Font.BOLD, PageChrome.fontSize(18f))
        panel.add(l, BorderLayout.NORTH)
    }
    val firstColumn = metadata.leafColumns().firstNotNullOfOrNull { col ->
        val cm = col.path("metadata")
        val id = cm.text("id", col.text("id"))
        if (id.isBlank() || id.startsWith("_") || cm.text("dataType") in setOf("actionGroup", "menu", "action")) null else id
    } ?: "name"
    val linkActionId = metadata.leafColumns().firstNotNullOfOrNull { col ->
        col.path("metadata").text("actionId").ifBlank { null }
    } ?: "select"

    val root = javax.swing.tree.DefaultMutableTreeNode("root")
    val treeModel = javax.swing.tree.DefaultTreeModel(root)
    val tree = javax.swing.JTree(treeModel)
    tree.isRootVisible = false
    // the other columns follow the name, muted ("Paintings · Department · Works 12 · On view 3")
    val otherColumns = metadata.leafColumns().mapNotNull { col ->
        val cm = col.path("metadata")
        val id = cm.text("id", col.text("id"))
        if (id.isBlank() || id == firstColumn || id.startsWith("_") || cm.text("dataType") in setOf("actionGroup", "menu", "action")) null
        else id to cm.text("label", col.text("label"))
    }
    tree.setCellRenderer { _, value, _, _, _, _, _ ->
        val row = (value as? javax.swing.tree.DefaultMutableTreeNode)?.userObject as? JsonNode
        val name = row?.path(firstColumn)?.displayString() ?: ""
        val rest = otherColumns.mapNotNull { (id, label) ->
            val v = row?.path(id)?.takeIf { !it.isMissingNode && !it.isNull }?.displayString()?.takeIf { it.isNotBlank() }
            v?.let { if (label.isBlank()) it else "$label $it" }
        }
        JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(6), 0)).apply {
            isOpaque = false
            border = JBUI.Borders.empty(2, 4)
            add(JBLabel(plain(name)))
            if (rest.isNotEmpty()) add(JBLabel(plain("· " + rest.joinToString(" · "))).apply { foreground = ToneColors.secondaryText() })
        }
    }
    fun fill(parent: javax.swing.tree.DefaultMutableTreeNode, rows: List<JsonNode>) {
        for (row in rows) {
            val node = javax.swing.tree.DefaultMutableTreeNode(row)
            parent.add(node)
            val children = row.path("children")
            if (children.isArray) fill(node, children.toList())
        }
    }
    fun publish(rows: List<JsonNode>) {
        root.removeAllChildren()
        fill(root, rows)
        treeModel.reload()
        for (i in 0 until tree.rowCount) tree.expandRow(i)
    }
    publish(extractRows(data))
    ctx.registerDataHandler(component.text("id").ifBlank { "crud" }) { d -> javax.swing.SwingUtilities.invokeLater { publish(extractRows(d)) } }
    ctx.registerDataHandler("crud") { d -> javax.swing.SwingUtilities.invokeLater { publish(extractRows(d)) } }
    // A tree over a REST source (`rowsSource`, YAML listings): nobody runs a server search for it, so
    // it fetches its rows itself — the whole items, `children` included (the table's REST path keeps
    // the column fields only, which would drop the hierarchy).
    val rowsSource = metadata.path("rowsSource")
    if (rowsSource.isObject) {
        val resolved = ctx.session.sources.resolveRestSource(rowsSource)
        val exprCtx = mapOf<String, Any?>("state" to ctx.currentComponentState, "appState" to ctx.appState)
        val crudId = component.text("id", "crud")
        ctx.session.executor.submit {
            try {
                val json = if (ctx.session.sources.viaProxy(rowsSource)) ctx.fetchViaProxy("rows", crudId)
                           else RestFetch.fetch(ctx.apiClient, rowsSource, exprCtx, ctx.session.sources)
                val arr = RestFetch.valueAtPath(json, resolved.text("itemsPath"))
                val rows = if (arr != null && arr.isArray) arr.toList() else emptyList()
                javax.swing.SwingUtilities.invokeLater { publish(rows) }
            } catch (t: Throwable) {
                println("[Mateu] tree rows fetch failed: ${t.message}")
            }
        }
    }

    tree.addMouseListener(object : MouseAdapter() {
        override fun mouseClicked(e: MouseEvent) {
            if (e.clickCount < 2) return
            val node = tree.lastSelectedPathComponent as? javax.swing.tree.DefaultMutableTreeNode ?: return
            val row = node.userObject as? JsonNode ?: return
            ctx.runAction("action-on-row-$linkActionId", mapOf("_clickedRow" to row))
        }
    })
    panel.add(javax.swing.JScrollPane(tree), BorderLayout.CENTER)
    return panel
}

/**
 * A listing cell whose value is an image url / data URI (`stereotype: image`): a thumbnail [THUMB]
 * px tall, loaded off the EDT once per url and kept in a small shared cache; the table repaints
 * when it arrives. Until then — or when Swing cannot decode it (an SVG, a broken url) — a muted 🖼.
 */
internal class ImageCellRenderer(private val baseUrl: String?) : DefaultTableCellRenderer() {

    override fun getTableCellRendererComponent(
        table: javax.swing.JTable, value: Any?, isSelected: Boolean, hasFocus: Boolean, row: Int, column: Int,
    ): java.awt.Component {
        val c = super.getTableCellRendererComponent(table, "", isSelected, hasFocus, row, column) as javax.swing.JLabel
        c.horizontalAlignment = javax.swing.SwingConstants.CENTER
        val src = (value as? JsonNode)?.let { if (it.isValueNode) it.asText() else null } ?: value?.toString().orEmpty()
        c.icon = null
        c.toolTipText = null
        if (src.isBlank()) return c
        val cached = CACHE[src]
        when {
            cached is javax.swing.Icon -> c.icon = cached
            cached == FAILED -> c.text = "🖼"
            else -> {
                c.text = "…"
                if (CACHE.putIfAbsent(src, LOADING) == null) load(src, table)
            }
        }
        return c
    }

    private fun load(src: String, table: javax.swing.JTable) = LOADER.execute {
        // A remote image is read with timeouts and retried once: ImageIO.read(URL) waits forever, so
        // a stalled connection to a slow image server (IIIF renders on demand, 5–8 s) left the cell
        // at "…" for good. Six downloads at a time.
        val img = runCatching {
            if (src.startsWith("data:")) {
                val b64 = src.substringAfter("base64,", "")
                if (b64.isBlank()) null else javax.imageio.ImageIO.read(java.util.Base64.getDecoder().decode(b64).inputStream())
            } else {
                resolveImageUrl(src, baseUrl)?.let { url ->
                    (1..2).firstNotNullOfOrNull { runCatching { readRemote(url) }.getOrNull() }
                }
            }
        }.getOrNull()
        val icon: Any = if (img == null || img.width <= 0 || img.height <= 0) FAILED else {
            val h = JBUI.scale(THUMB)
            val w = (img.width.toDouble() * h / img.height).toInt().coerceIn(1, h * 2)
            javax.swing.ImageIcon(img.getScaledInstance(w, h, java.awt.Image.SCALE_SMOOTH))
        }
        javax.swing.SwingUtilities.invokeLater {
            CACHE[src] = icon
            table.repaint()
        }
    }

    private fun readRemote(url: String): java.awt.image.BufferedImage? {
        val conn = java.net.URI.create(url).toURL().openConnection()
        conn.connectTimeout = 10_000
        conn.readTimeout = 30_000
        conn.setRequestProperty("Accept", "image/*")
        return conn.getInputStream().use { javax.imageio.ImageIO.read(it) }
    }

    companion object {
        const val THUMB = 40
        private val LOADER = java.util.concurrent.Executors.newFixedThreadPool(6) { r ->
            Thread(r, "mateu-thumbnails").apply { isDaemon = true }
        }
        private val LOADING = Any()
        private val FAILED = Any()
        /** Shared by every listing; bounded so a long browse does not keep every thumbnail. */
        private val CACHE: MutableMap<String, Any> = java.util.Collections.synchronizedMap(
            object : java.util.LinkedHashMap<String, Any>(64, 0.75f, true) {
                override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, Any>?) = size > 300
            },
        )
    }
}

/**
 * The results of a listing: as tall as its rows (header + one row per entry, at least one). A
 * listing that is the whole tab fills it anyway (BorderLayout centre); one stacked in a page with
 * other blocks (Loans beside its workflow, a record's Documents, the hero search) used to report
 * JTable's arbitrary viewport size — frozen by [addStacked] while still empty, so the table showed
 * a strip of its header or three rows and cut the rest.
 */
internal class RowsScrollPane(private val table: javax.swing.JTable) : ContentHeightScrollPane(table) {
    override fun getPreferredSize(): java.awt.Dimension {
        val p = super.getPreferredSize()
        val header = table.tableHeader?.preferredSize?.height ?: 0
        val rows = maxOf(table.rowCount, 1) * table.rowHeight
        val i = insets
        val hsb = p.height - (viewport?.preferredSize?.height ?: 0) - (columnHeader?.preferredSize?.height ?: 0) - i.top - i.bottom
        return java.awt.Dimension(p.width, header + rows + i.top + i.bottom + hsb.coerceAtLeast(0))
    }
}
