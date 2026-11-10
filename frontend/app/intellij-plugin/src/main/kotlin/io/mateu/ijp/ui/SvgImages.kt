package io.mateu.ijp.ui

import java.awt.image.BufferedImage

/**
 * SVG images on the desktop: ImageIO decodes no SVG, so an `Image` whose src is an `.svg` (the
 * Explorer's media, most icon sets) showed a "🖼 alt" placeholder. The platform ships JSVG (it draws
 * the IDE's own icons); it rasterises the document at its declared size, capped at [maxWidth].
 */
object SvgImages {
    /** Whether [src] names an SVG: a `.svg` path/url (query ignored) or an `image/svg+xml` data URI. */
    fun isSvg(src: String): Boolean {
        val s = src.trim().lowercase()
        return s.startsWith("data:image/svg+xml") || s.substringBefore('?').substringBefore('#').endsWith(".svg")
    }

    /** The SVG [bytes] as an image at its declared size (capped at [maxWidth]), or null when undrawable. */
    fun read(bytes: ByteArray, maxWidth: Int = 1200): BufferedImage? = runCatching {
        // the platform's own SVG document (JSVG underneath) — the library itself ships shrunk
        val doc = com.intellij.ui.svg.JSvgDocument.create(bytes)
        var w = doc.width.toDouble().takeIf { it >= 1 } ?: 300.0
        var h = doc.height.toDouble().takeIf { it >= 1 } ?: 150.0
        if (w > maxWidth) { h *= maxWidth / w; w = maxWidth.toDouble() }
        doc.createImage(w.toInt().coerceAtLeast(1), h.toInt().coerceAtLeast(1))
    }.getOrNull()

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
