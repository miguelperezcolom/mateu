package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.testFramework.PlatformTestUtil
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import io.mateu.ijp.StubMateuServer
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.Container
import java.awt.Dimension
import java.awt.event.KeyEvent
import java.awt.image.BufferedImage
import javax.swing.AbstractButton
import javax.swing.JComponent
import javax.swing.JLabel

/**
 * Shared harness of the headless render tests: a [StubMateuServer] that records every action the
 * renderer sends, an [AppContext] pointed at it, and helpers to read what a rendered tree shows
 * (labels, buttons, keyboard targets) and to operate it the way a user would.
 */
abstract class RenderTestCase : BasePlatformTestCase() {

    protected val mapper = ObjectMapper()
    protected fun json(s: String): JsonNode = mapper.readTree(s)
    protected lateinit var server: StubMateuServer

    override fun setUp() {
        super.setUp()
        server = StubMateuServer()
    }

    override fun tearDown() {
        try {
            server.close()
        } finally {
            super.tearDown()
        }
    }

    protected fun context(): AppContext {
        val ctx = AppContext(AppSession(server.baseUrl))
        ctx.silentErrors = true
        ctx.contentPane = ctx.newSlot()
        return ctx
    }

    /** Renders one client-side component from its wire metadata (+ optional children/state). */
    protected fun render(ctx: AppContext, metadata: String, children: String = "[]", state: String = "{}"): JComponent =
        ComponentRenderer(ctx).render(
            json("""{"type":"ClientSide","metadata":$metadata,"children":$children}"""), json(state), json("{}"))

    protected fun all(c: Container): Sequence<java.awt.Component> = sequenceOf<java.awt.Component>(c) +
        c.components.asSequence().flatMap { if (it is Container) all(it) else sequenceOf(it) }

    protected fun texts(c: JComponent) = all(c).filterIsInstance<JLabel>().map { it.text.orEmpty() }.toList()

    protected fun buttons(c: JComponent) = all(c).filterIsInstance<AbstractButton>().toList()

    protected fun button(c: JComponent, text: String) = buttons(c).first { it.text == text }

    /** The keyboard-activatable targets (focusable with a key listener, not a real button). */
    protected fun targets(c: JComponent) = all(c).filterIsInstance<JComponent>()
        .filter { it !is AbstractButton && it.isFocusable && it.keyListeners.isNotEmpty() }.toList()

    protected fun press(target: JComponent, key: Int = KeyEvent.VK_ENTER) = target.keyListeners.forEach {
        it.keyPressed(KeyEvent(target, KeyEvent.KEY_PRESSED, 0, 0, key, KeyEvent.CHAR_UNDEFINED))
    }

    protected fun awaitRequests(n: Int) {
        val until = System.currentTimeMillis() + 5_000
        while (server.requests.size < n) {
            PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
            if (System.currentTimeMillis() > until) fail("expected $n requests, got ${server.actionIds()}")
            Thread.sleep(10)
        }
    }

    protected fun lastParameters(): JsonNode = server.requests.last().path("parameters")

    /** Lays the tree out at [size] and paints it into an image, as the IDE would on screen. */
    protected fun paint(c: JComponent, size: Dimension = Dimension(600, 400)): BufferedImage {
        c.size = size
        layoutTree(c)
        val img = BufferedImage(size.width, size.height, BufferedImage.TYPE_INT_ARGB)
        val g = img.createGraphics()
        try {
            c.paint(g)
        } finally {
            g.dispose()
        }
        return img
    }

    private fun layoutTree(c: Container) {
        c.doLayout()
        c.components.forEach { if (it is Container) layoutTree(it) }
    }

    /** Whether any pixel of the image was painted (not fully transparent). */
    protected fun painted(img: BufferedImage): Boolean {
        for (x in 0 until img.width step 2) for (y in 0 until img.height step 2) {
            if ((img.getRGB(x, y) ushr 24) != 0) return true
        }
        return false
    }
}
