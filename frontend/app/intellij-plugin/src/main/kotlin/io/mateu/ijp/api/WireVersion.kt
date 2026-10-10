package io.mateu.ijp.api

/**
 * Wire-version check — the same rule as the web renderer (libs/mateu `infra/http/wireVersion.ts`).
 *
 * Every response of a Mateu backend carries `wireVersion` ("3.0" today). The wire is additive within
 * a MAJOR, so a newer minor is fine (unknown fields are ignored, unknown component types render as a
 * placeholder). Another MAJOR may have removed or changed what this renderer relies on: the user is
 * told so in plain words instead of being left with a half-broken screen. A response without the
 * field (a backend that predates it) or with an unparseable value is accepted.
 */
object WireVersion {
    /** The wire major this renderer was built for. */
    const val SUPPORTED_MAJOR = 3

    /** Null when compatible; otherwise the user-facing message. */
    fun mismatch(received: String?, supportedMajor: Int = SUPPORTED_MAJOR): String? {
        val value = received?.trim().orEmpty()
        if (value.isEmpty()) return null
        val major = value.substringBefore('.').toIntOrNull() ?: return null
        if (major == supportedMajor) return null
        return "This app's server speaks Mateu wire $major.x ($value); this renderer supports $supportedMajor.x. " +
            "Some screens may not display correctly — update the plugin or the server so they match."
    }
}
