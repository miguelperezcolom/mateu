package io.mateu.ijp.starter

import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.openapi.application.ApplicationStarter
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.util.Properties
import javax.swing.JFrame
import javax.swing.SwingUtilities
import javax.swing.WindowConstants

/**
 * Entry point for the Mateu renderer running on the **full IntelliJ Platform**. Launched with the
 * `mateu` command (`runIde --args mateu`), the platform boots a real Application first — so platform
 * services (JBPopupFactory, real L&F, scale, etc.) are all available — and then hands control here.
 *
 * Unlike the lightweight standalone, there is no hand-rolled bootstrap: we just read the backend
 * config, build the session + window and kick off the initial load. Rendering reuses the same
 * framework-agnostic renderers.
 */
class MateuStarter : ApplicationStarter {

    override val commandName: String get() = "mateu"

    override val isHeadless: Boolean get() = false

    override fun main(args: List<String>) {
        val props = loadProperties()
        val baseUrl = props.getProperty("mateu.baseUrl", "http://localhost:8080")
        val route = props.getProperty("mateu.route", "/")
        val config = parseConfig(props.getProperty("mateu.config", "{}"))

        val session = AppSession(baseUrl, config)
        val ctx = AppContext(session)

        SwingUtilities.invokeLater {
            val root = ctx.newSlot()
            ctx.contentPane = root

            val frame = JFrame("Mateu").apply {
                defaultCloseOperation = WindowConstants.DISPOSE_ON_CLOSE
                contentPane = root
                setSize(1280, 800)
                setLocationRelativeTo(null)
                isVisible = true
            }
            session.frame = frame

            ctx.initialLoad(route)
        }
    }

    private fun loadProperties(): Properties {
        val props = Properties()
        javaClass.getResourceAsStream("/application.properties")?.use { props.load(it) }
        return props
    }

    private fun parseConfig(json: String): Map<String, Any?> = try {
        if (json.isBlank()) {
            emptyMap()
        } else {
            @Suppress("UNCHECKED_CAST")
            ObjectMapper().readValue(json, Map::class.java) as Map<String, Any?>
        }
    } catch (e: Exception) {
        System.err.println("[Mateu] invalid mateu.config: ${e.message}")
        emptyMap()
    }
}
