package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** The per-screen declarations and the pure helpers AppContext decides on (no Swing involved). */
class ScreenDeclarationsTest : TestCase() {

    private val mapper = ObjectMapper()
    private fun json(s: String) = mapper.readTree(s)

    fun testDeclarationsReadEveryActionFlag() {
        val screen = ScreenDeclarations.of(
            json(
                """{"actions":[
                    {"id":"save","validationRequired":true},
                    {"id":"archive","rowsSelectedRequired":true,"bubble":true},
                    {"id":"export","sse":true},
                    {"id":"lookup","restAction":{"source":{"url":"/x"}}},
                    {"id":"drop","confirmationRequired":true},
                    {"id":"row-*"},
                    {"id":""}],
                   "rules":[{"action":"SetStateValue"}]}""",
            ),
        )
        assertEquals(listOf("save", "archive", "export", "lookup", "drop", "row-*"), screen.actionIds)
        assertTrue(screen.owns("row-7"))
        assertFalse(screen.owns(null))
        assertFalse(screen.bubbles("save"))
        assertTrue(screen.bubbles("archive"))
        assertTrue(screen.bubbles("edit"))
        assertTrue(screen.requiresValidation("save"))
        assertTrue("an unowned crud submit validates", screen.requiresValidation("create"))
        assertFalse(screen.requiresValidation("export"))
        assertTrue(screen.requiresRowSelection("archive"))
        assertTrue(screen.isStreamed("export"))
        assertEquals("/x", screen.restAction("lookup")!!.path("source").path("url").asText())
        assertNotNull(screen.confirmation("drop"))
        assertNull(screen.confirmation("save"))
        assertNotNull(screen.actionDefs)
        assertNotNull(screen.rules)
    }

    fun testNothingDeclaredMeansNothingOwnedAndNoErrors() {
        val none = ScreenDeclarations.NONE
        assertTrue(none.bubbles("save"))
        assertTrue(none.fieldErrors(mapOf(), mapOf()).isEmpty())
        assertNull(none.rules)
        val empty = ScreenDeclarations.of(json("""{"rules":[],"validations":{}}"""))
        assertNull("an empty rule list is no rules", empty.rules)
        assertNull(empty.actionDefs)
        assertTrue(empty.fieldErrors(mapOf(), mapOf()).isEmpty())
    }

    fun testActionTargets() {
        fun target(bubbles: Boolean, route: String = "/products/1", nav: String = "") =
            ActionTargets.of(bubbles, "x.Product", route, "x.Products", "/products", nav)
        assertEquals("x.Products", target(true))
        assertEquals("x.Product", target(false))
        assertEquals("x.Product", target(true, route = "/other"))
        assertEquals("x.Nav", target(true, route = "/other", nav = "x.Nav"))
        assertEquals("x.Product", ActionTargets.of(true, "x.Product", "/p", "", "", "x.Product"))
    }

    fun testTheLegacyConditionMatcher() {
        val state = mapOf<String, Any?>("qty" to 2, "price" to "9.5", "bad" to "n/a", "node" to json("4"), "name" to "")
        assertTrue(Conditions.legacyHolds("state['qty'] >= 2", state))
        assertTrue(Conditions.legacyHolds("state['qty'] <= 2", state))
        assertFalse(Conditions.legacyHolds("state['qty'] > 2", state))
        assertTrue(Conditions.legacyHolds("state['price'] > 9", state))
        assertTrue(Conditions.legacyHolds("state['bad'] < 1", state))
        assertTrue(Conditions.legacyHolds("state['node'] == 4", state))
        assertTrue(Conditions.legacyHolds("state['missing'] != 1", state))
        assertFalse(Conditions.legacyHolds("state['qty'] < -1.5", state))
        assertFalse(Conditions.legacyHolds("state['name']", state))
        assertTrue(Conditions.legacyHolds(" state['qty'] ", state))
        assertTrue("unrecognised holds", Conditions.legacyHolds("whatever ~ 3", state))
    }

    fun testTruthinessAndNumbers() {
        assertFalse(Conditions.truthy(null))
        assertFalse(Conditions.truthy(json("null")))
        assertFalse(Conditions.truthy(json("\" \"")))
        assertTrue(Conditions.truthy(json("\"x\"")))
        assertFalse(Conditions.truthy(json("0")))
        assertTrue(Conditions.truthy(json("true")))
        assertFalse(Conditions.truthy(json("[]")))
        assertTrue(Conditions.truthy(json("{\"a\":1}")))
        assertTrue(Conditions.truthy("x"))
        assertFalse(Conditions.truthy(0))
        assertFalse(Conditions.truthy(false))
        assertTrue(Conditions.truthy(Any()))
        assertEquals(0.0, Conditions.toDouble(json("true")))
        assertEquals(3.0, Conditions.toDouble(json("\"3\"")))
        assertEquals(0.0, Conditions.toDouble(Any()))
        assertEquals(0.0, Conditions.toDouble("abc"))
        // the parser first: an expression it understands never reaches the legacy matcher
        assertTrue(Conditions.holds("state.qty > 1", mapOf("qty" to 2), mapOf()))
        assertTrue(Conditions.holds("appState.on", mapOf(), mapOf("on" to true)))
    }

    fun testScreenShapes() {
        assertTrue(ScreenShapes.isMediatorShell(json("""{"metadata":{"type":"App"}}""")))
        assertTrue(ScreenShapes.isMediatorShell(json("""{"type":"ServerSide","children":[{"metadata":{"type":"App"}}]}""")))
        assertFalse(ScreenShapes.isMediatorShell(json("""{"type":"ServerSide","children":[{"metadata":{"type":"App"}},{}]}""")))
        assertFalse(ScreenShapes.isMediatorShell(json("""{"type":"ClientSide","metadata":{"type":"Form"}}""")))
        assertTrue(ScreenShapes.containsCrud(json("""{"children":[{"metadata":{"type":"Card","content":{"metadata":{"type":"Crud"}}}}]}""")))
        assertFalse(ScreenShapes.containsCrud(json("""{"children":[{"metadata":{"type":"Text"}}]}""")))
        assertFalse(ScreenShapes.containsCrud(json("null")))
        assertEquals("Detail", ScreenShapes.detailLabel("/"))
        assertEquals("New", ScreenShapes.detailLabel("/NEW"))
        assertEquals("edit", ScreenShapes.detailLabel("/7/edit/"))
        assertEquals(448, ScreenShapes.remToPx("28rem", 1))
        assertEquals(1, ScreenShapes.remToPx("50%", 1))
        val doc = json("""{"data":{"address":{"city":"Palma"}}}""")
        assertSame(doc, ScreenShapes.valueAtPath(doc, ""))
        assertEquals("Palma", ScreenShapes.valueAtPath(doc, "data.address.city")!!.asText())
        assertNull(ScreenShapes.valueAtPath(doc, "data.zip.code"))
    }

    fun testUnparseableShortcuts() {
        assertNull(ShortcutKeys.keyStroke(""))
        assertNull(ShortcutKeys.keyStroke("+"))
        assertNull(ShortcutKeys.keyStroke("hyper+x"))
        assertEquals(javax.swing.KeyStroke.getKeyStroke("ctrl alt D"), ShortcutKeys.keyStroke("Ctrl+Alt+d"))
    }

    fun testClientRulesStopAndRunActions() {
        val ran = ArrayList<String>()
        val state = HashMap<String, Any?>(mapOf("qty" to 2))
        val attrs = HashMap<String, MutableMap<String, Any?>>()
        val rules = json(
            """[{"filter":"bad syntax ((","action":"SetStateValue","fieldName":"never","value":1},
                {"action":"SetStateValue","fieldName":"a,b","fieldAttribute":"none","value":"v"},
                {"action":"SetAttributeValue","fieldName":"c","fieldAttribute":"none","value":true},
                {"action":"SetStateValue","fieldName":"total","expression":"bad ((","value":5},
                {"action":"SetStateValue","fieldName":"obj","value":{"k":1}},
                {"action":"SetStateValue","fieldName":"gone"},
                {"action":"RunAction","actionId":"refresh","result":"Stop"},
                {"action":"RunAction","actionId":"after-stop"}]""",
        )
        assertTrue(ClientRules.apply(rules, state, mapOf(), attrs) { ran.add(it) })
        assertFalse(state.containsKey("never"))
        assertEquals("v", state["a"])
        assertEquals("v", state["b"])
        assertTrue("an attribute rule without attribute does nothing", attrs["c"].isNullOrEmpty())
        assertEquals(5.0, state["total"])
        assertEquals(json("""{"k":1}"""), state["obj"])
        assertFalse("setting an absent value to null is no change", state.containsKey("gone"))
        assertEquals(listOf("refresh"), ran)
        // the same rules again change nothing
        assertFalse(ClientRules.apply(rules, state, mapOf(), attrs) { ran.add(it) })
    }
}
