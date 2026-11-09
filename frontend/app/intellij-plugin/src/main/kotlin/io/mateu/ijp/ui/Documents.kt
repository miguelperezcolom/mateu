package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import java.awt.Desktop
import java.awt.Graphics
import java.awt.Graphics2D
import java.awt.print.PageFormat
import java.awt.print.Printable
import java.awt.print.PrinterJob
import java.io.File
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.nio.file.Files
import java.time.Duration
import java.util.Base64
import javax.swing.JComponent

/**
 * Documents on the IntelliJ renderer — what a `DownloadFile` command (an action returned a
 * `Document`, or a listing export) and a `Print` command do on the desktop.
 *
 *  - attachment → a Save dialog, the file written where the user chose;
 *  - inline → written to a temp file and opened with the OS default app (a PDF viewer), which is
 *    the desktop's "new tab" — only for the viewer types of [opensWithOs]; anything else (a `.bat`, a
 *    `.jar`, a name and a MIME type that disagree) takes the attachment path;
 *  - print → handed to the OS print service for its type when it has one, else opened (same rule);
 *  - `Print` (the current page) → the rendered panel through the system print dialog.
 *
 * The bytes come inline (base64) or from the single-use URL under the backend's base URL — fetched
 * with a plain GET: the token in the URL is the authorization.
 */
object Documents {

    /** What to do with a `DownloadFile` payload. */
    data class Plan(
        val filename: String,
        val mimeType: String,
        val base64: String?,
        val url: String?,
        val inline: Boolean,
        val print: Boolean,
    )

    /** A name safe as a file name: no path, no control or reserved characters. */
    fun safeFileName(name: String?): String {
        val cleaned = (name ?: "")
            .replace(Regex("[\\u0000-\\u001f\\u007f/\\\\:*?\"<>|]"), "_")
            .trimStart('.')
            .trim()
            .take(120)
        return cleaned.ifBlank { "document" }
    }

    /** The URL to fetch, or null: a path resolved against the backend origin; only http(s). */
    fun documentUrl(url: String?, baseUrl: String): String? {
        if (url.isNullOrBlank()) return null
        if (Regex("^https?://", RegexOption.IGNORE_CASE).containsMatchIn(url)) return url
        if (!url.startsWith("/") || url.startsWith("//")) return null
        val origin = Regex("^(https?://[^/]+)", RegexOption.IGNORE_CASE).find(baseUrl)?.groupValues?.get(1)
            ?: return null
        return origin + url
    }

    fun planOf(data: JsonNode?, baseUrl: String): Plan? {
        if (data == null || !data.isObject) return null
        val base64 = data.path("base64Content").asText("").ifBlank { null }
        val url = if (base64 == null) documentUrl(data.path("url").asText(""), baseUrl) else null
        if (base64 == null && url == null) return null
        val inline = data.path("disposition").asText("") == "inline"
        return Plan(
            filename = safeFileName(data.path("filename").asText("")),
            mimeType = data.path("mimeType").asText("").ifBlank { "application/octet-stream" },
            base64 = base64,
            url = url,
            inline = inline,
            print = inline && data.path("print").asBoolean(false),
        )
    }

    /** What the OS may be handed unasked: extension → the MIME types that extension is. */
    private val VIEWER_TYPES = mapOf(
        "pdf" to setOf("application/pdf"),
        "png" to setOf("image/png"),
        "jpg" to setOf("image/jpeg"),
        "jpeg" to setOf("image/jpeg"),
        "gif" to setOf("image/gif"),
        "txt" to setOf("text/plain"),
    )

    /**
     * Whether the OS may open [plan] with no question asked. The name and the MIME type come from the
     * server, and a UI added from a link is not trusted: `Desktop.open` on `report.bat` runs it, and a
     * file written here carries no Mark-of-the-Web. So only a closed list of viewer types, with the
     * name and the MIME type agreeing. A CSV is deliberately out: it opens in a spreadsheet, which
     * evaluates what is in it. Everything else goes to the Save dialog, where the user decides.
     */
    fun opensWithOs(plan: Plan): Boolean {
        if (!plan.inline) return false
        val allowed = VIEWER_TYPES[plan.filename.substringAfterLast('.', "").lowercase()] ?: return false
        return plan.mimeType.substringBefore(';').trim().lowercase() in allowed
    }

    /** The bytes of a plan (a GET for a parked document). */
    fun bytesOf(plan: Plan): ByteArray {
        plan.base64?.let { return Base64.getDecoder().decode(it) }
        val client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NORMAL).build()
        val response = client.send(
            HttpRequest.newBuilder(URI.create(plan.url!!)).timeout(Duration.ofSeconds(60)).GET().build(),
            HttpResponse.BodyHandlers.ofByteArray(),
        )
        if (response.statusCode() != 200) error("The document is no longer available (${response.statusCode()})")
        return response.body()
    }

    /** Writes the bytes to a temp file named like the document (so the viewer shows that name). */
    fun tempFileOf(plan: Plan, bytes: ByteArray): File {
        val dir = Files.createTempDirectory("mateu-doc").toFile()
        val file = File(dir, plan.filename)
        file.writeBytes(bytes)
        file.deleteOnExit()
        dir.deleteOnExit()
        return file
    }

    /** Opens (or prints) a document with the OS; false when the desktop cannot. */
    fun openWithOs(file: File, print: Boolean): Boolean {
        if (!Desktop.isDesktopSupported()) return false
        val desktop = Desktop.getDesktop()
        if (print && desktop.isSupported(Desktop.Action.PRINT)) {
            runCatching { desktop.print(file) }.onSuccess { return true }
        }
        if (desktop.isSupported(Desktop.Action.OPEN)) {
            return runCatching { desktop.open(file) }.isSuccess
        }
        return false
    }

    /** Prints a Swing panel through the system print dialog, scaled to fit the page width. */
    fun printComponent(component: JComponent, jobName: String = "Mateu"): Boolean {
        val job = PrinterJob.getPrinterJob()
        job.jobName = jobName
        job.setPrintable(ComponentPrintable(component))
        if (!job.printDialog()) return false
        job.print()
        return true
    }

    /** Paints [component] across as many pages as its height needs, scaled to the page width. */
    class ComponentPrintable(private val component: JComponent) : Printable {
        override fun print(graphics: Graphics, format: PageFormat, pageIndex: Int): Int {
            val width = component.width.coerceAtLeast(1)
            val scale = minOf(1.0, format.imageableWidth / width)
            val pageHeight = format.imageableHeight / scale
            if (pageIndex * pageHeight >= component.height.coerceAtLeast(1)) return Printable.NO_SUCH_PAGE
            val g = graphics as Graphics2D
            g.translate(format.imageableX, format.imageableY)
            g.scale(scale, scale)
            g.translate(0.0, -pageIndex * pageHeight)
            component.printAll(g)
            return Printable.PAGE_EXISTS
        }
    }
}
