package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.Container
import javax.swing.AbstractButton
import javax.swing.JComponent
import javax.swing.JLabel
import javax.swing.JList
import javax.swing.JTable
import javax.swing.text.JTextComponent

/**
 * Renders every wire type added for parity (fixture `coverage/wire-types.json`) through the real
 * dispatcher: no exception, no "Unsupported component" fallback, the expected Swing shape, and an
 * accessible name on every interactive control. (Dialog/Drawer met inline open windows, which a
 * headless test cannot; they are verified with `./gradlew renderProbe` on `inline-overlays.json`.)
 */
class WireTypeRenderTest : BasePlatformTestCase() {

    private val mapper = ObjectMapper()
    private val fixture by lazy {
        mapper.readTree(javaClass.getResourceAsStream("/coverage/wire-types.json"))
            .path("fragments").path(0).path("component")
    }

    private fun render(): Map<String, JComponent> {
        val ctx = AppContext(AppSession("http://127.0.0.1:9"))
        ctx.silentErrors = true
        ctx.contentPane = ctx.newSlot()
        val renderer = ComponentRenderer(ctx)
        val empty = mapper.createObjectNode()
        return fixture.path("children").associate { child ->
            child.path("metadata").text("type") to renderer.render(child, empty, empty)
        }
    }

    private fun all(c: Container): Sequence<java.awt.Component> = sequenceOf<java.awt.Component>(c) +
        c.components.asSequence().flatMap { if (it is Container) all(it) else sequenceOf(it) }

    fun testEveryTypeRendersWithoutTheUnsupportedFallback() {
        val rendered = render()
        assertEquals(fixture.path("children").size(), rendered.size)
        for ((type, widget) in rendered) {
            val unsupported = all(widget).filterIsInstance<JLabel>().firstOrNull { it.text.orEmpty().contains("Unsupported component") }
            assertNull("$type fell back to: ${unsupported?.text}", unsupported)
        }
    }

    fun testShapes() {
        val r = render()
        assertEquals(2, all(r.getValue("Grid")).filterIsInstance<JTable>().single().rowCount)
        assertEquals(2, all(r.getValue("VirtualList")).filterIsInstance<JList<*>>().single().model.size)
        assertTrue(all(r.getValue("Breadcrumbs")).filterIsInstance<JLabel>().any { it.text == "Order 42" })
        assertTrue(all(r.getValue("Bpmn")).filterIsInstance<JLabel>().map { it.text }.toList().containsAll(listOf("○ Start", "↓ ▭ Approve", "↓ ◉ Done")))
        assertEquals("Helpful tip", all(r.getValue("Tooltip")).filterIsInstance<AbstractButton>().single().toolTipText)
        assertNotNull(r.getValue("ContextMenu").componentPopupMenu)
        // a span-aware GridBag grid since the native UX review (IJ-06): 3 columns = cells up to gridx 2
        val grid = r.getValue("ResponsiveGrid")
        val gb = grid.layout as java.awt.GridBagLayout
        assertEquals(3, grid.components.maxOf { gb.getConstraints(it).let { c -> c.gridx + c.gridwidth } })
        // Details starts collapsed; its toggle expands it.
        val details = r.getValue("Details")
        val hidden = all(details).filterIsInstance<JLabel>().first { it.text == "Hidden details" }
        assertFalse(hidden.parent.isVisible && hidden.isShowing)
    }

    fun testInteractiveControlsAreNamed() {
        for ((type, widget) in render()) {
            all(widget).filter { it is AbstractButton || it is JTextComponent || it is JTable || it is JList<*> }
                .filterIsInstance<JComponent>()
                .filter { it !is JTextComponent || it.isEditable }
                .forEach { c ->
                    val name = c.accessibleContext?.accessibleName
                    assertFalse("$type: unnamed ${c.javaClass.simpleName}", name.isNullOrBlank())
                }
        }
    }

    fun testHelpers() {
        assertEquals(3, gridColumnCount("repeat(3, 1fr)"))
        assertEquals(2, gridColumnCount("2fr 1fr"))
        assertEquals(3, gridColumnCount("minmax(10rem, 1fr) 1fr 1fr"))
        assertEquals(2, gridColumnCount(""))
        assertEquals(emptyList<Pair<String, String>>(), bpmnFlowNodes("not xml"))
    }

    companion object {
        /** The 39 types brought to parity (all but Dialog/Drawer are rendered by this test). */
        val COVERED_BY_FIXTURE = setOf(
            "AccordionPanel", "Avatar", "AvatarGroup", "BoardLayout", "BoardLayoutItem", "BoardLayoutRow", "Bpmn",
            "Breadcrumb", "Breadcrumbs", "CarouselLayout", "Chat", "ConfirmDialog", "ContentLayout", "ContextMenu",
            "CookieConsent", "Details", "Dialog", "Directory", "Drawer", "Element", "FormEditor", "FormItem", "Grid",
            "GridColumn", "Icon", "MasterDetailLayout", "MenuBar", "MessageInput", "MessageList", "MicroFrontend",
            "NotFound", "Notification", "ResponsiveGrid", "Result", "Stepper", "Tab", "Tooltip", "VirtualList", "Workflow",
        )
    }
}
