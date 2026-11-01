package io.mateu.ijp.hub

/**
 * What the hub makes of something the user brought — a scanned code, a `mateu://` link the OS handed
 * over, a pasted page address or a typed one — BEFORE anything is added: the confirm step shows it
 * (pure apart from the injected HTTP; unit-tested).
 *
 * Mirrors the app: a Mateu link is read by [HubLinks.parse]; anything else that is a web address is
 * taken as a PAGE of a UI and its mount is looked up ([HubManifest.resolveMount]), which is what a
 * browser's own "QR code for this page" needs.
 */
object HubFlow {

    sealed interface Proposal {
        /** One UI: the confirm step shows [baseUrl]'s domain, [manifest]'s name and sign-in. */
        data class AddOne(
            val baseUrl: String,
            val route: String?,
            val manifest: HubManifest.Manifest,
            /** Already in the list: opening it is all there is to do. */
            val existing: HubEntry?,
        ) : Proposal

        data class ImportMany(val baseUrls: List<String>, val rejected: Int, val alreadyThere: Int) : Proposal

        /** [updatable]: a newer Mateu app would open it ([AppCompat] newer wire) — offer the update. */
        data class Refused(val reason: String, val updatable: Boolean = false) : Proposal
    }

    fun propose(
        raw: String?,
        entries: HubEntries,
        http: HubManifest.Get = HubManifest.HTTP,
        options: HubLinks.Options = HubLinks.Options(),
    ): Proposal {
        when (val link = HubLinks.parse(raw, options)) {
            is HubLinks.Link.Add -> return one(link.baseUrl, link.route, HubManifest.fetch(link.baseUrl, http, options.allowInsecure), entries)
            is HubLinks.Link.Import -> return Proposal.ImportMany(
                link.baseUrls,
                link.rejected,
                link.baseUrls.count { entries.findByBaseUrl(it) != null },
            )
            is HubLinks.Link.Invalid -> {
                val address = HubLinks.normalizeBaseUrl(raw, options)
                if (address !is HubLinks.BaseUrl.Ok) {
                    // a web address that is refused says why as an address ("only https…"); a foreign code
                    // with a scheme but no "//" (a wifi network, an otpauth secret) says it is not a Mateu link
                    val text = raw?.let(HubLinks::jsTrim).orEmpty()
                    val foreignCode = !text.contains("://") && Regex("^[a-zA-Z][a-zA-Z0-9+.-]*:(?!\\d)").containsMatchIn(text)
                    return Proposal.Refused(if (foreignCode) link.reason else (address as HubLinks.BaseUrl.Refused).reason)
                }
                val mount = HubManifest.resolveMount(address.baseUrl, http, options.allowInsecure)
                return one(mount.baseUrl, mount.route, mount.fetched, entries)
            }
        }
    }

    private fun one(baseUrl: String, route: String?, fetched: HubManifest.Fetch, entries: HubEntries): Proposal = when (fetched) {
        is HubManifest.Fetch.Failed -> Proposal.Refused(fetched.reason)
        is HubManifest.Fetch.Ok -> HubManifest.refusal(fetched.manifest)?.let {
            Proposal.Refused(it, updatable = fetched.manifest.bundle == null && HubManifest.compat(fetched.manifest).reason == AppCompat.Reason.NEWER_WIRE)
        }
            ?: Proposal.AddOne(baseUrl, HubLinks.sanitizeRoute(route), fetched.manifest, entries.findByBaseUrl(baseUrl))
    }
}
