package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBCheckBox
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBList
import com.intellij.ui.components.JBRadioButton
import com.intellij.ui.components.JBScrollPane
import com.intellij.ui.components.JBTextField
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import java.awt.BasicStroke
import java.awt.BorderLayout
import java.awt.Color
import java.awt.Component
import java.awt.Dimension
import java.awt.FlowLayout
import java.awt.Graphics
import java.awt.Graphics2D
import java.awt.RenderingHints
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import java.text.NumberFormat
import java.util.Base64
import java.util.Locale
import javax.imageio.ImageIO
import javax.swing.BorderFactory
import javax.swing.Box
import javax.swing.BoxLayout
import javax.swing.ButtonGroup
import javax.swing.DefaultListModel
import javax.swing.JButton
import javax.swing.JColorChooser
import javax.swing.JComponent
import javax.swing.JEditorPane
import javax.swing.JFileChooser
import javax.swing.JPanel
import javax.swing.JPopupMenu
import javax.swing.JSlider
import javax.swing.JSpinner
import javax.swing.JTree
import javax.swing.SpinnerNumberModel
import javax.swing.SwingUtilities
import javax.swing.Timer
import javax.swing.tree.DefaultMutableTreeNode
import javax.swing.tree.TreeSelectionModel

/** The long tail of field stereotypes on Swing — mirrors the RN renderer's FieldWidgets. */

// ── lookup (remote search select) ─────────────────────────────────────────────────────────────

/**
 * `@Lookup` / searchable selects: a button opening a popup with a search box; typing (debounced)
 * runs the field's `search-<fieldId>` action and the options arrive as a field-keyed data-only
 * fragment through [AppContext.registerFieldDataHandler].
 */
fun lookupField(ctx: AppContext, fieldId: String, metadata: JsonNode, value: String, enabled: Boolean): JComponent {
    val action = metadata.path("remoteCoordinates").text("action").ifBlank { "search-$fieldId" }
    val button = JButton(if (value.isBlank()) "Select…" else value)
    button.isEnabled = enabled
    button.horizontalAlignment = javax.swing.SwingConstants.LEFT

    button.addActionListener {
        val popup = JPopupMenu()
        val panel = JPanel(BorderLayout(0, 4))
        panel.border = JBUI.Borders.empty(6)
        panel.preferredSize = Dimension(320, 260)
        val search = JBTextField()
        search.emptyText.text = "Search…"
        val model = DefaultListModel<Pair<String, String>>()
        val list = JBList(model)
        list.setCellRenderer { _, entry, _, isSelected, _ ->
            JBLabel(entry.second).apply {
                border = JBUI.Borders.empty(4, 6)
                isOpaque = isSelected
                if (isSelected) background = Color(0xD0, 0xE2, 0xF5)
            }
        }
        panel.add(search, BorderLayout.NORTH)
        panel.add(JBScrollPane(list), BorderLayout.CENTER)
        popup.add(panel)

        ctx.registerFieldDataHandler(fieldId) { page ->
            SwingUtilities.invokeLater {
                model.clear()
                for (opt in page.path("content")) {
                    model.addElement(opt.text("value") to opt.text("label", opt.text("value")))
                }
            }
        }
        var debounce: Timer? = null
        fun runSearch(text: String) = ctx.runAction(action, mapOf("searchText" to text), silent = true)
        search.document.addDocumentListener(object : javax.swing.event.DocumentListener {
            fun changed() {
                debounce?.stop()
                debounce = Timer(300) { runSearch(search.text) }.apply { isRepeats = false; start() }
            }
            override fun insertUpdate(e: javax.swing.event.DocumentEvent) = changed()
            override fun removeUpdate(e: javax.swing.event.DocumentEvent) = changed()
            override fun changedUpdate(e: javax.swing.event.DocumentEvent) = changed()
        })
        list.addMouseListener(object : MouseAdapter() {
            override fun mouseClicked(e: MouseEvent) {
                val picked = list.selectedValue ?: return
                ctx.putState(fieldId, picked.first)
                button.text = picked.second
                popup.isVisible = false
                ctx.unregisterFieldDataHandler(fieldId)
            }
        })
        popup.addPopupMenuListener(object : javax.swing.event.PopupMenuListener {
            override fun popupMenuWillBecomeVisible(e: javax.swing.event.PopupMenuEvent) {}
            override fun popupMenuWillBecomeInvisible(e: javax.swing.event.PopupMenuEvent) = ctx.unregisterFieldDataHandler(fieldId)
            override fun popupMenuCanceled(e: javax.swing.event.PopupMenuEvent) = ctx.unregisterFieldDataHandler(fieldId)
        })
        runSearch("")
        popup.show(button, 0, button.height)
        search.requestFocusInWindow()
    }
    return button
}

// ── option groups ─────────────────────────────────────────────────────────────────────────────

fun radioField(ctx: AppContext, fieldId: String, options: List<JsonNode>, value: String, enabled: Boolean): JComponent {
    val panel = JPanel()
    panel.layout = BoxLayout(panel, BoxLayout.Y_AXIS)
    panel.isOpaque = false
    val group = ButtonGroup()
    for (opt in options) {
        val v = opt.text("value")
        val rb = JBRadioButton(opt.text("label", v), v == value)
        rb.isEnabled = enabled
        rb.addActionListener { ctx.putState(fieldId, v) }
        group.add(rb)
        panel.add(rb)
    }
    return panel
}

fun multiSelectField(ctx: AppContext, fieldId: String, options: List<JsonNode>, selected: JsonNode, enabled: Boolean): JComponent {
    val current = HashSet<String>()
    if (selected.isArray) for (v in selected) current.add(v.asText())
    val panel = JPanel()
    panel.layout = BoxLayout(panel, BoxLayout.Y_AXIS)
    panel.isOpaque = false
    for (opt in options) {
        val v = opt.text("value")
        val cb = JBCheckBox(opt.text("label", v), current.contains(v))
        cb.isEnabled = enabled
        cb.addActionListener {
            if (cb.isSelected) current.add(v) else current.remove(v)
            ctx.putState(fieldId, current.toList())
        }
        panel.add(cb)
    }
    return panel
}

// ── numeric widgets ───────────────────────────────────────────────────────────────────────────

fun sliderField(ctx: AppContext, fieldId: String, metadata: JsonNode, value: String, enabled: Boolean): JComponent {
    val min = metadata.path("sliderMin").asInt(0)
    val max = metadata.path("sliderMax").asInt(100)
    val slider = JSlider(min, max, value.toDoubleOrNull()?.toInt()?.coerceIn(min, max) ?: min)
    slider.isEnabled = enabled
    slider.paintLabels = true
    slider.majorTickSpacing = ((max - min) / 4).coerceAtLeast(1)
    slider.addChangeListener { if (!slider.valueIsAdjusting) ctx.putState(fieldId, slider.value) }
    return slider
}

fun stepperField(ctx: AppContext, fieldId: String, metadata: JsonNode, value: String, enabled: Boolean): JComponent {
    val step = metadata.path("step").asInt(1).coerceAtLeast(1)
    val spinner = JSpinner(SpinnerNumberModel(value.toDoubleOrNull()?.toInt() ?: 0, Int.MIN_VALUE, Int.MAX_VALUE, step))
    spinner.isEnabled = enabled
    spinner.addChangeListener { ctx.putState(fieldId, spinner.value) }
    return spinner
}

fun starsField(ctx: AppContext, fieldId: String, value: String, enabled: Boolean): JComponent {
    val panel = JPanel(FlowLayout(FlowLayout.LEFT, 2, 0))
    panel.isOpaque = false
    var current = value.toDoubleOrNull()?.toInt() ?: 0
    val labels = ArrayList<JBLabel>()
    fun refresh() = labels.forEachIndexed { i, l ->
        l.text = if (i < current) "★" else "☆"
        l.foreground = if (i < current) Color(0xF5, 0xA6, 0x23) else Color.GRAY
    }
    for (i in 1..5) {
        val star = JBLabel("☆")
        star.font = star.font.deriveFont(20f)
        if (enabled) {
            star.addMouseListener(object : MouseAdapter() {
                override fun mouseClicked(e: MouseEvent) {
                    current = if (current == i) 0 else i
                    ctx.putState(fieldId, current)
                    refresh()
                }
            })
        }
        labels.add(star)
        panel.add(star)
    }
    refresh()
    return panel
}

// ── color ─────────────────────────────────────────────────────────────────────────────────────

fun colorField(ctx: AppContext, fieldId: String, value: String, enabled: Boolean): JComponent {
    val panel = JPanel(FlowLayout(FlowLayout.LEFT, 6, 0))
    panel.isOpaque = false
    val swatch = JPanel()
    swatch.preferredSize = Dimension(24, 24)
    swatch.background = runCatching { Color.decode(value) }.getOrElse { Color.WHITE }
    swatch.border = BorderFactory.createLineBorder(Color.GRAY)
    val pick = JButton(if (value.isBlank()) "Pick…" else value)
    pick.isEnabled = enabled
    pick.addActionListener {
        val chosen = JColorChooser.showDialog(panel, "Pick a color", swatch.background) ?: return@addActionListener
        val hex = String.format("#%02x%02x%02x", chosen.red, chosen.green, chosen.blue)
        swatch.background = chosen
        pick.text = hex
        ctx.putState(fieldId, hex)
    }
    panel.add(swatch)
    panel.add(pick)
    return panel
}

// ── images / signature ────────────────────────────────────────────────────────────────────────

private fun decodeDataUri(value: String): BufferedImage? = runCatching {
    val base64 = value.substringAfter("base64,", "")
    if (base64.isBlank()) null else ImageIO.read(Base64.getDecoder().decode(base64).inputStream())
}.getOrNull()

private fun imageLabel(value: String): JBLabel {
    val img = decodeDataUri(value)
    return if (img != null) {
        val scale = minOf(1.0, 280.0 / img.width)
        JBLabel(javax.swing.ImageIcon(img.getScaledInstance((img.width * scale).toInt(), (img.height * scale).toInt(), java.awt.Image.SCALE_SMOOTH)))
    } else {
        JBLabel(if (value.isBlank()) "—" else value)
    }
}

fun imagePreviewField(value: String): JComponent = imageLabel(value)

/** @UploadableImage / @PhotoCapture on the desktop: pick a file → data URI (no camera API on the JVM). */
fun uploadableImageField(ctx: AppContext, fieldId: String, value: String, enabled: Boolean): JComponent {
    val panel = JPanel()
    panel.layout = BoxLayout(panel, BoxLayout.Y_AXIS)
    panel.isOpaque = false
    var preview = imageLabel(value)
    preview.alignmentX = Component.LEFT_ALIGNMENT
    panel.add(preview)
    if (enabled) {
        val buttons = JPanel(FlowLayout(FlowLayout.LEFT, 6, 4))
        buttons.isOpaque = false
        buttons.alignmentX = Component.LEFT_ALIGNMENT
        val upload = JButton(if (value.isBlank()) "Upload" else "Replace")
        upload.addActionListener {
            val chooser = JFileChooser()
            chooser.fileFilter = javax.swing.filechooser.FileNameExtensionFilter("Images", "png", "jpg", "jpeg", "gif")
            if (chooser.showOpenDialog(panel) != JFileChooser.APPROVE_OPTION) return@addActionListener
            val file = chooser.selectedFile
            val mime = if (file.extension.lowercase() == "png") "image/png" else "image/jpeg"
            val uri = "data:$mime;base64," + Base64.getEncoder().encodeToString(file.readBytes())
            ctx.putState(fieldId, uri)
            panel.remove(preview)
            preview = imageLabel(uri)
            preview.alignmentX = Component.LEFT_ALIGNMENT
            panel.add(preview, 0)
            panel.revalidate(); panel.repaint()
            upload.text = "Replace"
        }
        val delete = JButton("Delete")
        delete.addActionListener {
            ctx.putState(fieldId, "")
            panel.remove(preview)
            preview = imageLabel("")
            preview.alignmentX = Component.LEFT_ALIGNMENT
            panel.add(preview, 0)
            panel.revalidate(); panel.repaint()
            upload.text = "Upload"
        }
        buttons.add(upload)
        buttons.add(delete)
        panel.add(buttons)
    }
    return panel
}

/** @Signature: draw with the mouse on a canvas; Accept commits a PNG data URI. */
fun signatureField(ctx: AppContext, fieldId: String, value: String, enabled: Boolean): JComponent {
    if (!enabled || value.isNotBlank()) {
        val panel = JPanel()
        panel.layout = BoxLayout(panel, BoxLayout.Y_AXIS)
        panel.isOpaque = false
        val preview = imageLabel(value)
        preview.alignmentX = Component.LEFT_ALIGNMENT
        panel.add(preview)
        if (enabled) {
            val again = JButton("Sign again")
            again.alignmentX = Component.LEFT_ALIGNMENT
            again.addActionListener {
                ctx.putState(fieldId, "")
                ctx.rerenderForm()
            }
            panel.add(again)
        }
        return panel
    }
    val strokes = ArrayList<ArrayList<java.awt.Point>>()
    val canvas = object : JPanel() {
        override fun paintComponent(g: Graphics) {
            super.paintComponent(g)
            val g2 = g as Graphics2D
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON)
            g2.color = Color.BLACK
            g2.stroke = BasicStroke(2f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND)
            for (stroke in strokes) for (i in 1 until stroke.size) {
                g2.drawLine(stroke[i - 1].x, stroke[i - 1].y, stroke[i].x, stroke[i].y)
            }
        }
    }
    canvas.background = Color.WHITE
    canvas.border = BorderFactory.createLineBorder(Color.GRAY)
    canvas.preferredSize = Dimension(320, 120)
    canvas.minimumSize = Dimension(320, 120)
    val mouse = object : MouseAdapter() {
        override fun mousePressed(e: MouseEvent) { strokes.add(arrayListOf(e.point)) }
        override fun mouseDragged(e: MouseEvent) { strokes.lastOrNull()?.add(e.point); canvas.repaint() }
    }
    canvas.addMouseListener(mouse)
    canvas.addMouseMotionListener(mouse)

    val panel = JPanel()
    panel.layout = BoxLayout(panel, BoxLayout.Y_AXIS)
    panel.isOpaque = false
    canvas.alignmentX = Component.LEFT_ALIGNMENT
    panel.add(canvas)
    val buttons = JPanel(FlowLayout(FlowLayout.LEFT, 6, 4))
    buttons.isOpaque = false
    buttons.alignmentX = Component.LEFT_ALIGNMENT
    buttons.add(JButton("Clear").apply { addActionListener { strokes.clear(); canvas.repaint() } })
    buttons.add(JButton("Accept").apply {
        addActionListener {
            val img = BufferedImage(canvas.width.coerceAtLeast(1), canvas.height.coerceAtLeast(1), BufferedImage.TYPE_INT_RGB)
            val g = img.createGraphics()
            canvas.paint(g)
            g.dispose()
            val out = ByteArrayOutputStream()
            ImageIO.write(img, "png", out)
            ctx.putState(fieldId, "data:image/png;base64," + Base64.getEncoder().encodeToString(out.toByteArray()))
            ctx.rerenderForm()
        }
    })
    panel.add(buttons)
    return panel
}

// ── tree select ───────────────────────────────────────────────────────────────────────────────

fun treeSelectField(ctx: AppContext, fieldId: String, metadata: JsonNode, value: String, enabled: Boolean): JComponent {
    val leavesOnly = metadata.path("treeLeavesOnly").asBoolean(false)
    val button = JButton(if (value.isBlank()) "Select…" else value)
    button.isEnabled = enabled
    button.addActionListener {
        val root = DefaultMutableTreeNode("root")
        fun add(parent: DefaultMutableTreeNode, opts: List<JsonNode>) {
            for (opt in opts) {
                val node = DefaultMutableTreeNode(opt.text("value") to opt.text("label", opt.text("value")))
                parent.add(node)
                add(node, opt.arr("children"))
            }
        }
        add(root, metadata.arr("options"))
        val tree = JTree(root)
        tree.isRootVisible = false
        tree.selectionModel.selectionMode = TreeSelectionModel.SINGLE_TREE_SELECTION
        tree.setCellRenderer { _, nodeValue, _, _, _, _, _ ->
            @Suppress("UNCHECKED_CAST")
            val pair = (nodeValue as? DefaultMutableTreeNode)?.userObject as? Pair<String, String>
            JBLabel(pair?.second ?: "").apply { border = JBUI.Borders.empty(2, 4) }
        }
        val popup = JPopupMenu()
        val scroll = JBScrollPane(tree)
        scroll.preferredSize = Dimension(300, 220)
        popup.add(scroll)
        tree.addMouseListener(object : MouseAdapter() {
            override fun mouseClicked(e: MouseEvent) {
                val node = tree.lastSelectedPathComponent as? DefaultMutableTreeNode ?: return
                if (leavesOnly && node.childCount > 0) return
                @Suppress("UNCHECKED_CAST")
                val pair = node.userObject as? Pair<String, String> ?: return
                ctx.putState(fieldId, pair.first)
                button.text = pair.second
                popup.isVisible = false
            }
        })
        popup.show(button, 0, button.height)
    }
    return button
}

// ── read-only text renderings ────────────────────────────────────────────────────────────────

fun formatMoney(value: String): String {
    val n = value.toDoubleOrNull() ?: return value
    val fmt = NumberFormat.getNumberInstance(Locale.GERMANY)
    fmt.minimumFractionDigits = 2
    fmt.maximumFractionDigits = 2
    return fmt.format(n)
}

/** Light markdown → HTML (headings, bold, bullets) rendered with a JEditorPane; html passes through. */
fun richTextField(value: String, kind: String): JComponent {
    val html = when (kind) {
        "markdown" -> {
            val body = value.lines().joinToString("") { line ->
                val h = Regex("^(#{1,6})\\s+(.*)$").find(line)
                when {
                    h != null -> "<h${h.groupValues[1].length}>${h.groupValues[2]}</h${h.groupValues[1].length}>"
                    Regex("^\\s*[-*•]\\s+").containsMatchIn(line) -> "<li>${line.replace(Regex("^\\s*[-*•]\\s+"), "")}</li>"
                    line.isBlank() -> "<br/>"
                    else -> "<p>$line</p>"
                }
            }
            body.replace(Regex("\\*\\*([^*]+)\\*\\*"), "<b>$1</b>")
        }
        else -> value
    }
    val pane = JEditorPane("text/html", "<html><body>$html</body></html>")
    pane.isEditable = false
    pane.isOpaque = false
    return pane
}

fun linkField(value: String): JComponent {
    val label = JBLabel("<html><a href=''>$value</a></html>")
    label.cursor = java.awt.Cursor.getPredefinedCursor(java.awt.Cursor.HAND_CURSOR)
    label.addMouseListener(object : MouseAdapter() {
        override fun mouseClicked(e: MouseEvent) {
            runCatching { com.intellij.ide.BrowserUtil.browse(value) }
        }
    })
    return label
}

fun badgeChip(label: String, on: Boolean): JComponent {
    val chip = JBLabel(label)
    chip.isOpaque = true
    chip.background = if (on) Color(0xE6, 0xF4, 0xEA) else Color(0xEE, 0xEE, 0xEE)
    chip.foreground = if (on) Color(0x1A, 0x7F, 0x37) else Color.GRAY
    chip.border = JBUI.Borders.empty(2, 8)
    return chip
}
