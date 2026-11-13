package io.mateu.ijp.visualeditor

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

/**
 * Headless verification of the embedded editor server (no IDE platform): it serves the bundled web
 * app with the IDE-host bootstrap injected, serves the hashed JS asset, and proxies the sync
 * endpoint to a live backend (the proxy assertion is skipped when no backend is up).
 */
class MateuVisualEditorServerTest {

    private val backend = System.getProperty("mateu.baseUrl", "http://localhost:8594")
    private val http = HttpClient.newHttpClient()

    private fun get(url: String): HttpResponse<String> =
        http.send(HttpRequest.newBuilder(URI.create(url)).GET().build(), HttpResponse.BodyHandlers.ofString())

    @Test
    fun servesTheBundleWithHostBootstrapInjectedBeforeTheModuleScript() {
        val port = MateuVisualEditorServer.ensureStarted(backend)
        val index = get("http://127.0.0.1:$port/index.html")
        assertEquals(200, index.statusCode())
        val html = index.body()
        assertTrue("host bootstrap present", html.contains("window.__mateuHost"))
        assertTrue("module script present", html.contains("<script type=\"module\""))
        // The bootstrap must precede the module entry, or the app boots into the browser fallback.
        assertTrue("bootstrap before module", html.indexOf("window.__mateuHost") < html.indexOf("<script type=\"module\""))
    }

    @Test
    fun dropsTheStandaloneCspWhoseNoInlineScriptRuleWouldBlockTheBootstrap() {
        val bundle = """
            <html><head>
            <meta http-equiv="Content-Security-Policy" data-mateu-standalone-csp
                  content="script-src 'self'; object-src 'none'; base-uri 'self'" />
            <script type="module" src="./assets/index-abc.js"></script></head><body></body></html>
        """.trimIndent()
        val html = String(MateuVisualEditorServer.injectHostBootstrap(bundle.toByteArray()), Charsets.UTF_8)
        assertFalse("standalone CSP removed", html.contains("data-mateu-standalone-csp"))
        assertTrue("bootstrap before module", html.indexOf("window.__mateuHost") in 0 until html.indexOf("<script type=\"module\""))
    }

    @Test
    fun servesTheHashedJsEntryAsset() {
        val port = MateuVisualEditorServer.ensureStarted(backend)
        val html = get("http://127.0.0.1:$port/index.html").body()
        val asset = Regex("/assets/[^\"]+\\.js").find(html)?.value
        assertTrue("entry asset referenced", asset != null)
        val js = get("http://127.0.0.1:$port$asset")
        assertEquals(200, js.statusCode())
        assertTrue("js content-type", js.headers().firstValue("content-type").orElse("").contains("javascript"))
    }

    @Test
    fun theRedwoodCanvasFallsBackToTheBackendsOwnRedwoodApp() {
        // bundled: served from the plugin; not bundled: /redwood/x is the backend's /x
        assertEquals("/_index.html", MateuVisualEditorServer.redwoodFallbackPath("/redwood/_index.html"))
        assertEquals("/_redwood/app-flow.json", MateuVisualEditorServer.redwoodFallbackPath("/redwood/_redwood/app-flow.json"))
        assertEquals(null, MateuVisualEditorServer.redwoodFallbackPath("/redwood/"))
        assertEquals(null, MateuVisualEditorServer.redwoodFallbackPath("/assets/index.js"))
    }

    @Test
    fun servesTheRedwoodCanvasPageWhenTheBundleHasIt() {
        assumeTrue("bundle built before the Redwood canvas", javaClass.getResource("/visual-editor/redwood-preview.html") != null)
        val port = MateuVisualEditorServer.ensureStarted(backend)
        val page = get("http://127.0.0.1:$port/redwood-preview.html")
        assertEquals(200, page.statusCode())
        assertTrue(page.body().contains("<script type=\"module\""))
    }

    /** A backend that says which Authorization it was sent. */
    private fun fakeBackend(): com.sun.net.httpserver.HttpServer =
        com.sun.net.httpserver.HttpServer.create(java.net.InetSocketAddress("127.0.0.1", 0), 0).apply {
            createContext("/") { ex ->
                val body = (ex.requestHeaders.getFirst("Authorization") ?: "none").toByteArray()
                ex.sendResponseHeaders(200, body.size.toLong())
                ex.responseBody.use { it.write(body) }
            }
            start()
        }

    private fun cookieFrom(port: Int): String =
        get(MateuVisualEditorServer.editorUrl(port)).headers().firstValue("set-cookie").orElseThrow().substringBefore(';')

    private fun syncCall(port: Int, cookie: String?): HttpResponse<String> {
        val builder = HttpRequest.newBuilder(URI.create("http://127.0.0.1:$port/mateu/v3/sync/x"))
        cookie?.let { builder.header("Cookie", it) }
        return http.send(builder.POST(HttpRequest.BodyPublishers.ofString("{}")).build(), HttpResponse.BodyHandlers.ofString())
    }

    @Test
    fun onlyTheEditorsOwnBrowserGetsTheBackendWithTheDevelopersToken() {
        val backend = fakeBackend()
        try {
            val port = MateuVisualEditorServer.ensureStarted(
                "http://127.0.0.1:${backend.address.port}", io.mateu.ijp.api.TokenProvider.of("the-token"),
            )
            assertEquals(403, syncCall(port, null).statusCode())
            assertEquals(403, syncCall(port, "mateu-editor-key=guess").statusCode())

            val answered = syncCall(port, cookieFrom(port))
            assertEquals(200, answered.statusCode())
            assertEquals("Bearer the-token", answered.body())
        } finally {
            MateuVisualEditorServer.ensureStarted(this.backend)
            backend.stop(0)
        }
    }

    @Test
    fun thePlainPageHandsOutNoKey() {
        val port = MateuVisualEditorServer.ensureStarted(backend)
        assertTrue(get("http://127.0.0.1:$port/index.html").headers().firstValue("set-cookie").isEmpty)
        assertTrue(get("http://127.0.0.1:$port/index.html?mateu-editor-key=guess").headers().firstValue("set-cookie").isEmpty)
    }

    @Test
    fun aRequestNamingAnotherHostIsARebindingAttempt() {
        assertTrue(MateuVisualEditorServer.isOwnHost("127.0.0.1:4242", 4242))
        assertTrue(MateuVisualEditorServer.isOwnHost("localhost:4242", 4242))
        assertFalse(MateuVisualEditorServer.isOwnHost("evil.example:4242", 4242))
        assertFalse(MateuVisualEditorServer.isOwnHost("127.0.0.1:1", 4242))
        assertFalse(MateuVisualEditorServer.isOwnHost(null, 4242))
    }

    @Test
    fun proxiesThePreviewActionToTheBackend() {
        val port = MateuVisualEditorServer.ensureStarted(backend)
        val reachable = runCatching { get("$backend/").statusCode() }.isSuccess
        assumeTrue("backend at $backend not reachable — skipping proxy check", reachable)
        val body = """{"route":"","consumedRoute":"","actionId":"__preview__","initiatorComponentId":"t",
            "componentState":{},"parameters":{"_yaml":"type: Text\ntext: Hi"}}"""
        val resp = http.send(
            HttpRequest.newBuilder(URI.create("http://127.0.0.1:$port/mateu/v3/sync/_no_route"))
                .header("Content-Type", "application/json")
                .header("Cookie", cookieFrom(port))
                .POST(HttpRequest.BodyPublishers.ofString(body)).build(),
            HttpResponse.BodyHandlers.ofString(),
        )
        assertEquals(200, resp.statusCode())
        assertTrue("fragments in proxied response", resp.body().contains("fragments"))
    }
}
