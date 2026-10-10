package io.mateu.ijp.live

import com.intellij.debugger.ui.HotSwapUI
import com.intellij.debugger.ui.HotSwapVetoableListener
import com.intellij.execution.ProgramRunnerUtil
import com.intellij.execution.RunManager
import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.execution.executors.DefaultDebugExecutor
import com.intellij.execution.process.KillableColoredProcessHandler
import com.intellij.execution.process.ProcessHandler
import com.intellij.execution.remote.RemoteConfiguration
import com.intellij.execution.remote.RemoteConfigurationType
import com.intellij.execution.RunContentExecutor
import com.intellij.ide.BrowserUtil
import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.Service
import com.intellij.openapi.project.Project
import io.mateu.ijp.plugin.MateuSettings
import java.io.File
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

/**
 * Live development of a Mateu app from the IDE: one action starts the project's app in DEVELOPMENT
 * MODE with the debug agent listening, attaches the debugger (so code changes HotSwap), opens the
 * running app, and — after every HotSwap — asks the backend to re-render the open screen
 * (`POST /mateu/dev/reload`). Spec edits (YAML, or the visual editor's canvas, which writes the same
 * files) reach the open screen by themselves: the backend watches the sources.
 */
@Service(Service.Level.PROJECT)
class MateuLiveService(private val project: Project) {

    @Volatile var running: ProcessHandler? = null
        private set

    @Volatile var appUrl: String? = null
        private set

    private val scheduler = Executors.newSingleThreadScheduledExecutor { r ->
        Thread(r, "mateu-live").apply { isDaemon = true }
    }

    @Volatile private var hotSwapHooked = false

    fun start() {
        val root = project.basePath?.let(::File) ?: return
        val module = appModuleOf(root)
        val plan = liveRunPlanOf(module, root)
        if (plan == null) {
            notify("No pom.xml or build.gradle found under ${root.path}: nothing to run.", NotificationType.WARNING)
            return
        }
        running?.takeIf { !it.isProcessTerminated }?.destroyProcess()
        val commandLine = GeneralCommandLine(plan.command)
            .withWorkDirectory(plan.workDir)
            .withEnvironment(plan.environment)
            .withParentEnvironmentType(GeneralCommandLine.ParentEnvironmentType.CONSOLE)
        val handler = KillableColoredProcessHandler(commandLine)
        running = handler
        appUrl = plan.appUrl
        RunContentExecutor(project, handler)
            .withTitle("Mateu (live)")
            .withActivateToolWindow(true)
            .run()
        notify(
            "Starting the ${plan.framework.label} app in development mode (${plan.command.joinToString(" ")}). " +
                "Specs are watched; HotSwap re-renders the open screen.",
            NotificationType.INFORMATION,
        )
        hookHotSwap()
        // Once the app answers: attach the debugger (HotSwap) and open it.
        val deadline = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(5)
        scheduler.execute(object : Runnable {
            override fun run() {
                if (handler.isProcessTerminated) return
                if (!MateuDevClient.answers(plan.appUrl)) {
                    if (System.currentTimeMillis() < deadline) scheduler.schedule(this, 1, TimeUnit.SECONDS)
                    return
                }
                ApplicationManager.getApplication().invokeLater {
                    attachDebugger(plan.debugPort)
                    pointTheIdeAt(plan.appUrl)
                    BrowserUtil.browse(plan.appUrl)
                }
            }
        })
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

    /** The plugin's app tool window and the visual editor's Play follow the project's base URL. */
    private fun pointTheIdeAt(url: String) {
        val state = MateuSettings.getInstance(project).state
        if (state.baseUrl.isBlank() && state.registryUrl.isBlank()) {
            state.baseUrl = url
            notify("Settings | Tools | Mateu now points at the running app ($url): the Mateu tool window " +
                "and the visual editor's Play use it.", NotificationType.INFORMATION)
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
                if (url != null && running?.isProcessTerminated == false) {
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

/** Run | Run Mateu App (live): the app in development mode, debugger attached, opened. */
class RunMateuLiveAction : AnAction() {
    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.BGT

    override fun update(e: AnActionEvent) {
        e.presentation.isEnabledAndVisible = e.project?.basePath != null
    }

    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        MateuLiveService.getInstance(project).start()
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
