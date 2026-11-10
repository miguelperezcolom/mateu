package io.mateu.ijp.ui

import java.awt.Color
import java.awt.Insets

/**
 * The part of an `Element`'s inline `style` attribute Swing can draw on the component itself —
 * background (a gradient's first colour), text colour, padding, a one-sided or full solid border,
 * bold / italic. It used to be ignored: the gradient banner and the quote's left rule of the
 * Element example were plain text. Anything else (radius, shadows, layout) is left out.
 */
object ElementStyles {

    data class Style(
        val background: Color? = null,
        val foreground: Color? = null,
        val padding: Insets? = null,
        /** top, left, bottom, right widths of a solid border (0 = none) and its colour. */
        val border: Insets? = null,
        val borderColor: Color? = null,
        val bold: Boolean = false,
        val italic: Boolean = false,
    ) {
        val isEmpty get() = this == Style()
    }

    /** The declarations of a CSS inline style, by lower-cased property. */
    fun declarations(style: String?): Map<String, String> =
        style.orEmpty().split(';').mapNotNull { d ->
            val i = d.indexOf(':')
            if (i <= 0) null else d.substring(0, i).trim().lowercase() to d.substring(i + 1).trim()
        }.filter { it.second.isNotEmpty() }.toMap()

    fun parse(style: String?): Style {
        val d = declarations(style)
        val background = (d["background-color"] ?: d["background"])?.let(::firstColor)
        val foreground = d["color"]?.let(::color)
        val padding = d["padding"]?.let(::box)
        var border: Insets? = null
        var borderColor: Color? = null
        fun side(value: String): Pair<Int, Color?>? {
            val parts = value.split(Regex("\\s+"))
            if (parts.any { it.equals("none", true) }) return null
            val width = parts.firstNotNullOfOrNull { length(it) } ?: 1
            return width to firstColor(value)
        }
        d["border"]?.let { v -> side(v)?.let { (w, c) -> border = Insets(w, w, w, w); borderColor = c } }
        for ((name, set) in listOf<Pair<String, (Insets, Int) -> Insets>>(
            "border-top" to { b, w -> Insets(w, b.left, b.bottom, b.right) },
            "border-left" to { b, w -> Insets(b.top, w, b.bottom, b.right) },
            "border-bottom" to { b, w -> Insets(b.top, b.left, w, b.right) },
            "border-right" to { b, w -> Insets(b.top, b.left, b.bottom, w) },
        )) {
            d[name]?.let { v -> side(v)?.let { (w, c) -> border = set(border ?: Insets(0, 0, 0, 0), w); if (c != null) borderColor = c } }
        }
        val weight = d["font-weight"].orEmpty()
        return Style(
            background = background,
            foreground = foreground,
            padding = padding,
            border = border,
            borderColor = borderColor,
            bold = weight == "bold" || (weight.toIntOrNull() ?: 0) >= 600,
            italic = d["font-style"] == "italic",
        )
    }

    /** A CSS length in px (`1rem` = 16px, `.5rem`, `8px`, `0`); null for anything else. */
    fun length(value: String): Int? {
        val v = value.trim().lowercase()
        if (v == "0") return 0
        return when {
            v.endsWith("rem") -> v.removeSuffix("rem").toDoubleOrNull()?.times(16)?.toInt()
            v.endsWith("em") -> v.removeSuffix("em").toDoubleOrNull()?.times(16)?.toInt()
            v.endsWith("px") -> v.removeSuffix("px").toDoubleOrNull()?.toInt()
            else -> null
        }
    }

    /** `padding` / `margin` shorthand (1–4 values) in px, CSS order top right bottom left. */
    fun box(value: String): Insets? {
        val v = value.split(Regex("\\s+")).map { length(it) ?: return null }
        return when (v.size) {
            1 -> Insets(v[0], v[0], v[0], v[0])
            2 -> Insets(v[0], v[1], v[0], v[1])
            3 -> Insets(v[0], v[1], v[2], v[1])
            4 -> Insets(v[0], v[3], v[2], v[1])
            else -> null
        }
    }

    private val NAMED = mapOf(
        "white" to Color.WHITE, "black" to Color.BLACK, "red" to Color(0xFF0000), "green" to Color(0x008000),
        "blue" to Color(0x0000FF), "gray" to Color(0x808080), "grey" to Color(0x808080), "orange" to Color(0xFFA500),
        "yellow" to Color(0xFFFF00), "purple" to Color(0x800080), "transparent" to Color(0, 0, 0, 0),
    )

    /** One CSS colour: `#rgb`, `#rrggbb`, `rgb()/rgba()`, or a common name. */
    fun color(value: String): Color? {
        val v = value.trim().lowercase()
        NAMED[v]?.let { return it }
        Regex("^#([0-9a-f]{3}|[0-9a-f]{6})$").matchEntire(v)?.let { m ->
            val hex = m.groupValues[1].let { if (it.length == 3) it.map { c -> "$c$c" }.joinToString("") else it }
            return Color(hex.toInt(16))
        }
        Regex("^rgba?\\(([^)]*)\\)$").matchEntire(v)?.let { m ->
            val n = m.groupValues[1].split(',').map { it.trim() }
            if (n.size < 3) return null
            val (r, g, b) = n.take(3).map { it.toIntOrNull()?.coerceIn(0, 255) ?: return null }
            val a = n.getOrNull(3)?.toDoubleOrNull()?.coerceIn(0.0, 1.0) ?: 1.0
            return Color(r, g, b, (a * 255).toInt())
        }
        return null
    }

    /** The first colour named anywhere in a value (`linear-gradient(90deg, #1e3a8a, #7c3aed)`). */
    fun firstColor(value: String): Color? {
        val tokens = Regex("#[0-9a-fA-F]{3,6}\\b|rgba?\\([^)]*\\)|\\b[a-zA-Z]+\\b").findAll(value).map { it.value }
        return tokens.firstNotNullOfOrNull { color(it) }
    }

    /** Applies [style] to [c]: colours, padding and the solid border, scaled to the UI. */
    fun apply(c: javax.swing.JComponent, style: Style) {
        if (style.isEmpty) return
        style.background?.let { c.isOpaque = it.alpha > 0; c.background = it }
        style.foreground?.let { c.foreground = it }
        if (style.bold || style.italic) {
            c.font = c.font.deriveFont((if (style.bold) java.awt.Font.BOLD else 0) or (if (style.italic) java.awt.Font.ITALIC else 0))
        }
        fun s(px: Int): Int = com.intellij.util.ui.JBUI.scale(px)
        val pad = style.padding?.let { com.intellij.util.ui.JBUI.Borders.empty(s(it.top), s(it.left), s(it.bottom), s(it.right)) }
        val line = style.border?.let { b ->
            javax.swing.BorderFactory.createMatteBorder(s(b.top), s(b.left), s(b.bottom), s(b.right),
                style.borderColor ?: c.foreground ?: Color.GRAY)
        }
        c.border = when {
            line != null && pad != null -> javax.swing.BorderFactory.createCompoundBorder(line, pad)
            else -> line ?: pad ?: c.border
        }
    }
}
