package io.mateu.ijp.ui

import com.intellij.ui.JBColor
import com.intellij.util.ui.JBUI
import java.awt.BasicStroke
import java.awt.Dimension
import java.awt.Graphics
import java.awt.Graphics2D
import java.awt.RenderingHints
import java.awt.geom.Path2D
import javax.swing.JPanel

/**
 * A BPMN process as a diagram on the desktop. A Bpmn's XML carries its own layout (the DI section:
 * a shape's bounds, an edge's waypoints), so the diagram is DRAWN where bpmn-js draws it on the web;
 * without a layout it reads as an outline whose gateways show their branches. The previous linear
 * list flattened a gateway's branches into one sequence ("Approved? ↓ Ship ↓ Rejected ↓ On loan").
 */
object BpmnDiagrams {
    data class Node(val id: String, val kind: String, val name: String)
    data class Flow(val id: String, val source: String, val target: String, val name: String)
    data class Bounds(val x: Double, val y: Double, val w: Double, val h: Double)
    data class Model(
        val nodes: Map<String, Node>,
        val flows: List<Flow>,
        val shapes: Map<String, Bounds>,
        val edges: Map<String, List<Pair<Double, Double>>>,
    ) {
        /** Whether every node has a shape (the diagram can be drawn as laid out). */
        val laidOut get() = nodes.isNotEmpty() && nodes.keys.all { it in shapes }
    }

    private val KINDS = setOf("startEvent", "endEvent", "task", "userTask", "serviceTask", "scriptTask", "manualTask",
        "businessRuleTask", "sendTask", "receiveTask", "subProcess", "callActivity", "exclusiveGateway",
        "parallelGateway", "inclusiveGateway", "eventBasedGateway", "intermediateCatchEvent", "intermediateThrowEvent")

    fun parse(xml: String): Model? {
        if (xml.isBlank()) return null
        val doc = runCatching {
            val f = javax.xml.parsers.DocumentBuilderFactory.newInstance()
            f.isNamespaceAware = true
            f.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true)
            f.newDocumentBuilder().parse(org.xml.sax.InputSource(java.io.StringReader(xml)))
        }.getOrNull() ?: return null
        val nodes = LinkedHashMap<String, Node>()
        val flows = ArrayList<Flow>()
        val shapes = HashMap<String, Bounds>()
        val edges = HashMap<String, List<Pair<Double, Double>>>()
        val all = doc.getElementsByTagNameNS("*", "*")
        for (i in 0 until all.length) {
            val e = all.item(i) as org.w3c.dom.Element
            val local = e.localName ?: e.tagName.substringAfter(':')
            when {
                local in KINDS -> nodes[e.getAttribute("id")] = Node(e.getAttribute("id"), local, e.getAttribute("name").ifBlank { local })
                local == "sequenceFlow" -> flows += Flow(e.getAttribute("id"), e.getAttribute("sourceRef"), e.getAttribute("targetRef"), e.getAttribute("name"))
                local == "BPMNShape" -> childNamed(e, "Bounds")?.let { b ->
                    shapes[e.getAttribute("bpmnElement")] = Bounds(b.d("x"), b.d("y"), b.d("width"), b.d("height"))
                }
                local == "BPMNEdge" -> edges[e.getAttribute("bpmnElement")] = childrenNamed(e, "waypoint").map { it.d("x") to it.d("y") }
            }
        }
        return Model(nodes, flows, shapes, edges)
    }

    private fun org.w3c.dom.Element.d(name: String) = getAttribute(name).toDoubleOrNull() ?: 0.0

    private fun childrenNamed(e: org.w3c.dom.Element, local: String): List<org.w3c.dom.Element> {
        val out = ArrayList<org.w3c.dom.Element>()
        val kids = e.childNodes
        for (i in 0 until kids.length) {
            val k = kids.item(i) as? org.w3c.dom.Element ?: continue
            if ((k.localName ?: k.tagName.substringAfter(':')) == local) out += k
        }
        return out
    }

    private fun childNamed(e: org.w3c.dom.Element, local: String) = childrenNamed(e, local).firstOrNull()

    /**
     * The process as outline lines, depth first from the start: each line is (indent, text). A node
     * with several outgoing flows lists each branch indented under it, headed by the flow's name.
     */
    fun outline(model: Model): List<Pair<Int, String>> {
        val out = ArrayList<Pair<Int, String>>()
        val seen = HashSet<String>()
        fun glyph(kind: String) = when {
            kind.endsWith("startEvent") -> "○"
            kind.endsWith("endEvent") -> "◉"
            kind.contains("Gateway") -> "◇"
            else -> "▭"
        }
        fun walk(id: String, depth: Int, via: String?) {
            val node = model.nodes[id] ?: return
            val prefix = if (via.isNullOrBlank()) "" else "$via → "
            if (!seen.add(id)) { out += depth to "$prefix↪ ${node.name}"; return }
            out += depth to "$prefix${glyph(node.kind)} ${node.name}"
            val next = model.flows.filter { it.source == id }
            if (next.size == 1) walk(next[0].target, depth, next[0].name.takeIf { it.isNotBlank() })
            else next.forEach { walk(it.target, depth + 1, it.name.ifBlank { "branch" }) }
        }
        val starts = model.nodes.values.filter { it.kind == "startEvent" }.ifEmpty { model.nodes.values.take(1) }
        starts.forEach { walk(it.id, 0, null) }
        model.nodes.keys.filter { it !in seen }.forEach { walk(it, 0, null) }
        return out
    }
}

/** The laid-out process, painted from its DI: shapes at their bounds, edges along their waypoints. */
internal class BpmnCanvas(private val model: BpmnDiagrams.Model) : JPanel() {
    // room around the shapes for labels wider than an event ("Loan requested" under a 36px circle)
    private val margin = 48.0
    private val minX = (model.shapes.values.minOfOrNull { it.x } ?: 0.0)
    private val minY = (model.shapes.values.minOfOrNull { it.y } ?: 0.0)

    init { isOpaque = false }

    override fun getPreferredSize(): Dimension {
        val maxX = model.shapes.values.maxOfOrNull { it.x + it.w } ?: 0.0
        val maxY = model.shapes.values.maxOfOrNull { it.y + it.h } ?: 0.0
        // room under the lowest shape for its label
        return Dimension(JBUI.scale((maxX - minX + margin * 2).toInt()), JBUI.scale((maxY - minY + margin * 2 + 18).toInt()))
    }

    override fun getMinimumSize() = preferredSize

    override fun paintComponent(g: Graphics) {
        val g2 = g.create() as Graphics2D
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON)
        g2.scale(JBUI.scale(1f).toDouble(), JBUI.scale(1f).toDouble())
        g2.translate(margin - minX, margin - minY)
        g2.font = JBUI.Fonts.smallFont()
        val fm = g2.fontMetrics
        val ink = ToneColors.foreground()
        val line = JBColor.border().darker()
        // edges first, under the shapes
        g2.stroke = BasicStroke(1.5f)
        for (flow in model.flows) {
            val pts = model.edges[flow.id] ?: continue
            if (pts.size < 2) continue
            g2.color = line
            val p = Path2D.Double()
            pts.forEachIndexed { i, (x, y) -> if (i == 0) p.moveTo(x, y) else p.lineTo(x, y) }
            g2.draw(p)
            val (x1, y1) = pts[pts.size - 2]
            val (x2, y2) = pts.last()
            val a = Math.atan2(y2 - y1, x2 - x1)
            val head = Path2D.Double().apply {
                moveTo(x2, y2)
                lineTo(x2 - 8 * Math.cos(a - 0.4), y2 - 8 * Math.sin(a - 0.4))
                lineTo(x2 - 8 * Math.cos(a + 0.4), y2 - 8 * Math.sin(a + 0.4))
                closePath()
            }
            g2.fill(head)
            if (flow.name.isNotBlank()) {
                val mid = pts[pts.size / 2 - (if (pts.size % 2 == 0) 1 else 0)]
                val (mx, my) = if (pts.size == 2) ((pts[0].first + pts[1].first) / 2) to ((pts[0].second + pts[1].second) / 2) else mid
                g2.color = ToneColors.secondaryText()
                g2.drawString(flow.name, (mx + 4).toFloat(), (my - 4).toFloat())
            }
        }
        val accent = JBColor(java.awt.Color(0x3574F0), java.awt.Color(0x548AF7))
        for (node in model.nodes.values) {
            val b = model.shapes[node.id] ?: continue
            g2.stroke = BasicStroke(if (node.kind == "endEvent") 3f else 1.5f)
            when {
                node.kind.endsWith("Event") -> {
                    g2.color = JBColor.background()
                    g2.fill(java.awt.geom.Ellipse2D.Double(b.x, b.y, b.w, b.h))
                    g2.color = if (node.kind == "endEvent") ink else accent
                    g2.draw(java.awt.geom.Ellipse2D.Double(b.x, b.y, b.w, b.h))
                    label(g2, fm, node.name, b.x + b.w / 2, b.y + b.h + fm.ascent + 2.0)
                }
                node.kind.contains("Gateway") -> {
                    val d = Path2D.Double().apply {
                        moveTo(b.x + b.w / 2, b.y); lineTo(b.x + b.w, b.y + b.h / 2)
                        lineTo(b.x + b.w / 2, b.y + b.h); lineTo(b.x, b.y + b.h / 2); closePath()
                    }
                    g2.color = JBColor.background(); g2.fill(d)
                    g2.color = ink; g2.draw(d)
                    val mark = when (node.kind) { "parallelGateway" -> "+"; "exclusiveGateway" -> "×"; "inclusiveGateway" -> "○"; else -> "" }
                    if (mark.isNotEmpty()) label(g2, fm, mark, b.x + b.w / 2, b.y + b.h / 2 + fm.ascent / 2.0 - 1)
                    label(g2, fm, node.name, b.x + b.w / 2, b.y - 4.0)
                }
                else -> {
                    val rect = java.awt.geom.RoundRectangle2D.Double(b.x, b.y, b.w, b.h, 10.0, 10.0)
                    g2.color = JBColor.background(); g2.fill(rect)
                    g2.color = ink; g2.draw(rect)
                    // the task's name wrapped inside its box
                    val lines = wrap(node.name, fm, (b.w - 10).toInt())
                    var y = b.y + (b.h - lines.size * fm.height) / 2 + fm.ascent
                    for (l in lines) { label(g2, fm, l, b.x + b.w / 2, y); y += fm.height }
                }
            }
        }
        g2.dispose()
    }

    private fun label(g2: Graphics2D, fm: java.awt.FontMetrics, text: String, cx: Double, baseline: Double) {
        g2.color = ToneColors.foreground()
        g2.drawString(text, (cx - fm.stringWidth(text) / 2.0).toFloat(), baseline.toFloat())
    }

    private fun wrap(text: String, fm: java.awt.FontMetrics, width: Int): List<String> {
        val out = ArrayList<String>()
        var line = ""
        for (word in text.split(' ')) {
            val candidate = if (line.isEmpty()) word else "$line $word"
            if (fm.stringWidth(candidate) <= width || line.isEmpty()) line = candidate else { out += line; line = word }
        }
        if (line.isNotEmpty()) out += line
        return out
    }
}
