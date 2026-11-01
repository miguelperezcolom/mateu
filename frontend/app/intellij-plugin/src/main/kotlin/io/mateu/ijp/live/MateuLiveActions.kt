package io.mateu.ijp.live

import com.intellij.debugger.ui.HotSwapUI
import com.intellij.debugger.ui.HotSwapVetoableListener
import com.intellij.execution.ProgramRunnerUtil
import com.intellij.execution.RunManager
import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.execution.executors.DefaultDebugExecutor
import com.intellij.execution.process.CapturingProcessHandler
import com.intellij.execution.process.ProcessEvent
import com.intellij.execution.process.ProcessHandler
import com.intellij.execution.process.ProcessListener
import com.intellij.execution.remote.RemoteConfiguration
import com.intellij.execution.remote.RemoteConfigurationType
import com.intellij.ide.BrowserUtil
import com.intellij.notification.NotificationAction
import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.Service
import com.intellij.openapi.components.service
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.popup.JBPopupFactory
import com.intellij.openapi.ui.popup.PopupStep
import com.intellij.openapi.ui.popup.util.BaseListPopupStep
import com.intellij.openapi.util.Key
import com.intellij.openapi.wm.ToolWindowManager
import io.mateu.ijp.plugin.MateuProjectService
import io.mateu.ijp.plugin.MateuSettings
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

/**
 * Live development of a Mateu app from the IDE. A [MateuAppRunConfiguration] starts the project's app
 * in DEVELOPMENT MODE (the JVM debug agent listening), and this service takes it from there: once the
 * app answers it attaches the debugger (Debug), opens the app on the configuration's [LaunchTarget],
 * and — after every HotSwap — asks the backend to re-render the open screen (`POST
 * /mateu/dev/reload`). Spec edits (YAML, or the visual editor's canvas, which writes the same files)
 * reach the open screen by themselves: the backend watches the sources. The running app can also be
 * opened on any other target ([OpenMateuAppInAction]) without restarting it.
 */
@Service(Service.Level.PROJECT)
class MateuLiveService(private val project: Project) {

    @Volatile var running: ProcessHandler? = null
        private set

    @Volatile var appUrl: String? = null
        private set

    @Volatile var plan: LiveRunPlan? = null
        private set

    private val scheduler = Executors.newSingleThreadScheduledExecutor { r ->
        Thread(r, "mateu-live").apply { isDaemon = true }
    }

    @Volatile private var hotSwapHooked = false

    /** Whether a launched app is still running. */
    val isRunning: Boolean get() = running?.isProcessTerminated == false

    /** A [MateuAppRunConfiguration] started [handler]: wait for the app, then debug and open it. */
    fun launched(handler: ProcessHandler, plan: LiveRunPlan, target: LaunchTarget, debug: Boolean) {
        running?.takeIf { it !== handler && !it.isProcessTerminated }?.destroyProcess()
        running = handler
        this.plan = plan
        if (plan.framework == Framework.STATIC_BUNDLE) {
            // the dev goal moves to the next free port when 3000 is taken: wait for the URL it logs —
            // polling 3000 meanwhile could find ANOTHER server there and open it
            appUrl = null
            handler.addProcessListener(object : ProcessListener {
                override fun onTextAvailable(event: ProcessEvent, outputType: Key<*>) {
                    BUNDLE_SERVING_LINE.find(event.text)?.let { appUrl = it.groupValues[1] }
                }
            })
        } else {
            appUrl = plan.appUrl
            hookHotSwap()
        }
        if (debug && plan.debugPort == null) {
            notify("A static bundle has no backend to debug: debug its UI with the browser's developer tools.",
                NotificationType.INFORMATION)
        }
        val deadline = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(5)
        scheduler.schedule(object : Runnable {
            override fun run() {
                if (handler.isProcessTerminated) return
                val url = appUrl
                if (url == null || !MateuDevClient.answers(url)) {
                    if (System.currentTimeMillis() < deadline) scheduler.schedule(this, 1, TimeUnit.SECONDS)
                    else notify("The Mateu app did not answer at ${url ?: plan.appUrl} within 5 minutes.", NotificationType.WARNING)
                    return
                }
                ApplicationManager.getApplication().invokeLater {
                    if (debug) plan.debugPort?.let(::attachDebugger)
                    open(target)
                }
            }
        }, 1, TimeUnit.SECONDS)
    }

    /** Opens the running app on [target]. */
    fun open(target: LaunchTarget) {
        val url = appUrl ?: return
        val framework = plan?.framework ?: Framework.UNKNOWN
        target.unsupportedReason(framework)?.let { notify(it, NotificationType.WARNING); return }
        when (target) {
            LaunchTarget.WEB -> BrowserUtil.browse(url)
            LaunchTarget.DESKTOP -> openOnDesktop(url)
            LaunchTarget.ANDROID_EMULATOR, LaunchTarget.IOS_SIMULATOR -> openOnSimulator(target, url)
            LaunchTarget.PHONE -> openOnPhone(url)
        }
    }

    /**
     * The Mateu desktop app — a SEPARATE IntelliJ with its own window — opens the running app: the IDE
     * hands the OS the hub's add link (`mateu://add?u=<url>`), the app confirms it (domain shown) and
     * opens the UI. This IDE's settings are not touched. When no desktop app is installed: say so, with
     * the download and the old way (this IDE's Mateu tool window) one click away — never silently.
     */
    private fun openOnDesktop(url: String) {
        val os = DesktopApp.osOf()
        val link = DesktopApp.linkOf(url)
        ApplicationManager.getApplication().executeOnPooledThread {
            val installed = DesktopApp.handlerProbeOf(os)?.let { probe ->
                runCatching { CapturingProcessHandler(GeneralCommandLine(probe)).runProcess(15_000) }
                    .map { DesktopApp.handlerFound(os, if (it.isTimeout) -1 else it.exitCode, it.stdout) }
                    .getOrDefault(false)
            } ?: false
            val opened = installed && DesktopApp.openCommandOf(os, link)?.let { command ->
                runCatching { CapturingProcessHandler(GeneralCommandLine(command)).runProcess(15_000) }
                    .map { !it.isTimeout && it.exitCode == 0 }
                    .getOrDefault(false)
            } == true
            if (!opened) ApplicationManager.getApplication().invokeLater { offerDesktopApp(url, installed) }
        }
    }

    /** No desktop app took the link: download it, or open the app in this IDE's Mateu tool window. */
    private fun offerDesktopApp(url: String, installed: Boolean) {
        val text = if (installed) {
            "The Mateu desktop app did not open $url."
        } else {
            "The Mateu desktop app is not installed: it opens the app in a window of its own (a separate IntelliJ)."
        }
        NotificationGroupManager.getInstance().getNotificationGroup("Mateu")
            .createNotification(text, NotificationType.INFORMATION)
            .addAction(NotificationAction.createSimpleExpiring("Download the Mateu desktop app") {
                BrowserUtil.browse(DesktopApp.DOWNLOAD_URL)
            })
            .addAction(NotificationAction.createSimpleExpiring("Open in this IDE instead") { openInThisIde(url) })
            .notify(project)
    }

    /** The Mateu tool window of THIS IDE, pointed at the running app (and reconnected when it pointed elsewhere). */
    private fun openInThisIde(url: String) {
        val state = MateuSettings.getInstance(project).state
        if (state.baseUrl != url || state.registryUrl.isNotBlank()) {
            state.baseUrl = url
            state.registryUrl = ""
            notify("Settings | Tools | Mateu now points at the running app ($url).", NotificationType.INFORMATION)
        }
        project.service<MateuProjectService>().reconnect()
        ToolWindowManager.getInstance(project).getToolWindow("Mateu")?.let {
            it.isAvailable = true
            it.activate(null)
        }
    }

    /** `adb … am start` / `xcrun simctl openurl`: the Mateu app's add link, on the running simulator. */
    private fun openOnSimulator(target: LaunchTarget, url: String) {
        val command = simulatorCommandOf(target, url, adbOf()) ?: return
        ApplicationManager.getApplication().executeOnPooledThread {
            val output = runCatching { CapturingProcessHandler(GeneralCommandLine(command)).runProcess(30_000) }
            val failure = output.fold(
                onSuccess = { out ->
                    when {
                        out.isTimeout -> "it did not answer in 30 s"
                        out.exitCode != 0 || "Error" in out.stderr || "Error" in out.stdout ->
                            (out.stderr.ifBlank { out.stdout }).trim().ifBlank { "exit code ${out.exitCode}" }
                        else -> null
                    }
                },
                onFailure = { it.message ?: it.toString() },
            )
            if (failure == null) {
                notify("Opened in the Mateu app on the ${target.label}.", NotificationType.INFORMATION)
            } else {
                val help = if (target == LaunchTarget.ANDROID_EMULATOR) {
                    "Start an emulator (Android Studio › Device Manager) with a development build of the Mateu app, " +
                        "and make sure adb is on the PATH or ANDROID_HOME is set."
                } else {
                    "Boot a simulator (Xcode › Open Developer Tool › Simulator) with a development build of the Mateu app."
                }
                notify("Could not open the app on the ${target.label} (${command.first()}): $failure. $help",
                    NotificationType.WARNING)
            }
        }
    }

    /** A dialog with the QR code a phone's camera scans to add the app. */
    private fun openOnPhone(url: String) {
        val lan = lanAddressOf()
        if (lan == null) {
            notify("This machine has no address on a local network: a phone cannot reach the app.", NotificationType.WARNING)
            return
        }
        PhoneLinkDialog(project, universalLinkOf(lanUrlOf(url, lan))).show()
    }

    /** Remote JVM Debug to the app's agent: the session HotSwap works through. */
    private fun attachDebugger(port: Int) {
        runCatching {
            val runManager = RunManager.getInstance(project)
            val name = "Mateu (live) debugger"
            val settings = runManager.findConfigurationByName(name)
                ?: runManager.createConfiguration(name, RemoteConfigurationType::class.java).also {
                    runManager.addConfiguration(it)
                }
            (settings.configuration as? RemoteConfiguration)?.apply {
                HOST = "localhost"
                PORT = port.toString()
                SERVER_MODE = false
                USE_SOCKET_TRANSPORT = true
            }
            ProgramRunnerUtil.executeConfiguration(settings, DefaultDebugExecutor.getDebugExecutorInstance())
        }.onFailure {
            notify("Could not attach the debugger on port $port: ${it.message}", NotificationType.WARNING)
        }
    }

    /** After a HotSwap the code is new but nothing on screen asked for it: re-render the screen. */
    private fun hookHotSwap() {
        if (hotSwapHooked) return
        hotSwapHooked = true
        runCatching {
            HotSwapUI.getInstance(project).addListener(HotSwapVetoableListener {
                // Called as the swap starts; the classes are redefined right after. Give it a moment.
                val url = appUrl
                if (url != null && isRunning) {
                    scheduler.schedule({ MateuDevClient.reload(url) }, 1500, TimeUnit.MILLISECONDS)
                }
                true
            })
        }
    }

    /** Re-render the screen open in the browsers now (the manual trigger). */
    fun reloadScreen(): Boolean {
        val url = appUrl ?: io.mateu.ijp.plugin.loadMateuConfig(project).baseUrl
        val ok = MateuDevClient.reload(url)
        if (!ok) {
            notify("No Mateu backend in development mode answered at $url (start it with " +
                "Run Mateu App (live), or with -Dmateu.dev=true).", NotificationType.WARNING)
        }
        return ok
    }

    private fun notify(text: String, type: NotificationType) {
        NotificationGroupManager.getInstance().getNotificationGroup("Mateu")
            .createNotification(text, type).notify(project)
    }

    companion object {
        fun getInstance(project: Project): MateuLiveService = project.getService(MateuLiveService::class.java)
    }
}

/**
 * Run | Run Mateu App (live): debugs the project's "Mateu App" run configuration (created on first
 * use, opening on the web) — the app in development mode, debugger attached, opened. Pick another
 * target (desktop, emulator, simulator, phone) in Run | Edit Configurations….
 */
class RunMateuLiveAction : AnAction() {
    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.BGT

    override fun update(e: AnActionEvent) {
        e.presentation.isEnabledAndVisible = e.project?.basePath != null
    }

    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val runManager = RunManager.getInstance(project)
        val settings = runManager.allSettings.firstOrNull { it.configuration is MateuAppRunConfiguration }
            ?: runManager.createConfiguration("Mateu App", MateuAppConfigurationType::class.java).also {
                runManager.addConfiguration(it)
            }
        runManager.selectedConfiguration = settings
        ProgramRunnerUtil.executeConfiguration(settings, DefaultDebugExecutor.getDebugExecutorInstance())
    }
}

/** Run | Open Mateu App In…: the RUNNING app on another target, without restarting it. */
class OpenMateuAppInAction : AnAction() {
    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.BGT

    override fun update(e: AnActionEvent) {
        val project = e.project
        e.presentation.isVisible = project != null
        e.presentation.isEnabled = project != null && MateuLiveService.getInstance(project).isRunning
    }

    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val service = MateuLiveService.getInstance(project)
        val plan = service.plan
        val framework = plan?.framework ?: Framework.UNKNOWN
        // the phone needs the app listening on the network, which only a launch decides
        val lan = plan != null && reachableFromLan(plan)
        val targets = LaunchTarget.entries.filter { (lan || !it.needsLan) && it.unsupportedReason(framework) == null }
        val step = object : BaseListPopupStep<LaunchTarget>("Open Mateu App In", targets) {
            override fun onChosen(selectedValue: LaunchTarget, finalChoice: Boolean): PopupStep<*>? {
                ApplicationManager.getApplication().invokeLater { service.open(selectedValue) }
                return FINAL_CHOICE
            }
        }
        JBPopupFactory.getInstance().createListPopup(step).showCenteredInCurrentWindow(project)
    }
}

/** Run | Reload Mateu Screen: `POST /mateu/dev/reload` — what the IDE also does after a HotSwap. */
class ReloadMateuScreenAction : AnAction() {
    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.BGT

    override fun update(e: AnActionEvent) {
        e.presentation.isEnabledAndVisible = e.project != null
    }

    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        ApplicationManager.getApplication().executeOnPooledThread {
            MateuLiveService.getInstance(project).reloadScreen()
        }
    }
}
