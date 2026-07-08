package io.mateu.ijp.debug

import com.intellij.ui.scale.JBUIScale
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.image.BufferedImage
import java.io.File
import javax.imageio.ImageIO
import javax.swing.JComponent
import javax.swing.JFrame
import javax.swing.JTable
import javax.swing.SwingUtilities
import javax.swing.UIManager

/**
 * Dev-only render probe: feeds a captured UIIncrement JSON (e.g. a `curl` of the sync endpoint)
 * through the REAL renderer pipeline (AppContext.applyIncrement → ComponentRenderer) without
 * booting an IDE, then prints a component-tree summary and writes a PNG of the rendered panel.
 * Run with `./gradlew renderProbe -Pprobe.json=/path/to/increment.json [-Pprobe.png=/path/out.png]`.
 *
 * The lightweight platform bootstrap (paths + scale + L&F, no Application) comes from the removed
 * standalone renderer's PlatformBootstrap — enough for Swing/JB components to construct and paint.
 */
fun main() {
    bootstrap()

    val jsonPath = System.getProperty("probe.json") ?: error("-Dprobe.json=<increment.json> required")
    val pngPath = System.getProperty("probe.png") ?: "$jsonPath.png"

    val session = AppSession(System.getProperty("probe.baseUrl") ?: "http://localhost:8592")
    val ctx = AppContext(session)
    val panel = ctx.newSlot()
    ctx.contentPane = panel
    ctx.silentErrors = true

    val increment = session.mapper.readTree(File(jsonPath))
    SwingUtilities.invokeAndWait { ctx.applyIncrement(increment) }
    // loadServerSideComponent defers its putChildren via invokeLater; drain a few EDT hops.
    repeat(3) { Thread.sleep(200); SwingUtilities.invokeAndWait {} }

    SwingUtilities.invokeAndWait {
        val frame = JFrame("probe")
        frame.defaultCloseOperation = JFrame.DISPOSE_ON_CLOSE
        frame.contentPane.add(panel)
        frame.setSize(1200, 900)
        frame.isVisible = true
        frame.validate()

        println("=== component tree ===")
        dump(panel, 0)

        val img = BufferedImage(frame.width, frame.height, BufferedImage.TYPE_INT_RGB)
        val g = img.createGraphics()
        frame.contentPane.paint(g)
        g.dispose()
        ImageIO.write(img, "png", File(pngPath))
        println("=== png written to $pngPath ===")
        frame.dispose()
    }
    session.executor.shutdownNow()
}

private fun dump(c: JComponent, depth: Int) {
    val extra = when (c) {
        is JTable -> " rows=${c.rowCount} cols=${c.columnCount} " +
            (0 until c.rowCount).joinToString(" | ") { r ->
                (0 until c.columnCount).joinToString(",") { col -> "${c.getValueAt(r, col)}" }
            }
        is javax.swing.JLabel -> " text='${c.text}'"
        is javax.swing.text.JTextComponent -> " text='${c.text.take(40)}'"
        else -> ""
    }
    println("  ".repeat(depth) + c.javaClass.simpleName + " [${c.width}x${c.height}]" + extra)
    for (child in c.components) if (child is JComponent) dump(child, depth + 1)
}

private fun bootstrap() {
    System.setProperty("java.awt.headless", "false")
    val base = java.nio.file.Files.createTempDirectory("mateu-probe").toFile()
    fun sub(name: String) = File(base, name).apply { mkdirs() }.absolutePath
    System.setProperty("idea.home.path", base.absolutePath)
    System.setProperty("idea.config.path", sub("config"))
    System.setProperty("idea.system.path", sub("system"))
    System.setProperty("idea.plugins.path", sub("plugins"))
    System.setProperty("idea.log.path", sub("log"))
    runCatching {
        JBUIScale.setSystemScaleFactor(1f)
        JBUIScale.setUserScaleFactor(1f)
    }.onFailure { System.err.println("[probe] scale precompute failed: $it") }
    runCatching {
        val laf = Class.forName("com.intellij.ide.ui.laf.darcula.DarculaLaf")
            .getDeclaredConstructor().newInstance() as javax.swing.LookAndFeel
        UIManager.setLookAndFeel(laf)
    }.onFailure { System.err.println("[probe] Darcula failed (${it.message}), default L&F") }
}
