package io.mateu.ijp.api

import java.util.Locale

/**
 * Version skew between this plugin and the backends it talks to — the contract every Mateu renderer
 * shares (pure; the IDE wiring lives in the project service):
 *
 * - every Mateu request (sync / sse) says who is calling: `X-Mateu-Renderer: intellij/<v> wire/<w>`
 *   (third-party REST sources — [MateuApiClient.fetchExternal], `ui/RestFetch.kt` — never get it);
 * - every Mateu response carries `X-Mateu-Build`, an opaque fingerprint of the deployed UI. The
 *   first one seen per backend (the url up to its `/mateu/` segment) is that backend's BASELINE for
 *   this IDE session (memory only). A later success with another build = the app was redeployed →
 *   one sticky "updated" notice with Reload; a Mateu 403 refusal with another build = the screen is
 *   STALE, not forbidden → a "changed" error with Reload instead of the generic text.
 * - no header (a static bundle, an older server) → nothing.
 */
class BuildSkew {
    enum class Notice { NONE, UPDATED, STALE }

    private val baselines = HashMap<String, String>()
    private val told = HashSet<String>()

    /** What to show for a response of backend [key]; records the baseline on first sight. */
    @Synchronized
    fun observe(key: String, build: String?, ok: Boolean, mateuForbidden: Boolean = false): Notice {
        val value = build?.trim().orEmpty()
        if (value.isEmpty()) return Notice.NONE
        val baseline = baselines[key]
        if (baseline == null) {
            baselines[key] = value
            return Notice.NONE
        }
        if (value == baseline) return Notice.NONE
        if (mateuForbidden) {
            // shown INSTEAD of the generic refusal, every time; the "updated" notice is then redundant
            told += key
            return Notice.STALE
        }
        if (!ok || key in told) return Notice.NONE
        told += key
        return Notice.UPDATED
    }

    @Synchronized
    fun clear() {
        baselines.clear()
        told.clear()
    }

    data class Texts(val updated: String, val stale: String, val reload: String)

    companion object {
        const val RENDERER_HEADER = "X-Mateu-Renderer"
        const val BUILD_HEADER = "X-Mateu-Build"

        /** The wire this build was made for (major = [WireVersion.SUPPORTED_MAJOR]). */
        const val WIRE = "${WireVersion.SUPPORTED_MAJOR}.0"

        /** The IDE session's tracker (keys are absolute urls, so every client can share it). */
        val SHARED = BuildSkew()

        /** The plugin's version, from the build-generated resource (see build.gradle.kts). */
        val pluginVersion: String by lazy {
            runCatching {
                BuildSkew::class.java.getResourceAsStream("/mateu-plugin-version.txt")
                    ?.bufferedReader()?.use { it.readText() }?.trim()
            }.getOrNull()?.takeIf { it.isNotBlank() } ?: "unknown"
        }

        /** `intellij/<version> wire/<major>.<minor>`. */
        fun rendererHeaderValue(version: String = pluginVersion, wire: String = WIRE): String =
            "intellij/${version.ifBlank { "unknown" }} wire/$wire"

        /** The backend a request url belongs to: the url up to (excluding) its `/mateu/` segment. */
        fun backendKeyOf(url: String): String {
            val at = url.indexOf("/mateu/")
            return if (at < 0) url else url.substring(0, at)
        }

        /** A 403 that is Mateu's own refusal: Java's text `Forbidden`; .NET/Python an increment with messages. */
        fun isMateuForbidden(status: Int, body: String?): Boolean {
            if (status != 403) return false
            val text = body?.trim().orEmpty()
            if (text == "Forbidden") return true
            if (!text.startsWith("{")) return false
            return runCatching {
                val messages = com.fasterxml.jackson.databind.ObjectMapper().readTree(text).path("messages")
                messages.isArray && messages.size() > 0
            }.getOrDefault(false)
        }

        private val EN = Texts(
            updated = "This app has been updated. Reload to use the latest version.",
            stale = "This screen has changed since you opened it. Reload to continue.",
            reload = "Reload",
        )
        private val ES = Texts(
            updated = "Esta aplicación se ha actualizado. Recarga para usar la última versión.",
            stale = "Esta pantalla ha cambiado desde que la abriste. Recarga para continuar.",
            reload = "Recargar",
        )

        /** The notice texts in [locale] (Spanish for `es*`, English otherwise). */
        fun texts(locale: Locale?): Texts = if (locale?.language == "es") ES else EN
    }
}

/** A Mateu 403 from a screen an older deployment built: the stale notice was already shown. */
class StaleScreenException(message: String) : RuntimeException(message)
