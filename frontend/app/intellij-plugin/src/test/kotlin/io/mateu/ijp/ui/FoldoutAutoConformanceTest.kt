package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import java.io.File
import junit.framework.TestCase

/**
 * The foldout auto-open corpus (conformance/client/foldout-auto.json) — the same file the web,
 * Redwood and React Native suites run: which panels are open on first paint.
 */
class FoldoutAutoConformanceTest : TestCase() {

    private val mapper = ObjectMapper()

    private fun corpus(): JsonNode {
        var dir: File? = File("").absoluteFile
        while (dir != null) {
            val f = File(dir, "conformance/client/foldout-auto.json")
            if (f.isFile) return mapper.readTree(f)
            dir = dir.parentFile
        }
        error("conformance/client/foldout-auto.json not found above ${File("").absolutePath}")
    }

    private fun JsonNode.boolOrNull(field: String): Boolean? = get(field)?.takeUnless { it.isNull }?.asBoolean()

    private fun JsonNode.doubleOr(field: String, fallback: Double): Double =
        get(field)?.takeUnless { it.isNull }?.asDouble() ?: fallback

    private fun optionsOf(defaults: JsonNode, own: JsonNode?): FoldoutFit.Options {
        fun pick(field: String, fallback: Double) = own?.get(field)?.asDouble() ?: defaults.doubleOr(field, fallback)
        return FoldoutFit.Options(
            overviewPx = pick("overviewPx", 400.0),
            stripPx = pick("stripPx", 48.0),
            defaultPanelPx = pick("defaultPanelPx", 352.0),
            remPx = pick("remPx", 16.0),
            gapPx = pick("gapPx", 0.0),
        )
    }

    fun testTheCorpus() {
        val corpus = corpus()
        val failures = ArrayList<String>()
        for (c in corpus.path("cases")) {
            val panels = c.path("panels").map {
                FoldoutFit.Panel(it.boolOrNull("open"), it.boolOrNull("autoOpen"), it.get("width")?.takeUnless { w -> w.isNull }?.asText())
            }
            val available = c.get("available")?.takeUnless { it.isNull }?.asDouble()
            val actual = FoldoutFit.openStates(panels, available, optionsOf(corpus.path("defaults"), c.get("options")))
            val expected = c.path("expected").map { it.asBoolean() }
            if (actual != expected) failures += "${c.path("name").asText()}: expected $expected, got $actual"
        }
        assertTrue(failures.joinToString("\n"), failures.isEmpty())
    }
}
