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
 * `probe.json` may also be a FOLDER of increments (batch: `probe.png` is then the output folder,
 * one PNG + one tree dump per file). A `probe.properties` beside the input (`theme=light` paints under IntelliJ Light,
 * `size=1440x900` sets the frame) — or env `MATEU_PROBE_THEME` / `MATEU_PROBE_SIZE`.
 *
 * The lightweight platform bootstrap (paths + scale + L&F, no Application) comes from the removed
 * standalone renderer's PlatformBootstrap — enough for Swing/JB components to construct and paint.
 */
/** Options of a batch folder's `probe.properties` (theme=light|dark, size=WxH), else the env. */
private val options = java.util.Properties()

private fun option(key: String, env: String): String? = options.getProperty(key) ?: System.getenv(env)

fun main() {
    val jsonPath = System.getProperty("probe.json") ?: error("-Dprobe.json=<increment.json> required")
    val input = File(jsonPath)
    // The gradle daemon does not hand a NEW env var to the probe JVM, so a batch folder may carry
    // its options in a probe.properties file instead.
    File(if (input.isDirectory) input else input.absoluteFile.parentFile, "probe.properties").takeIf { it.isFile }
        ?.reader()?.use { options.load(it) }
    // `locale=en`: the app's locale (AppDto.locale) a captured SCREEN does not carry — in the IDE
    // the app shell sets it; without it money and dates followed the probe JVM's locale
    option("locale", "MATEU_PROBE_LOCALE")?.let { io.mateu.ijp.ui.MoneyValues.setAppLocale(it) }
    bootstrap()
    if (input.isDirectory) {
        // Batch mode: every *.json in the folder → <out>/<name>.png + <name>.txt (the tree dump), in
        // one JVM — a gradle start per screen costs ~40 s. probe.png names the output folder.
        val out = File(System.getProperty("probe.png") ?: input.absolutePath).apply { mkdirs() }
        val realOut = System.out
        for (file in input.listFiles { f -> f.name.endsWith(".json") }!!.sortedBy { it.name }) {
            val base = file.nameWithoutExtension
            val txt = java.io.PrintStream(File(out, "$base.txt"))
            System.setOut(txt)
            runCatching { renderOne(file, File(out, "$base.png").absolutePath) }
                .onFailure { it.printStackTrace(txt) }
            txt.close()
            System.setOut(realOut)
            println("rendered $base")
        }
    } else {
        renderOne(input, System.getProperty("probe.png") ?: "$jsonPath.png")
    }
    kotlin.system.exitProcess(0)
}

private fun renderOne(jsonFile: File, pngPath: String) {
    val session = AppSession(System.getProperty("probe.baseUrl") ?: io.mateu.ijp.plugin.DEFAULT_BASE_URL)
    val ctx = AppContext(session)
    val panel = ctx.newSlot()
    ctx.contentPane = panel
    ctx.silentErrors = true
    // -Dprobe.nativeToolbar=true simulates an IDE host (editor tab / tool window): toolbar buttons
    // publish into ctx.viewActions instead of rendering inline; they're printed after the tree.
    ctx.nativeToolbarHost = System.getProperty("probe.nativeToolbar") == "true"

    val increment = session.mapper.readTree(jsonFile)
    SwingUtilities.invokeAndWait { ctx.applyIncrement(increment) }
    // loadServerSideComponent defers its putChildren via invokeLater; drain a few EDT hops.
    repeat(4) { Thread.sleep(250); SwingUtilities.invokeAndWait {} }

    // -Dprobe.followUp=<json>: a second increment applied on top (e.g. an action's response),
    // to exercise in-place updates (state-only merges, toolbar republish…).
    System.getProperty("probe.followUp")?.let { followUp ->
        val second = session.mapper.readTree(File(followUp))
        SwingUtilities.invokeAndWait { ctx.applyIncrement(second) }
        repeat(3) { Thread.sleep(200); SwingUtilities.invokeAndWait {} }
    }
    // MATEU_PROBE_SIZE=WxH (env: the gradle task forwards only fixed properties).
    val (w, h) = (option("size", "MATEU_PROBE_SIZE") ?: "1200x900").split("x").map { it.trim().toInt() }

    lateinit var frame: JFrame
    SwingUtilities.invokeAndWait {
        frame = JFrame("probe")
        frame.defaultCloseOperation = JFrame.DISPOSE_ON_CLOSE
        // the IDE's frames carry an IdeGlassPane the platform splitters need (see ProbeGlassPane)
        frame.glassPane = ProbeGlassPane()
        // hosted as a view is in the IDE (MateuViewManager): a page taller than the window SCROLLS,
        // it is not squeezed to the frame — which the screen caps (a 2400px frame came out 854px)
        frame.contentPane.add(com.intellij.ui.components.JBScrollPane(io.mateu.ijp.plugin.FillOrScrollPanel(panel)))
        frame.setSize(w, h)
        frame.isVisible = true
        frame.validate()
    }
    // `settleMs=6000`: what arrives AFTER the first paint (islands, micro frontends, rows of a search,
    // images) is laid out on a shown frame, as in the IDE, before the tree is dumped
    val settle = option("settleMs", "MATEU_PROBE_SETTLE_MS")?.toLongOrNull() ?: 0L
    var waited = 0L
    while (waited < settle) { Thread.sleep(250); waited += 250; SwingUtilities.invokeAndWait {} }
    SwingUtilities.invokeAndWait {
        frame.validate()

        println("=== component tree ===")
        dump(panel, 0)
        if (ctx.nativeToolbarHost) {
            println("=== published view actions ===")
            ctx.viewActions.forEach { println("  $it") }
        }
        println("=== dirty chain: trackDirty=${ctx.trackDirty} dirty=${ctx.dirty}")

        // the whole page (as tall as it lays out, up to the configured height), not the visible window
        val img = BufferedImage(panel.width.coerceAtLeast(1), panel.height.coerceIn(1, maxOf(h, frame.height)), BufferedImage.TYPE_INT_RGB)
        val g = img.createGraphics()
        g.color = panel.background ?: java.awt.Color.WHITE
        g.fillRect(0, 0, img.width, img.height)
        panel.paint(g)
        g.dispose()
        ImageIO.write(img, "png", File(pngPath))
        println("=== png written to $pngPath ===")
        frame.dispose()
    }
    // Overlays (drawer dialogs) may keep displayable windows around — capture them first, then close.
    SwingUtilities.invokeAndWait {
        for (w in java.awt.Window.getWindows()) {
            if (w.isVisible && w !is JFrame) {
                println("=== overlay window: ${w.javaClass.simpleName} '${(w as? java.awt.Dialog)?.title}' ${w.width}x${w.height} ===")
                (w as? javax.swing.RootPaneContainer)?.let { rpc ->
                    val img = BufferedImage(w.width.coerceAtLeast(1), w.height.coerceAtLeast(1), BufferedImage.TYPE_INT_RGB)
                    val g = img.createGraphics()
                    rpc.contentPane.paint(g)
                    g.dispose()
                    ImageIO.write(img, "png", File("$pngPath.overlay.png"))
                    println("=== overlay png written to $pngPath.overlay.png ===")
                }
            }
            w.dispose()
        }
    }
    session.executor.shutdownNow()
}

private fun dump(c: JComponent, depth: Int) {
    val extra = when (c) {
        is JTable -> " rows=${c.rowCount} cols=${c.columnCount} " +
            (0 until c.rowCount).joinToString(" | ") { r ->
                (0 until c.columnCount).joinToString(",") { col -> "${c.getValueAt(r, col)}" }
            }
        is javax.swing.JComboBox<*> -> " combo items=${c.itemCount} selected='${c.selectedItem}'" +
            (0 until c.itemCount).joinToString(",", " [", "]") { "${c.getItemAt(it)}" }
        is javax.swing.JLabel -> " text='${c.text}'"
        is javax.swing.AbstractButton -> " text='${c.text}'"
        is javax.swing.text.JTextComponent -> " text='${c.text.take(40)}'"
        else -> ""
    }
    // What a screen reader would announce for this component. Printed so the probe verifies the
    // accessibility tree, not only the visual one — a control with no accessible name is
    // indistinguishable from a correct one in a screenshot.
    val name = c.accessibleContext?.accessibleName
    val description = c.accessibleContext?.accessibleDescription
    val labels = (c as? javax.swing.JLabel)?.labelFor?.javaClass?.simpleName
    val a11y = buildString {
        if (!name.isNullOrBlank()) append(" a11yName='$name'")
        if (!description.isNullOrBlank()) append(" a11yDesc='$description'")
        if (labels != null) append(" labelFor=$labels")
    }
    println("  ".repeat(depth) + c.javaClass.simpleName + " [${c.width}x${c.height}]" + extra + a11y)
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
    // Force 1:1 so headless renders are deterministic. Only the system scale is set here — the user
    // scale defaults to 1 in a headless run, and JBUIScale.setUserScaleFactor is @ApiStatus.Internal.
    runCatching {
        System.setProperty("sun.java2d.uiScale", "1.0")
        JBUIScale.setSystemScaleFactor(1f)
    }.onFailure { System.err.println("[probe] scale precompute failed: $it") }
    runCatching {
        // theme=light paints under IntelliJ Light; anything else, dark. The colours live in the
        // platform's theme JSON (themes/expUI/*.theme.json = the New UI, the 2025 default), which a
        // booted IDE applies through LafManager — so the probe applies it itself: without it,
        // IntelliJLaf paints with Darcula's defaults and a "light" render comes out dark.
        val light = option("theme", "MATEU_PROBE_THEME") == "light"
        val lafClass = if (light) "com.intellij.ide.ui.laf.IntelliJLaf" else "com.intellij.ide.ui.laf.darcula.DarculaLaf"
        val laf = Class.forName(lafClass)
            .getDeclaredConstructor().newInstance() as javax.swing.LookAndFeel
        com.intellij.ui.JBColor.setDark(!light)
        UIManager.setLookAndFeel(laf)
        runCatching {
            // UITheme.loadTempThemeFromJson needs a booted Application, so apply the JSON here:
            // the parent theme first, then the New UI one on top.
            val loader = laf.javaClass.classLoader
            val defaults = UIManager.getLookAndFeelDefaults()
            if (light) {
                applyThemeJson(loader, "themes/intellijlaf.theme.json", defaults)
                applyThemeJson(loader, "themes/expUI/expUI_light.theme.json", defaults)
            } else {
                applyThemeJson(loader, "themes/darcula.theme.json", defaults)
                applyThemeJson(loader, "themes/expUI/expUI_dark.theme.json", defaults)
            }
        }.onFailure { System.err.println("[probe] theme JSON not applied (${it.message}); bare L&F colours") }
    }.onFailure {
        // The system L&F (Aqua on macOS) is not module-accessible under newer JDKs, leaving no
        // ComponentUI and a blank render — fall back to the cross-platform (Metal) L&F so the probe
        // still paints on any environment.
        System.err.println("[probe] Darcula failed (${it.message}), cross-platform L&F")
        runCatching { UIManager.setLookAndFeel(UIManager.getCrossPlatformLookAndFeelClassName()) }
    }
}

/**
 * A minimal version of what LafManager does with a `*.theme.json`: the `ui` tree flattened to
 * UIDefaults keys (`Panel: {background: …}` → `Panel.background`), `*` entries applied to every key
 * with that suffix, colour values resolved through the theme's `colors` palette. Only colours,
 * numbers and booleans are applied (border/insets strings are left to the L&F) — enough for the
 * probe to paint a light or dark render that matches the IDE's.
 */
private fun applyThemeJson(loader: ClassLoader, resource: String, defaults: javax.swing.UIDefaults) {
    val mapper = com.fasterxml.jackson.databind.ObjectMapper()
        .enable(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_COMMENTS)
    val root = loader.getResourceAsStream(resource)?.use { mapper.readTree(it) } ?: error("$resource not found")
    val palette = HashMap<String, String>()
    root.path("colors").properties().forEach { (k, v) -> palette[k] = v.asText() }
    fun colorOf(raw: String, depth: Int = 0): java.awt.Color? {
        val v = raw.trim()
        if (v.startsWith("#")) {
            val hex = v.removePrefix("#")
            return when (hex.length) {
                6 -> java.awt.Color(hex.toInt(16))
                8 -> java.awt.Color(hex.substring(0, 6).toInt(16) or (hex.substring(6).toInt(16) shl 24), true)
                else -> null
            }
        }
        return palette[v]?.takeIf { depth < 4 }?.let { colorOf(it, depth + 1) }
    }
    fun valueOf(node: com.fasterxml.jackson.databind.JsonNode): Any? = when {
        node.isBoolean -> node.booleanValue()
        node.isInt -> node.intValue()
        node.isTextual -> colorOf(node.asText())?.let { javax.swing.plaf.ColorUIResource(it) }
        else -> null
    }
    val flat = LinkedHashMap<String, com.fasterxml.jackson.databind.JsonNode>()
    fun flatten(prefix: String, node: com.fasterxml.jackson.databind.JsonNode) {
        if (node.isObject) node.properties().forEach { (k, v) -> flatten(if (prefix.isEmpty()) k else "$prefix.$k", v) }
        else flat[prefix] = node
    }
    flatten("", root.path("ui"))
    val existing = defaults.keys.mapNotNull { it as? String }
    for ((key, node) in flat) {
        if (!key.startsWith("*.")) continue
        val value = valueOf(node) ?: continue
        val suffix = key.substring(1)
        for (k in existing) if (k.endsWith(suffix)) defaults[k] = value
    }
    for ((key, node) in flat) {
        if (key.startsWith("*.")) continue
        valueOf(node)?.let { defaults[key] = it }
    }
}
