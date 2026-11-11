package io.mateu.ijp.ui

import java.awt.image.BufferedImage

/**
 * SVG images on the desktop: ImageIO decodes no SVG, so an `Image` whose src is an `.svg` (the
 * Explorer's media, most icon sets) showed a "🖼 alt" placeholder. An SVG is recognised here and
 * rasterised with the bundled JSVG (see [read]).
 */
object SvgImages {
    /** Whether [src] names an SVG: a `.svg` path/url (query ignored) or an `image/svg+xml` data URI. */
    fun isSvg(src: String): Boolean {
        val s = src.trim().lowercase()
        return s.startsWith("data:image/svg+xml") || s.substringBefore('?').substringBefore('#').endsWith(".svg")
    }

    /** The size an SVG with no width/height of its own (only a viewBox, or nothing) is drawn at. */
    private const val FALLBACK_SIZE = 150

    /**
     * The SVG [bytes] rasterised (JSVG, MIT, bundled in the plugin — the platform's own SVG code is
     * internal API the plugin verifier refuses): at the document's own size, scaled down to fit
     * [maxWidth]; null when it is not an SVG it can read. External resources are never fetched
     * (JSVG's default resource policy), so an SVG cannot make the desktop call anywhere.
     */
    fun read(bytes: ByteArray, maxWidth: Int = 1200): BufferedImage? = runCatching {
        val doc = com.github.weisj.jsvg.parser.SVGLoader()
            .load(bytes.inputStream(), null, com.github.weisj.jsvg.parser.LoaderContext.createDefault())
            ?: return null
        val size = doc.size()
        var w = size.width.toDouble().takeIf { it.isFinite() && it >= 1 } ?: FALLBACK_SIZE.toDouble()
        var h = size.height.toDouble().takeIf { it.isFinite() && it >= 1 } ?: FALLBACK_SIZE.toDouble()
        val scale = if (w > maxWidth) maxWidth / w else 1.0
        w *= scale
        h *= scale
        val img = BufferedImage(w.toInt().coerceAtLeast(1), h.toInt().coerceAtLeast(1), BufferedImage.TYPE_INT_ARGB)
        val g = img.createGraphics()
        try {
            g.setRenderingHint(java.awt.RenderingHints.KEY_ANTIALIASING, java.awt.RenderingHints.VALUE_ANTIALIAS_ON)
            g.setRenderingHint(java.awt.RenderingHints.KEY_STROKE_CONTROL, java.awt.RenderingHints.VALUE_STROKE_PURE)
            g.scale(scale, scale)
            doc.render(null as javax.swing.JComponent?, g)
        } finally {
            g.dispose()
        }
        img
    }.getOrNull()

    /**
     * Any image [src] — a data URI or an http(s) url, SVG or raster — read as an image (blocking: call
     * it off the EDT for a url); null when it cannot be read.
     */
    fun load(src: String): BufferedImage? {
        val s = src.trim()
        if (s.isEmpty()) return null
        val svg = isSvg(s)
        val bytes = runCatching {
            if (s.startsWith("data:")) {
                if (svg) dataUriBytes(s) else java.util.Base64.getDecoder().decode(s.substringAfter("base64,", ""))
            } else java.net.URI.create(s).toURL().openStream().use { it.readBytes() }
        }.getOrNull() ?: return null
        return decodeImage(bytes, svg || looksLikeSvg(bytes))
    }

    /** An SVG served without telling (no .svg in the url): its text starts like XML/SVG. */
    internal fun looksLikeSvg(bytes: ByteArray): Boolean {
        val head = String(bytes, 0, minOf(bytes.size, 512), Charsets.UTF_8).trimStart('﻿', ' ', '\n', '\r', '\t')
        return head.startsWith("<svg") || (head.startsWith("<?xml") && head.contains("<svg"))
    }

    /** A data URI's SVG bytes (base64 or percent-encoded), or null. */
    fun dataUriBytes(src: String): ByteArray? {
        val body = src.substringAfter(',', "")
        if (body.isEmpty()) return null
        return runCatching {
            if (src.substringBefore(',').contains(";base64")) java.util.Base64.getDecoder().decode(body)
            else java.net.URLDecoder.decode(body, Charsets.UTF_8).toByteArray()
        }.getOrNull()
    }
}

/** Any image bytes → an image: SVG through JSVG, the rest through ImageIO. */
internal fun decodeImage(bytes: ByteArray, svg: Boolean): BufferedImage? =
    if (svg) SvgImages.read(bytes) else runCatching { javax.imageio.ImageIO.read(bytes.inputStream()) }.getOrNull()
