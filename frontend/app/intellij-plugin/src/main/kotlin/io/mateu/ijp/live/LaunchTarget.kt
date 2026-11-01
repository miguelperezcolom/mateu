package io.mateu.ijp.live

import java.io.File
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

/**
 * Where a launched Mateu app is opened — pure, so it is unit-tested without an IDE. The same running
 * app can be looked at in any of them: they all speak the same `/mateu/v3/sync` API (a static
 * bundle is read by the web and React Native renderers only).
 */
enum class LaunchTarget(val label: String) {
    /** The default browser: the web renderer the app serves. */
    WEB("Web (browser)"),
    /** The Mateu desktop app — a separate IntelliJ — through its `mateu://` link (see [DesktopApp]). */
    DESKTOP("Desktop (Mateu app)"),
    /** The Mateu app (React Native renderer) on the running Android emulator. */
    ANDROID_EMULATOR("Android emulator"),
    /** The Mateu app (React Native renderer) on the booted iOS simulator. */
    IOS_SIMULATOR("iOS simulator"),
    /** The Mateu app on a phone on the same network: a QR code to scan. */
    PHONE("Phone (QR code)");

    override fun toString(): String = label

    /** A phone reaches the app through the network, so the app must listen on every interface. */
    val needsLan: Boolean get() = this == PHONE

    /** Why this target cannot open a project of [framework], or null when it can. */
    fun unsupportedReason(framework: Framework): String? =
        if (this == DESKTOP && framework == Framework.STATIC_BUNDLE) {
            "The desktop renderer needs a backend: a static bundle opens on the web or in the Mateu app."
        } else {
            null
        }
}

/** The host an Android emulator reaches this machine's loopback through. */
const val ANDROID_EMULATOR_HOST = "10.0.2.2"

/** [appUrl] as the Android emulator reaches it: `localhost` / `127.0.0.1` become [ANDROID_EMULATOR_HOST]. */
fun emulatorUrlOf(appUrl: String): String =
    appUrl.replaceFirst(Regex("^(https?://)(localhost|127\\.0\\.0\\.1)(?=[:/]|$)"), "$1$ANDROID_EMULATOR_HOST")

/** [appUrl] as another device on the network reaches it: the loopback host becomes [lanAddress]. */
fun lanUrlOf(appUrl: String, lanAddress: String): String =
    appUrl.replaceFirst(Regex("^(https?://)(localhost|127\\.0\\.0\\.1)(?=[:/]|$)"), "$1$lanAddress")

private fun encoded(url: String): String = URLEncoder.encode(url, StandardCharsets.UTF_8)

/** The Mateu app's own add link (custom scheme), what a simulator opens: `mateu://add?u=<baseUrl>`. */
fun appLinkOf(baseUrl: String): String = "mateu://add?u=" + encoded(baseUrl)

/** The universal link a phone's camera opens: `https://mateu.io/add?u=<baseUrl>` (as `mateu-bundle:dev`). */
fun universalLinkOf(baseUrl: String): String = "https://mateu.io/add?u=" + encoded(baseUrl)

/**
 * The command that opens [appUrl] in the Mateu app on a simulator / emulator target, or null for the
 * targets the IDE opens itself. [adb] is the adb executable to use.
 */
fun simulatorCommandOf(target: LaunchTarget, appUrl: String, adb: String = "adb"): List<String>? = when (target) {
    LaunchTarget.ANDROID_EMULATOR -> listOf(
        adb, "shell", "am", "start", "-a", "android.intent.action.VIEW", "-d", appLinkOf(emulatorUrlOf(appUrl)),
    )
    LaunchTarget.IOS_SIMULATOR -> listOf("xcrun", "simctl", "openurl", "booted", appLinkOf(appUrl))
    else -> null
}

/**
 * The adb executable: the Android SDK's (`ANDROID_HOME` / `ANDROID_SDK_ROOT`, else the default SDK
 * folder of each OS) when it exists, else plain `adb` from the PATH.
 */
fun adbOf(env: (String) -> String? = System::getenv, home: String = System.getProperty("user.home", "")): String {
    val exe = if (System.getProperty("os.name", "").lowercase().contains("win")) "adb.exe" else "adb"
    val sdks = listOfNotNull(
        env("ANDROID_HOME"),
        env("ANDROID_SDK_ROOT"),
        "$home/Android/Sdk",
        "$home/Library/Android/sdk",
        env("LOCALAPPDATA")?.let { "$it/Android/Sdk" },
    )
    return sdks.map { File(it, "platform-tools/$exe") }.firstOrNull { it.isFile }?.absolutePath ?: "adb"
}

/**
 * This machine's address on the local network (a site-local IPv4 of an up, non-loopback, non-virtual
 * interface; 192.168.x and 10.x before 172.16–31, often a container bridge), or null — the same
 * choice `mateu-bundle:dev` makes for its phone QR.
 */
fun lanAddressOf(): String? = runCatching {
    java.net.NetworkInterface.getNetworkInterfaces().toList()
        .filter { it.isUp && !it.isLoopback && !it.isVirtual && !it.isPointToPoint }
        .flatMap { it.inetAddresses.toList() }
        .filterIsInstance<java.net.Inet4Address>()
        .filter { it.isSiteLocalAddress }
        .map { it.hostAddress }
        .sortedBy { it.startsWith("172.") }
        .firstOrNull()
}.getOrNull()
