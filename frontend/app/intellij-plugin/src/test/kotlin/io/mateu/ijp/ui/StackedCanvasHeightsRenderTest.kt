package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import io.mateu.ijp.StubMateuServer
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.Component
import java.awt.Container
import java.awt.event.ActionEvent
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.JScrollPane
import javax.swing.JTable
import javax.swing.KeyStroke

/**
 * The canvases (Gantt, Kanban, PlanningBoard, MatrixGrid) keep their content height on a LONG
 * page. A page is a vertical BoxLayout of cards; handed less height than its children prefer it
 * shrinks each child towards its minimum, and these four reported a minimum of nothing (an empty
 * layout, two scroll bars) — so they collapsed to a few px while the labels around them kept
 * theirs. Pinned by stacking them between filler cards and laying the page out in a frame far
 * shorter than it needs (the render probe's shape): every canvas must still get its rows.
 */
class StackedCanvasHeightsRenderTest : BasePlatformTestCase() {

    private val mapper = ObjectMapper()
    private fun json(s: String): JsonNode = mapper.readTree(s)
    private lateinit var server: StubMateuServer

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

    private fun context(): AppContext {
        val ctx = AppContext(AppSession(server.baseUrl))
        ctx.silentErrors = true
        ctx.contentPane = ctx.newSlot()
        return ctx
    }

    private fun cs(id: String, metadata: String, children: String = "[]") =
        """{"type":"ClientSide","id":"$id","metadata":$metadata,"children":$children}"""

    private fun card(id: String, title: String, content: String) =
        cs(id, """{"type":"Card","title":"$title","content":$content}""")

    private val gantt = """{"type":"Gantt","onTaskSelectionActionId":"sel","tasks":[""" + (0 until 6).joinToString(",") {
        """{"id":"t$it","title":"Task $it","start":"2026-10-0${1 + it}","end":"2026-10-1${it}","progress":30}"""
    } + "]}"

    private val kanban = """{"type":"Kanban","columns":[""" + listOf("Todo", "Doing", "Done").joinToString(",") { c ->
        """{"title":"$c","cards":[""" + (0 until 4).joinToString(",") { """{"title":"$c card $it","description":"desc","actionId":"a$it"}""" } + "]}"
    } + "]}"

    private val planning = """{"type":"PlanningBoard","from":"2026-10-01","to":"2026-10-14","resources":[""" +
        (0 until 6).joinToString(",") { """{"id":"r$it","label":"Room $it","group":"${if (it < 3) "Floor 1" else "Floor 2"}"}""" } +
        """],"blocks":[""" +
        (0 until 6).joinToString(",") { """{"id":"b$it","resourceId":"r$it","start":"2026-10-0${2 + it}","end":"2026-10-1${it}","label":"Guest $it","color":"#3366cc"}""" } +
        "]}"

    private val matrix = """{"type":"MatrixGrid","rowHeaderLabel":"Type","columns":[""" +
        (1..7).joinToString(",") { """{"id":"d$it","label":"Oct $it","group":"October"}""" } +
        """],"sections":[{"id":"rooms","title":"Rooms","collapsed":false,"rows":[""" +
        (1..6).joinToString(",") { r -> """{"id":"row$r","label":"Row $r","cells":[""" + (1..7).joinToString(",") { """{"value":"${r * it}"}""" } + "]}" } +
        "]}]}"

    /** Four filler cards, the four canvases, four more fillers: far taller than the frame below. */
    private fun longPage(): String {
        val fillers = { from: Int -> (from until from + 4).map { card("f$it", "Filler $it", cs("ft$it", """{"type":"Text","text":"Some filler text line"}""")) } }
        val children = fillers(0) +
            listOf(card("cg", "Gantt", cs("g", gantt)), card("ck", "Kanban", cs("k", kanban)),
                card("cp", "Planning", cs("p", planning)), card("cm", "Matrix", cs("m", matrix))) +
            fillers(4)
        return cs("page", """{"type":"Page","title":"Long page"}""",
            "[" + cs("v", """{"type":"VerticalLayout","spacing":true}""", children.joinToString(",", "[", "]")) + "]")
    }

    private fun all(c: Component): Sequence<Component> = sequenceOf(c) +
        ((c as? Container)?.components?.asSequence()?.flatMap { all(it) } ?: emptySequence())

    /** Lays [root] out at [width]x[height] without a window — a headless `validate`. */
    private fun layOut(root: JComponent, width: Int, height: Int) {
        root.setSize(width, height)
        all(root).forEach { it.doLayout() }
        all(root).forEach { it.doLayout() } // a second pass: scroll panes size their bars from the first
    }

    private fun rendered(): JComponent {
        val ctx = context()
        val view = ComponentRenderer(ctx).render(json(longPage()), json("{}"), json("{}"))
        val frame = JPanel(java.awt.BorderLayout())
        frame.add(view, java.awt.BorderLayout.CENTER)
        layOut(frame, 1200, 600)
        return view
    }

    private fun named(view: JComponent, prefix: String) =
        all(view).first { (it as? JComponent)?.accessibleContext?.accessibleName?.startsWith(prefix) == true } as JComponent

    fun testGanttKeepsARowPerTaskOnALongPage() {
        val gantt = named(rendered(), "Gantt — Task 0")
        assertTrue("gantt height ${gantt.height}", gantt.height >= 6 * 26)
    }

    fun testPlanningBoardKeepsItsLanesOnALongPage() {
        val view = rendered()
        val canvas = all(view).first { it.javaClass.simpleName == "PlanningBoardCanvas" }
        val scroll = generateSequence<Component>(canvas) { it.parent }.first { it is JScrollPane } as JScrollPane
        assertTrue("canvas ${canvas.preferredSize.height} in scroll ${scroll.height}", scroll.height >= canvas.preferredSize.height)
        assertTrue("minimum follows content: ${scroll.minimumSize.height}", scroll.minimumSize.height >= canvas.preferredSize.height)
    }

    fun testMatrixGridKeepsItsLinesOnALongPage() {
        val view = rendered()
        val cells = all(view).filterIsInstance<JTable>().first { it.columnCount == 7 }
        val scroll = generateSequence<Component>(cells) { it.parent }.first { it is JScrollPane } as JScrollPane
        val lines = 7 * cells.rowHeight // section line + 6 rows
        assertTrue("matrix ${scroll.height} for $lines of rows", scroll.height >= lines)
        assertTrue("the cells viewport ${scroll.viewport.height} shows every line", scroll.viewport.height >= lines)
    }

    fun testKanbanColumnsKeepTheirCardsOnALongPage() {
        val view = rendered()
        val column = named(view, "Todo card 0").parent as JComponent
        val cards = all(column).filter { it is JPanel && it.accessibleContext?.accessibleName?.startsWith("Todo card") == true }.toList()
        assertEquals(4, cards.size)
        assertTrue("column ${column.height} holds its ${cards.size} cards", column.height >= cards.sumOf { it.preferredSize.height })
        assertTrue("every card is laid out: ${cards.map { it.height }}", cards.all { it.height >= 30 })
        val board = generateSequence<Component>(column) { it.parent }.first { it is JScrollPane }
        assertTrue("board ${board.height} >= column ${column.preferredSize.height}", board.height >= column.preferredSize.height)
    }

    fun testKanbanColumnPreferredHeightIsNotFrozenAtTheEmptyColumn() {
        // Independent of the page: the column used to take `preferredSize = (220, preferredSize.height)`
        // BEFORE its cards were added, so every column reported its header's height forever.
        val ctx = context()
        val kanban = ComponentRenderer(ctx).render(json(cs("k", this.kanban)), json("{}"), json("{}"))
        val column = named(kanban, "Todo card 0").parent as JComponent
        assertTrue("column prefers ${column.preferredSize.height}", column.preferredSize.height > 4 * 40)
    }

    fun testMatrixGridGrowsWhenASectionExpandsAfterRender() {
        // The vertical stack caps a child's maximum at the preferred height it had when added; a
        // grid rendered with a collapsed section must still be able to grow past it.
        val ctx = context()
        val collapsed = matrix.replace(""""collapsed":false""", """"collapsed":true""")
        val grid = ComponentRenderer(ctx).render(json(cs("m", collapsed)), json("{}"), json("{}"))
        val holder = verticalPanel()
        holder.addStacked(grid, 0)
        val before = grid.preferredSize.height
        val labels = all(grid).filterIsInstance<JTable>().first { it.columnCount == 1 }
        assertEquals(1, labels.rowCount)
        labels.changeSelection(0, 0, false, false)
        val enter = KeyStroke.getKeyStroke("ENTER")
        labels.getActionForKeyStroke(enter).actionPerformed(ActionEvent(labels, 0, "ENTER"))
        assertEquals("the section expanded", 7, labels.rowCount)
        assertTrue("preferred grew: $before → ${grid.preferredSize.height}", grid.preferredSize.height > before)
        assertTrue("maximum follows: ${grid.maximumSize.height}", grid.maximumSize.height >= grid.preferredSize.height)
    }
}
