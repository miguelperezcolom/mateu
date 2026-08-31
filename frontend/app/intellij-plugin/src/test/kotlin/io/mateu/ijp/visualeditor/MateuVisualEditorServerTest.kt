package io.mateu.ijp.visualeditor

import org.junit.Assert.assertEquals
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
    fun proxiesThePreviewActionToTheBackend() {
        val port = MateuVisualEditorServer.ensureStarted(backend)
        val reachable = runCatching { get("$backend/").statusCode() }.isSuccess
        assumeTrue("backend at $backend not reachable — skipping proxy check", reachable)
        val body = """{"route":"","consumedRoute":"","actionId":"__preview__","initiatorComponentId":"t",
            "componentState":{},"parameters":{"_yaml":"type: Text\ntext: Hi"}}"""
        val resp = http.send(
            HttpRequest.newBuilder(URI.create("http://127.0.0.1:$port/mateu/v3/sync/_no_route"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body)).build(),
            HttpResponse.BodyHandlers.ofString(),
        )
        assertEquals(200, resp.statusCode())
        assertTrue("fragments in proxied response", resp.body().contains("fragments"))
    }
}
