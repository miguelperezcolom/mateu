package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.JBColor
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.text
import java.awt.BasicStroke
import java.awt.Color
import java.awt.Dimension
import java.awt.Graphics
import java.awt.Graphics2D
import java.awt.RenderingHints
import java.awt.geom.Arc2D
import java.awt.geom.Path2D
import javax.swing.JComponent
import javax.swing.JPanel

/**
 * The kinds of chart Chart.js draws on the web that a desktop chart tells apart. Every other
 * `chartType` (scatter, bubble…) is drawn as the nearest of these — never silently as bars when the
 * web shows a ring: a doughnut or a radar answers a different question (parts of a whole, a profile
 * over axes), and the same data as bars said something the page did not.
 */
enum class ChartKind(val title: String) {
    BAR("Bar chart"), LINE("Line chart"), PIE("Pie chart"), DOUGHNUT("Doughnut chart"),
    POLAR_AREA("Polar area chart"), RADAR("Radar chart");

    val isCircular get() = this == PIE || this == DOUGHNUT || this == POLAR_AREA

    companion object {
        fun of(chartType: String): ChartKind = when (chartType.trim().lowercase()) {
            "line", "area", "scatter", "bubble" -> LINE
            "pie" -> PIE
            "doughnut", "donut" -> DOUGHNUT
            "polararea", "polar", "polar_area" -> POLAR_AREA
            "radar" -> RADAR
            else -> BAR
        }
    }
}

/** One dataset of a chart: its legend label and one value per category label. */
data class ChartSeries(val label: String, val values: List<Double>)

/** A chart's wire data, read once: kind, category labels, every dataset (the web draws them all). */
data class ChartModel(val kind: ChartKind, val labels: List<String>, val series: List<ChartSeries>) {
    val values: List<Double> get() = series.firstOrNull()?.values.orEmpty()

    companion object {
        fun of(metadata: JsonNode): ChartModel {
            val data = metadata.path("chartData")
            return ChartModel(
                ChartKind.of(metadata.text("chartType")),
                data.arr("labels").map { it.asText() },
                data.arr("datasets").map { ds -> ChartSeries(ds.text("label"), ds.arr("data").map { it.asDouble() }) },
            )
        }
    }
}

/** Chart painted with Java2D: bars/lines for every dataset, pie/doughnut/polar area, radar. */
fun renderChart(metadata: JsonNode, style: String = ""): JComponent {
    val chart = ChartPanel(ChartModel.of(metadata))
    // `height: 240px` on the component is the chart's height on the web (Chart.js fills its box)
    cssPx(style, "height")?.let { h -> chart.preferredSize = Dimension(chart.preferredSize.width, JBUI.scale(h)) }
    cssPx(style, "width")?.let { w -> chart.preferredSize = Dimension(JBUI.scale(w), chart.preferredSize.height) }
    return chart
}

/** A small categorical palette (Chart.js-like hues), readable on both themes. */
internal val CHART_PALETTE = listOf(
    JBColor(0x3574F0, 0x548AF7), JBColor(0xE8772E, 0xF09A5A), JBColor(0x2E9E6A, 0x4CBF86),
    JBColor(0xC94F7C, 0xE07BA0), JBColor(0x8A5CD1, 0xA98BE3), JBColor(0xC9A227, 0xDDBE55),
    JBColor(0x2A9DB0, 0x52BFD0), JBColor(0x7A7A7A, 0xA0A0A0),
)

/**
 * IJ-04: a JPanel (a bare JComponent has a NULL AccessibleContext) carrying the chart's data as its
 * accessible name — WCAG 1.1.1: a painted chart is an image, and a screen reader got nothing at all.
 * Each bar/point is also labelled with its value while there are few: a direct label beats an axis
 * the reader has to estimate against (Few, "Show Me the Numbers").
 */
internal class ChartPanel(private val model: ChartModel) : JPanel() {
    /** Kept for callers that only know one series. */
    constructor(labels: List<String>, values: List<Double>, line: Boolean) :
        this(ChartModel(if (line) ChartKind.LINE else ChartKind.BAR, labels, listOf(ChartSeries("", values))))

    init {
        isOpaque = false
        preferredSize = Dimension(JBUI.scale(320), JBUI.scale(200))
        minimumSize = Dimension(JBUI.scale(160), JBUI.scale(140))
        // getAccessibleContext(), not the protected `accessibleContext` field (null until first asked)
        getAccessibleContext().accessibleName = chartTextAlternative(model)
    }

    // a stacked chart keeps the height it asked for (a box layout squeezed it to its minimum)
    override fun getMinimumSize(): Dimension = Dimension(super.getMinimumSize().width, preferredSize.height)

    override fun paintComponent(g: Graphics) {
        if (model.series.all { it.values.isEmpty() }) return
        val g2 = g.create() as Graphics2D
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON)
        g2.font = JBUI.Fonts.smallFont()
        try {
            when {
                model.kind.isCircular -> paintCircular(g2)
                model.kind == ChartKind.RADAR -> paintRadar(g2)
                else -> paintCartesian(g2)
            }
        } finally {
            g2.dispose()
        }
    }

    private fun color(i: Int) = CHART_PALETTE[i % CHART_PALETTE.size]

    /** The legend's height when the chart has more than one dataset (painted along the top). */
    private fun paintSeriesLegend(g2: Graphics2D, pad: Int): Int {
        val named = model.series.filter { it.label.isNotBlank() }
        if (model.series.size < 2 || named.isEmpty()) return 0
        val fm = g2.fontMetrics
        var x = pad
        val sw = JBUI.scale(10)
        model.series.forEachIndexed { i, s ->
            g2.color = color(i)
            g2.fillRect(x, pad + (fm.height - sw) / 2, sw, sw)
            g2.color = ToneColors.foreground()
            g2.drawString(s.label, x + sw + JBUI.scale(4), pad + fm.ascent)
            x += sw + JBUI.scale(16) + fm.stringWidth(s.label)
        }
        return fm.height + JBUI.scale(6)
    }

    private fun paintCartesian(g2: Graphics2D) {
        val pad = JBUI.scale(8)
        val fm = g2.fontMetrics
        val legendH = paintSeriesLegend(g2, pad)
        val labelH = JBUI.scale(18)
        val valueH = JBUI.scale(14) // room above the tallest bar for its value label
        val w = width - pad * 2
        val h = height - pad * 2 - labelH - valueH - legendH
        if (h <= 0) return
        val max = model.series.flatMap { it.values }.maxOrNull()?.takeIf { it > 0 } ?: 1.0
        val n = model.series.maxOf { it.values.size }
        val slot = w.toDouble() / n
        val top = pad + legendH + valueH
        val labelValues = n * model.series.size <= 14 // direct labels only while they stay legible
        if (model.kind == ChartKind.LINE) {
            model.series.forEachIndexed { si, s ->
                g2.color = color(si)
                g2.stroke = BasicStroke(JBUI.scale(2).toFloat())
                var prev: Pair<Int, Int>? = null
                s.values.forEachIndexed { i, v ->
                    val x = pad + (slot * i + slot / 2).toInt()
                    val y = top + h - (v / max * h).toInt()
                    prev?.let { (px, py) -> g2.drawLine(px, py, x, y) }
                    g2.fillOval(x - JBUI.scale(3), y - JBUI.scale(3), JBUI.scale(6), JBUI.scale(6))
                    prev = x to y
                }
                if (labelValues) {
                    g2.color = ToneColors.foreground()
                    s.values.forEachIndexed { i, v ->
                        val x = pad + (slot * i + slot / 2).toInt()
                        val y = top + h - (v / max * h).toInt()
                        val t = formatTick(v)
                        g2.drawString(t, x - fm.stringWidth(t) / 2, y - JBUI.scale(6))
                    }
                }
            }
        } else {
            val k = model.series.size
            val groupW = (slot * 0.7).toInt().coerceAtLeast(2)
            val barW = (groupW / k).coerceAtLeast(2)
            for (i in 0 until n) {
                val groupX = pad + (slot * i + (slot - barW * k) / 2).toInt()
                model.series.forEachIndexed { si, s ->
                    val v = s.values.getOrNull(i) ?: return@forEachIndexed
                    val x = groupX + si * barW
                    val barH = (v / max * h).toInt()
                    g2.color = color(si)
                    g2.fillRoundRect(x, top + h - barH, barW - if (k > 1) JBUI.scale(1) else 0, barH, JBUI.scale(4), JBUI.scale(4))
                    if (labelValues) {
                        g2.color = ToneColors.foreground()
                        val t = formatTick(v)
                        g2.drawString(t, x + barW / 2 - fm.stringWidth(t) / 2, top + h - barH - JBUI.scale(3))
                    }
                }
            }
        }
        g2.color = ToneColors.secondaryText()
        for (i in 0 until n) {
            val label = model.labels.getOrNull(i) ?: continue
            val x = pad + (slot * i + slot / 2).toInt() - fm.stringWidth(label) / 2
            g2.drawString(label, x, height - pad)
        }
    }

    /** Pie / doughnut / polar area: the slices, and a legend of label + value + share beside them. */
    private fun paintCircular(g2: Graphics2D) {
        val values = model.values.map { it.coerceAtLeast(0.0) }
        val total = values.sum().takeIf { it > 0 } ?: return
        val pad = JBUI.scale(8)
        val fm = g2.fontMetrics
        val legend = model.labels.mapIndexed { i, l -> "$l  ${formatTick(values.getOrElse(i) { 0.0 })}" }
        val legendW = (legend.maxOfOrNull { fm.stringWidth(it) } ?: 0) + JBUI.scale(18)
        val d = minOf(height - pad * 2, width - pad * 3 - legendW).coerceAtLeast(JBUI.scale(40))
        val cx = pad
        val cy = (height - d) / 2
        val max = values.maxOrNull()?.takeIf { it > 0 } ?: 1.0
        var start = 90.0
        values.forEachIndexed { i, v ->
            g2.color = color(i)
            if (model.kind == ChartKind.POLAR_AREA) {
                val sweep = 360.0 / values.size
                val r = d / 2.0 * Math.sqrt(v / max)
                g2.fill(Arc2D.Double(cx + d / 2.0 - r, cy + d / 2.0 - r, r * 2, r * 2, start, -sweep, Arc2D.PIE))
                start -= sweep
            } else {
                val sweep = v / total * 360.0
                g2.fill(Arc2D.Double(cx.toDouble(), cy.toDouble(), d.toDouble(), d.toDouble(), start, -sweep, Arc2D.PIE))
                start -= sweep
            }
        }
        if (model.kind == ChartKind.DOUGHNUT) {
            // the hole is the background — the ring, not a pie
            g2.color = background ?: parent?.background ?: JBColor.background()
            val hole = d * 0.55
            g2.fill(java.awt.geom.Ellipse2D.Double(cx + (d - hole) / 2, cy + (d - hole) / 2, hole, hole))
        }
        val lx = cx + d + pad * 2
        var ly = (height - legend.size * (fm.height + JBUI.scale(4))) / 2
        val sw = JBUI.scale(10)
        legend.forEachIndexed { i, text ->
            g2.color = color(i)
            g2.fillRect(lx, ly + (fm.height - sw) / 2, sw, sw)
            g2.color = ToneColors.foreground()
            g2.drawString(text, lx + sw + JBUI.scale(6), ly + fm.ascent)
            ly += fm.height + JBUI.scale(4)
        }
    }

    /** Radar: one spoke per label, rings for the scale, each dataset a translucent polygon. */
    private fun paintRadar(g2: Graphics2D) {
        val n = model.labels.size.coerceAtLeast(model.series.maxOf { it.values.size })
        if (n < 3) return paintCartesian(g2)
        val pad = JBUI.scale(8)
        val fm = g2.fontMetrics
        val legendH = paintSeriesLegend(g2, pad)
        val labelW = (model.labels.maxOfOrNull { fm.stringWidth(it) } ?: 0) + JBUI.scale(6)
        val r = (minOf(width - labelW * 2, height - legendH - fm.height * 2 - pad * 2) / 2.0).coerceAtLeast(JBUI.scale(20).toDouble())
        val cx = width / 2.0
        val cy = legendH + pad + fm.height + r
        val max = model.series.flatMap { it.values }.maxOrNull()?.takeIf { it > 0 } ?: 1.0
        fun point(i: Int, frac: Double): Pair<Double, Double> {
            val a = -Math.PI / 2 + 2 * Math.PI * i / n
            return (cx + Math.cos(a) * r * frac) to (cy + Math.sin(a) * r * frac)
        }
        g2.color = JBColor.border()
        for (ring in 1..4) {
            val p = Path2D.Double()
            for (i in 0 until n) point(i, ring / 4.0).let { (x, y) -> if (i == 0) p.moveTo(x, y) else p.lineTo(x, y) }
            p.closePath()
            g2.draw(p)
        }
        for (i in 0 until n) point(i, 1.0).let { (x, y) -> g2.drawLine(cx.toInt(), cy.toInt(), x.toInt(), y.toInt()) }
        model.series.forEachIndexed { si, s ->
            val p = Path2D.Double()
            for (i in 0 until n) point(i, (s.values.getOrElse(i) { 0.0 } / max).coerceIn(0.0, 1.0))
                .let { (x, y) -> if (i == 0) p.moveTo(x, y) else p.lineTo(x, y) }
            p.closePath()
            val c = color(si)
            g2.color = Color(c.red, c.green, c.blue, 60)
            g2.fill(p)
            g2.color = c
            g2.stroke = BasicStroke(JBUI.scale(2).toFloat())
            g2.draw(p)
        }
        g2.color = ToneColors.secondaryText()
        for (i in 0 until n) {
            val label = model.labels.getOrNull(i) ?: continue
            val (x, y) = point(i, 1.0)
            val tx = when {
                x < cx - 1 -> x - fm.stringWidth(label) - JBUI.scale(4)
                x > cx + 1 -> x + JBUI.scale(4)
                else -> x - fm.stringWidth(label) / 2
            }
            val ty = if (y < cy) y - JBUI.scale(4) else y + fm.ascent
            g2.drawString(label, tx.toInt(), ty.toInt())
        }
    }
}

/** A compact value label: 1200 → "1.2k", 3_400_000 → "3.4M", 87 → "87" (same rule as the RN renderer). */
internal fun formatTick(value: Double): String {
    if (!value.isFinite()) return ""
    val abs = Math.abs(value)
    fun trim(n: Double): String {
        val r = Math.round(n * 10) / 10.0
        return if (r == Math.floor(r)) r.toLong().toString() else r.toString()
    }
    return when {
        abs >= 1_000_000 -> "${trim(value / 1_000_000)}M"
        abs >= 1_000 -> "${trim(value / 1_000)}k"
        else -> trim(value)
    }
}

/** The chart's text alternative: "Bar chart. Jan: 120, Feb: 180" (capped at 12 points). */
internal fun chartTextAlternative(labels: List<String>, values: List<Double>, line: Boolean, maxPoints: Int = 12): String =
    chartTextAlternative(ChartModel(if (line) ChartKind.LINE else ChartKind.BAR, labels, listOf(ChartSeries("", values))), maxPoints)

/**
 * The chart's text alternative, named by its KIND (a doughnut said "Bar chart"): one dataset reads
 * "Doughnut chart. Paintings: 412, …"; several read each dataset by name, "Visitors — Mon: 1.2k…".
 */
internal fun chartTextAlternative(model: ChartModel, maxPoints: Int = 12): String {
    if (model.series.all { it.values.isEmpty() }) return "Chart, no data"
    fun points(values: List<Double>): String {
        val pairs = values.take(maxPoints).mapIndexed { i, v -> "${model.labels.getOrElse(i) { (i + 1).toString() }}: ${formatTick(v)}" }
        val more = if (values.size > maxPoints) ", and ${values.size - maxPoints} more" else ""
        return pairs.joinToString(", ") + more
    }
    val body = if (model.series.size == 1) points(model.values)
    else model.series.mapIndexed { i, s -> "${s.label.ifBlank { "Series ${i + 1}" }} — ${points(s.values)}" }.joinToString("; ")
    return "${model.kind.title}. $body"
}
