package io.mateu.ijp.update

import com.intellij.notification.NotificationAction
import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.application.PathManager
import com.intellij.openapi.diagnostic.Logger
import com.intellij.util.concurrency.AppExecutorUtil
import io.mateu.ijp.plugin.AppRegistry
import io.mateu.ijp.plugin.loadMateuConfig
import io.mateu.ijp.ui.SafeHtml
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

/**
 * The desktop app's own updater (the IntelliJ platform's is switched off in that app: see
 * `buildInstaller`). In the background — shortly after startup, then every 12 hours — it reads the
 * update feed; a newer plugin is downloaded, verified (sha256) and STAGED next to the plugins dir,
 * and ONE notification offers "Restart to update". The launcher swaps it in before the next start.
 * A release on another IntelliJ build is never patched: a notification links to its installer.
 *
 * Outside the desktop app (a developer's IDE, `runIde`) every entry point is a no-op that answers
 * [UpdateResult.Disabled].
 */
object MateuUpdater {

    private val LOG = Logger.getInstance(MateuUpdater::class.java)
    private const val CHECK_EVERY_HOURS = 12L
    private const val FIRST_CHECK_AFTER_SECONDS = 20L

    private val started = AtomicBoolean()
    private val lock = Any()
    private val notified = java.util.Collections.synchronizedSet(mutableSetOf<String>())

    /** Updater settings of THIS process (system properties + the IDE's plugins dir). */
    fun settings(): UpdaterSettings = resolveUpdaterSettings(
        system = System::getProperty,
        focused = loadMateuConfig().standalone,
        pluginsDir = runCatching { PathManager.getPluginsDir() }.getOrNull(),
    )

    /** True in the desktop app with updates on: [checkNow] can actually update. */
    fun isEnabled(): Boolean = settings().enabled

    /** Schedules the background checks (idempotent; a no-op outside the desktop app). */
    fun startBackgroundChecks() {
        val s = settings()
        if (!s.enabled) {
            LOG.info("Mateu updater off: ${s.disabledReason}")
            return
        }
        if (!started.compareAndSet(false, true)) return
        AppExecutorUtil.getAppScheduledExecutorService().scheduleWithFixedDelay(
            { report(check(), fromUser = false) },
            FIRST_CHECK_AFTER_SECONDS,
            TimeUnit.HOURS.toSeconds(CHECK_EVERY_HOURS),
            TimeUnit.SECONDS,
        )
    }

    /**
     * Checks NOW (off the EDT) and calls [onResult] on the EDT. A newer plugin is staged before the
     * callback, so on [UpdateResult.ReadyToRestart] the caller can offer [restart]. Meant for the
     * registry's "update required" gate; outside the desktop app it answers [UpdateResult.Disabled]
     * (fall back to the IDE's own update flow there).
     */
    fun checkNow(onResult: (UpdateResult) -> Unit) {
        ApplicationManager.getApplication().executeOnPooledThread {
            val result = check()
            report(result, fromUser = true)
            ApplicationManager.getApplication().invokeLater { onResult(result) }
        }
    }

    /** Restarts the app; its launcher applies the staged update before the IDE starts again. */
    fun restart() {
        ApplicationManager.getApplication().invokeLater { ApplicationManager.getApplication().restart() }
    }

    private fun check(): UpdateResult = synchronized(lock) {
        val result = UpdateCheck(settings(), AppRegistry.installedPluginVersion()).run()
        LOG.info("Mateu update check: $result")
        result
    }

    private fun report(result: UpdateResult, fromUser: Boolean) {
        val product = loadMateuConfig().productName
        when (result) {
            is UpdateResult.ReadyToRestart -> once("ready:${result.version}") {
                notify(
                    "$product ${result.version} is ready",
                    "Restart to update.",
                    NotificationType.INFORMATION,
                    NotificationAction.createSimpleExpiring("Restart") { restart() },
                )
            }
            is UpdateResult.ReinstallNeeded -> once("reinstall:${result.version}") {
                val url = result.installerUrl
                notify(
                    "A new version of $product needs to be reinstalled",
                    "$product ${result.version} runs on a newer platform (${result.ideVersion}): download and install it.",
                    NotificationType.INFORMATION,
                    url?.let { NotificationAction.createSimpleExpiring("Download") { SafeHtml.browse(it) } },
                )
            }
            is UpdateResult.Failed -> if (fromUser) {
                notify("Could not update $product", result.message, NotificationType.WARNING, null)
            }
            else -> Unit
        }
    }

    private fun once(key: String, show: () -> Unit) {
        if (notified.add(key)) show()
    }

    private fun notify(title: String, content: String, type: NotificationType, action: NotificationAction?) {
        val n = NotificationGroupManager.getInstance().getNotificationGroup("Mateu")
            .createNotification(SafeHtml.escape(title), SafeHtml.escape(content), type)
        action?.let { n.addAction(it) }
        n.notify(null)
    }
}
