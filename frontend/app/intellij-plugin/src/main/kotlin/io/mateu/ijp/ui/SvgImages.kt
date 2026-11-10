package io.mateu.ijp.ui

import java.awt.image.BufferedImage

/**
 * SVG images on the desktop: ImageIO decodes no SVG, so an `Image` whose src is an `.svg` (the
 * Explorer's media, most icon sets) showed a "🖼 alt" placeholder. No public platform API rasterises
 * one (see [read]), so an SVG is recognised here and shown as its named placeholder.
 */
object SvgImages {
    /** Whether [src] names an SVG: a `.svg` path/url (query ignored) or an `image/svg+xml` data URI. */
    fun isSvg(src: String): Boolean {
        val s = src.trim().lowercase()
        return s.startsWith("data:image/svg+xml") || s.substringBefore('?').substringBefore('#').endsWith(".svg")
    }

    /**
     * The SVG [bytes] as an image — always null today: the platform's SVG rasteriser (JSvgDocument,
     * SVGLoader) is INTERNAL API, which the plugin verifier refuses, and its bundled JSVG ships
     * without its parser. An SVG therefore shows the named placeholder (known-issues, desktop).
     */
    @Suppress("UNUSED_PARAMETER")
    fun read(bytes: ByteArray, maxWidth: Int = 1200): BufferedImage? = null

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
