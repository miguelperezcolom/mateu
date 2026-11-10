package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.state.Expressions
import java.io.File
import junit.framework.TestCase

/**
 * The client conformance corpus of REST url templates (conformance/client/source-templates.json):
 * a source's url interpolated against the component state must give the SAME url on every leg —
 * libs/mateu, Redwood and React Native in the browser, Java/.NET/Python when the source is
 * proxied. The plugin interpolates the url itself (RestFetch.fetch → Expressions.interpolateUrl),
 * so it runs the corpus too. Each case runs twice: the state as Jackson nodes (the wire-backed
 * state) and as plain maps/lists (the live form state).
 */
class SourceTemplatesConformanceTest : TestCase() {

    private val mapper = ObjectMapper()

    private fun corpusFile(): File {
        var dir: File? = File("").absoluteFile
        while (dir != null) {
            val f = File(dir, "conformance/client/source-templates.json")
            if (f.isFile) return f
            dir = dir.parentFile
        }
        error("conformance/client/source-templates.json not found above ${File("").absolutePath}")
    }

    fun testTheSourceTemplateCorpus() {
        val corpus = mapper.readTree(corpusFile())
        val failures = ArrayList<String>()
        var count = 0
        for (c in corpus.path("cases")) {
            val name = c.path("name").asText()
            val template = c.path("template").asText()
            val expected = c.path("expected").asText()
            val state = c.path("state")
            @Suppress("UNCHECKED_CAST")
            val asMaps = mapper.convertValue(state, Map::class.java) as Map<String, Any?>
            for ((shape, stateValue) in listOf("nodes" to state, "maps" to asMaps)) {
                count++
                val actual = try {
                    Expressions.interpolateUrl(template, mapOf("state" to stateValue))
                } catch (e: Exception) {
                    "error ${e.message}"
                }
                if (actual != expected) {
                    failures += "$name [$shape]: expected $expected, got $actual"
                }
            }
        }
        assertTrue("the corpus is not empty", count > 10)
        assertTrue(failures.joinToString("\n", "${failures.size} conformance cases failed:\n"), failures.isEmpty())
    }
}
