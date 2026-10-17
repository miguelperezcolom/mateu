package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase
import java.io.File

/**
 * Parity gate: every wire component type a backend produces (the `type` discriminators of
 * `ComponentMetadataDto` in the generated `wire-schema.json`, minus the deprecated ones nobody
 * produces) must have a case in [ComponentRenderer] — a new DTO without a Swing rendering fails the
 * build here instead of showing "Unsupported component" in the IDE.
 */
class WireTypeParityTest : TestCase() {

    private val schema = File("../../../backend/shared/uidl/wire-schema.json")
    private val renderer = File("src/main/kotlin/io/mateu/ijp/ui/ComponentRenderer.kt")

    /** discriminator → deprecated, for every registered component type. */
    private fun registered(): Map<String, Boolean> {
        val defs = ObjectMapper().readTree(schema).path("\$defs")
        return defs.path("ComponentMetadataDto").path("oneOf").associate { ref ->
            val def = defs.path(ref.path("\$ref").asText().substringAfterLast('/'))
            def.path("properties").path("type").path("const").asText() to def.path("deprecated").asBoolean(false)
        }
    }

    /** The types a server produces (registered and not deprecated). */
    internal fun wireTypes(): Set<String> = registered().filterValues { !it }.keys

    /** Registered but produced by no server (deprecated for removal): not required. */
    internal fun deprecatedWireTypes(): Set<String> = registered().filterValues { it }.keys

    /**
     * The string labels of the TOP-LEVEL branches of `renderClientSide`'s `when (metadata.text("type"))`
     * — lines like `"A", "B" -> …` at the indentation of that `when`'s first branch. Anchoring to the
     * dispatcher keeps nested `when`s out (the Text size switch's `"xl"`, `"l"`, `"s"`, `"xs"` used
     * to count as "handled types"), and a branch that only shows the "Unsupported component"
     * placeholder does not count either.
     */
    internal fun handledTypes(source: String = renderer.readText()): Set<String> {
        val lines = source.lines()
        val start = lines.indexOfFirst { it.contains("return when (metadata.text(\"type\"))") }
        if (start < 0) return emptySet()
        val branch = Regex("^(\\s*)(\"[A-Za-z]+\"(\\s*,\\s*\"[A-Za-z]+\")*)\\s*->(.*)$")
        val first = lines.drop(start + 1).firstNotNullOfOrNull { branch.find(it) } ?: return emptySet()
        val indent = first.groupValues[1]
        val out = mutableSetOf<String>()
        for (line in lines.drop(start + 1)) {
            if (line.startsWith(indent + "else ->")) break
            val m = branch.find(line) ?: continue
            if (m.groupValues[1] != indent) continue
            if (m.groupValues[4].contains("Unsupported component")) continue
            Regex("\"([A-Za-z]+)\"").findAll(m.groupValues[2]).forEach { out += it.groupValues[1] }
        }
        return out
    }

    fun testOnlyTheDispatcherTopLevelBranchesCount() {
        val src = """
            |    private fun renderClientSide(): JComponent {
            |        return when (metadata.text("type")) {
            |            "Text" -> JBLabel("x").also {
            |                when (metadata.text("size")) {
            |                    "xl" -> 1
            |                    "s" -> 2
            |                }
            |            }
            |            "Grid", "VirtualList" -> renderGrid()
            |            "Nova" -> JBLabel("Unsupported component: Nova")
            |            else -> JBLabel("Unsupported component")
            |        }
            |    }
            |    "Ghost" -> outside()
        """.trimMargin()
        assertEquals(setOf("Text", "Grid", "VirtualList"), handledTypes(src))
        // the real dispatcher has no stray size literals either
        assertTrue(handledTypes().none { it in setOf("xl", "l", "m", "s", "xs") })
    }

    fun testEveryWireTypeHasACase() {
        assertTrue("wire schema not found at ${schema.absolutePath}", schema.exists())
        val wire = wireTypes()
        assertTrue("suspiciously few wire types: ${wire.size}", wire.size > 100)
        assertEquals(setOf("Result", "Stepper"), deprecatedWireTypes())
        val missing = wire - handledTypes()
        assertTrue(
            "Wire component types with no case in ComponentRenderer (add a Swing rendering): ${missing.sorted()}",
            missing.isEmpty(),
        )
    }

    fun testTheRenderTestFixtureCoversTheTypesAddedForParity() {
        val fixture = File("src/test/resources/coverage/wire-types.json").readText() +
            File("src/test/resources/coverage/inline-overlays.json").readText()
        val inFixture = Regex("\"type\"\\s*:\\s*\"([A-Za-z]+)\"").findAll(fixture).map { it.groupValues[1] }.toSet()
        val missing = WireTypeRenderTest.COVERED_BY_FIXTURE - inFixture
        assertTrue("fixture lacks $missing", missing.isEmpty())
    }
}
