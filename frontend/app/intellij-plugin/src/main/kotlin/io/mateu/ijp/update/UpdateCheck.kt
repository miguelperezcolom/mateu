package io.mateu.ijp.update

import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardOpenOption
import java.time.Duration

/** What the updater knows about the app it runs in — resolved by [resolveUpdaterSettings]. */
data class UpdaterSettings(
    /** The feed to poll; null = updates off (see [disabledReason]). */
    val feedUrl: String?,
    /** The installer of the feed that fits this machine (`macos-aarch64`, `linux`, …). */
    val installerKey: String,
    /** The IntelliJ build the app was packaged on (`-Dmateu.desktop.ideVersion`). */
    val ideVersion: String?,
    /** Where updates are staged; next to the custom plugins dir, where the launchers look. */
    val updateDir: Path?,
    val disabledReason: String?,
) {
    val enabled: Boolean get() = disabledReason == null
}

/**
 * Pure resolution (unit-tested). The updater runs ONLY in the desktop app: focused mode AND the
 * platform key `buildInstaller` bakes (`-Dmateu.desktop.platform`) — so `runIde -Dmateu.focused=true`
 * or a Marketplace install never downloads anything. `-Dmateu.updateUrl` overrides the feed; empty,
 * `none` or `off` turns updates off (a white-label build that ships its own).
 */
fun resolveUpdaterSettings(
    system: (String) -> String?,
    focused: Boolean,
    pluginsDir: Path?,
): UpdaterSettings {
    val platform = system("mateu.desktop.platform")?.trim()?.ifBlank { null }
    val raw = system("mateu.updateUrl")
    val feedUrl = when {
        raw == null -> UpdateFeed.DEFAULT_URL
        raw.isBlank() || raw.trim().lowercase() in setOf("none", "off", "false") -> null
        else -> raw.trim()
    }
    val reason = when {
        !focused || platform == null -> "not the desktop app"
        feedUrl == null -> "updates are turned off (mateu.updateUrl)"
        !UpdateFeed.isAllowedUrl(feedUrl) -> "the update feed must be https: $feedUrl"
        pluginsDir == null -> "no plugins directory"
        else -> null
    }
    return UpdaterSettings(
        feedUrl = feedUrl,
        installerKey = platform ?: installerKey(system("os.name") ?: "", system("os.arch") ?: ""),
        ideVersion = system("mateu.desktop.ideVersion")?.trim()?.ifBlank { null },
        updateDir = pluginsDir?.toAbsolutePath()?.parent?.resolve("mateu-update"),
        disabledReason = reason,
    )
}

/** The outcome of one update check. */
sealed interface UpdateResult {
    /** Not the desktop app, or updates turned off. */
    data class Disabled(val reason: String) : UpdateResult

    /** The installed plugin is the feed's version (or newer). */
    data object UpToDate : UpdateResult

    /** [version] is downloaded, verified and staged: it is applied by the next launch. */
    data class ReadyToRestart(val version: String) : UpdateResult

    /** [version] runs on another IntelliJ build: the app has to be reinstalled ([installerUrl] for
     *  this machine, when the feed has one). */
    data class ReinstallNeeded(val version: String, val installerUrl: String?, val ideVersion: String) : UpdateResult

    data class Failed(val message: String) : UpdateResult
}

/** The network side of a check (an interface so the check is testable without a server). */
interface UpdateTransport {
    fun fetchText(url: String): String
    fun download(url: String, target: Path)
}

/** One check against the feed: decide, and stage a newer plugin. Never touches the running plugin. */
class UpdateCheck(
    private val settings: UpdaterSettings,
    private val installedVersion: String,
    private val transport: UpdateTransport = HttpUpdateTransport(),
) {
    fun run(): UpdateResult {
        settings.disabledReason?.let { return UpdateResult.Disabled(it) }
        val staging = UpdateStaging(settings.updateDir!!)
        return try {
            staging.discardIfNotNewer(installedVersion)
            val feed = UpdateFeed.parse(transport.fetchText(settings.feedUrl!!))
            if (compareDesktopVersions(feed.version, installedVersion) <= 0) return UpdateResult.UpToDate
            val feedIde = feed.ideVersion
            if (feedIde != null && settings.ideVersion != null && feedIde != settings.ideVersion) {
                // A plugin built for another platform may not even load here: the installer carries both.
                return UpdateResult.ReinstallNeeded(feed.version, feed.installers[settings.installerKey], feedIde)
            }
            val staged = staging.pendingVersion()
            if (staged != null && compareDesktopVersions(staged, feed.version) >= 0) return UpdateResult.ReadyToRestart(staged)
            val plugin = feed.plugin ?: return UpdateResult.Failed("the update feed offers ${feed.version} but no verifiable plugin download")
            Files.createDirectories(settings.updateDir)
            val part = settings.updateDir.resolve("download.zip.part")
            try {
                transport.download(plugin.url, part)
                staging.stage(part, plugin.sha256, feed.version)
            } finally {
                Files.deleteIfExists(part)
            }
            UpdateResult.ReadyToRestart(feed.version)
        } catch (e: Exception) {
            UpdateResult.Failed(e.message ?: e.toString())
        }
    }
}

/** The largest plugin archive the updater accepts (the plugin is a few tens of MB): a feed pointing at
 *  something bigger, or a server that never stops sending, does not fill the disk. */
const val MAX_DOWNLOAD_BYTES: Long = 512L * 1024 * 1024

/** Copies [input] to [target], failing (and deleting what was written) past [max] bytes. */
fun copyBounded(input: java.io.InputStream, target: Path, max: Long) {
    var total = 0L
    try {
        Files.newOutputStream(target, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE).use { out ->
            val buffer = ByteArray(64 * 1024)
            while (true) {
                val n = input.read(buffer)
                if (n < 0) break
                total += n
                check(total <= max) { "the download is larger than $max bytes" }
                out.write(buffer, 0, n)
            }
        }
    } catch (e: Exception) {
        Files.deleteIfExists(target)
        throw e
    }
}

/** java.net.http, following redirects (GitHub's release downloads answer 302 to a CDN). */
class HttpUpdateTransport(
    private val client: HttpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(15))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .build(),
) : UpdateTransport {

    override fun fetchText(url: String): String {
        val response = client.send(request(url, Duration.ofSeconds(30)), HttpResponse.BodyHandlers.ofString())
        check(response.statusCode() in 200..299) { "the update feed answered HTTP ${response.statusCode()} ($url)" }
        return response.body()
    }

    override fun download(url: String, target: Path) {
        Files.createDirectories(target.parent)
        val response = client.send(request(url, Duration.ofMinutes(10)), HttpResponse.BodyHandlers.ofInputStream())
        response.body().use { input ->
            check(response.statusCode() in 200..299) { "the plugin download answered HTTP ${response.statusCode()} ($url)" }
            val declared = response.headers().firstValueAsLong("Content-Length").orElse(-1)
            check(declared <= MAX_DOWNLOAD_BYTES) { "the plugin download is larger than $MAX_DOWNLOAD_BYTES bytes ($url)" }
            copyBounded(input, target, MAX_DOWNLOAD_BYTES)
        }
    }

    private fun request(url: String, timeout: Duration): HttpRequest =
        HttpRequest.newBuilder(URI.create(url)).timeout(timeout).header("User-Agent", "mateu-desktop-updater").GET().build()
}
