package io.mateu.ijp.ui

import com.intellij.ide.util.PropertiesComponent
import com.intellij.ui.table.JBTable
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent
import javax.swing.JCheckBoxMenuItem
import javax.swing.JPopupMenu
import javax.swing.event.ChangeEvent
import javax.swing.event.ListSelectionEvent
import javax.swing.event.TableColumnModelEvent
import javax.swing.event.TableColumnModelListener
import javax.swing.table.TableColumn

/**
 * Per-user column personalization on a crud [JBTable] — parity with the web column chooser
 * (`columnPrefsStore`/`applyColumnPrefs`): show/hide columns via a header right-click menu, and
 * native drag-reorder, both persisted per crud route in [PropertiesComponent]. Protected columns
 * (the row-open/identifier column) are never hideable. Additive — installs on an already-built
 * table, so the crud renderer needs no refactor.
 *
 * Persistence is two comma-joined string properties (hidden ids, id order) — no Jackson, so it does
 * not depend on the Kotlin databind module being registered.
 */
object ColumnChooser {

    private fun keyHidden(scope: String) = "mateu.columns.${scope.ifBlank { "_" }}.hidden"
    private fun keyOrder(scope: String) = "mateu.columns.${scope.ifBlank { "_" }}.order"

    private fun readList(name: String): List<String> =
        PropertiesComponent.getInstance().getValue(name)?.split(",")?.filter { it.isNotBlank() } ?: emptyList()

    private fun writeList(name: String, values: List<String>) {
        val pc = PropertiesComponent.getInstance()
        if (values.isEmpty()) pc.unsetValue(name) else pc.setValue(name, values.joinToString(","))
    }

    /**
     * @param ids column ids in model order (identity column first)
     * @param protectedIds ids that must never be hidden (the row-open/identifier column)
     * @param scope the crud route — the persistence granularity (like the web's pathname scope)
     */
    fun install(table: JBTable, ids: List<String>, protectedIds: Set<String>, scope: String) {
        val cm = table.columnModel
        if (cm.columnCount != ids.size) return // defensive: model/ids out of sync — leave the table as-is
        // Tag each TableColumn with its stable id (JTable identifiers default to the header label).
        for (i in ids.indices) cm.getColumn(i).identifier = ids[i]
        // Keep every column so a hidden one can be re-shown.
        val byId = HashMap<String, TableColumn>()
        for (i in ids.indices) byId[ids[i]] = cm.getColumn(i)

        val hidden = readList(keyHidden(scope)).filter { it in ids && it !in protectedIds }.toMutableSet()
        val savedOrder = readList(keyOrder(scope))

        fun columnById(id: String): TableColumn? =
            (0 until cm.columnCount).map { cm.getColumn(it) }.firstOrNull { it.identifier == id }

        fun currentOrder(): List<String> =
            (0 until cm.columnCount).map { cm.getColumn(it).identifier as? String ?: "" }

        fun persist() {
            writeList(keyHidden(scope), hidden.toList())
            writeList(keyOrder(scope), currentOrder())
        }

        // Apply persisted hidden set.
        for (id in hidden) columnById(id)?.let { cm.removeColumn(it) }
        // Apply persisted order: pull saved ids to the front in that order (visible ones only).
        var target = 0
        for (id in savedOrder) {
            if (id in hidden) continue
            val col = columnById(id) ?: continue
            val cur = (0 until cm.columnCount).firstOrNull { cm.getColumn(it) === col } ?: continue
            if (cur != target) cm.moveColumn(cur, target)
            target++
        }

        // Native drag-reorder, persisted.
        table.tableHeader.reorderingAllowed = true
        cm.addColumnModelListener(object : TableColumnModelListener {
            override fun columnMoved(e: TableColumnModelEvent) {
                if (e.fromIndex != e.toIndex) writeList(keyOrder(scope), currentOrder())
            }
            override fun columnAdded(e: TableColumnModelEvent) {}
            override fun columnRemoved(e: TableColumnModelEvent) {}
            override fun columnMarginChanged(e: ChangeEvent) {}
            override fun columnSelectionChanged(e: ListSelectionEvent) {}
        })

        // Header right-click → show/hide menu (checked = visible).
        table.tableHeader.addMouseListener(object : MouseAdapter() {
            override fun mousePressed(e: MouseEvent) = maybePopup(e)
            override fun mouseReleased(e: MouseEvent) = maybePopup(e)
            private fun maybePopup(e: MouseEvent) {
                if (!e.isPopupTrigger) return
                val menu = JPopupMenu()
                for (id in ids) {
                    if (id in protectedIds) continue
                    val visible = columnById(id) != null
                    val label = byId[id]?.headerValue?.toString() ?: id
                    val item = JCheckBoxMenuItem(label, visible)
                    item.addActionListener {
                        if (visible) {
                            hidden.add(id)
                            columnById(id)?.let { cm.removeColumn(it) }
                        } else {
                            hidden.remove(id)
                            byId[id]?.let { cm.addColumn(it) } // re-added at the end; drag to reposition
                        }
                        persist()
                    }
                    menu.add(item)
                }
                if (menu.componentCount > 0) menu.show(e.component, e.x, e.y)
            }
        })
    }
}
