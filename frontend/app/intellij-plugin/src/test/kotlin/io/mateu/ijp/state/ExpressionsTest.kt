package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/**
 * The rule / validation / label evaluator (same subset as the web and RN engines). Rules decide
 * what is hidden, disabled or required and whether a save is refused, so each operator the server
 * emits is pinned here.
 */
class ExpressionsTest : TestCase() {

    private val mapper = ObjectMapper()
    private fun eval(expr: String, state: Map<String, Any?> = emptyMap(), appState: Map<String, Any?> = emptyMap()) =
        Expressions.evaluate(expr, mapOf("state" to state, "appState" to appState))

    fun testAJsonBodyEscapesItsValuesNeverTheTemplate() {
        val ctx = mapOf("state" to mapOf("name" to "O\"Brien\nJr", "age" to 40, "node" to mapper.readTree("\"a\\\\b\"")))
        val json = mapOf("Content-Type" to "application/json; charset=utf-8")
        val body = Expressions.interpolateBody("{\"name\":\"\${state.name}\",\"age\":\${state.age},\"n\":\"\${state.node}\"}", json, ctx)
        val parsed = mapper.readTree(body)
        assertEquals("O\"Brien\nJr", parsed.get("name").asText())
        assertEquals(40, parsed.get("age").asInt())
        // a plain-text body is filled as it always was
        assertEquals("q=O\"Brien\nJr", Expressions.interpolateBody("q=\${state.name}", mapOf("content-type" to "text/plain"), ctx))
        assertEquals("\\u0001", Expressions.jsonEscape("\u0001"))
        assertFalse(Expressions.declaresJson(emptyMap()))
    }

    fun testLiteralsAndArithmetic() {
        assertEquals(7.0, eval("1 + 2 * 3"))
        assertEquals(9.0, eval("(1 + 2) * 3"))
        assertEquals(1.0, eval("7 % 3"))
        assertEquals(-2.0, eval("-2"))
        assertEquals("ab", eval("'a' + \"b\""))
        assertEquals(true, eval("true"))
        assertNull(eval("null"))
        assertNull(eval("undefined"))
    }

    fun testComparisonsAndLooseEquality() {
        assertEquals(true, eval("state.age >= 18", mapOf("age" to 18)))
        assertEquals(false, eval("state.age > 18", mapOf("age" to 18)))
        assertEquals(true, eval("state.age < 18.5", mapOf("age" to 18)))
        // loose like JS ==: the number 1 equals the string '1'
        assertEquals(true, eval("state.n == '1'", mapOf("n" to 1)))
        assertEquals(true, eval("state.n != 2", mapOf("n" to 1)))
        assertEquals(true, eval("state.x == null", emptyMap()))
        assertEquals(false, eval("state.x === 'a'", mapOf("x" to "b")))
        assertEquals(true, eval("state.x !== 'a'", mapOf("x" to "b")))
    }

    fun testLogicalOperatorsShortCircuitToOperands() {
        assertEquals("fallback", eval("state.name || 'fallback'", mapOf("name" to "")))
        assertEquals("Ada", eval("state.name || 'fallback'", mapOf("name" to "Ada")))
        assertEquals(0, eval("state.n ?? 5", mapOf("n" to 0)))
        assertEquals(5.0, eval("state.n ?? 5", emptyMap()))
        assertEquals(false, eval("state.a && state.b", mapOf("a" to false, "b" to true)))
        assertEquals(true, eval("!state.a", mapOf("a" to false)))
        assertEquals("yes", eval("state.ok ? 'yes' : 'no'", mapOf("ok" to true)))
        assertEquals("no", eval("state.ok ? 'yes' : 'no'", mapOf("ok" to 0)))
    }

    fun testPathsOverMapsListsAndBracketKeys() {
        val state = mapOf("customer" to mapOf("name" to "Ada"), "a-b" to 3, "rows" to listOf("x", "y"))
        assertEquals("Ada", eval("state.customer.name", state))
        // the server emits non-identifier keys as state['a-b'] (ReflectionFormFieldMapper.stateExpression)
        assertEquals(3, eval("state['a-b']", state))
        assertEquals(2.0, eval("state.rows.length", state))
        assertEquals("y", eval("state.rows[1]", state))
        assertNull(eval("state.missing.deeper", state))
        assertEquals(3.0, eval("state.s.length", mapOf("s" to "abc")))
        assertEquals("light", eval("appState.theme", appState = mapOf("theme" to "light")))
    }

    fun testWireBackedJsonStateIsUnwrapped() {
        val json = mapper.readTree("""{"total":12.5,"paid":true,"name":"x","rows":[{"id":"r1"},{"id":"r2"}],"nil":null}""")
        val state = mapOf<String, Any?>("doc" to json)
        assertEquals(12.5, eval("state.doc.total", state))
        assertEquals(true, eval("state.doc.paid", state))
        assertEquals("x", eval("state.doc.name", state))
        assertEquals(2.0, eval("state.doc.rows.length", state))
        assertNull(eval("state.doc.nil", state))
        // indexing into a JSON array, the way state.rows[0].id reads on the web
        assertEquals("r2", eval("state.doc.rows[1].id", state))
    }

    fun testUnknownSyntaxThrowsSoCallersCanFallBack() {
        for (bad in listOf("state.a =", "a ^ b", "(1 + 2", "1 2", "")) {
            try {
                eval(bad)
                fail("expected '$bad' to throw")
            } catch (e: IllegalArgumentException) {
                // expected
            }
        }
    }

    fun testNoHostReflectionIsReachable() {
        // Kotlin objects are opaque to the evaluator: no getters, no methods, no class access.
        assertNull(eval("state.s.class", mapOf("s" to "abc")))
        assertNull(eval("state.s.bytes", mapOf("s" to "abc")))
        assertNull(eval("state.o.javaClass", mapOf("o" to Any())))
        assertNull(eval("constructor"))
    }

    fun testInterpolation() {
        val ctx = mapOf("state" to mapOf("name" to "Ada", "n" to 3.0, "price" to 2.5))
        assertEquals("Hi Ada", Expressions.interpolate("Hi \${state.name}", ctx))
        // whole doubles print as integers, like JS
        assertEquals("3 items", Expressions.interpolate("\${state.n} items", ctx))
        assertEquals("2.5", Expressions.interpolate("\${state.price}", ctx))
        // a failing or null expression renders empty, never the raw template
        assertEquals("[]", Expressions.interpolate("[\${state.missing}]", ctx))
        assertEquals("[]", Expressions.interpolate("[\${ 1 + }]", ctx))
        assertEquals("plain", Expressions.interpolate("plain", ctx))
        assertEquals("", Expressions.interpolate(null, ctx))
        // string concatenation inside an expression prints numbers the JS way too
        assertEquals("Total: 3", Expressions.interpolate("\${'Total: ' + state.n}", ctx))
    }

    fun testTruthiness() {
        assertFalse(Expressions.truthy(null))
        assertFalse(Expressions.truthy(""))
        assertFalse(Expressions.truthy(0))
        assertFalse(Expressions.truthy(Double.NaN))
        assertFalse(Expressions.truthy(false))
        assertTrue(Expressions.truthy("false"))
        assertTrue(Expressions.truthy(emptyList<Any>()))
        assertTrue(Expressions.truthy(1))
    }
}
