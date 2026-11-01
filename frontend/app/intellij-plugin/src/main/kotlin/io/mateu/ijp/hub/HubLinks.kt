package io.mateu.ijp.hub

import com.fasterxml.jackson.databind.ObjectMapper
import java.io.ByteArrayOutputStream
import java.net.URLEncoder
import java.nio.ByteBuffer
import java.nio.charset.CharacterCodingException
import java.nio.charset.CodingErrorAction
import java.nio.charset.StandardCharsets

/**
 * The hub's link grammar — a port of the React Native app's `src/hub/links.ts`, which is the
 * reference: both run `conformance/client/hub-links.json`, so they accept, refuse and word their
 * reasons identically (design/mobile-app-hub.md §1, §7).
 *
 * A QR code, a `mateu://` link the OS hands over or a typed address all end up here, and everything
 * that comes from outside is untrusted: a code can be printed by anyone. So it is strict, and parses
 * with its own regular expressions instead of `java.net.URI`, whose leniencies differ from the app's.
 *
 *   https://mateu.io/add?u=<urlencoded baseUrl>[&r=<route>]   add one UI
 *   mateu://add?u=<urlencoded baseUrl>[&r=<route>]             the same, custom scheme
 *   https://mateu.io/add?u=<a>&u=<b>…                          import several (the export QR)
 *   mateu://import?d=<base64url JSON {"v":1,"u":[…]}>         import several, compact form
 *
 * A link may NEVER carry credentials: a base URL with userinfo (`https://bank.com@evil.com`) is refused.
 */
object HubLinks {

    /** Hosts whose `/add` path is ours (the universal-link domain). */
    val LINK_HOSTS = listOf("mateu.io", "www.mateu.io")

    const val MAX_URL_LENGTH = 2048
    const val MAX_ROUTE_LENGTH = 512
    const val MAX_IMPORT = 50

    data class Options(
        /** Accept `http://` base URLs (development only). */
        val allowInsecure: Boolean = false,
        /**
         * Accept `http://` only for THIS machine (localhost, 127.x, [::1]) — what the desktop app sets,
         * since a developer's IDE hands it the app it just started (`http://localhost:8080`).
         */
        val allowLoopbackHttp: Boolean = false,
        /** Extra hosts (`host[:port]`) whose `/add` path is accepted. */
        val extraLinkHosts: List<String> = emptyList(),
    )

    sealed interface BaseUrl {
        data class Ok(val baseUrl: String, val host: String, val secure: Boolean) : BaseUrl
        data class Refused(val reason: String) : BaseUrl
    }

    sealed interface Link {
        data class Add(val baseUrl: String, val route: String? = null) : Link
        data class Import(val baseUrls: List<String>, val rejected: Int) : Link
        data class Invalid(val reason: String) : Link
    }

    // scheme://authority path ?query #fragment — RFC 3986 appendix B, minus the optional parts we refuse
    private val URL_RE = Regex("^([a-zA-Z][a-zA-Z0-9+.-]*)://([^/?#]*)([^?#]*)(\\?[^#]*)?(#.*)?$", RegexOption.DOT_MATCHES_ALL)
    private val CONTROL_OR_SPACE =
        Regex("[\\u0000-\\u0020\\u007f-\\u009f\\u2028\\u2029\\u200b-\\u200f\\u202a-\\u202e\\u2066-\\u2069\\ufeff]")
    private val HOST_RE = Regex("^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$")
    private val IPV6_RE = Regex("^\\[[0-9a-f:.]+]$")
    private val SCHEME_PREFIX = Regex("^[a-zA-Z][a-zA-Z0-9+.-]*://")
    private val OTHER_SCHEME = Regex("^[a-zA-Z][a-zA-Z0-9+.-]*:(?!\\d)")
    private val HOST_PORT = Regex("^(\\[[^]]*]|[^:]*)(?::(\\d{1,5}))?$")
    private val ROUTE_SCHEME = Regex("^[a-zA-Z][a-zA-Z0-9+.-]*:")
    private val NON_ASCII = Regex("[^\\u0000-\\u007f]")

    /**
     * Normalises what the user typed (or a link carried) into a Mateu base URL: scheme + host[:port] +
     * path, no trailing slash, no query, no fragment. A missing scheme means https.
     */
    fun normalizeBaseUrl(input: String?, options: Options = Options()): BaseUrl {
        if (input == null) return BaseUrl.Refused("Not an address.")
        var raw = jsTrim(input)
        if (raw.isEmpty()) return BaseUrl.Refused("Enter an address.")
        if (raw.length > MAX_URL_LENGTH) return BaseUrl.Refused("The address is too long.")
        if (CONTROL_OR_SPACE.containsMatchIn(raw)) return BaseUrl.Refused("The address contains spaces or hidden characters.")
        if (!SCHEME_PREFIX.containsMatchIn(raw)) {
            // "acme.com/crm" → https; but "javascript:alert(1)" / "data:…" have a scheme without "//": refuse
            if (OTHER_SCHEME.containsMatchIn(raw)) return BaseUrl.Refused("Only https addresses can be added.")
            raw = "https://$raw"
        }
        val m = URL_RE.find(raw) ?: return BaseUrl.Refused("That does not look like a web address.")
        val scheme = m.groupValues[1].lowercase()
        val authority = m.groupValues[2]
        val path = m.groupValues[3]
        if (scheme != "https" && scheme != "http") return BaseUrl.Refused("Only https addresses can be added.")
        if (scheme == "http" && !options.allowInsecure && !options.allowLoopbackHttp) return BaseUrl.Refused("Only secure (https) addresses can be added.")
        if (authority.contains('@')) return BaseUrl.Refused("Addresses with a user name or password are not accepted.")
        val hp = HOST_PORT.find(authority) ?: return BaseUrl.Refused("The address has an invalid host.")
        val host = hp.groupValues[1].lowercase().removeSuffix(".")
        val port = hp.groups[2]?.value
        if (host.isEmpty()) return BaseUrl.Refused("The address has no host.")
        if (NON_ASCII.containsMatchIn(host)) return BaseUrl.Refused("International domain names must be entered in their xn-- form.")
        if (!HOST_RE.matches(host) && !IPV6_RE.matches(host)) return BaseUrl.Refused("The address has an invalid host.")
        if (scheme == "http" && !options.allowInsecure && !isLoopbackHost(host)) return BaseUrl.Refused("Only secure (https) addresses can be added.")
        if (port != null) {
            val n = port.toInt()
            if (n !in 1..65535) return BaseUrl.Refused("The address has an invalid port.")
        }
        if (path.contains('\\')) return BaseUrl.Refused("The address has an invalid path.")
        if (path.split('/').any { it == ".." || it == "." }) return BaseUrl.Refused("The address has an invalid path.")
        val defaultPort = (scheme == "https" && port == "443") || (scheme == "http" && port == "80")
        val hostPort = if (port != null && !defaultPort) "$host:$port" else host
        val cleanPath = path.trimEnd('/')
        return BaseUrl.Ok("$scheme://$hostPort$cleanPath", hostPort, scheme == "https")
    }

    /** The host[:port] of an already-normalised base URL — what the confirm step shows big. */
    /** This machine: `localhost`, `127.0.0.0/8`, `[::1]` (an already lower-cased host, no port). */
    fun isLoopbackHost(host: String): Boolean =
        host == "localhost" || host == "[::1]" || Regex("^127\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$").matches(host)

    fun domainOf(baseUrl: String): String = URL_RE.find(baseUrl)?.groupValues?.get(2)?.lowercase() ?: baseUrl

    /** A route to open inside the UI: relative to its mount, never an absolute or protocol-relative URL. */
    fun sanitizeRoute(route: String?): String? {
        if (route == null) return null
        val r = jsTrim(route)
        if (r.isEmpty() || r.length > MAX_ROUTE_LENGTH) return null
        if (CONTROL_OR_SPACE.containsMatchIn(r)) return null
        if (r.startsWith("//") || r.contains('\\') || ROUTE_SCHEME.containsMatchIn(r)) return null
        if (r.split('/', '?', '#').any { it == ".." }) return null
        return if (r.startsWith("/")) r else "/$r"
    }

    /** Repeated query keys preserved in order; malformed escapes make the value null (refused later). */
    fun parseQuery(query: String): List<Pair<String, String?>> {
        val q = query.removePrefix("?")
        if (q.isEmpty()) return emptyList()
        return q.split('&').filter { it.isNotEmpty() }.map { pair ->
            val i = pair.indexOf('=')
            val k = if (i < 0) pair else pair.substring(0, i)
            val v = if (i < 0) "" else pair.substring(i + 1)
            (decodeComponent(k) ?: "") to decodeComponent(v)
        }
    }

    /** `decodeURIComponent(s.replace(/\+/g, ' '))`, null where JavaScript would throw. */
    private fun decodeComponent(s: String): String? {
        val text = s.replace('+', ' ')
        if (!text.contains('%')) return text
        val out = StringBuilder()
        var i = 0
        while (i < text.length) {
            val c = text[i]
            if (c != '%') {
                out.append(c)
                i++
                continue
            }
            // a run of %XX escapes is one UTF-8 byte sequence
            val bytes = ByteArrayOutputStream()
            while (i < text.length && text[i] == '%') {
                if (i + 2 >= text.length) return null
                val hex = text.substring(i + 1, i + 3)
                if (!hex.all { it in '0'..'9' || it.lowercaseChar() in 'a'..'f' }) return null
                bytes.write(hex.toInt(16))
                i += 3
            }
            out.append(strictUtf8(bytes.toByteArray()) ?: return null)
        }
        return out.toString()
    }

    private fun strictUtf8(bytes: ByteArray): String? = try {
        StandardCharsets.UTF_8.newDecoder()
            .onMalformedInput(CodingErrorAction.REPORT)
            .onUnmappableCharacter(CodingErrorAction.REPORT)
            .decode(ByteBuffer.wrap(bytes)).toString()
    } catch (e: CharacterCodingException) {
        null
    }

    private const val B64URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

    /** base64url (RFC 4648 §5, no padding) of a UTF-8 string. */
    fun base64UrlEncode(text: String): String {
        val bytes = text.toByteArray(StandardCharsets.UTF_8)
        val out = StringBuilder()
        var i = 0
        while (i < bytes.size) {
            fun at(k: Int) = if (k < bytes.size) bytes[k].toInt() and 255 else 0
            val n = (at(i) shl 16) or (at(i + 1) shl 8) or at(i + 2)
            out.append(B64URL[(n shr 18) and 63]).append(B64URL[(n shr 12) and 63])
            if (i + 1 < bytes.size) out.append(B64URL[(n shr 6) and 63])
            if (i + 2 < bytes.size) out.append(B64URL[n and 63])
            i += 3
        }
        return out.toString()
    }

    fun base64UrlDecode(input: String): String? {
        val s = input.trimEnd('=')
        if (!s.all { it in B64URL } || s.length % 4 == 1) return null
        val bytes = ByteArrayOutputStream()
        var i = 0
        while (i < s.length) {
            val c = (0..3).map { k -> if (i + k < s.length) B64URL.indexOf(s[i + k]) else 0 }
            val n = (c[0] shl 18) or (c[1] shl 12) or (c[2] shl 6) or c[3]
            bytes.write((n shr 16) and 255)
            if (i + 2 < s.length) bytes.write((n shr 8) and 255)
            if (i + 3 < s.length) bytes.write(n and 255)
            i += 4
        }
        return strictUtf8(bytes.toByteArray())
    }

    /** The export payload of `mateu://import?d=…`. */
    fun encodeImportPayload(baseUrls: List<String>): String =
        base64UrlEncode(ObjectMapper().writeValueAsString(mapOf("v" to 1, "u" to baseUrls)))

    /**
     * Classifies a scanned / opened link. Anything that is not one of the accepted forms is [Link.Invalid]
     * with a sentence the user can read — a QR for something else (a menu, a wifi network) is the common
     * case, not an attack.
     */
    fun parse(raw: String?, options: Options = Options()): Link {
        if (raw == null || jsTrim(raw).isEmpty()) return Link.Invalid("The code is empty.")
        val text = jsTrim(raw)
        if (text.length > 8192) return Link.Invalid("The code is too long.")
        val m = URL_RE.find(text) ?: return Link.Invalid("This code is not a Mateu link.")
        val scheme = m.groupValues[1].lowercase()
        val authority = m.groupValues[2].lowercase()
        val path = m.groupValues[3].trimEnd('/')
        val query = parseQuery(m.groupValues[4])

        var action: String? = null
        if (scheme == "mateu") {
            // mateu://add?… — the "host" is the action; tolerate mateu:///add too
            val verb = authority.ifEmpty { path.removePrefix("/") }
            if (verb == "add" || verb == "import") action = verb
        } else if (scheme == "https" || (scheme == "http" && options.allowInsecure)) {
            val hosts = LINK_HOSTS + options.extraLinkHosts.map { it.lowercase() }
            if (authority in hosts && (path == "/add" || path == "/import")) action = path.removePrefix("/")
        }
        if (action == null) return Link.Invalid("This code is not a Mateu link.")

        fun values(key: String) = query.filter { it.first == key }.map { it.second }

        if (action == "import" || values("d").isNotEmpty()) {
            val d = values("d").firstOrNull() ?: return Link.Invalid("The import code is damaged.")
            val json = base64UrlDecode(d)
            val list = runCatching {
                val node = json?.let { ObjectMapper().readTree(it) }
                val v = node?.get("v")
                if (node != null && node.isObject && v != null && v.isNumber && v.asDouble() == 1.0) node.get("u") else null
            }.getOrNull()
            if (list == null || !list.isArray) return Link.Invalid("The import code is damaged.")
            return importOf(list.map { if (it.isTextual) it.asText() else null }, options)
        }

        val us = values("u")
        if (us.isEmpty()) return Link.Invalid("The link does not say which app to add.")
        if (us.size > 1) return importOf(us, options)
        val u = us[0] ?: return Link.Invalid("The link is damaged.")
        val base = normalizeBaseUrl(u, options)
        if (base is BaseUrl.Refused) return Link.Invalid(base.reason)
        val r = values("r")
        val route = if (r.size == 1) sanitizeRoute(r[0]) else null
        return Link.Add((base as BaseUrl.Ok).baseUrl, route)
    }

    private fun importOf(list: List<String?>, options: Options): Link {
        val baseUrls = LinkedHashSet<String>()
        var rejected = 0
        for (item in list.take(MAX_IMPORT)) {
            val n = item?.let { normalizeBaseUrl(it, options) }
            if (n !is BaseUrl.Ok) {
                rejected++
                continue
            }
            baseUrls.add(n.baseUrl)
        }
        rejected += maxOf(0, list.size - MAX_IMPORT)
        if (baseUrls.isEmpty()) return Link.Invalid("The import code has no usable addresses.")
        return Link.Import(baseUrls.toList(), rejected)
    }

    /** The "Export my UIs" link: base URLs only — never tokens, names or anything else. */
    fun exportLink(baseUrls: List<String>): String =
        "https://mateu.io/add?" + baseUrls.joinToString("&") { "u=${encodeComponent(it)}" }

    /** The share/QR link for ONE UI (what the web's "Open on mobile" dialog encodes). */
    fun addLink(baseUrl: String, route: String? = null): String {
        val r = sanitizeRoute(route)
        return "https://mateu.io/add?u=${encodeComponent(baseUrl)}" + (r?.let { "&r=${encodeComponent(it)}" } ?: "")
    }

    /** `encodeURIComponent`: URLEncoder's form encoding, minus its `+` for a space and with JS's unreserved set. */
    private fun encodeComponent(s: String): String =
        URLEncoder.encode(s, StandardCharsets.UTF_8)
            .replace("+", "%20").replace("%21", "!").replace("%27", "'")
            .replace("%28", "(").replace("%29", ")").replace("%7E", "~")

    /** JavaScript's `String.prototype.trim`: its whitespace set, not Kotlin's. */
    internal fun jsTrim(s: String): String {
        fun ws(c: Char) = c == ' ' || c in '\t'..'\r' || c == ' ' || c == ' ' || c in ' '..' ' ||
            c == ' ' || c == ' ' || c == ' ' || c == ' ' || c == '　' || c == '﻿'
        return s.trim(::ws)
    }
}
