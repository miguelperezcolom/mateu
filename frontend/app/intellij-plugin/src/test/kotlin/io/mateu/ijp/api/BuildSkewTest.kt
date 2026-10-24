package io.mateu.ijp.api

import com.sun.net.httpserver.HttpServer
import junit.framework.TestCase
import java.net.InetSocketAddress
import java.util.Collections
import java.util.Locale

/** The version-skew contract: the renderer header, the per-backend build baseline, the notices. */
class BuildSkewTest : TestCase() {

    fun testRendererHeader() {
        assertEquals("intellij/0.2.17 wire/3.0", BuildSkew.rendererHeaderValue("0.2.17", "3.0"))
        assertEquals("intellij/unknown wire/3.0", BuildSkew.rendererHeaderValue("", "3.0"))
        assertTrue(BuildSkew.rendererHeaderValue().matches(Regex("intellij/\\S+ wire/3\\.0")))
    }

    fun testBackendKey() {
        assertEquals("https://a.com/app", BuildSkew.backendKeyOf("https://a.com/app/mateu/v3/sync/orders"))
        assertEquals("http://x", BuildSkew.backendKeyOf("http://x/mateu/v3/sse/_no_route"))
    }

    fun testFirstBuildIsTheBaselineAndAChangeIsToldOnce() {
        val skew = BuildSkew()
        assertEquals(BuildSkew.Notice.NONE, skew.observe("k", "b1", ok = true))
        assertEquals(BuildSkew.Notice.NONE, skew.observe("k", "b1", ok = true))
        assertEquals(BuildSkew.Notice.UPDATED, skew.observe("k", "b2", ok = true))
        assertEquals(BuildSkew.Notice.NONE, skew.observe("k", "b2", ok = true))
        assertEquals(BuildSkew.Notice.NONE, skew.observe("k", "b3", ok = true))
        assertEquals(BuildSkew.Notice.NONE, skew.observe("other", "z", ok = true))
    }

    fun testNoHeaderOrANonMateuFailureChangesNothing() {
        val skew = BuildSkew()
        assertEquals(BuildSkew.Notice.NONE, skew.observe("k", null, ok = true))
        assertEquals(BuildSkew.Notice.NONE, skew.observe("k", "b1", ok = true))
        assertEquals(BuildSkew.Notice.NONE, skew.observe("k", " ", ok = true))
        assertEquals(BuildSkew.Notice.NONE, skew.observe("k", "b2", ok = false))
        assertEquals(BuildSkew.Notice.UPDATED, skew.observe("k", "b2", ok = true))
    }

    fun testAMateu403FromAnotherBuildIsStaleAndSuppressesTheUpdatedNotice() {
        val skew = BuildSkew()
        skew.observe("k", "b1", ok = true)
        assertEquals(BuildSkew.Notice.STALE, skew.observe("k", "b2", ok = false, mateuForbidden = true))
        assertEquals(BuildSkew.Notice.NONE, skew.observe("k", "b2", ok = true))
        // same build, or no baseline yet: a real refusal
        val fresh = BuildSkew()
        assertEquals(BuildSkew.Notice.NONE, fresh.observe("k", "b1", ok = false, mateuForbidden = true))
        assertEquals(BuildSkew.Notice.NONE, fresh.observe("k", "b1", ok = false, mateuForbidden = true))
    }

    fun testMateuForbidden() {
        assertTrue(BuildSkew.isMateuForbidden(403, "Forbidden"))
        assertTrue(BuildSkew.isMateuForbidden(403, "{\"messages\":[{\"text\":\"Forbidden\"}]}"))
        assertFalse(BuildSkew.isMateuForbidden(403, "<html>proxy</html>"))
        assertFalse(BuildSkew.isMateuForbidden(403, "{\"messages\":[]}"))
        assertFalse(BuildSkew.isMateuForbidden(500, "Forbidden"))
    }

    fun testTexts() {
        assertEquals("This app has been updated. Reload to use the latest version.", BuildSkew.texts(Locale.ENGLISH).updated)
        assertEquals("Esta pantalla ha cambiado desde que la abriste. Recarga para continuar.", BuildSkew.texts(Locale.forLanguageTag("es-ES")).stale)
        assertEquals("Recargar", BuildSkew.texts(Locale.forLanguageTag("es")).reload)
        assertEquals("Reload", BuildSkew.texts(null).reload)
    }

    fun testTheClientSendsTheHeaderAndReportsRedeployAndStaleScreens() {
        val answers = ArrayDeque(listOf(200 to "b1", 200 to "b2", 200 to "b2", 403 to "b3"))
        val renderers = Collections.synchronizedList(ArrayList<String?>())
        val server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/") { ex ->
            renderers.add(ex.requestHeaders.getFirst(BuildSkew.RENDERER_HEADER))
            val (status, build) = answers.removeFirst()
            val body = (if (status == 403) "Forbidden" else "{}").toByteArray()
            ex.responseHeaders.add(BuildSkew.BUILD_HEADER, build)
            ex.sendResponseHeaders(status, body.size.toLong())
            ex.responseBody.use { it.write(body) }
        }
        server.start()
        try {
            val client = MateuApiClient("http://127.0.0.1:${server.address.port}", "s1", skew = BuildSkew())
            val notices = ArrayList<BuildSkew.Notice>()
            client.onBuildNotice = { notices += it }
            repeat(3) { client.initialLoad("/", emptyMap()) }
            try {
                client.initialLoad("/", emptyMap())
                fail("a stale 403 must throw")
            } catch (expected: StaleScreenException) {
            }
            assertEquals(listOf(BuildSkew.Notice.UPDATED, BuildSkew.Notice.STALE), notices)
            assertTrue(renderers.all { it != null && it.matches(Regex("intellij/\\S+ wire/3\\.0")) })
        } finally {
            server.stop(0)
        }
    }

    fun testExternalRestFetchesNeverCarryTheRendererHeader() {
        val seen = Collections.synchronizedList(ArrayList<String?>())
        val server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/") { ex ->
            seen.add(ex.requestHeaders.getFirst(BuildSkew.RENDERER_HEADER))
            val body = "{}".toByteArray()
            ex.sendResponseHeaders(200, body.size.toLong())
            ex.responseBody.use { it.write(body) }
        }
        server.start()
        try {
            MateuApiClient("http://127.0.0.1:${server.address.port}", "s1")
                .fetchExternal("http://127.0.0.1:${server.address.port}/api/countries", "GET", emptyMap(), null)
            assertEquals(listOf<String?>(null), seen)
        } finally {
            server.stop(0)
        }
    }
}
