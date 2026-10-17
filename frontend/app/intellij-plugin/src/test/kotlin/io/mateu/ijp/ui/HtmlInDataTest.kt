package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.databind.node.TextNode
import com.intellij.testFramework.PlatformTestUtil
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import com.sun.net.httpserver.HttpServer
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.Container
import java.awt.image.BufferedImage
import java.io.File
import java.net.InetSocketAddress
import java.util.concurrent.atomic.AtomicInteger
import javax.swing.AbstractButton
import javax.swing.JComboBox
import javax.swing.JComponent
import javax.swing.JEditorPane
import javax.swing.JLabel
import javax.swing.JList
import javax.swing.JTabbedPane
import javax.swing.JTable
import javax.swing.border.TitledBorder
import javax.swing.plaf.basic.BasicHTML

/**
 * Data is text, never markup (the review's MINOR 6 follow-up). Swing renders any text starting with
 * `<html>` as HTML and FETCHES its images when the text is set — so every text value of the real
 * wire (the shared conformance corpus and the wire-types fixture) is replaced by a beacon,
 * `<html><img src=http://127.0.0.1:<port>/…>`, rendered, laid out, painted (cell renderers run on
 * paint), and: no request may reach the beacon server, and no label, button, tooltip, cell, tab or
 * titled border may hold the beacon as live markup. A second test scans the sources so a NEW label
 * fed data without [plain] fails even when no fixture reaches it.
 */
class HtmlInDataTest : BasePlatformTestCase() {

    private val mapper = ObjectMapper()
    private lateinit var beacon: HttpServer
    private val hits = AtomicInteger()
    private val port by lazy { beacon.address.port }
    private val payload by lazy { "<html><img src=\"http://127.0.0.1:$port/beacon.png\">Beacon</html>" }

    override fun setUp() {
        super.setUp()
        beacon = (20950..20999).firstNotNullOf { p -> runCatching { HttpServer.create(InetSocketAddress("127.0.0.1", p), 0) }.getOrNull() }
        beacon.createContext("/") { ex -> hits.incrementAndGet(); ex.sendResponseHeaders(404, -1); ex.close() }
        beacon.start()
    }

    override fun tearDown() {
        try { beacon.stop(0) } finally { super.tearDown() }
    }

    /** Keys that select a renderer branch rather than carry text: kept, so the branch still renders. */
    private val structural = setOf(
        "type", "dataType", "stereotype", "kind", "variant", "gridLayout", "layout", "position", "size",
        "theme", "color", "tone", "orientation", "direction", "display", "resultType", "listingType", "view",
        "action", "buttonStyle", "level",
    )

    private fun poisoned(node: JsonNode): JsonNode {
        val copy = node.deepCopy<JsonNode>()
        fun walk(n: JsonNode) {
            when {
                n.isObject -> (n as ObjectNode).fields().asSequence().toList().forEach { (k, v) ->
                    if (v.isTextual && k !in structural) n.set<JsonNode>(k, TextNode(payload)) else walk(v)
                }
                n.isArray -> n.forEachIndexed { i, v ->
                    if (v.isTextual) (n as com.fasterxml.jackson.databind.node.ArrayNode).set(i, TextNode(payload)) else walk(v)
                }
            }
        }
        walk(copy)
        return copy
    }

    private val casesDir: File by lazy {
        generateSequence(File(System.getProperty("user.dir")).absoluteFile) { it.parentFile }
            .map { File(it, "conformance/cases") }.first { it.isDirectory }
    }

    // popup menus are not children of what they belong to: walk them (and submenus) too
    private fun all(c: Container): Sequence<java.awt.Component> {
        val popups = listOfNotNull((c as? javax.swing.JMenu)?.popupMenu, (c as? JComponent)?.componentPopupMenu)
        return sequenceOf<java.awt.Component>(c) + popups.asSequence().flatMap { all(it) } +
            c.components.asSequence().flatMap { if (it is Container) all(it) else sequenceOf(it) }
    }

    private fun live(text: String?) = text != null && BasicHTML.isHTMLString(text) && text.contains("<img")

    /** Lays out and paints [root], runs every cell renderer, and reports what holds the beacon as markup. */
    private fun offenders(name: String, root: JComponent): List<String> {
        root.setSize(1400, 2400)
        all(root).filterIsInstance<Container>().forEach { it.doLayout() }
        runCatching { root.paint(BufferedImage(1400, 2400, BufferedImage.TYPE_INT_ARGB).createGraphics()) }
        val out = ArrayList<String>()
        // a label/button/cell offends when its text is live markup AND Swing built an HTML view for it
        // (a renderer with html.disable shows the same text as text); a tooltip, tab or border title
        // offends on its text alone (their views are built later, when shown)
        fun check(what: String, c: Any?, text: String?, viewless: Boolean = false) {
            val rendered = viewless || (c as? JComponent)?.getClientProperty(BasicHTML.propertyKey) != null
            if (live(text) && rendered) out += "$name: $what ${c?.javaClass?.simpleName} '${text?.take(60)}'"
        }
        for (c in all(root)) {
            if (c is JLabel) check("label", c, c.text)
            if (c is AbstractButton) check("button", c, c.text)
            if (c is JComponent) {
                check("tooltip of", c, c.toolTipText, viewless = true)
                (c.border as? TitledBorder)?.let { check("titled border of", c, it.title, viewless = true) }
            }
            if (c is JEditorPane && c.text.contains("beacon.png")) out += "$name: html pane kept the remote image"
            if (c is JTabbedPane) for (i in 0 until c.tabCount) check("tab", c, c.getTitleAt(i), viewless = true)
            if (c is JTable) {
                for (r in 0 until minOf(c.rowCount, 20)) for (col in 0 until c.columnCount) {
                    val cell = runCatching { c.prepareRenderer(c.getCellRenderer(r, col), r, col) }.getOrNull()
                    if (cell is JLabel) check("cell", cell, cell.text)
                }
                c.tableHeader?.let { h ->
                    for (col in 0 until c.columnCount) {
                        val head = h.defaultRenderer.getTableCellRendererComponent(c, c.columnModel.getColumn(col).headerValue, false, false, -1, col)
                        if (head is JLabel) check("header", head, head.text)
                    }
                }
            }
            if (c is JList<*>) {
                @Suppress("UNCHECKED_CAST") val list = c as JList<Any?>
                for (i in 0 until minOf(list.model.size, 20)) {
                    val cell = list.cellRenderer?.getListCellRendererComponent(list, list.model.getElementAt(i), i, false, false)
                    if (cell is JLabel) check("list item", cell, cell.text)
                }
            }
            if (c is JComboBox<*>) {
                @Suppress("UNCHECKED_CAST") val combo = c as JComboBox<Any?>
                val list = JList<Any?>()
                for (i in 0 until minOf(combo.itemCount, 20)) {
                    val cell = combo.renderer?.getListCellRendererComponent(list, combo.getItemAt(i), i, false, false)
                    if (cell is JLabel) check("combo item", cell, cell.text)
                }
            }
        }
        return out
    }

    private var seen = 0

    /** Attributes a beacon request to the case that just rendered (fetches are asynchronous). */
    private fun fetchedBy(name: String): List<String> {
        val deadline = System.currentTimeMillis() + 150
        while (hits.get() == seen && System.currentTimeMillis() < deadline) Thread.sleep(10)
        val now = hits.get()
        return if (now > seen) listOf("$name: fetched the beacon image").also { seen = now } else emptyList()
    }

    fun testABeaconInEveryTextOfTheRealWireIsNeverRenderedAsMarkup() {
        val failures = ArrayList<String>()
        // the conformance corpus, through the increment pipeline
        val cases = casesDir.listFiles { f -> File(f, "expected.json").isFile }!!.sortedBy { it.name }
        assertTrue(cases.size >= 20)
        for (dir in cases) {
            val increment = poisoned(mapper.readTree(File(dir, "expected.json")))
            val ctx = AppContext(AppSession("http://127.0.0.1:9"))
            ctx.silentErrors = true
            val pane = ctx.newSlot()
            ctx.contentPane = pane
            ctx.titleConsumer = {}
            runCatching { ctx.applyIncrement(increment) }
            PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
            failures += offenders(dir.name, pane)
            failures += fetchedBy(dir.name)
        }
        // every wire type of the parity fixture, through the dispatcher
        val fixture = mapper.readTree(javaClass.getResourceAsStream("/coverage/wire-types.json"))
            .path("fragments").path(0).path("component")
        val ctx = AppContext(AppSession("http://127.0.0.1:9"))
        ctx.silentErrors = true
        ctx.contentPane = ctx.newSlot()
        val renderer = ComponentRenderer(ctx)
        val empty = mapper.createObjectNode()
        for (child in fixture.path("children")) {
            val type = child.path("metadata").path("type").asText()
            val widget = runCatching { renderer.render(poisoned(child), poisoned(empty), empty) }.getOrNull() ?: continue
            failures += offenders(type, widget)
            failures += fetchedBy(type)
        }
        PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
        Thread.sleep(800) // image loading is asynchronous: give a fetch the time to arrive
        assertTrue(failures.distinct().joinToString("\n"), failures.isEmpty())
        assertEquals("requests reached the beacon (a remote image was fetched)", 0, hits.get())
    }

    fun testTheBeaconProbeWorks() {
        // the probe is not blind: an unprotected label with the payload IS live markup and DOES fetch
        val raw = JLabel(payload)
        assertTrue(offenders("probe", raw).isNotEmpty())
        val deadline = System.currentTimeMillis() + 3000
        while (hits.get() == 0 && System.currentTimeMillis() < deadline) Thread.sleep(50)
        assertTrue("the raw label fetched its image", hits.get() > 0)
        // and the same text through plain() is neither
        hits.set(0)
        assertTrue(offenders("plain", JLabel(plain(payload))).isEmpty())
        Thread.sleep(300)
        assertEquals(0, hits.get())
    }

    fun testPlainLeavesOrdinaryTextAloneAndNeutralisesMarkup() {
        assertEquals("Order 42 <b>", plain("Order 42 <b>"))
        assertEquals("", plain(null))
        assertNull(plainTip(null))
        assertEquals("<html>&lt;html&gt;&lt;b&gt;x&lt;/b&gt;</html>", plain("<html><b>x</b>"))
        assertEquals("<html>&lt;HTML&gt;a<br>b</html>", plain("<HTML>a\nb"))
    }

    /**
     * Source guard: a label/button/link created with a NON-literal text must pass it through [plain]
     * (or build trusted `<html>` markup whose every interpolation is escaped/sanitised). Icons and
     * a short allow-list of trusted IDE screens are exempt.
     */
    fun testNoLabelOrButtonIsCreatedWithRawDataText() {
        val src = generateSequence(File(System.getProperty("user.dir")).absoluteFile) { it.parentFile }
            .map { File(it, "src/main/kotlin/io/mateu/ijp") }.first { it.isDirectory }
        val ctor = Regex("\\b(JBLabel|JLabel|JButton|ActionLink|JCheckBox|JBCheckBox|JRadioButton|JBRadioButton|JMenuItem|JBMenuItem|JToggleButton|JMenu|JCheckBoxMenuItem|JRadioButtonMenuItem|JBCheckBoxMenuItem)\\(")
        val iconArg = Regex("^(icon\\b|ideIcon\\b|javax\\.swing\\.ImageIcon\\(|com\\.intellij\\.icons\\.|AllIcons\\.)")
        val literal = Regex("^\"[^\"$\\\\]*(\\\\.[^\"$\\\\]*)*\"\\s*[,)]")
        val safeInterpolation = Regex("^\\$\\{(SafeHtml\\.|io\\.mateu\\.ijp\\.ui\\.SafeHtml\\.|escapeHtml\\(|com\\.intellij\\.openapi\\.util\\.text\\.StringUtil\\.escapeXmlEntities\\()")
        val offenders = ArrayList<String>()
        src.walkTopDown().filter { it.isFile && it.extension == "kt" && it.name !in setOf("PlainText.kt", "SafeHtml.kt") }.forEach { f ->
            f.readLines().forEachIndexed { i, line ->
                if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) return@forEachIndexed
                for (m in ctor.findAll(line)) {
                    val arg = line.substring(m.range.last + 1).trimStart()
                    val ok = arg.isEmpty() || arg.startsWith(")") || arg.startsWith("plain(") || literal.containsMatchIn(arg) ||
                        iconArg.containsMatchIn(arg) || arg.startsWith("if (name in setOf(") /* renderElement: sanitised above */ ||
                        (arg.startsWith("\"<html>") && Regex("\\$\\{").findAll(arg).all { safeInterpolation.containsMatchIn(arg.substring(it.range.first)) } &&
                            !Regex("\\$[a-zA-Z]").containsMatchIn(arg))
                    if (!ok) offenders += "${f.relativeTo(src)}:${i + 1}: ${line.trim().take(100)}"
                }
                Regex("\\btoolTipText = (.*)$").find(line)?.let { t ->
                    val rhs = t.groupValues[1].trim()
                    if (!(rhs.startsWith("plainTip(") || rhs.startsWith("Popovers.") || literal.containsMatchIn("$rhs)") || rhs == "null" ||
                            rhs.startsWith("wrapped.toolTipText")))
                        offenders += "${f.relativeTo(src)}:${i + 1}: ${line.trim().take(100)}"
                }
            }
        }
        assertTrue(offenders.joinToString("\n"), offenders.isEmpty())
    }
}
