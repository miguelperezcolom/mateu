package io.mateu.ijp.mcp

import java.security.MessageDigest

/**
 * Who may talk to the desktop MCP server — pure, unit-tested. The server listens on 127.0.0.1 only;
 * on top of that every request must:
 *  - be a POST (JSON-RPC over HTTP);
 *  - name the loopback host it was sent to (`Host: 127.0.0.1:<port>` or `localhost:<port>`): a page
 *    that re-points its own domain at 127.0.0.1 (DNS rebinding) sends ITS name, and is refused;
 *  - carry no `Origin` other than `null`: a browser always sends one for a cross-site request, an
 *    agent (curl, an MCP client) does not;
 *  - carry `Authorization: Bearer <token>`, compared in constant time.
 */
object McpRequestGuard {

    data class Verdict(val status: Int, val message: String) {
        val allowed: Boolean get() = status == 200
    }

    val OK = Verdict(200, "")

    fun check(
        method: String?,
        host: String?,
        origin: String?,
        authorization: String?,
        token: String?,
        port: Int,
    ): Verdict {
        if (!method.equals("POST", ignoreCase = true)) return Verdict(405, "Only POST")
        if (!hostAllowed(host, port)) return Verdict(403, "Forbidden host")
        if (!originAllowed(origin)) return Verdict(403, "Forbidden origin")
        if (!authorized(authorization, token)) return Verdict(401, "Unauthorized")
        return OK
    }

    fun hostAllowed(host: String?, port: Int): Boolean {
        val h = host?.trim()?.lowercase() ?: return false
        return h == "127.0.0.1:$port" || h == "localhost:$port"
    }

    /** No Origin (an agent) or the opaque `null` one; anything else is a web page. */
    fun originAllowed(origin: String?): Boolean = origin == null || origin.trim() == "null"

    fun authorized(authorization: String?, token: String?): Boolean {
        if (token.isNullOrBlank() || authorization == null) return false
        val prefix = "Bearer "
        if (!authorization.startsWith(prefix, ignoreCase = true)) return false
        val presented = authorization.substring(prefix.length).trim()
        return MessageDigest.isEqual(presented.toByteArray(Charsets.UTF_8), token.toByteArray(Charsets.UTF_8))
    }

    /** A fresh token: 32 random bytes, URL-safe base64 (43 characters). */
    fun newToken(random: java.security.SecureRandom = java.security.SecureRandom()): String {
        val bytes = ByteArray(32).also(random::nextBytes)
        return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }
}
