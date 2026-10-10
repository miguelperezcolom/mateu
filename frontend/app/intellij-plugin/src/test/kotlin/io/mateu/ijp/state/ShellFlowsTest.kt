package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** App-shell flows run by a menu leaf (mirrors the RN shellFlows tests; wire = AppShellFlowSyncTest). */
class ShellFlowsTest : TestCase() {

    private val json = ObjectMapper()

    private val actions = json.readTree(
        """
        [
          {"id": "newOrder", "commands": [
            {"targetComponentId": null, "type": "MarkAsClean", "data": null},
            {"targetComponentId": null, "type": "NavigateTo", "data": "orders/new"}]},
          {"id": "announce", "commands": [
            {"type": "DispatchEvent", "data": {"eventName": "order-started", "detail": null}}]},
          {"id": "abs", "commands": [
            {"type": "NavigateTo", "data": "/customers"},
            {"type": "NavigateTo", "data": "https://example.com/docs"},
            {"type": "RunAction", "data": {"actionId": "refresh"}},
            {"type": "CloseModal", "data": null}]},
          {"id": "serverOnly", "commands": null}
        ]
        """.trimIndent(),
    )

    private fun leaf(actionId: String) =
        json.readTree("""{"label": "x", "route": "/x", "rules": [{"action": "RunAction", "actionId": "$actionId"}]}""")

    fun testAFlowLeafAppliesItsCommandsClientSide() {
        assertEquals(listOf(ShellFlows.Effect.Navigate("orders/new")), ShellFlows.effects(leaf("newOrder"), actions))
        assertEquals(listOf(ShellFlows.Effect.Event("order-started", null)), ShellFlows.effects(leaf("announce"), actions))
    }

    fun testAnIdWithoutStepsKeepsTheServerDispatch() {
        assertEquals(listOf(ShellFlows.Effect.RunAction("serverOnly")), ShellFlows.effects(leaf("serverOnly"), actions))
        assertEquals(listOf(ShellFlows.Effect.RunAction("nope")), ShellFlows.effects(leaf("nope"), null))
    }

    fun testUrlsLeaveTheAppAndRoutesStayInIt() {
        assertEquals(
            listOf(
                ShellFlows.Effect.Navigate("customers"),
                ShellFlows.Effect.Url("https://example.com/docs"),
                ShellFlows.Effect.RunAction("refresh"),
                ShellFlows.Effect.CloseOverlay(null, null),
            ),
            ShellFlows.effects(leaf("abs"), actions),
        )
        assertNull(ShellFlows.inAppRoute("//evil.com/x"))
        assertNull(ShellFlows.inAppRoute("mailto:a@b.c"))
    }

    fun testOnlyALeafWithRulesIsARuleLeaf() {
        assertTrue(ShellFlows.isRuleLeaf(leaf("x")))
        assertFalse(ShellFlows.isRuleLeaf(json.readTree("""{"label": "Home", "route": "/home", "rules": []}""")))
        assertFalse(ShellFlows.isRuleLeaf(json.readTree("""{"label": "Home", "route": "/home"}""")))
    }

    // ── the app's ACTION catalogue (App.actionCatalogue, as ActionCatalogueSyncTest pins it) ──
    private val catalogue = json.readTree(
        """
        [
          {"id": "newOrder", "commands": [{"type": "NavigateTo", "data": "elsewhere"}]},
          {"id": "refreshCustomers", "restAction": {"source": {"url": "https://example.test/api/customers"}}},
          {"id": "chained", "commands": [{"type": "RunAction", "data": {"actionId": "fromCatalogue"}}]},
          {"id": "fromCatalogue", "commands": [{"type": "NavigateTo", "data": "home"}]},
          {"id": "loop", "commands": [{"type": "RunAction", "data": {"actionId": "loop"}}]}
        ]
        """.trimIndent(),
    )

    fun testAnIdTheShellDoesNotDeclareRunsTheCatalogueEntry() {
        assertEquals(listOf(ShellFlows.Effect.Navigate("home")), ShellFlows.effects(leaf("chained"), actions, catalogue))
        val rest = ShellFlows.effects(leaf("refreshCustomers"), actions, catalogue)
        assertTrue(rest.single() is ShellFlows.Effect.RestAction)
    }

    fun testOwnerFirstTheShellsOwnActionWins() {
        assertEquals(listOf(ShellFlows.Effect.Navigate("orders/new")), ShellFlows.effects(leaf("newOrder"), actions, catalogue))
        // an owner entry without a flow is the owner's server action: the catalogue does not shadow it
        assertEquals(listOf(ShellFlows.Effect.RunAction("serverOnly")), ShellFlows.effects(leaf("serverOnly"), actions, catalogue))
        assertFalse(ShellFlows.isClientRunnable(ShellFlows.resolve("serverOnly", actions, catalogue)))
        assertTrue(ShellFlows.isClientRunnable(ShellFlows.resolve("refreshCustomers", actions, catalogue)))
    }

    fun testUnknownIdsGoToTheServerAndASelfReferencingFlowCannotLoop() {
        assertEquals(listOf(ShellFlows.Effect.RunAction("nope")), ShellFlows.effects(leaf("nope"), actions, catalogue))
        assertEquals(listOf(ShellFlows.Effect.RunAction("loop")), ShellFlows.actionEffects("loop", null, catalogue))
    }
}
