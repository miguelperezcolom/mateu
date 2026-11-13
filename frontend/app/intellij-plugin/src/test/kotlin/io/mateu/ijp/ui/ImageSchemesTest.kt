package io.mateu.ijp.ui

import com.sun.net.httpserver.HttpServer
import junit.framework.TestCase
import java.net.InetSocketAddress
import java.nio.file.Files

/**
 * GA-5.2: a UI the user has not trusted yet (the hub opens anybody's) can name an image anywhere —
 * a hero, a card menu entry. The desktop fetches images over http(s) only (never `file:`, which on
 * Windows opens an SMB session with the named host), with timeouts and a size cap.
 */
class ImageSchemesTest : TestCase() {

    private val png1x1 = java.util.Base64.getDecoder().decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    )

    fun testALocalFileIsNeverRead() {
        val file = Files.createTempFile("mateu-img", ".png")
        try {
            Files.write(file, png1x1)
            val url = file.toUri().toString() // file:/…
            assertNull("file: is never read", SvgImages.load(url))
            assertNull(readImageSource(url))
            assertNull(SvgImages.fetchBytes(url))
            assertNull(SvgImages.fetchBytes("ftp://attacker.example/x.png"))
            assertNull(SvgImages.fetchBytes("jar:file:/x.jar!/x.png"))
        } finally {
            Files.deleteIfExists(file)
        }
    }

    fun testHeroAndMenuCardsNeverNameAnotherScheme() {
        assertNull(MenuCards.resolveImageUri("file://attacker.example/share/x.png", "http://h"))
        assertNull(MenuCards.resolveImageUri("FILE:///etc/passwd", "http://h"))
        assertNull(MenuCards.resolveImageUri("ftp://x/y.png", "http://h"))
        assertNull(heroImageUrl("https://app.example", "file://attacker.example/share/x.png"))
        assertNull(heroImageUrl("https://app.example", "javascript:alert(1)"))
        assertEquals("https://app.example/img/h.png", heroImageUrl("https://app.example/crm", "/img/h.png"))
        assertEquals("data:image/png;base64,AAA", heroImageUrl("https://app.example", "data:image/png;base64,AAA"))
    }

    fun testAnHttpImageIsReadAndAnOversizedOneIsCut() {
        val big = ByteArray(64 * 1024) { 1 }
        val server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/ok.png") { ex ->
            ex.sendResponseHeaders(200, png1x1.size.toLong())
            ex.responseBody.use { it.write(png1x1) }
        }
        server.createContext("/endless.png") { ex ->
            // no Content-Length: chunked, more than the cap allows
            ex.sendResponseHeaders(200, 0)
            ex.responseBody.use { out -> repeat(4) { out.write(big) } }
        }
        server.start()
        try {
            val base = "http://127.0.0.1:${server.address.port}"
            assertEquals(1, SvgImages.load("$base/ok.png")!!.width)
            assertNull(SvgImages.fetchBytes("$base/endless.png", maxBytes = 100 * 1024))
            assertNotNull(SvgImages.fetchBytes("$base/endless.png", maxBytes = 1024 * 1024))
        } finally {
            server.stop(0)
        }
    }
}
