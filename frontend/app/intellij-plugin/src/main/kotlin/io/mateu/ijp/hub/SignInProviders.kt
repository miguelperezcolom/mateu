package io.mateu.ijp.hub

import com.fasterxml.jackson.databind.JsonNode

/**
 * Sign-in providers (pure, unit-tested) — the desktop twin of the phone app's
 * `src/core/signInProviders.ts`; both run `conformance/client/sign-in-flow-native.json`.
 *
 * A UI's `auth` block names a LIST of providers (`auth.providers`); the desktop offers the `oidc` ones
 * whose `platforms` include `desktop`: none → no sign-in, one → straight to it, several → a chooser.
 * A `redirect` provider (the host framework's own login page) is never offered here even when it lists
 * `desktop`: it ends with a session cookie in the system browser, not a token the IDE could send.
 *
 * Without `providers` (a server from before the list) the single keys `issuer`/`clientId`/`scopes`/
 * `audience` are provider `default`. With `providers` present, the list is the whole truth.
 */
object SignInProviders {

    enum class Mode { NONE, DIRECT, CHOOSER }

    private val PLATFORMS = listOf("web", "mobile", "desktop")
    val ICONS = setOf("google", "microsoft", "apple", "github", "facebook", "x", "linkedin", "gitlab", "okta", "auth0", "keycloak", "key")

    private val BRAND_LABELS = mapOf(
        "google" to "Google", "microsoft" to "Microsoft", "entra" to "Microsoft Entra ID", "apple" to "Apple",
        "github" to "GitHub", "facebook" to "Facebook", "x" to "X", "linkedin" to "LinkedIn", "gitlab" to "GitLab",
        "keycloak" to "Keycloak", "okta" to "Okta", "auth0" to "Auth0", "cognito" to "Amazon Cognito", "zitadel" to "ZITADEL",
    )

    private const val MAX_LABEL = 40
    private val HIDDEN = Regex("[\\u0000-\\u001f\\u007f-\\u009f\\u200b-\\u200f\\u202a-\\u202e\\u2066-\\u2069\\ufeff]")

    private fun text(node: JsonNode?): String? = node?.takeIf { it.isTextual }?.asText()

    private fun cleanLabel(node: JsonNode?): String? =
        text(node)?.replace(HIDDEN, "")?.replace(Regex("\\s+"), " ")?.let(HubLinks::jsTrim)?.ifEmpty { null }?.take(MAX_LABEL)

    private fun platformsOf(node: JsonNode?, type: String): List<String> =
        if (node == null || !node.isArray) {
            if (type == "redirect") listOf("web") else PLATFORMS
        } else {
            node.filter { it.isTextual && it.asText() in PLATFORMS }.map { it.asText() }
        }

    /** The issuer/client/scopes/audience of one OIDC description (a provider, or the legacy keys); null when unusable. */
    private fun oidcOf(r: JsonNode, id: String, label: String?, icon: String): HubManifest.Auth? {
        val issuer = text(r.get("issuer"))?.trimEnd('/').orEmpty()
        val clientId = text(r.get("clientId")).orEmpty()
        if (issuer.isEmpty() || clientId.isEmpty()) return null
        val scopesNode = r.get("scopes")
        val scopes = when {
            scopesNode?.isArray == true -> scopesNode.filter { it.isTextual }.map { it.asText() }
            scopesNode?.isTextual == true -> scopesNode.asText().split(Regex("[\\s,]+")).filter { it.isNotEmpty() }
            else -> HubManifest.DEFAULT_SCOPES
        }.ifEmpty { HubManifest.DEFAULT_SCOPES }
        val audience = text(r.get("audience"))?.ifEmpty { null }
        return HubManifest.Auth(issuer, clientId, scopes, audience, id = id, label = label, icon = icon)
    }

    /** The providers of an `auth` block [platform] can sign in with, in the UI's order (a duplicate id keeps the first). */
    fun parse(raw: JsonNode?, platform: String = "desktop"): List<HubManifest.Auth> {
        if (raw == null || !raw.isObject) return emptyList()
        val list = raw.get("providers")
        if (list != null && list.isArray) {
            val out = LinkedHashMap<String, HubManifest.Auth>()
            list.forEachIndexed { i, p ->
                if (!p.isObject) return@forEachIndexed
                val type = text(p.get("type")) ?: "oidc"
                if (type != "oidc") return@forEachIndexed // redirect: a browser cookie, never a token
                if (platform !in platformsOf(p.get("platforms"), type)) return@forEachIndexed
                val id = text(p.get("id"))?.trim()?.ifEmpty { null } ?: "provider${i + 1}"
                val icon = text(p.get("icon"))?.takeIf { it in ICONS } ?: "key"
                val auth = oidcOf(p, id, cleanLabel(p.get("label")) ?: BRAND_LABELS[id], icon) ?: return@forEachIndexed
                out.putIfAbsent(id, auth)
            }
            return out.values.toList()
        }
        if (platform == "web") return emptyList() // the legacy keys only ever meant the native apps
        if ((text(raw.get("type")) ?: "oidc") != "oidc") return emptyList()
        return listOfNotNull(oidcOf(raw, "default", null, "key"))
    }

    fun modeOf(providers: List<*>): Mode = when (providers.size) {
        0 -> Mode.NONE
        1 -> Mode.DIRECT
        else -> Mode.CHOOSER
    }

    /**
     * The provider to use without asking: the one already signed in ([signedIn]), else the one used last
     * ([remembered]), else the only one. Null = several and nothing to go by: ask.
     */
    fun preselected(providers: List<HubManifest.Auth>, signedIn: (HubManifest.Auth) -> Boolean, remembered: String?): HubManifest.Auth? =
        providers.firstOrNull(signedIn)
            ?: remembered?.let { r -> providers.firstOrNull { it.id == r } }
            ?: providers.singleOrNull()

    /** The chooser's order: the one used last first, then the UI's order. */
    fun ordered(providers: List<HubManifest.Auth>, remembered: String?): List<HubManifest.Auth> {
        val last = providers.firstOrNull { it.id == remembered } ?: return providers
        return listOf(last) + providers.filter { it !== last }
    }

    /** What a provider is called on screen: its label, else the identity provider's host. */
    fun nameOf(auth: HubManifest.Auth): String =
        auth.label ?: Regex("^[a-zA-Z]+://([^/:?#]+)").find(auth.issuer)?.groupValues?.get(1) ?: auth.issuer

    /** The neutral mark of a provider: its initial, or null for the key — never brand artwork. */
    fun initialOf(auth: HubManifest.Auth): String? =
        if (auth.icon == "key") null else nameOf(auth).trim().firstOrNull()?.uppercaseChar()?.toString()
}
