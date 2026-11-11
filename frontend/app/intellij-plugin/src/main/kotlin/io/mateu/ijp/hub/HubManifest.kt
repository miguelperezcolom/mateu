package io.mateu.ijp.hub

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.api.WireVersion
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

/**
 * The UI manifest — `GET <baseUrl>/mateu/v3/manifest`, served by every Mateu backend
 * (design/mobile-app-hub.md §2), ported from the app's `src/hub/manifest.ts`:
 *
 *   { "name": "Acme CRM", "shortName": "CRM", "icon": "<url or data uri>", "themeColor": "#1f6feb",
 *     "wireVersion": "3", "auth": { "type": "oidc", "issuer": "…", "clientId": "…", "scopes": […] } }
 *
 * It comes from a server the user has not trusted yet (the confirm step is where they decide), so every
 * field is validated and anything odd is dropped: a name is plain text with a length cap, an icon an
 * https URL or a raster data URI, a colour a hex literal, a sign-in only with an https issuer.
 *
 * Unlike the phone, the desktop app does not run STATIC UIs (a bundle with no server): a manifest
 * naming a `bundle` is refused with a sentence saying so. `minAppVersion` speaks of the phone app's
 * versions and is not read here; the wire major is.
 */
object HubManifest {

    const val PATH = "/mateu/v3/manifest"
    const val MAX_NAME = 60
    const val MAX_SHORT_NAME = 20
    const val MAX_ICON_DATA_URI = 200_000
    val DEFAULT_SCOPES = listOf("openid", "profile", "email", "offline_access")

    /** One sign-in provider ([SignInProviders]): `default` for the single legacy keys. */
    data class Auth(
        val issuer: String,
        val clientId: String,
        val scopes: List<String>,
        val audience: String? = null,
        val id: String = "default",
        /** What the chooser calls it; null → the issuer's host. */
        val label: String? = null,
        /** A brand token (SignInProviders.ICONS), drawn as a neutral initial — never brand artwork. */
        val icon: String = "key",
    )

    data class Manifest(
        val name: String,
        val shortName: String? = null,
        val icon: String? = null,
        val themeColor: String? = null,
        val wireVersion: String? = null,
        /** The first sign-in provider the desktop can use (what a manifest meant before `providers`). */
        val auth: Auth? = null,
        val bundle: String? = null,
        /** The Mateu release serving the UI (the server sends it itself): [AppCompat] compares it with ours. */
        val mateuVersion: String? = null,
        /** EVERY sign-in provider the desktop can use, in the UI's order: one → straight to it, several → a chooser. */
        val providers: List<Auth> = listOfNotNull(auth),
        /** Sign in before the first screen (default); false = only when a 401 asks. */
        val loginOnStart: Boolean = true,
    )

    sealed interface Fetch {
        /** [missing]: the server answered but publishes no manifest (an older Mateu) — named after its domain. */
        data class Ok(val manifest: Manifest, val missing: Boolean = false) : Fetch
        data class Failed(val reason: String, val offline: Boolean = false) : Fetch
    }

    private val HIDDEN = Regex("[\\u0000-\\u001f\\u007f-\\u009f\\u200b-\\u200f\\u202a-\\u202e\\u2066-\\u2069\\ufeff]")
    private val SPACES = Regex("\\s+")
    private val RASTER_DATA_URI = Regex("^data:image/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$")
    private val HEX_COLOUR = Regex("^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")

    private fun cleanText(v: JsonNode?, max: Int): String? {
        if (v == null || !v.isTextual) return null
        val t = HubLinks.jsTrim(v.asText().replace(HIDDEN, "").replace(SPACES, " "))
        return t.ifEmpty { null }?.take(max)
    }

    /** An icon the app may load: https (http on dev), resolved against the base URL when relative, or a raster data URI. */
    fun resolveIcon(icon: JsonNode?, baseUrl: String, allowInsecure: Boolean = false): String? {
        if (icon == null || !icon.isTextual || icon.asText().isBlank()) return null
        val v = HubLinks.jsTrim(icon.asText())
        if (v.startsWith("data:")) return v.takeIf { RASTER_DATA_URI.matches(it) && it.length <= MAX_ICON_DATA_URI }
        val absolute = when {
            Regex("^https?://", RegexOption.IGNORE_CASE).containsMatchIn(v) -> v
            v.startsWith("//") || Regex("^[a-zA-Z][a-zA-Z0-9+.-]*:").containsMatchIn(v) -> return null
            else -> {
                val origin = Regex("^(https?://[^/]+)", RegexOption.IGNORE_CASE).find(baseUrl)?.groupValues?.get(1) ?: return null
                if (v.startsWith("/")) "$origin$v" else "${baseUrl.trimEnd('/')}/$v"
            }
        }
        val beforeQuery = absolute.split('?', '#')[0]
        val options = HubLinks.Options(allowInsecure, allowLoopbackHttp = isLoopbackBase(baseUrl))
        if (HubLinks.normalizeBaseUrl(beforeQuery, options) !is HubLinks.BaseUrl.Ok || absolute.any { it.isWhitespace() }) return null
        return absolute.substringBefore('#')
    }

    /** Validates a manifest answer. Never throws; a missing name falls back to the domain. */
    fun parse(raw: JsonNode?, baseUrl: String, allowInsecure: Boolean = false): Manifest {
        val r = raw?.takeIf { it.isObject }
        val providers = providersOf(r?.get("auth"), allowInsecure, baseUrl)
        val wire = r?.get("wireVersion")?.takeIf { it.isTextual || it.isNumber }?.let { if (it.isNumber) it.numberValue().toString() else it.asText() }
        return Manifest(
            name = cleanText(r?.get("name"), MAX_NAME) ?: HubLinks.domainOf(baseUrl),
            shortName = cleanText(r?.get("shortName"), MAX_SHORT_NAME),
            icon = resolveIcon(r?.get("icon"), baseUrl, allowInsecure),
            themeColor = r?.get("themeColor")?.takeIf { it.isTextual && HEX_COLOUR.matches(it.asText()) }?.asText()?.lowercase(),
            wireVersion = wire,
            auth = providers.firstOrNull(),
            bundle = r?.get("bundle")?.takeIf { it.isTextual && it.asText().isNotEmpty() }?.asText(),
            mateuVersion = r?.get("mateuVersion")?.takeIf { it.isTextual && AppCompat.release(it.asText()) != null }?.asText(),
            providers = providers,
            loginOnStart = r?.get("auth")?.get("loginOnStart")?.takeIf { it.isBoolean }?.asBoolean() ?: true,
        )
    }

    /**
     * Whether [baseUrl] is a plain-http app on THIS machine — the one a developer's IDE just started.
     * Its icon and its identity provider may then be plain http on this machine too (a local Keycloak).
     */
    private fun isLoopbackBase(baseUrl: String): Boolean {
        val ok = HubLinks.normalizeBaseUrl(baseUrl, HubLinks.Options(allowLoopbackHttp = true)) as? HubLinks.BaseUrl.Ok ?: return false
        return !ok.secure && HubLinks.isLoopbackHost(ok.host.replace(Regex(":\\d+$"), ""))
    }

    /** The manifest's sign-in providers for the desktop, only those whose identity provider is https too: the user's password goes there. */
    private fun providersOf(raw: JsonNode?, allowInsecure: Boolean, baseUrl: String = ""): List<Auth> =
        SignInProviders.parse(raw, "desktop").filter { auth ->
            val localIssuer = isLoopbackBase(baseUrl) && isLoopbackBase(auth.issuer)
            auth.issuer.startsWith("https://", true) || ((allowInsecure || localIssuer) && auth.issuer.startsWith("http://", true))
        }

    /** Can the desktop app render that UI at all? A static site, or what [AppCompat] says is REQUIRED,
     *  cannot. Null = it can (it may still be [compat]ibly behind: see [compat]). */
    fun refusal(manifest: Manifest, supportedMajor: Int = WireVersion.SUPPORTED_MAJOR): String? {
        if (manifest.bundle != null) return "This is a static UI (no server behind it): the desktop app can only open UIs served by a Mateu backend."
        val result = compat(manifest, supportedMajor)
        return if (result.status == AppCompat.Status.REQUIRED) compatMessage(manifest, result, supportedMajor) else null
    }

    /** This desktop app against that UI ([AppCompat]): its renderer's wire and Mateu release. */
    fun compat(manifest: Manifest, supportedMajor: Int = WireVersion.SUPPORTED_MAJOR): AppCompat.Result =
        AppCompat.of(ui(manifest), app(supportedMajor))

    /** The sentence for [result]'s reason (null when compatible). */
    fun compatMessage(manifest: Manifest, result: AppCompat.Result, supportedMajor: Int = WireVersion.SUPPORTED_MAJOR): String? =
        result.reason?.let { AppCompat.message(it, manifest.name, ui(manifest), app(supportedMajor)) }

    private fun ui(m: Manifest) = AppCompat.Ui(wireVersion = m.wireVersion, mateuVersion = m.mateuVersion)

    private fun app(supportedMajor: Int) = AppCompat.App(
        wire = "$supportedMajor.0",
        mateuVersion = io.mateu.ijp.api.BuildSkew.pluginVersion.takeIf { AppCompat.release(it) != null },
    )

    /** What the hub needs from HTTP: a GET answering status + body (a seam for tests). */
    fun interface Get {
        fun get(url: String): Pair<Int, String>
    }

    val HTTP = Get { url ->
        // a server on THIS machine is never followed elsewhere: a redirect from a local port is not a UI
        val client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).followRedirects(redirectsFor(url)).build()
        val rq = HttpRequest.newBuilder(URI.create(url)).header("Accept", "application/json").timeout(Duration.ofSeconds(10)).GET().build()
        val rs = client.send(rq, HttpResponse.BodyHandlers.ofString())
        rs.statusCode() to rs.body()
    }

    /** NEVER for a loopback address (localhost, 127.x, [::1]); the usual same-scheme-or-safer rule elsewhere. */
    fun redirectsFor(url: String): HttpClient.Redirect {
        val host = Regex("^https?://([^/?#]+)", RegexOption.IGNORE_CASE).find(url)?.groupValues?.get(1)?.lowercase()
            ?.replace(Regex(":\\d+$"), "") ?: return HttpClient.Redirect.NEVER
        return if (HubLinks.isLoopbackHost(host)) HttpClient.Redirect.NEVER else HttpClient.Redirect.NORMAL
    }

    /** Fetches + validates the manifest. Network errors are `offline`. */
    fun fetch(baseUrl: String, http: Get = HTTP, allowInsecure: Boolean = false): Fetch {
        val (status, body) = try {
            http.get("$baseUrl$PATH")
        } catch (e: Exception) {
            return Fetch.Failed("Can't reach the server. Check the address and your connection.", offline = true)
        }
        if (status == 404 || status == 405) return Fetch.Ok(Manifest(HubLinks.domainOf(baseUrl)), missing = true)
        if (status !in 200..299) return Fetch.Failed("The server answered with an error (HTTP $status).")
        val json = runCatching { ObjectMapper().readTree(body) }.getOrNull()
            ?: return Fetch.Failed("The server is not a Mateu app (its manifest is not JSON).")
        return Fetch.Ok(parse(json, baseUrl, allowInsecure))
    }

    data class Mount(val baseUrl: String, val route: String?, val fetched: Fetch)

    /** At most this many path segments are tried as the mount of a page url. */
    private const val MAX_MOUNT_PROBES = 6

    /**
     * The UI a PAGE url belongs to (`https://crm.acme.com/app/orders/7` — what a browser's "QR code for
     * this page" carries): the manifest is asked from the full path upwards and the first that answers
     * one is the UI; the rest of the path is the route to open. Nothing found → the url itself.
     */
    fun resolveMount(pageUrl: String, http: Get = HTTP, allowInsecure: Boolean = false): Mount {
        val m = Regex("^(https?://[^/?#]+)(/[^?#]*)?", RegexOption.IGNORE_CASE).find(pageUrl)
            ?: return Mount(pageUrl, null, fetch(pageUrl, http, allowInsecure))
        val origin = m.groupValues[1]
        val segments = m.groupValues[2].split('/').filter { it.isNotEmpty() }
        var first: Fetch? = null
        for (i in minOf(segments.size, MAX_MOUNT_PROBES) downTo 0) {
            val baseUrl = origin + if (i > 0) "/" + segments.take(i).joinToString("/") else ""
            val fetched = fetch(baseUrl, http, allowInsecure)
            if (first == null) first = fetched
            if (fetched is Fetch.Ok && !fetched.missing) {
                val route = segments.drop(i).joinToString("/")
                return Mount(baseUrl, route.ifEmpty { null }, fetched)
            }
        }
        return Mount(pageUrl, null, first!!)
    }
}
