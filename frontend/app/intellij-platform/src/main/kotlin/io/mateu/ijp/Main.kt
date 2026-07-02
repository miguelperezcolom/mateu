package io.mateu.ijp

import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.bootstrap.PlatformBootstrap
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.util.Properties
import javax.swing.JFrame
import javax.swing.SwingUtilities
import javax.swing.WindowConstants

/**
 * Entry point: boot the IntelliJ Platform UI runtime, read the backend config from
 * `application.properties`, build the session + window, and kick off the initial load. The returned
 * App shell renders into the frame's content slot and drives all further navigation.
 */
fun main() {
    PlatformBootstrap.boot()

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
            defaultCloseOperation = WindowConstants.EXIT_ON_CLOSE
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
    object {}.javaClass.getResourceAsStream("/application.properties")?.use { props.load(it) }
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
