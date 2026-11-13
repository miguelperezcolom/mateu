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
 * The Redwood canvas is served the same way: the bundle carries the Redwood/VB app of
 * io.mateu:mateu-redwood under `redwood/` (the editor's build copies it there) and its page
 * `redwood-preview.html` frames it, so a YAML-only project previews in Redwood with NO backend. A
 * bundle built without it falls back to the backend's own Redwood app (`/redwood/x` → `<backend>/x`,
 * what a backend that depends on io.mateu:mateu-redwood serves at its root). JET and the VB runtime always
 * load from Oracle's CDN.
 *
 * One server per backend URL, started lazily and shared by every open editor tab. It speaks with the
 * signed-in developer's credentials, so loopback is not enough: a request must name this server as its
 * `Host` (no DNS rebinding) and, to reach the backend or the project's files, carry the cookie that
 * only the editor's own browser gets ([editorUrl] is the one place the per-run secret is handed out).
 */
object MateuVisualEditorServer {
    private var server: HttpServer? = null
    private var startedFor: String? = null
    private var port: Int = -1

    /** Credentials the proxy adds to every backend call (the web app never sees the token). */
    @Volatile private var tokens: io.mateu.ijp.api.TokenProvider = io.mateu.ijp.api.TokenProvider.NONE
    private val http: HttpClient = HttpClient.newBuilder().build()

    /** Random per IDE run; survives a restart for another backend, so open tabs keep working. */
    private val secret: String = ByteArray(32).also { java.security.SecureRandom().nextBytes(it) }
        .joinToString("") { "%02x".format(it) }

    /** The query parameter (of the editor's own URL only) and the cookie that carry [secret]. */
    private const val KEY_NAME = "mateu-editor-key"

    /** The standalone editor's CSP `<meta>` in the bundle's index.html (see apps/visual-editor/index.html). */
    private val STANDALONE_CSP = Regex("<meta[^>]*data-mateu-standalone-csp[^>]*>")

    /** What JCEF loads: the only way to get the cookie, handed straight to the browser by the IDE. */
    fun editorUrl(port: Int): String = "http://127.0.0.1:$port/index.html?$KEY_NAME=$secret"

    @Synchronized
    fun ensureStarted(
        backendBaseUrl: String,
        tokens: io.mateu.ijp.api.TokenProvider = io.mateu.ijp.api.TokenProvider.NONE,
    ): Int {
        this.tokens = tokens
        if (server != null && startedFor == backendBaseUrl) return port
        server?.stop(0)
        val s = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        port = s.address.port
        s.createContext("/mateu", hostChecked { proxy(it, backendBaseUrl) })
        s.createContext("/sse", hostChecked { proxy(it, backendBaseUrl) })
        s.createContext(IMAGES_PREFIX, hostChecked { serveImage(it) })
        s.createContext("/", hostChecked { serveStatic(it, backendBaseUrl) })
        s.executor = Executors.newCachedThreadPool()
        s.start()
        server = s
        startedFor = backendBaseUrl
        return port
    }

    /** Whether a `Host` header names this server (anything else is a rebound DNS name). */
    internal fun isOwnHost(host: String?, port: Int): Boolean =
        host == "127.0.0.1:$port" || host == "localhost:$port"

    private fun hostChecked(handler: (HttpExchange) -> Unit) = com.sun.net.httpserver.HttpHandler { ex ->
        if (isOwnHost(ex.requestHeaders.getFirst("Host"), port)) {
            handler(ex)
        } else {
            ex.use { it.sendResponseHeaders(403, -1) }
        }
    }

    private fun matchesSecret(value: String?): Boolean =
        value != null && java.security.MessageDigest.isEqual(value.toByteArray(), secret.toByteArray())

    /** The secret of a `name=value; …` query string or Cookie header, or null. */
    private fun keyIn(pairs: String?, separator: String): String? = pairs?.split(separator)
        ?.map { it.trim() }?.firstOrNull { it.startsWith("$KEY_NAME=") }?.substringAfter('=')

    private fun fromTheEditor(ex: HttpExchange): Boolean =
        ex.requestHeaders["Cookie"].orEmpty().any { matchesSecret(keyIn(it, ";")) }

    /** Where the project images are served: `/__mateu-images/<token>/<module-relative path>`. */
    const val IMAGES_PREFIX = "/__mateu-images/"

    /** The module roots whose images this server answers for, by token. */
    private val imageRoots = java.util.concurrent.ConcurrentHashMap<String, java.nio.file.Path>()

    /**
     * Let the editor show a module's images (thumbnails in the picker, the real image on the canvas
     * and in Play — same origin as the editor, so JCEF and the framed Redwood canvas both load them).
     * The token is stable per root, so every editor of a module shares it.
     */
    fun registerImageRoot(root: java.nio.file.Path): String {
        val normalized = root.toAbsolutePath().normalize()
        val token = Integer.toHexString(normalized.toString().hashCode()).padStart(8, '0')
        imageRoots[token] = normalized
        return token
    }

    /** The URL path (same origin as the editor) a registered root's file is served at. */
    fun imageUrl(token: String, relativePath: String): String =
        IMAGES_PREFIX + token + "/" + relativePath.split('/').joinToString("/") { java.net.URLEncoder.encode(it, Charsets.UTF_8).replace("+", "%20") }

    /** The file a request names, or null: unknown token, a path escaping the root, not an image. */
    internal fun imageFileOf(rawPath: String): java.nio.file.Path? {
        if (!rawPath.startsWith(IMAGES_PREFIX)) return null
        val rest = rawPath.removePrefix(IMAGES_PREFIX)
        val token = rest.substringBefore('/')
        val root = imageRoots[token] ?: return null
        val rel = runCatching { java.net.URLDecoder.decode(rest.substringAfter('/', ""), Charsets.UTF_8) }.getOrNull() ?: return null
        if (rel.isBlank() || rel.split('/').any { it == ".." } || !ProjectImages.isImage(rel)) return null
        val file = root.resolve(rel).normalize()
        return if (file.startsWith(root) && java.nio.file.Files.isRegularFile(file)) file else null
    }

    private fun serveImage(ex: HttpExchange) = ex.use {
        val file = if (fromTheEditor(ex)) imageFileOf(ex.requestURI.rawPath) else null
        if (file == null) {
            ex.sendResponseHeaders(404, -1)
            return@use
        }
        val bytes = java.nio.file.Files.readAllBytes(file)
        ex.responseHeaders.add("Content-Type", contentType(file.fileName.toString()))
        ex.responseHeaders.add("Cache-Control", "no-cache")
        ex.sendResponseHeaders(200, bytes.size.toLong())
        ex.responseBody.write(bytes)
    }

    private fun serveStatic(ex: HttpExchange, backendBaseUrl: String) = ex.use {
        val path = ex.requestURI.path.let { if (it == "/" || it.isBlank()) "/index.html" else it }
        if (path.split('/').contains("..")) {
            ex.sendResponseHeaders(404, -1)
            return@use
        }
        val resource = "/visual-editor$path"
        val bytes = javaClass.getResourceAsStream(resource)?.readBytes()
        if (bytes == null) {
            // the Redwood canvas, when this bundle does not carry the Redwood app: the backend's own
            val redwood = redwoodFallbackPath(path)
            if (redwood != null) proxy(ex, backendBaseUrl, redwood) else ex.sendResponseHeaders(404, -1)
            return@use
        }
        val body = if (path == "/index.html") injectHostBootstrap(bytes) else bytes
        if (path == "/index.html" && matchesSecret(keyIn(ex.requestURI.rawQuery, "&"))) {
            ex.responseHeaders.add("Set-Cookie", "$KEY_NAME=$secret; Path=/; HttpOnly; SameSite=Strict")
        }
        ex.responseHeaders.add("Content-Type", contentType(path))
        ex.sendResponseHeaders(200, body.size.toLong())
        ex.responseBody.write(body)
    }

    /**
     * Insert the IDE-host bootstrap BEFORE the app's module script, so the web app picks the IDE
     * host (not the browser localStorage fallback) on its very first render. Messages the app posts
     * before the JCEF query pipe is wired are queued in `__mateuOutbox` and drained on load end.
     */
    internal fun injectHostBootstrap(indexHtml: ByteArray): ByteArray {
        // The IDE's theme, so the editor (chrome + Lumo canvas) follows a dark IDE. Read per page load.
        val theme = try { if (com.intellij.ui.JBColor.isBright()) "light" else "dark" } catch (_: Throwable) { "light" }
        val bootstrap = """
            <script>
              window.__mateuTheme = '$theme';
              window.__mateuBaseUrl = '';
              window.__mateuOutbox = [];
              window.__mateuHost = { postMessage: function (m) { window.__mateuOutbox.push(m); }, addEventListener: function () {} };
            </script>
        """.trimIndent()
        // The bundle carries the standalone (browser-hosted) editor's CSP, which allows no inline
        // script — this bootstrap is one. JCEF keeps its previous, host-controlled page (no policy).
        val html = String(indexHtml, Charsets.UTF_8).replace(STANDALONE_CSP, "")
        val marker = "<script type=\"module\""
        val patched = if (html.contains(marker)) html.replaceFirst(marker, "$bootstrap\n    $marker") else bootstrap + html
        return patched.toByteArray(Charsets.UTF_8)
    }

    /** `/redwood/_redwood/app-flow.json` → `/_redwood/app-flow.json`; null for any other path. */
    internal fun redwoodFallbackPath(path: String): String? =
        if (path.startsWith("/redwood/") && path.length > "/redwood/".length) path.removePrefix("/redwood") else null

    private fun proxy(ex: HttpExchange, backendBaseUrl: String, rawPath: String = ex.requestURI.rawPath) = ex.use {
        if (!fromTheEditor(ex)) {
            ex.sendResponseHeaders(403, -1)
            return@use
        }
        try {
            val target = backendBaseUrl.trimEnd('/') + rawPath +
                (ex.requestURI.rawQuery?.let { "?$it" } ?: "")
            val bodyBytes = ex.requestBody.readBytes()
            val builder = HttpRequest.newBuilder(URI.create(target))
            val publisher = if (bodyBytes.isEmpty()) HttpRequest.BodyPublishers.noBody()
                else HttpRequest.BodyPublishers.ofByteArray(bodyBytes)
            builder.method(ex.requestMethod, publisher)
            ex.requestHeaders["Content-Type"]?.firstOrNull()?.let { builder.header("Content-Type", it) }
            ex.requestHeaders["Accept"]?.firstOrNull()?.let { builder.header("Accept", it) }
            io.mateu.ijp.api.bearer(tokens.accessToken())?.let { builder.header("Authorization", it) }
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

    private fun contentType(name: String): String = name.lowercase().let { path -> when {
        path.endsWith(".html") -> "text/html; charset=utf-8"
        path.endsWith(".js") -> "text/javascript; charset=utf-8"
        path.endsWith(".css") -> "text/css; charset=utf-8"
        path.endsWith(".json") -> "application/json"
        path.endsWith(".svg") -> "image/svg+xml"
        path.endsWith(".png") -> "image/png"
        path.endsWith(".jpg") || path.endsWith(".jpeg") -> "image/jpeg"
        path.endsWith(".gif") -> "image/gif"
        path.endsWith(".webp") -> "image/webp"
        path.endsWith(".avif") -> "image/avif"
        path.endsWith(".woff2") -> "font/woff2"
        else -> "application/octet-stream"
    } }
}
