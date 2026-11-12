package io.mateu.ijp.ui

import java.awt.image.BufferedImage

/**
 * SVG images on the desktop: ImageIO decodes no SVG, so an `Image` whose src is an `.svg` (the
 * Explorer's media, most icon sets) showed a "🖼 alt" placeholder.
 *
 * The platform's SVG entry points (JSvgDocument, SVGLoader, `com.intellij.ui.svg.loadSvg`) are
 * INTERNAL API, which the plugin verifier refuses, and the JSVG it bundles is shrunk (no public
 * parser). The PUBLIC door is `com.intellij.util.ImageLoader.loadFromUrl(URL)`: it picks the SVG
 * decoder by the path's `.svg` extension. So the bytes are written once to a content-addressed
 * `<sha256>.svg` file under the system temp dir and loaded from its `file:` URL.
 */
object SvgImages {
    /** Whether [src] names an SVG: a `.svg` path/url (query ignored) or an `image/svg+xml` data URI. */
    fun isSvg(src: String): Boolean {
        val s = src.trim().lowercase()
        return s.startsWith("data:image/svg+xml") || s.substringBefore('?').substringBefore('#').endsWith(".svg")
    }

    /** Whether [bytes] look like an SVG document (an url without `.svg` serving one, an extension-less upload). */
    fun looksLikeSvg(bytes: ByteArray): Boolean {
        val head = String(bytes, 0, minOf(bytes.size, 1024), Charsets.UTF_8).trimStart('﻿', ' ', '\t', '\r', '\n')
        return (head.startsWith("<?xml") || head.startsWith("<svg") || head.startsWith("<!--") || head.startsWith("<!DOCTYPE svg")) &&
            head.contains("<svg")
    }

    /** The SVG [bytes] as an image at its declared size (capped at [maxWidth]), or null when undrawable. */
    fun read(bytes: ByteArray, maxWidth: Int = 1200): BufferedImage? = runCatching {
        val file = cachedFile(bytes)
        val image = com.intellij.util.ImageLoader.loadFromUrl(file.toURI().toURL()) ?: return null
        var w = image.getWidth(null).toDouble()
        var h = image.getHeight(null).toDouble()
        if (w < 1 || h < 1) return null
        if (w > maxWidth) { h *= maxWidth / w; w = maxWidth.toDouble() }
        val out = BufferedImage(w.toInt().coerceAtLeast(1), h.toInt().coerceAtLeast(1), BufferedImage.TYPE_INT_ARGB)
        val g = out.createGraphics()
        g.setRenderingHint(java.awt.RenderingHints.KEY_INTERPOLATION, java.awt.RenderingHints.VALUE_INTERPOLATION_BILINEAR)
        g.drawImage(image, 0, 0, out.width, out.height, null)
        g.dispose()
        out
    }.getOrNull()

    /** The file holding [bytes], named by their digest so a repeated image reuses it (and the loader's cache). */
    private fun cachedFile(bytes: ByteArray): java.io.File {
        val digest = java.security.MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it) }
        val dir = java.io.File(System.getProperty("java.io.tmpdir"), "mateu-svg").apply { mkdirs() }
        val file = java.io.File(dir, "$digest.svg")
        if (!file.isFile || file.length() != bytes.size.toLong()) {
            // write-then-rename so a concurrent reader never sees a half-written document
            val tmp = java.io.File.createTempFile(digest, ".part", dir)
            tmp.writeBytes(bytes)
            if (!tmp.renameTo(file)) { file.writeBytes(bytes); tmp.delete() }
        }
        return file
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

/** Any image bytes → an image: SVG (declared or sniffed) through the platform's loader, the rest through ImageIO. */
internal fun decodeImage(bytes: ByteArray, svg: Boolean = false): BufferedImage? =
    if (svg || SvgImages.looksLikeSvg(bytes)) SvgImages.read(bytes)
    else runCatching { javax.imageio.ImageIO.read(bytes.inputStream()) }.getOrNull()

/**
 * The image a `src` names — a data URI (base64 or, for SVG, percent-encoded) or an http(s)/file url —
 * decoded like [decodeImage]. Blocking: call it off the EDT for a remote url.
 */
internal fun readImageSource(src: String): BufferedImage? = runCatching {
    val s = src.trim()
    val svg = SvgImages.isSvg(s)
    val bytes = if (s.startsWith("data:")) {
        if (svg || !s.substringBefore(',').contains(";base64")) SvgImages.dataUriBytes(s)
        else java.util.Base64.getDecoder().decode(s.substringAfter("base64,", ""))
    } else {
        val conn = java.net.URI.create(s).toURL().openConnection()
        conn.connectTimeout = 10_000
        conn.readTimeout = 30_000
        conn.getInputStream().use { it.readBytes() }
    }
    bytes?.takeIf { it.isNotEmpty() }?.let { decodeImage(it, svg) }
}.getOrNull()
