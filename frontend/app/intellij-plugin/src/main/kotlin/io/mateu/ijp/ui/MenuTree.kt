package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.ColoredTreeCellRenderer
import com.intellij.ui.SimpleTextAttributes
import com.intellij.ui.TreeSpeedSearch
import com.intellij.ui.treeStructure.Tree
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import java.awt.event.KeyAdapter
import java.awt.event.KeyEvent
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent
import javax.swing.JComponent
import javax.swing.JTree
import javax.swing.tree.DefaultMutableTreeNode
import javax.swing.tree.DefaultTreeModel
import javax.swing.tree.TreeSelectionModel

/**
 * The app menu in the navigator as a platform [Tree] — what every IDE navigator is (Project,
 * Structure, Settings). It replaced a column of hyperlinks: a tree has a selected row (where am I),
 * arrow-key navigation, expand/collapse of groups, and speed search (type to jump), and it reads as
 * one control to a screen reader instead of N unrelated links.
 *
 * A click or Enter on a leaf opens it (like the link it replaces); groups toggle. Separators are
 * dropped: in a tree the groups already separate.
 */
object MenuTree {

    /** One menu node: a leaf carries its wire [entry]; a group its [children]. */
    data class Node(val label: String, val entry: JsonNode?, val children: List<Node>) {
        val isGroup get() = children.isNotEmpty()
        override fun toString() = label // speed search and accessibility read this
    }

    /** The menu entries → tree nodes (pure; separators and unlabelled entries dropped). */
    fun nodesOf(menu: Iterable<JsonNode>): List<Node> = menu.mapNotNull { item ->
        if (item.bool("separator")) return@mapNotNull null
        val label = item.text("label")
        val submenus = item.path("submenus")
        when {
            submenus.isArray && !submenus.isEmpty -> Node(label, null, nodesOf(submenus)).takeIf { it.isGroup }
            label.isBlank() -> null
            else -> Node(label, item, emptyList())
        }
    }

    fun build(menu: List<JsonNode>, open: (JsonNode) -> Unit): JComponent {
        val root = DefaultMutableTreeNode("Menu")
        fun add(parent: DefaultMutableTreeNode, nodes: List<Node>) {
            for (n in nodes) {
                val treeNode = DefaultMutableTreeNode(n)
                parent.add(treeNode)
                add(treeNode, n.children)
            }
        }
        add(root, nodesOf(menu))
        // The platform Tree (its selection painting, its UI settings) needs the running IDE; a bare
        // JVM (the render probe) gets a plain JTree with the same model and behaviour.
        // The tree starts EMPTY and gets the model only once our renderer is in: a JTree measures its
        // rows with the renderer it has, and Swing's default one is an HTML-aware JLabel — a menu
        // label of `<html><img src=…>` was rendered as markup (and its image fetched) on construction.
        val empty = DefaultTreeModel(DefaultMutableTreeNode())
        val tree = if (com.intellij.openapi.application.ApplicationManager.getApplication() != null) Tree(empty) else JTree(empty)
        tree.cellRenderer = object : ColoredTreeCellRenderer() {
            override fun customizeCellRenderer(
                tree: JTree, value: Any?, selected: Boolean, expanded: Boolean, leaf: Boolean, row: Int, hasFocus: Boolean,
            ) {
                // plain text by construction: SimpleColoredComponent paints fragments, never HTML
                val node = (value as? DefaultMutableTreeNode)?.userObject as? Node ?: return
                append(node.label, if (node.isGroup) SimpleTextAttributes.REGULAR_BOLD_ATTRIBUTES else SimpleTextAttributes.REGULAR_ATTRIBUTES)
            }
        }
        tree.isRootVisible = false
        tree.model = DefaultTreeModel(root)
        tree.showsRootHandles = root.children().asSequence().any { (it as DefaultMutableTreeNode).childCount > 0 }
        tree.selectionModel.selectionMode = TreeSelectionModel.SINGLE_TREE_SELECTION
        tree.isOpaque = false
        tree.border = JBUI.Borders.empty(0, 4)
        // every group open, like the links were (TreeUtil.expandAll needs a booted Application)
        var row = 0
        while (row < tree.rowCount) tree.expandRow(row++)
        tree.accessibleContext.accessibleName = "Menu"

        fun nodeAt(path: javax.swing.tree.TreePath?) = (path?.lastPathComponent as? DefaultMutableTreeNode)?.userObject as? Node
        fun activate(path: javax.swing.tree.TreePath?) {
            val node = nodeAt(path) ?: return
            val entry = node.entry
            if (entry != null) open(entry)
            else if (tree.isExpanded(path)) tree.collapsePath(path) else tree.expandPath(path)
        }
        // Press and release on the same entry opens it. Not mouseClicked: Swing drops a click when the
        // pointer moves a pixel between press and release, so an entry sometimes "did not react".
        // A group row still toggles only through its handle / double click (BasicTreeUI's own).
        // The WHOLE row is the target, as it is painted (full-width selection): getPathForLocation only
        // hits the label's own width, so a click right of a short label («Visits», «Loans») selected the
        // row and opened nothing.
        fun rowPathAt(x: Int, y: Int): javax.swing.tree.TreePath? {
            val row = tree.getClosestRowForLocation(x, y)
            if (row < 0) return null
            val b = tree.getRowBounds(row) ?: return null
            return if (y >= b.y && y < b.y + b.height && x >= b.x) tree.getPathForRow(row) else null
        }
        tree.addMouseListener(object : MouseAdapter() {
            private var pressed: javax.swing.tree.TreePath? = null

            override fun mousePressed(e: MouseEvent) {
                // ANY click count: going quickly from one entry to the next counts as the 2nd click of a
                // series, and requiring clickCount == 1 dropped it (the entry was selected, nothing opened).
                // Opening an entry twice is harmless — an open view's tab is just brought to the front.
                pressed = if (e.button == MouseEvent.BUTTON1 && !e.isPopupTrigger) rowPathAt(e.x, e.y) else null
            }

            override fun mouseReleased(e: MouseEvent) {
                val start = pressed ?: return
                pressed = null
                if (e.button != MouseEvent.BUTTON1 || e.isPopupTrigger) return
                val path = rowPathAt(e.x, e.y) ?: return
                // a group's own row toggles through its handle / double click — only leaves open on a click
                if (path == start && nodeAt(path)?.entry != null) activate(path)
            }
        })
        tree.addKeyListener(object : KeyAdapter() {
            override fun keyPressed(e: KeyEvent) {
                if (e.keyCode == KeyEvent.VK_ENTER && e.modifiersEx == 0) {
                    activate(tree.selectionPath)
                    e.consume()
                }
            }
        })
        runCatching { TreeSpeedSearch.installOn(tree) }
        return tree
    }
}
