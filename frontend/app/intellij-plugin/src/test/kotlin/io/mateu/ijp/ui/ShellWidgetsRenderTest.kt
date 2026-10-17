package io.mateu.ijp.ui

import com.intellij.testFramework.PlatformTestUtil
import com.intellij.ui.SearchTextField
import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBTextField
import io.mateu.ijp.state.AppSession
import io.mateu.ijp.state.AppShortcuts
import io.mateu.ijp.state.IdleClock
import java.awt.Dimension
import java.awt.event.MouseEvent
import javax.swing.JComponent
import javax.swing.JViewport

/**
 * The widgets of the app shell and the board-like canvases: the planning board's click/drag, the
 * map's marker rows, the global search, the notification bell, quick launch and the idle-session
 * sign-out.
 */
class ShellWidgetsRenderTest : RenderTestCase() {

    private data class Opened(val label: String, val route: String?)

    private fun recordOpens(session: AppSession): MutableList<Opened> {
        val opened = ArrayList<Opened>()
        session.openViewHandler = { label, route, _, _, _ -> opened.add(Opened(label, route)) }
        return opened
    }

    private fun waitUntil(what: String, condition: () -> Boolean) {
        val until = System.currentTimeMillis() + 5_000
        while (!condition()) {
            PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
            if (System.currentTimeMillis() > until) fail("timed out waiting for $what")
            Thread.sleep(10)
        }
    }

    // ── planning board ──

    private val board = """{"type":"PlanningBoard","from":"2026-10-05","to":"2026-10-11","selectActionId":"openBooking",
        "moveActionId":"moveBooking","resources":[{"id":"r101","label":"101","group":"Floor 1"},{"id":"r102","label":"102","group":"Floor 1"},
        {"id":"r201","label":"201","group":"Floor 2"}],
        "blocks":[{"id":"b1","resourceId":"r101","start":"2026-10-05","end":"2026-10-06","label":"Ada","status":"confirmed"},
        {"id":"b2","resourceId":"r201","start":"2026-10-08","end":"2026-10-20","label":"Grace","color":"#fc0"}]}"""

    private fun boardCanvas(c: JComponent): JComponent =
        all(c).filterIsInstance<JViewport>().first().view as JComponent

    private fun mouse(c: JComponent, id: Int, x: Int, y: Int) {
        val e = MouseEvent(c, id, 0, 0, x, y, 1, false)
        when (id) {
            MouseEvent.MOUSE_PRESSED -> c.mouseListeners.forEach { it.mousePressed(e) }
            MouseEvent.MOUSE_RELEASED -> c.mouseListeners.forEach { it.mouseReleased(e) }
            MouseEvent.MOUSE_MOVED -> c.mouseMotionListeners.forEach { it.mouseMoved(e) }
        }
    }

    fun testAPlanningBoardHasALanePerResourceAndACaptionPerGroup() {
        val canvas = boardCanvas(render(context(), board))
        // header 34 + 2 group captions × 22 + 3 lanes × 30; label column 140 + 7 days × 42
        assertEquals(Dimension(140 + 7 * 42, 34 + 2 * 22 + 3 * 30), canvas.preferredSize)
    }

    fun testClickingABlockSelectsItAndDraggingItMovesIt() {
        val canvas = boardCanvas(render(context(), board))
        assertTrue(painted(paint(canvas, canvas.preferredSize)))
        // r101 is the first lane, under the header and the "Floor 1" caption: y 56..86; b1 starts at x 142
        mouse(canvas, MouseEvent.MOUSE_MOVED, 150, 70)
        assertEquals("Ada (2026-10-05 – 2026-10-06)", canvas.toolTipText)
        mouse(canvas, MouseEvent.MOUSE_PRESSED, 150, 70)
        mouse(canvas, MouseEvent.MOUSE_RELEASED, 151, 71)
        awaitRequests(1)
        assertEquals("openBooking", server.actionIds().single())
        assertEquals("b1", lastParameters().path("_blockId").asText())

        // two days right and one lane down
        mouse(canvas, MouseEvent.MOUSE_PRESSED, 150, 70)
        mouse(canvas, MouseEvent.MOUSE_RELEASED, 150 + 84, 70 + 30)
        awaitRequests(2)
        assertEquals("moveBooking", server.actionIds().last())
        val p = lastParameters()
        assertEquals(listOf("b1", "r102", "2026-10-07", "2026-10-08"),
            listOf("_blockId", "_resourceId", "_start", "_end").map { p.path(it).asText() })

        mouse(canvas, MouseEvent.MOUSE_MOVED, 5, 5)
        assertNull("no tooltip off the blocks", canvas.toolTipText)
        mouse(canvas, MouseEvent.MOUSE_PRESSED, 5, 5)
        mouse(canvas, MouseEvent.MOUSE_RELEASED, 5, 5)
        PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
        assertEquals("a press off the blocks does nothing", 2, server.requests.size)
    }

    // ── map ──

    fun testAMapListsItsMarkersAndAMarkerRunsTheAction() {
        val ctx = context()
        val map = render(ctx, """{"type":"Map","markerActionId":"openHotel","markers":[
            {"id":"h1","latitude":39.57,"longitude":2.65,"label":"Palma","description":"HQ","color":"#f00"},
            {"id":"h2","latitude":40.4,"longitude":-3.7,"label":"Madrid","color":"red"}]}""")
        assertTrue(texts(map).containsAll(listOf("🗺 Map", "HQ")))
        val links = all(map).filterIsInstance<ActionLink>().toList()
        assertEquals(listOf("Palma", "Open in browser", "Madrid", "Open in browser"), links.map { it.text })
        assertEquals("Palma, HQ", links[0].accessibleContext.accessibleName)
        assertEquals("Open Palma in browser", links[1].accessibleContext.accessibleName)
        links[2].doClick()
        awaitRequests(1)
        assertEquals("h2", lastParameters().path("_markerId").asText())
        assertTrue(painted(paint(map)))
        assertEquals(java.awt.Color.decode("#ff0000"), parseMarkerColor("#f00"))
        assertEquals(java.awt.Color.decode(MapRows.DEFAULT_COLOR), parseMarkerColor("red"))
    }

    fun testAMapWithoutMarkersSaysSoAndPassiveMarkersAreNotLinks() {
        assertTrue(texts(render(context(), """{"type":"Map","markers":[]}""")).contains("No location"))
        val passive = render(context(), """{"type":"Map","markers":[{"id":"h1","latitude":1,"longitude":2,"label":"Here"}]}""")
        assertEquals(listOf("Open in browser"), all(passive).filterIsInstance<ActionLink>().map { it.text }.toList())
        assertTrue(texts(passive).contains("Here"))
    }

    // ── global search ──

    fun testGlobalSearchMatchesTheMenuAndTheServersHitsGroupedByCategory() {
        val ctx = context()
        val opened = recordOpens(ctx.session)
        server.answer = """{"fragments":[{"data":{"_globalsearch":[
            {"label":"Ada Lovelace","description":"Guest","route":"/guests/1","category":"Guests"},
            {"label":"Ada Hotel","route":"/hotels/9","category":"Hotels"}]}}],"messages":[],"commands":[]}"""
        val search = globalSearch(ctx, json("""{"route":"/app","serverSideType":"app.Home","menu":[
            {"label":"Bookings","submenus":[{"label":"Adapters","route":"/adapters"},{"label":"Rates","route":"/rates"}]}]}"""))
        val field = all(search).filterIsInstance<SearchTextField>().single()
        field.text = "ada"
        field.textEditor.postActionEvent()
        waitUntil("the server hits") { all(search).filterIsInstance<ActionLink>().count() == 3 }
        assertEquals("_globalsearch", server.actionIds().last())
        assertEquals("ada", lastParameters().path("searchText").asText())
        assertEquals(listOf("Adapters", "Ada Lovelace — Guest", "Ada Hotel"),
            all(search).filterIsInstance<ActionLink>().map { it.text }.toList())
        assertTrue(texts(search).containsAll(listOf("GUESTS", "HOTELS")))
        all(search).filterIsInstance<ActionLink>().toList()[1].doClick()
        all(search).filterIsInstance<ActionLink>().toList()[0].doClick()
        assertEquals(listOf(Opened("Ada Lovelace", "/guests/1"), Opened("Adapters", "/adapters")), opened)

        server.answer = """{"fragments":[],"messages":[],"commands":[]}"""
        field.text = "zzz"
        field.textEditor.postActionEvent()
        waitUntil("no matches") { texts(search).contains("No matches") && server.requests.size == 2 }
        field.text = ""
        field.textEditor.postActionEvent()
        assertTrue("clearing the query hides the results", all(search).filterIsInstance<ActionLink>().none())
    }

    // ── notification bell ──

    fun testTheBellShowsTheUnreadCountFromTheFirstFetch() {
        val ctx = context()
        server.answer = """{"fragments":[{"data":{"_notifications":[{"id":"n1","title":"Arrival","unread":true},
            {"id":"n2","title":"Old","unread":false},{"id":"n3","title":"Late check-out","unread":true}]}}],"messages":[],"commands":[]}"""
        val bell = notificationBell(ctx, json("""{"route":"/app","serverSideType":"app.Home"}"""))
        waitUntil("the badge") { buttons(bell).single().text == "Notifications (2)" }
        val request = server.requests.single()
        assertEquals("_notifications-list", request.path("actionId").asText())
        assertEquals("app.Home", request.path("serverSideType").asText())
    }

    fun testABellWithNothingUnreadHasNoCount() {
        server.answer = """{"fragments":[{"data":{"_notifications":[{"id":"n2","title":"Old"}]}}],"messages":[],"commands":[]}"""
        val bell = notificationBell(context(), json("""{"route":"/app"}"""))
        awaitRequests(1)
        PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
        assertEquals("Notifications", buttons(bell).single().text)
    }

    // ── quick launch, idle sign-out ──

    private val app = """{"type":"App","shortcuts":[{"key":"f9","label":"Merge profiles","route":"/merge","code":"MRG"},
        {"key":"alt+s","label":"Sync","actionId":"syncChannels","code":"SYNC"}]}"""

    fun testQuickLaunchGoesWhereTheCodeGoesAndSaysWhenNoCodeMatches() {
        val session = AppSession(server.baseUrl)
        session.appShortcuts = AppShortcuts.of(json(app))
        session.appServerSideType = "app.Home"
        val opened = recordOpens(session)
        val box = quickLaunchField(session)
        val field = all(box).filterIsInstance<JBTextField>().single()
        field.text = "nope"
        field.postActionEvent()
        assertTrue(texts(box).contains("No shortcut has the code \"nope\""))
        field.text = "mrg"
        field.postActionEvent()
        assertEquals(listOf(Opened("Merge profiles", "/merge")), opened)
        assertEquals("the field is cleared after launching", "", field.text)
        field.text = "SYNC"
        field.postActionEvent()
        awaitRequests(1)
        assertEquals("syncChannels", server.actionIds().single())
        assertEquals("app.Home", server.requests.single().path("serverSideType").asText())
        session.dispose()
    }

    fun testAnIdleSessionIsSignedOutWhenTheTimeoutPasses() {
        val session = AppSession(server.baseUrl)
        val notices = ArrayList<String>()
        session.notifier = { title, _, _, _ -> notices.add(title.orEmpty()) }
        var signedOut = false
        session.onSignedOut = { signedOut = true }
        val config = IdleClock.of(json("""{"idleSession":{"timeoutSeconds":1,"warningSeconds":1,"signOutUrl":"/bye"}}"""))!!
        val watcher = IdleWatcher(session, config)
        try {
            waitUntil("the sign-out") { signedOut }
            assertEquals(listOf("Signed out"), notices)
        } finally {
            watcher.close()
            session.dispose()
        }
    }
}
