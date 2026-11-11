package io.mateu.ijp.plugin

import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.progress.PerformInBackgroundOption
import com.intellij.openapi.progress.ProgressIndicator
import com.intellij.openapi.progress.ProgressManager
import com.intellij.openapi.progress.Task
import io.mateu.ijp.api.ServerActivity
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

/**
 * While the app waits for a server ([ServerActivity]), the IDE's own background-progress indicator
 * in the status bar says so — the same one indexing and builds use, so the user already knows it and
 * can hide or show it like any other (status bar ▸ widgets, or the Background Tasks popup). Shown only
 * when a wait lasts [DELAY_MS]: a quick answer does not make it flicker. Not cancellable: the request
 * belongs to the screen (a long-running server task has its own cancellable task, see
 * [MateuPlatformNotices]).
 */
internal object MateuServerProgress {
    const val DELAY_MS = 150L

    private val installed = AtomicBoolean(false)
    private val showing = AtomicBoolean(false)
    private val timer = Executors.newSingleThreadScheduledExecutor { r -> Thread(r, "mateu-server-progress").apply { isDaemon = true } }

    fun install() {
        if (!installed.compareAndSet(false, true)) return
        ServerActivity.addListener {
            timer.schedule({ if (ServerActivity.busy) show() }, DELAY_MS, TimeUnit.MILLISECONDS)
        }
    }

    private fun show() {
        if (!showing.compareAndSet(false, true)) return
        ApplicationManager.getApplication().invokeLater {
            // the window the user is in: a task with no project never reached a project frame's status bar
            val project = com.intellij.openapi.wm.IdeFocusManager.getGlobalInstance().lastFocusedFrame?.project
                ?: com.intellij.openapi.project.ProjectManager.getInstance().openProjects.firstOrNull()
            val task = object : Task.Backgroundable(project, "Mateu: waiting for the server", false, PerformInBackgroundOption.ALWAYS_BACKGROUND) {
                override fun run(indicator: ProgressIndicator) {
                    indicator.isIndeterminate = true
                    try {
                        // one task for the whole busy period: several requests in a row are one wait
                        while (ServerActivity.busy) {
                            indicator.text2 = ServerActivity.lastLabel
                            Thread.sleep(100)
                        }
                    } finally {
                        showing.set(false)
                        // a request that started while this one was finishing gets its own indicator
                        if (ServerActivity.busy) timer.schedule({ if (ServerActivity.busy) show() }, DELAY_MS, TimeUnit.MILLISECONDS)
                    }
                }
            }
            ProgressManager.getInstance().run(task)
        }
    }
}
