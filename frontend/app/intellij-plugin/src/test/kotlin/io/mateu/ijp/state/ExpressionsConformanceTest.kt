package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import java.io.File
import junit.framework.TestCase

/**
 * The client conformance corpus (conformance/client/expressions.json) — the same file the web,
 * Redwood and React Native suites run. `expected` is the web reference; `overrides.intellij` is a
 * divergence the corpus states with its reason. Each case runs twice: the context as Jackson
 * nodes (the wire-backed state) and as plain maps/lists (the live form state).
 */
class ExpressionsConformanceTest : TestCase() {

    private val mapper = ObjectMapper()

    private fun corpusFile(): File {
        var dir: File? = File("").absoluteFile
        while (dir != null) {
            val f = File(dir, "conformance/client/expressions.json")
            if (f.isFile) return f
            dir = dir.parentFile
        }
        error("conformance/client/expressions.json not found above ${File("").absolutePath}")
    }

    fun testTheExpressionCorpus() {
        val corpus = mapper.readTree(corpusFile())
        val failures = ArrayList<String>()
        var count = 0
        for (c in corpus.path("cases")) {
            val name = c.path("name").asText()
            val expr = c.path("expr").asText()
            val override = c.path("overrides").path("intellij")
            val expected = if (override.isObject) override.path("expected") else c.path("expected")
            val context = if (c.has("context")) c.path("context") else corpus.path("context")
            val asNodes: Map<String, Any?> = context.fields().asSequence().associate { it.key to it.value }
            @Suppress("UNCHECKED_CAST")
            val asMaps = mapper.convertValue(context, Map::class.java) as Map<String, Any?>
            for ((shape, ctx) in listOf("nodes" to asNodes, "maps" to asMaps)) {
                count++
                val outcome = try {
                    Result.success(Expressions.evaluate(expr, ctx))
                } catch (e: Exception) {
                    Result.failure(e)
                }
                val ok = when {
                    expected.path("\$error").asBoolean(false) -> outcome.isFailure
                    outcome.isFailure -> false
                    else -> matches(expected, outcome.getOrNull())
                }
                if (!ok) {
                    failures += "$name — $expr [$shape]: expected $expected, got " +
                        (outcome.exceptionOrNull()?.let { "error ${it.message}" } ?: outcome.getOrNull().toString())
                }
            }
        }
        assertTrue("the corpus is not empty", count > 100)
        assertTrue(failures.joinToString("\n", "${failures.size} conformance cases failed:\n"), failures.isEmpty())
    }

    private fun matches(expected: JsonNode, actual: Any?): Boolean {
        if (expected.path("\$undefined").asBoolean(false) || expected.isNull) {
            return actual == null || (actual is JsonNode && (actual.isNull || actual.isMissingNode))
        }
        val node: JsonNode = if (actual is JsonNode) actual else mapper.valueToTree(actual)
        return same(expected, node)
    }

    private fun same(a: JsonNode, b: JsonNode): Boolean = when {
        a.isNumber || b.isNumber -> a.isNumber && b.isNumber && a.asDouble() == b.asDouble()
        a.isArray -> b.isArray && a.size() == b.size() && (0 until a.size()).all { same(a[it], b[it]) }
        a.isObject -> b.isObject && a.size() == b.size() && a.fieldNames().asSequence().all { b.has(it) && same(a[it], b[it]) }
        else -> a == b
    }
}
