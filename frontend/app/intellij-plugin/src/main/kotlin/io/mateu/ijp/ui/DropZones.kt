package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.JBColor
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.text
import java.awt.Font
import java.awt.datatransfer.DataFlavor
import java.awt.datatransfer.Transferable
import java.awt.datatransfer.UnsupportedFlavorException
import java.awt.dnd.DropTargetAdapter
import java.awt.dnd.DropTargetDragEvent
import java.awt.dnd.DropTargetDropEvent
import java.awt.dnd.DropTargetEvent
import javax.swing.JComponent
import javax.swing.JTable
import javax.swing.ListSelectionModel
import javax.swing.TransferHandler

/** The in-JVM flavor a row drag travels under (see [RowDrag.MIME]). */
val MATEU_ROWS_FLAVOR = DataFlavor(RowDrag.MIME, "Mateu rows")

private class RowsTransferable(private val encoded: String) : Transferable {
    override fun getTransferDataFlavors(): Array<DataFlavor> = arrayOf(MATEU_ROWS_FLAVOR)
    override fun isDataFlavorSupported(flavor: DataFlavor): Boolean = flavor == MATEU_ROWS_FLAVOR
    override fun getTransferData(flavor: DataFlavor): Any {
        if (flavor != MATEU_ROWS_FLAVOR) throw UnsupportedFlavorException(flavor)
        return encoded
    }
}

/**
 * Makes a listing table's rows draggable (`Crud.dragType`): the drag carries the SELECTED rows —
 * pressing on an unselected row selects it first, so a plain drag takes the row under the pointer —
 * as a [RowDrag.Payload]. [rowAt] maps a MODEL index to the wire row (null for synthetic rows).
 */
fun installRowDrag(table: JTable, dragType: String, rowAt: (Int) -> JsonNode?) {
    if (table.selectionModel.selectionMode == ListSelectionModel.SINGLE_SELECTION) {
        table.selectionModel.selectionMode = ListSelectionModel.MULTIPLE_INTERVAL_SELECTION
    }
    table.dragEnabled = true
    table.transferHandler = object : TransferHandler() {
        override fun getSourceActions(c: JComponent): Int = MOVE
        override fun createTransferable(c: JComponent): Transferable? {
            val rows = table.selectedRows.toList().mapNotNull { rowAt(table.convertRowIndexToModel(it)) }
            val payload = RowDrag.payloadOf(dragType, rows) ?: return null
            return RowsTransferable(RowDrag.encode(payload))
        }
    }
}

private fun payloadOf(t: Transferable?): RowDrag.Payload? =
    runCatching { RowDrag.decode(t?.getTransferData(MATEU_ROWS_FLAVOR) as? String) }.getOrNull()

/**
 * Drop zone (wire `DropZone`): a titled panel (title, subtitle, then its children) that accepts
 * drops of dragged listing rows of its `accept` type and runs `actionId` with the zone's
 * `parameters` + `_draggedIds` + `_dragType` — like a Button dispatches its action with parameters.
 * The border highlights while an acceptable drag hovers it.
 */
fun renderDropZone(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val accept = metadata.text("accept")
    val actionId = metadata.text("actionId")
    val parameters = r.ctx.jsonToParams(metadata.path("parameters"))
    val idle = JBUI.Borders.compound(JBUI.Borders.customLine(JBColor.border(), 1), JBUI.Borders.empty(8, 10))
    val hover = JBUI.Borders.compound(JBUI.Borders.customLine(JBUI.CurrentTheme.Focus.focusColor(), 2), JBUI.Borders.empty(7, 9))

    val panel = verticalPanel(4)
    panel.border = idle
    val title = metadata.text("title")
    val subtitle = metadata.text("subtitle")
    if (title.isNotBlank()) panel.addStacked(JBLabel(title).apply { font = font.deriveFont(Font.BOLD) }, 0)
    if (subtitle.isNotBlank()) {
        panel.addStacked(JBLabel(subtitle).apply { foreground = ToneColors.secondaryText() }, 0)
    }
    component.path("children").forEach { child -> panel.addStacked(r.render(child, state, data), 4) }
    panel.accessibleName(title.ifBlank { subtitle })
    if (accept.isNotBlank()) {
        panel.toolTipText = "Drop $accept rows here"
    }

    panel.transferHandler = object : TransferHandler() {
        override fun canImport(support: TransferSupport): Boolean {
            if (!support.isDataFlavorSupported(MATEU_ROWS_FLAVOR)) return false
            // Local (same-JVM) drags expose the data while hovering; if a platform does not, the
            // flavor alone admits the drag and importData does the real check.
            val payload = payloadOf(support.transferable)
            val ok = payload == null || RowDrag.accepts(accept, actionId, payload)
            panel.border = if (ok) hover else idle
            return ok
        }

        override fun importData(support: TransferSupport): Boolean {
            panel.border = idle
            val payload = payloadOf(support.transferable) ?: return false
            if (!RowDrag.accepts(accept, actionId, payload)) return false
            r.ctx.runAction(actionId, RowDrag.dropParameters(parameters, payload))
            return true
        }
    }
    // Reset the highlight when the drag leaves or ends without an import.
    panel.dropTarget?.addDropTargetListener(object : DropTargetAdapter() {
        override fun dragExit(dte: DropTargetEvent) { panel.border = idle }
        override fun drop(dtde: DropTargetDropEvent) { panel.border = idle }
        override fun dragEnter(dtde: DropTargetDragEvent) {}
    })
    return panel
}
