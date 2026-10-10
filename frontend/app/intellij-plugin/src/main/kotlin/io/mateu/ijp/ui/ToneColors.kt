package io.mateu.ijp.ui

import com.intellij.ui.JBColor
import com.intellij.util.ui.UIUtil
import java.awt.Color

/**
 * Semantic tones (info / success / warning / danger / neutral) as IntelliJ theme colours.
 *
 * The renderer used to paint banners and header badges with fixed LIGHT pastels and, for the
 * badges, no foreground at all — so in Darcula / New UI Dark (where most developers live) the
 * label kept the theme's light-grey text on a light pastel: ~1.6:1, unreadable (IJ-01, WCAG 1.4.3),
 * and the light banners glared out of a dark IDE. The IntelliJ Platform UI Guidelines ask for the
 * theme's own keys: the `Banner.*Background` / `*BorderColor` keys of the current theme
 * (EditorNotificationPanel / InlineBanner use the same ones), with light/dark fallbacks for themes
 * that do not define them, and the theme's label foreground on top.
 */
internal object ToneColors {

    enum class Tone { INFO, SUCCESS, WARNING, DANGER, NEUTRAL }

    fun toneOf(name: String?): Tone = when (name.orEmpty().trim().uppercase()) {
        "SUCCESS", "OK", "DONE" -> Tone.SUCCESS
        "WARNING", "WARN", "PENDING" -> Tone.WARNING
        "DANGER", "ERROR", "KO" -> Tone.DANGER
        "INFO" -> Tone.INFO
        else -> Tone.NEUTRAL
    }

    /** Background of a banner / chip of this tone, from the current theme. */
    fun background(tone: Tone): Color = when (tone) {
        Tone.INFO -> JBColor.namedColor("Banner.infoBackground", JBColor(0xE8F0FE, 0x25324D))
        Tone.SUCCESS -> JBColor.namedColor("Banner.successBackground", JBColor(0xE6F4EA, 0x253627))
        Tone.WARNING -> JBColor.namedColor("Banner.warningBackground", JBColor(0xFDF6E3, 0x3D3223))
        Tone.DANGER -> JBColor.namedColor("Banner.errorBackground", JBColor(0xFBE9E7, 0x3E2626))
        Tone.NEUTRAL -> JBColor.namedColor("Tag.background", JBColor(0xE8EAED, 0x3C3F41))
    }

    /** Border of a banner of this tone, from the current theme. */
    fun border(tone: Tone): Color = when (tone) {
        Tone.INFO -> JBColor.namedColor("Banner.infoBorderColor", JBColor(0xBDD3F9, 0x35538F))
        Tone.SUCCESS -> JBColor.namedColor("Banner.successBorderColor", JBColor(0xC2E3CB, 0x375239))
        Tone.WARNING -> JBColor.namedColor("Banner.warningBorderColor", JBColor(0xF0D88A, 0x5E4D33))
        Tone.DANGER -> JBColor.namedColor("Banner.errorBorderColor", JBColor(0xF3C6C0, 0x5E3838))
        Tone.NEUTRAL -> JBColor.border()
    }

    /** Text on a tone background: the theme's own label colour (always readable on its banners). */
    fun foreground(): Color = UIUtil.getLabelForeground()

    /**
     * Secondary text (subtitles, captions, hints, timestamps). The renderer painted all of it with
     * the theme's DISABLED label colour, so live content read as greyed-out, unavailable controls
     * (IJ-12). The IntelliJ Platform UI Guidelines' colour for secondary/comment text is the
     * context-help foreground — the one the platform uses under its own form fields.
     */
    fun secondaryText(): Color = UIUtil.getContextHelpForeground()

    /**
     * A SOLID status chip (listing status cells): a saturated fill with the text colour that
     * reaches 4.5:1 on it. White on the former amber (#F0AB00, 2.0:1) and light blue (#2B9AF3,
     * 3.0:1) failed AA (IJ-02); the warning chip now uses dark text and the info chip a deeper blue.
     */
    fun solid(tone: Tone): Pair<Color, Color> = when (tone) {
        Tone.SUCCESS -> Color(0x2E, 0x7D, 0x32) to Color.WHITE // 5.1:1
        Tone.DANGER -> Color(0xC9, 0x19, 0x0B) to Color.WHITE // 5.8:1
        Tone.WARNING -> Color(0xF0, 0xAB, 0x00) to Color(0x1F, 0x1F, 0x1F) // 8.3:1
        Tone.INFO -> Color(0x1A, 0x63, 0xC0) to Color.WHITE // 5.9:1
        Tone.NEUTRAL -> Color(0x5F, 0x63, 0x68) to Color.WHITE // 6.1:1
    }

    /** WCAG 2.x contrast ratio of two colours. */
    fun contrast(a: Color, b: Color): Double {
        fun lin(c: Int): Double { val s = c / 255.0; return if (s <= 0.03928) s / 12.92 else Math.pow((s + 0.055) / 1.055, 2.4) }
        fun lum(c: Color) = 0.2126 * lin(c.red) + 0.7152 * lin(c.green) + 0.0722 * lin(c.blue)
        val (hi, lo) = listOf(lum(a), lum(b)).sortedDescending()
        return (hi + 0.05) / (lo + 0.05)
    }
}
