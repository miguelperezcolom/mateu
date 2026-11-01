package io.mateu.ijp.live

/**
 * The Mateu desktop app — the IntelliJ-based app the installers ship (`./gradlew buildInstaller`,
 * attached to every GitHub release) — as the DESKTOP target of a live run. The UI opens THERE, in a
 * separate IntelliJ with its own window, never in the developer's IDE: the IDE hands the OS the
 * hub's add link (`mateu://add?u=<appUrl>`) and the OS hands it to the app, which registered the
 * scheme when installed (the hub variant only). The developer's IDE settings are not touched.
 *
 * Pure, so it is unit-tested without an IDE: which command asks the OS whether something handles
 * `mateu://`, how to read its answer, and which command opens the link.
 */
object DesktopApp {

    /** Where the installers are: the latest release (one per OS: dmg/zip, setup.exe, tar.gz). */
    const val DOWNLOAD_URL = "https://github.com/miguelperezcolom/mateu/releases/latest"

    /** The hub build's macOS bundle id (build.gradle.kts `buildInstaller`, slug `mateu`). */
    const val MAC_BUNDLE_ID = "io.mateu.desktop"

    enum class Os { MAC, WINDOWS, LINUX, OTHER }

    fun osOf(name: String = System.getProperty("os.name", "")): Os {
        val n = name.lowercase()
        return when {
            n.contains("mac") || n.contains("darwin") -> Os.MAC
            n.contains("win") -> Os.WINDOWS
            n.contains("nux") || n.contains("nix") || n.contains("bsd") -> Os.LINUX
            else -> Os.OTHER
        }
    }

    /** The link the desktop app receives: the same hub grammar a phone scans (conformance/client/hub-links.json). */
    fun linkOf(appUrl: String): String = appLinkOf(appUrl)

    /**
     * The command that asks the OS which app handles `mateu://`, or null when there is no way to ask
     * (then the link is just opened and a failure is reported).
     *  - macOS: Launch Services through JXA — where the app with the desktop app's bundle id is (or nothing);
     *  - Windows: the registry key the NSIS installer writes (HKCR merges the user's HKCU classes);
     *  - Linux: the x-scheme-handler the install.sh registered with xdg-mime.
     */
    fun handlerProbeOf(os: Os): List<String>? = when (os) {
        // By bundle id, not "who handles mateu://": on Apple silicon the PHONE app (installed from the
        // App Store / TestFlight) claims the scheme too, and may be the default handler.
        Os.MAC -> listOf(
            "osascript", "-l", "JavaScript", "-e",
            "ObjC.import('AppKit'); var u = \$.NSWorkspace.sharedWorkspace" +
                ".URLForApplicationWithBundleIdentifier('$MAC_BUNDLE_ID'); " +
                "u.isNil() ? '' : ObjC.unwrap(u.path)",
        )
        Os.WINDOWS -> listOf("reg", "query", "HKCR\\mateu\\shell\\open\\command", "/ve")
        Os.LINUX -> listOf("xdg-mime", "query", "default", "x-scheme-handler/mateu")
        Os.OTHER -> null
    }

    /** Whether the probe's answer names a handler. */
    fun handlerFound(os: Os, exitCode: Int, stdout: String): Boolean = when (os) {
        Os.WINDOWS -> exitCode == 0
        Os.MAC, Os.LINUX -> exitCode == 0 && stdout.isNotBlank() && stdout.trim() != "null"
        Os.OTHER -> false
    }

    /** The command that hands [link] to the OS (which starts or focuses the registered app). */
    fun openCommandOf(os: Os, link: String): List<String>? = when (os) {
        Os.MAC -> listOf("open", "-b", MAC_BUNDLE_ID, link)
        // `start` would read an `&` in the link as a command separator; the URL protocol handler does not
        Os.WINDOWS -> listOf("rundll32", "url.dll,FileProtocolHandler", link)
        Os.LINUX -> listOf("xdg-open", link)
        Os.OTHER -> null
    }
}
