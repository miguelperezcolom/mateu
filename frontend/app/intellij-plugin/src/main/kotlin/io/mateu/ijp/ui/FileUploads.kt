package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.api.Urls
import java.io.FilterInputStream
import java.io.IOException
import java.io.InputStream
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.nio.file.Path
import java.time.Duration

/**
 * The pure side of large file uploads through the app's storage port
 * (design/uploads/file-uploads-contract.md): the field's attributes, the `mateu-file:` reference
 * value, size texts, the upload url and the endpoints' answers. No Swing — unit-tested.
 */
object FileUploads {
    /** The data-URI fallback's limit when the field declares none (10 MB). */
    const val DEFAULT_FALLBACK_MAX_BYTES: Long = 10485760

    /** What a fileUpload field declares (and what the server added: uploadUrl/uploadTicket/uploadDirect). */
    data class Config(
        val accept: String? = null,
        val maxBytes: Long? = null,
        val multiple: Boolean = false,
        val uploadUrl: String? = null,
        val uploadTicket: String? = null,
        val uploadDirect: Boolean = false,
    ) {
        /** The ticket switches the field to upload mode. */
        val uploadMode: Boolean get() = !uploadTicket.isNullOrBlank() && !uploadUrl.isNullOrBlank()

        /** The limit the data-URI fallback applies. */
        val fallbackMaxBytes: Long get() = maxBytes ?: DEFAULT_FALLBACK_MAX_BYTES
    }

    /** A stored file, as the `mateu-file:` reference describes it (size -1 = unknown). */
    data class FileRef(val id: String, val name: String? = null, val contentType: String? = null, val size: Long = -1, val url: String? = null)

    /** The wire's `attributes` (a list of {key, value} pairs) as a map; an object is accepted too. */
    fun attributesOf(attributes: JsonNode?): Map<String, String> {
        val out = linkedMapOf<String, String>()
        if (attributes == null) return out
        if (attributes.isArray) {
            attributes.forEach { a ->
                val key = a.path("key")
                val value = a.path("value")
                if (key.isTextual && !value.isMissingNode && !value.isNull) out[key.asText()] = value.asText()
            }
        } else if (attributes.isObject) {
            attributes.fields().forEach { (k, v) -> if (!v.isNull) out[k] = v.asText() }
        }
        return out
    }

    fun configOf(metadata: JsonNode): Config {
        val a = attributesOf(metadata.path("attributes"))
        fun nonBlank(key: String) = a[key]?.trim()?.takeIf { it.isNotEmpty() }
        return Config(
            accept = nonBlank("accept"),
            maxBytes = nonBlank("maxBytes")?.takeIf { it.all(Char::isDigit) }?.toLongOrNull(),
            multiple = nonBlank("multiple").equals("true", ignoreCase = true),
            uploadUrl = nonBlank("uploadUrl"),
            uploadTicket = nonBlank("uploadTicket"),
            uploadDirect = nonBlank("uploadDirect").equals("true", ignoreCase = true),
        )
    }

    /** `N bytes`, `N KB`, `N MB`, `N GB` (1024 base, integer when exact, else one decimal). */
    fun formatBytes(bytes: Long): String {
        val units = listOf("bytes", "KB", "MB", "GB")
        var value = bytes.toDouble()
        var unit = 0
        while (unit < units.size - 1 && value >= 1024) {
            value /= 1024
            unit++
        }
        val text = if (value == Math.floor(value)) value.toLong().toString() else String.format(java.util.Locale.ROOT, "%.1f", value)
        return "$text ${units[unit]}"
    }

    fun tooLargeMessage(maxBytes: Long): String = "This file is too large (max ${formatBytes(maxBytes)})."

    /** Percent-encodes UTF-8, escaping every byte outside `A-Za-z0-9-._~`. */
    fun percentEncode(text: String): String {
        val sb = StringBuilder()
        for (b in text.toByteArray(StandardCharsets.UTF_8)) {
            val c = b.toInt() and 0xff
            if (c in 'A'.code..'Z'.code || c in 'a'.code..'z'.code || c in '0'.code..'9'.code || c == '-'.code || c == '.'.code || c == '_'.code || c == '~'.code) {
                sb.append(c.toChar())
            } else {
                sb.append('%').append("0123456789ABCDEF"[c shr 4]).append("0123456789ABCDEF"[c and 0xf])
            }
        }
        return sb.toString()
    }

    /** Decodes `%XX` sequences only (`+` stays a plus; a malformed `%` is kept as it came). */
    fun percentDecode(text: String): String {
        val out = java.io.ByteArrayOutputStream()
        var i = 0
        while (i < text.length) {
            val ch = text[i]
            if (ch == '%' && i + 2 < text.length) {
                val digits = text.substring(i + 1, i + 3)
                val hex = if (digits.all { it in '0'..'9' || it.lowercaseChar() in 'a'..'f' }) digits.toInt(16) else null
                if (hex != null) {
                    out.write(hex)
                    i += 3
                    continue
                }
            }
            out.write(ch.toString().toByteArray(StandardCharsets.UTF_8))
            i++
        }
        return String(out.toByteArray(), StandardCharsets.UTF_8)
    }

    private const val PREFIX = "mateu-file:"

    fun isFileRef(value: String?): Boolean = value != null && value.startsWith(PREFIX)

    /** A `mateu-file:` value, or null for anything else (a data URI, a url, blank). */
    fun parse(value: String?): FileRef? {
        if (value == null || !value.startsWith(PREFIX)) return null
        val rest = value.removePrefix(PREFIX)
        val id = percentDecode(rest.substringBefore('?'))
        var ref = FileRef(id)
        if ('?' in rest) {
            for (pair in rest.substringAfter('?').split('&')) {
                if (pair.isEmpty()) continue
                val key = pair.substringBefore('=')
                val v = percentDecode(pair.substringAfter('=', ""))
                ref = when (key) {
                    "name" -> ref.copy(name = v)
                    "type" -> ref.copy(contentType = v)
                    "url" -> ref.copy(url = v)
                    "size" -> v.takeIf { it.isNotEmpty() && it.all(Char::isDigit) }?.toLongOrNull()?.let { ref.copy(size = it) } ?: ref
                    else -> ref
                }
            }
        }
        return ref
    }

    /** The reference value of a stored file (params in the contract's order; absent ones omitted). */
    fun toValue(file: FileRef): String {
        val params = mutableListOf<String>()
        file.name?.takeIf { it.isNotEmpty() }?.let { params += "name=" + percentEncode(it) }
        file.contentType?.takeIf { it.isNotEmpty() }?.let { params += "type=" + percentEncode(it) }
        if (file.size >= 0) params += "size=${file.size}"
        file.url?.takeIf { it.isNotEmpty() }?.let { params += "url=" + percentEncode(it) }
        return PREFIX + percentEncode(file.id) + if (params.isEmpty()) "" else "?" + params.joinToString("&")
    }

    fun isHttpUrl(url: String?): Boolean = url != null && Regex("^https?://", RegexOption.IGNORE_CASE).containsMatchIn(url.trim())

    /** What the field shows for a stored file: its name (else its id), with its size when known. */
    fun label(ref: FileRef): String {
        val name = ref.name?.takeIf { it.isNotEmpty() } ?: ref.id
        return if (ref.size >= 0) "$name (${formatBytes(ref.size)})" else name
    }

    /** The field's value as a list of entries (a single value → one entry; blank → none). */
    fun valuesOf(raw: JsonNode?): List<String> = when {
        raw == null || raw.isNull || raw.isMissingNode -> emptyList()
        raw.isArray -> raw.map { it.asText() }.filter { it.isNotEmpty() }
        else -> listOfNotNull(raw.asText().takeIf { it.isNotEmpty() })
    }

    /** The value after a file was committed: appended for a `multiple` field, replaced otherwise. */
    fun withFile(current: List<String>, added: String, multiple: Boolean): Any = if (multiple) current + added else added

    /** The value after the entry at [index] was removed. */
    fun withoutFile(current: List<String>, index: Int, multiple: Boolean): Any =
        if (multiple) current.filterIndexed { i, _ -> i != index } else ""

    /**
     * Where to send the bytes: an absolute `uploadUrl` as it is; a root-relative one against the
     * ORIGIN of the backend (the upload endpoints live at the root path); a bare relative one against
     * the base url.
     */
    fun resolveUploadUrl(baseUrl: String, uploadUrl: String): String {
        if (Urls.isAbsolute(uploadUrl)) return uploadUrl
        if (!isHttpUrl(baseUrl)) return uploadUrl
        return runCatching {
            val base = if (baseUrl.endsWith("/") || uploadUrl.startsWith("/")) baseUrl else "$baseUrl/"
            URI(base).resolve(uploadUrl).toString()
        }.getOrDefault(uploadUrl)
    }

    /** The headers of the streamed upload (beside the app's own Mateu credentials). */
    fun uploadHeaders(ticket: String, name: String, contentType: String?): Map<String, String> = linkedMapOf(
        "X-Mateu-Upload-Ticket" to ticket,
        "X-Mateu-File-Name" to percentEncode(name),
        "Content-Type" to (contentType?.takeIf { it.isNotBlank() } ?: "application/octet-stream"),
        "Accept" to "application/json",
    )

    /** A pre-signed target (`POST uploadUrl/target` answered 200). */
    data class Target(val url: String, val method: String, val headers: Map<String, String>, val value: String)

    private val mapper = ObjectMapper()

    private fun json(text: String): JsonNode? = runCatching { mapper.readTree(text) }.getOrNull()?.takeIf { it.isObject }

    fun targetJson(name: String, contentType: String?, size: Long): String =
        mapper.writeValueAsString(linkedMapOf("name" to name, "contentType" to (contentType ?: "application/octet-stream"), "size" to size))

    /** The committed value of a 200 from `/mateu/v3/upload`, or null when the answer has none. */
    fun uploadedValueOf(text: String): String? = json(text)?.path("value")?.takeIf { it.isTextual && it.asText().isNotEmpty() }?.asText()

    fun targetOf(text: String): Target? {
        val j = json(text) ?: return null
        val url = j.path("url").takeIf { it.isTextual }?.asText() ?: return null
        val value = j.path("value").takeIf { it.isTextual }?.asText() ?: return null
        val headers = linkedMapOf<String, String>()
        j.path("headers").takeIf { it.isObject }?.fields()?.forEach { (k, v) -> if (!v.isNull) headers[k] = v.asText() }
        return Target(url, j.path("method").asText("").ifBlank { "PUT" }, headers, value)
    }

    /** The server's `message` of a refused upload, else a plain text for its status. */
    fun errorOf(status: Int, text: String): String {
        json(text)?.path("message")?.takeIf { it.isTextual && it.asText().isNotEmpty() }?.let { return it.asText() }
        return when (status) {
            403 -> "This upload is not allowed."
            404 -> "Uploads are not available."
            413 -> "This file is too large."
            415 -> "This type of file is not accepted."
            0 -> "The file could not be sent. Check the connection and try again."
            else -> "The file could not be uploaded."
        }
    }

    /** A file's content type from its name, else the generic one. */
    fun contentTypeOf(name: String): String = java.net.URLConnection.guessContentTypeFromName(name) ?: "application/octet-stream"
}

/** One HTTP leg of an upload; the body is a text (JSON) or a file streamed from disk. */
data class UploadHttpRequest(val method: String, val url: String, val headers: Map<String, String>, val text: String? = null, val file: Path? = null)

data class UploadHttpResponse(val status: Int, val text: String)

/** Sends one leg; [onSent] reports the bytes of a file body sent; [cancelled] is polled while sending. */
fun interface UploadTransport {
    fun send(request: UploadHttpRequest, onSent: (Long) -> Unit, cancelled: () -> Boolean): UploadHttpResponse
}

/** A refused or failed upload; [message] is what the user is shown. */
class UploadException(val status: Int, message: String) : Exception(message)

/** The user cancelled the upload (nothing to show). */
class UploadCancelledException : Exception("cancelled")

/**
 * Sends a picked file to the app's storage port (contract §4): streamed through Mateu (`POST
 * uploadUrl`, raw bytes, the ticket + the app's Mateu credentials), or — with `uploadDirect` — to
 * the store's pre-signed target (`POST uploadUrl/target` first; the bytes then go to that url
 * WITHOUT Mateu credentials; a 404 there falls back to the streamed upload).
 *
 * [credentials] = the Mateu credential headers a request to a url carries (none when it is not
 * trusted with them) — `MateuApiClient.credentialHeaders`.
 */
class FileUploader(
    private val baseUrl: String,
    private val credentials: (String) -> Map<String, String>,
    private val transport: UploadTransport = HttpUploadTransport(),
) {
    /** Uploads [file] and returns the value to commit (a `mateu-file:` reference). */
    fun upload(config: FileUploads.Config, file: Path, name: String, contentType: String?, size: Long,
               onProgress: (Double) -> Unit = {}, cancelled: () -> Boolean = { false }): String {
        val ticket = config.uploadTicket ?: throw UploadException(0, "Uploads are not available.")
        val url = FileUploads.resolveUploadUrl(baseUrl, config.uploadUrl ?: throw UploadException(0, "Uploads are not available."))
        val progress: (Long) -> Unit = { sent -> if (size > 0) onProgress((sent.toDouble() / size).coerceIn(0.0, 1.0)) }

        if (config.uploadDirect) {
            val targetUrl = url.trimEnd('/') + "/target"
            val answer = send(UploadHttpRequest("POST", targetUrl,
                credentials(targetUrl) + mapOf("X-Mateu-Upload-Ticket" to ticket, "Content-Type" to "application/json", "Accept" to "application/json"),
                text = FileUploads.targetJson(name, contentType, size)), {}, cancelled)
            if (answer.status == 200) {
                val target = FileUploads.targetOf(answer.text) ?: throw UploadException(200, "The file could not be uploaded.")
                // the pre-signed url belongs to the store, not to Mateu: only the headers the store asked for
                val headers = linkedMapOf<String, String>()
                if (contentType != null && target.headers.keys.none { it.equals("content-type", true) }) headers["Content-Type"] = contentType
                headers.putAll(target.headers)
                val sent = send(UploadHttpRequest(target.method, target.url, headers, file = file), progress, cancelled)
                if (sent.status !in 200..299) throw UploadException(sent.status, FileUploads.errorOf(sent.status, sent.text))
                return target.value
            }
            if (answer.status != 404) throw UploadException(answer.status, FileUploads.errorOf(answer.status, answer.text))
            // 404: the store issued no target — stream it through Mateu
        }

        val answer = send(UploadHttpRequest("POST", url, credentials(url) + FileUploads.uploadHeaders(ticket, name, contentType), file = file), progress, cancelled)
        if (answer.status != 200) throw UploadException(answer.status, FileUploads.errorOf(answer.status, answer.text))
        return FileUploads.uploadedValueOf(answer.text) ?: throw UploadException(200, "The file could not be uploaded.")
    }

    private fun send(request: UploadHttpRequest, onSent: (Long) -> Unit, cancelled: () -> Boolean): UploadHttpResponse {
        if (cancelled()) throw UploadCancelledException()
        return try {
            transport.send(request, onSent, cancelled)
        } catch (e: UploadCancelledException) {
            throw e
        } catch (e: Exception) {
            if (cancelled()) throw UploadCancelledException()
            throw UploadException(0, FileUploads.errorOf(0, ""))
        }
    }
}

/** The plugin's transport: `java.net.http`, the file streamed from disk (never read into memory). */
class HttpUploadTransport(private val http: HttpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(30)).build()) : UploadTransport {
    override fun send(request: UploadHttpRequest, onSent: (Long) -> Unit, cancelled: () -> Boolean): UploadHttpResponse {
        val builder = HttpRequest.newBuilder().uri(URI.create(request.url))
        // restricted headers (Content-Length, Host…) are set by the client itself
        request.headers.filterKeys { !it.equals("content-length", true) && !it.equals("host", true) }.forEach { (k, v) -> builder.header(k, v) }
        val body = when {
            request.file != null -> {
                val length = Files.size(request.file)
                HttpRequest.BodyPublishers.fromPublisher(
                    HttpRequest.BodyPublishers.ofInputStream { CountingStream(Files.newInputStream(request.file), onSent, cancelled) }, length)
            }
            request.text != null -> HttpRequest.BodyPublishers.ofString(request.text)
            else -> HttpRequest.BodyPublishers.noBody()
        }
        val response = http.send(builder.method(request.method, body).build(), HttpResponse.BodyHandlers.ofString())
        if (cancelled()) throw UploadCancelledException()
        return UploadHttpResponse(response.statusCode(), response.body().orEmpty())
    }

    /** Reports the bytes read and aborts the request (by failing the read) once cancelled. */
    private class CountingStream(input: InputStream, private val onSent: (Long) -> Unit, private val cancelled: () -> Boolean) : FilterInputStream(input) {
        private var sent = 0L

        override fun read(): Int = check { super.read().also { if (it >= 0) count(1) } }

        override fun read(b: ByteArray, off: Int, len: Int): Int = check { super.read(b, off, len).also { if (it > 0) count(it.toLong()) } }

        private inline fun check(block: () -> Int): Int {
            if (cancelled()) throw IOException("upload cancelled")
            return block()
        }

        private fun count(n: Long) {
            sent += n
            onSent(sent)
        }
    }
}
