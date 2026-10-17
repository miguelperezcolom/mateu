package io.mateu.ijp.ui

import javax.swing.JComponent
import javax.swing.plaf.basic.BasicHTML

/**
 * DATA text on a Swing label, button, tooltip or cell is TEXT, never markup.
 *
 * Swing renders any text that starts with `<html>` as HTML, and builds that view when the text is
 * SET — so a value like `<html><img src=https://tracker/x>` fetches the image the moment the label is
 * constructed (a beacon reporting who opened the record), before anything could inspect the tree.
 * Every place that puts data on such a component therefore passes it through [plain] (or, for a
 * reused renderer component, [htmlDisabled]); markup the plugin builds itself stays HTML and routes
 * the data inside it through [SafeHtml.escape] / [SafeHtml.sanitize].
 */
fun plain(text: String?): String {
    val t = text.orEmpty()
    // Swing's own test: exactly "<html>" (any case) at index 0. Such a value is shown escaped, as text.
    return if (BasicHTML.isHTMLString(t)) "<html>${SafeHtml.escape(t).replace("\n", "<br>")}</html>" else t
}

/** [plain] for a tooltip, keeping "no tooltip" (null) as it is. */
fun plainTip(text: String?): String? = text?.let(::plain)

/** Turns Swing's HTML rendering off on a component that is fed data later (a cell renderer). */
fun <T : JComponent> T.htmlDisabled(): T = apply { putClientProperty(BasicHTML.propertyKey + ".disable", true) }

/**
 * A table whose cells and headers show data: its default cell renderers (one reused component per
 * value class) never render HTML, and nor does its header renderer.
 */
fun <T : javax.swing.JTable> T.plainCells(): T = apply {
    for (cls in listOf(Any::class.java, String::class.java, Number::class.java, java.lang.Integer::class.java,
        java.lang.Long::class.java, java.lang.Double::class.java, java.lang.Float::class.java, java.util.Date::class.java)) {
        (getDefaultRenderer(cls) as? JComponent)?.htmlDisabled()
    }
    tableHeader?.let { header ->
        val base = header.defaultRenderer
        header.defaultRenderer = javax.swing.table.TableCellRenderer { table, value, isSelected, hasFocus, row, column ->
            base.getTableCellRendererComponent(table, (value as? String)?.let(::plain) ?: value, isSelected, hasFocus, row, column)
        }
    }
}

/** A list/combo renderer whose String items are shown as [plain] text. */
fun <E> plainItems(base: javax.swing.ListCellRenderer<in E>): javax.swing.ListCellRenderer<E> =
    javax.swing.ListCellRenderer { list, value, index, isSelected, cellHasFocus ->
        @Suppress("UNCHECKED_CAST")
        base.getListCellRendererComponent(list, ((value as? String)?.let(::plain) ?: value) as E, index, isSelected, cellHasFocus)
    }
