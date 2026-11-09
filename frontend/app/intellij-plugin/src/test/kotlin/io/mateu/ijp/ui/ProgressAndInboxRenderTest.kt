package io.mateu.ijp.ui

import com.intellij.testFramework.PlatformTestUtil
import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.NoticeTexts
import io.mateu.ijp.state.ProgressTasks
import javax.swing.JButton
import javax.swing.JLayer
import javax.swing.JPanel
import javax.swing.JProgressBar
import javax.swing.JToggleButton

/** The thin Swing over [io.mateu.ijp.state.ViewBlock] and the inbox's filters and groups. */
class ProgressAndInboxRenderTest : RenderTestCase() {

    private fun task(id: String, state: String = "running", extra: String = "") =
        ProgressTasks.of(json("""{"taskId":"$id","title":"Import","state":"$state","blocking":true $extra}"""))!!

    private fun covered(ctx: AppContext): JLayer<*> {
        val layer = blockable(ctx, JPanel()) as JLayer<*>
        assertFalse("nothing covers a free view", layer.glassPane.isVisible)
        return layer
    }

    private fun AppContext.report(t: io.mateu.ijp.state.ProgressTask) {
        if (viewBlock.observe(t)) onViewBlockChanged?.invoke()
    }

    fun testABlockingTaskCoversTheViewWithItsTitleProgressAndButtons() {
        val ctx = context()
        val layer = covered(ctx)
        ctx.report(task("t1", extra = ""","fraction":0.5,"done":1,"total":2,"cancellable":true,"backgroundable":true"""))
        assertTrue(layer.glassPane.isVisible)
        assertTrue(all(layer.glassPane).filterIsInstance<JBLabel>().any { it.text == "Import" })
        val bar = all(layer.glassPane).filterIsInstance<JProgressBar>().single()
        assertFalse(bar.isIndeterminate)
        assertEquals(500, bar.value)
        assertEquals(2, all(layer.glassPane).filterIsInstance<JButton>().count { it.isVisible })
    }

    fun testATaskThatOffersNothingShowsNoButtons() {
        val ctx = context()
        val layer = covered(ctx)
        ctx.report(task("t1"))
        assertTrue(all(layer.glassPane).filterIsInstance<JProgressBar>().single().isIndeterminate)
        assertEquals(0, all(layer.glassPane).filterIsInstance<JButton>().count { it.isVisible })
    }

    fun testMovingToTheBackgroundUncoversTheView() {
        val ctx = context()
        val layer = covered(ctx)
        ctx.report(task("t1", extra = ""","backgroundable":true"""))
        all(layer.glassPane).filterIsInstance<JButton>().single { it.isVisible }.doClick()
        assertFalse(layer.glassPane.isVisible)
    }

    fun testTheEndOfTheTaskUncoversTheView() {
        val ctx = context()
        val layer = covered(ctx)
        ctx.report(task("t1"))
        ctx.report(task("t1", state = "done"))
        assertFalse(layer.glassPane.isVisible)
    }

    fun testCancelAsksTheServerOnceAndKeepsTheViewCoveredUntilItAnswers() {
        val ctx = context()
        val layer = covered(ctx)
        ctx.report(task("t1", extra = ""","cancellable":true"""))
        val cancel = all(layer.glassPane).filterIsInstance<JButton>().single { it.isVisible }
        cancel.doClick()
        awaitRequests(1)
        assertEquals("_progress-cancel", server.actionIds().single())
        assertFalse(cancel.isEnabled)
        assertTrue(layer.glassPane.isVisible)
    }

    fun testACoveredViewStartsNoOtherActionFromTheUserButTriggersGoOn() {
        val ctx = context()
        covered(ctx)
        ctx.contentPane = ctx.newSlot()
        ctx.report(task("t1"))
        var outcome: Boolean? = null
        ctx.runAction("save", null) { outcome = it }
        assertEquals(false, outcome)
        assertTrue(server.actionIds().isEmpty())
    }

    // ── the inbox panel ──

    private val inbox = """{"fragments":[{"data":{"_notifications":[
        {"id":"n1","title":"Arrival","unread":true,"category":"Front desk"},
        {"id":"n2","title":"Old invoice","unread":false,"category":"Billing"},
        {"id":"n3","title":"Refund done","unread":false,"resolved":true,"category":"Billing"}]}}],"messages":[],"commands":[]}"""

    private fun panelWithEntries(): InboxPanel {
        val ctx = context()
        server.answer = inbox
        ctx.session.inbox.start(ctx)
        awaitRequests(1)
        val until = System.currentTimeMillis() + 5_000
        while (ctx.session.inbox.model.items().isEmpty() && System.currentTimeMillis() < until) {
            PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
            Thread.sleep(10)
        }
        return InboxPanel(ctx.session) {}
    }

    private fun labels(panel: InboxPanel) = all(panel).filterIsInstance<JBLabel>().map { it.text }.toList()

    private fun choose(panel: InboxPanel, label: String) =
        all(panel).filterIsInstance<JToggleButton>().single { it.text == label }.doClick()

    fun testThePanelGroupsByCategoryAndFilters() {
        val panel = panelWithEntries()
        val shown = labels(panel)
        assertTrue("category headings: $shown", shown.containsAll(listOf("Front desk", "Billing")))
        assertTrue(shown.containsAll(listOf("Arrival", "Old invoice", "Refund done")))

        choose(panel, NoticeTexts.filterUnread(MoneyValues.uiLocale()))
        assertEquals(listOf("Front desk", "Arrival"), labels(panel).filter { it in listOf("Front desk", "Billing", "Arrival", "Old invoice", "Refund done") })

        choose(panel, NoticeTexts.filterResolved(MoneyValues.uiLocale()))
        assertTrue(labels(panel).contains("Refund done"))
        assertFalse(labels(panel).contains("Arrival"))
    }

    fun testADismissGoesToTheServer() {
        val panel = panelWithEntries()
        server.requests.clear()
        all(panel).filterIsInstance<ActionLink>().first { it.text == NoticeTexts.dismiss(MoneyValues.uiLocale()) }.doClick()
        awaitRequests(1)
        assertEquals("_notifications-dismiss", server.actionIds().single())
    }
}
