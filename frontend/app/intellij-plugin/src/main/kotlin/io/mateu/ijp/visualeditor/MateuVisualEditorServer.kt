package io.mateu.ijp.visualeditor

import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpServer
import java.io.IOException
import java.net.InetSocketAddress
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.util.concurrent.Executors

/**
 * A tiny loopback HTTP server that lets the JCEF-hosted visual editor run exactly as it does in a
 * browser: it (a) serves the built web bundle from the plugin classpath (under "visual-editor") and
 * (b) proxies the "mateu" and "sse" paths to the real Mateu backend. Because the bundle and the sync
 * endpoint are then same-origin, the web app needs `baseUrl=""` and there is no CORS to configure —
 * the same design the Vite dev server uses. It also injects a small bootstrap into `index.html` so
 * the web app detects the IDE host (see [MateuVisualEditor]).
 *
 * One server per backend URL, started lazily and shared by every open editor tab.
 */
object MateuVisualEditorServer {
    private var server: HttpServer? = null
    private var startedFor: String? = null
    private var port: Int = -1
    private val http: HttpClient = HttpClient.newBuilder().build()

    @Synchronized
    fun ensureStarted(backendBaseUrl: String): Int {
        if (server != null && startedFor == backendBaseUrl) return port
        server?.stop(0)
        val s = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        s.createContext("/mateu") { proxy(it, backendBaseUrl) }
        s.createContext("/sse") { proxy(it, backendBaseUrl) }
        s.createContext("/") { serveStatic(it) }
        s.executor = Executors.newCachedThreadPool()
        s.start()
        server = s
        startedFor = backendBaseUrl
        port = s.address.port
        return port
    }

    private fun serveStatic(ex: HttpExchange) = ex.use {
        val path = ex.requestURI.path.let { if (it == "/" || it.isBlank()) "/index.html" else it }
        val resource = "/visual-editor$path"
        val bytes = javaClass.getResourceAsStream(resource)?.readBytes()
        if (bytes == null) {
            ex.sendResponseHeaders(404, -1)
            return@use
        }
        val body = if (path == "/index.html") injectHostBootstrap(bytes) else bytes
        ex.responseHeaders.add("Content-Type", contentType(path))
        ex.sendResponseHeaders(200, body.size.toLong())
        ex.responseBody.write(body)
    }

    /**
     * Insert the IDE-host bootstrap BEFORE the app's module script, so the web app picks the IDE
     * host (not the browser localStorage fallback) on its very first render. Messages the app posts
     * before the JCEF query pipe is wired are queued in `__mateuOutbox` and drained on load end.
     */
    private fun injectHostBootstrap(indexHtml: ByteArray): ByteArray {
        val bootstrap = """
            <script>
              window.__mateuBaseUrl = '';
              window.__mateuOutbox = [];
              window.__mateuHost = { postMessage: function (m) { window.__mateuOutbox.push(m); }, addEventListener: function () {} };
            </script>
        """.trimIndent()
        val html = String(indexHtml, Charsets.UTF_8)
        val marker = "<script type=\"module\""
        val patched = if (html.contains(marker)) html.replaceFirst(marker, "$bootstrap\n    $marker") else bootstrap + html
        return patched.toByteArray(Charsets.UTF_8)
    }

    private fun proxy(ex: HttpExchange, backendBaseUrl: String) = ex.use {
        try {
            val target = backendBaseUrl.trimEnd('/') + ex.requestURI.rawPath +
                (ex.requestURI.rawQuery?.let { "?$it" } ?: "")
            val bodyBytes = ex.requestBody.readBytes()
            val builder = HttpRequest.newBuilder(URI.create(target))
            val publisher = if (bodyBytes.isEmpty()) HttpRequest.BodyPublishers.noBody()
                else HttpRequest.BodyPublishers.ofByteArray(bodyBytes)
            builder.method(ex.requestMethod, publisher)
            ex.requestHeaders["Content-Type"]?.firstOrNull()?.let { builder.header("Content-Type", it) }
            ex.requestHeaders["Accept"]?.firstOrNull()?.let { builder.header("Accept", it) }
            val resp = http.send(builder.build(), HttpResponse.BodyHandlers.ofByteArray())
            resp.headers().firstValue("content-type").ifPresent { ex.responseHeaders.add("Content-Type", it) }
            val out = resp.body()
            ex.sendResponseHeaders(resp.statusCode(), out.size.toLong())
            ex.responseBody.write(out)
        } catch (e: IOException) {
            val msg = "Mateu backend unreachable at $backendBaseUrl: ${e.message}".toByteArray()
            ex.sendResponseHeaders(502, msg.size.toLong())
            ex.responseBody.write(msg)
        }
    }

    private fun contentType(path: String): String = when {
        path.endsWith(".html") -> "text/html; charset=utf-8"
        path.endsWith(".js") -> "text/javascript; charset=utf-8"
        path.endsWith(".css") -> "text/css; charset=utf-8"
        path.endsWith(".json") -> "application/json"
        path.endsWith(".svg") -> "image/svg+xml"
        path.endsWith(".png") -> "image/png"
        path.endsWith(".woff2") -> "font/woff2"
        else -> "application/octet-stream"
    }
}
