package io.mateu.ijp.hub

/**
 * Can THIS app render that UI? The rule of conformance/client/app-compat.json — the phone app runs
 * the same corpus (React Native `src/hub/compat.ts`, the reference). Side-effect-free; unit-tested by
 * AppCompatConformanceTest.
 *
 * - required: another wire major, or an app older than the manifest's `minAppVersion` (only checked
 *   when [App.appVersion] is given — the desktop app passes none: that floor speaks of the phone app's
 *   versions) → not added, not opened; the update is offered (or, for an OLDER wire, the server must
 *   be updated).
 * - recommended: a newer wire minor, or a newer Mateu release than this app's renderer → it opens,
 *   with a suggestion to update.
 * - compatible: anything else; what cannot be compared never blocks.
 */
object AppCompat {

    enum class Status { COMPATIBLE, RECOMMENDED, REQUIRED }

    enum class Reason(val id: String) {
        NEWER_WIRE("newerWire"), OLDER_WIRE("olderWire"), MIN_APP_VERSION("minAppVersion"),
        NEWER_MINOR("newerMinor"), NEWER_MATEU("newerMateu"),
    }

    data class App(val wire: String, val mateuVersion: String?, val appVersion: String? = null)

    data class Ui(val wireVersion: String? = null, val minAppVersion: String? = null, val mateuVersion: String? = null)

    data class Result(val status: Status, val reason: Reason?)

    private val WIRE = Regex("^(\\d+)(?:\\.(\\d+))?")
    private val RELEASE = Regex("^(\\d+)\\.(\\d+)(?:\\.(\\d+))?(?:[-.]?(alpha|beta|rc|a|b)\\.?(\\d+))?$")
    private val STAGES = mapOf("alpha" to 0, "a" to 0, "beta" to 1, "b" to 1, "rc" to 2)

    private fun wireOf(v: String?): Pair<Int, Int>? =
        WIRE.find(v?.trim().orEmpty())?.let { it.groupValues[1].toInt() to (it.groupValues[2].toIntOrNull() ?: 0) }

    /** A Mateu release as comparable numbers (GA above rc), or null when the text names none. */
    fun release(v: String?): List<Int>? {
        val text = v?.trim().orEmpty()
        if (text.isEmpty() || text.startsWith("0.")) return null
        val m = RELEASE.matchEntire(text) ?: return null
        val g = m.groupValues
        val stage = if (g[4].isEmpty()) 3 else STAGES.getValue(g[4])
        return listOf(g[1].toInt(), g[2].toInt(), g[3].toIntOrNull() ?: 0, stage, g[5].toIntOrNull() ?: 0)
    }

    /** Negative when [a] is the older release; null when either names no release. */
    fun compareReleases(a: String?, b: String?): Int? {
        val ra = release(a) ?: return null
        val rb = release(b) ?: return null
        for (i in ra.indices) if (ra[i] != rb[i]) return ra[i] - rb[i]
        return 0
    }

    /** Dotted numeric compare ("1.10" > "1.2"); junk counts as 0. */
    private fun compareDotted(a: String, b: String): Int {
        val pa = a.split('.')
        val pb = b.split('.')
        for (i in 0 until maxOf(pa.size, pb.size)) {
            val na = pa.getOrNull(i)?.toIntOrNull() ?: 0
            val nb = pb.getOrNull(i)?.toIntOrNull() ?: 0
            if (na != nb) return na - nb
        }
        return 0
    }

    fun of(ui: Ui, app: App): Result {
        val theirs = wireOf(ui.wireVersion)
        val ours = wireOf(app.wire)
        if (theirs != null && ours != null && theirs.first > ours.first) return Result(Status.REQUIRED, Reason.NEWER_WIRE)
        if (theirs != null && ours != null && theirs.first < ours.first) return Result(Status.REQUIRED, Reason.OLDER_WIRE)
        if (app.appVersion != null && ui.minAppVersion != null && compareDotted(app.appVersion, ui.minAppVersion) < 0) {
            return Result(Status.REQUIRED, Reason.MIN_APP_VERSION)
        }
        if (theirs != null && ours != null && theirs.second > ours.second) return Result(Status.RECOMMENDED, Reason.NEWER_MINOR)
        val rel = compareReleases(ui.mateuVersion, app.mateuVersion)
        if (rel != null && rel > 0) return Result(Status.RECOMMENDED, Reason.NEWER_MATEU)
        return Result(Status.COMPATIBLE, null)
    }

    /** The sentence for the person (the desktop app speaks English, like the rest of its UI). */
    fun message(reason: Reason, name: String, ui: Ui, app: App): String = when (reason) {
        Reason.NEWER_WIRE -> "$name uses a newer Mateu (wire ${ui.wireVersion}) than this version of the desktop app understands. Update the Mateu app to open it."
        Reason.OLDER_WIRE -> "$name's server runs a Mateu (wire ${ui.wireVersion}) too old for this version of the desktop app. The server needs updating."
        Reason.MIN_APP_VERSION -> "$name needs the Mateu app ${ui.minAppVersion} or later; you have ${app.appVersion}."
        Reason.NEWER_MINOR, Reason.NEWER_MATEU ->
            "$name runs a newer Mateu${ui.mateuVersion?.let { " ($it)" } ?: ""} than this app${app.mateuVersion?.let { " ($it)" } ?: ""}. " +
                "It opens, but some screens may not display correctly until you update the app."
    }
}
