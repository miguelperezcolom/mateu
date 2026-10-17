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

    /** The string labels of the dispatcher's `when` branches: lines like `"A", "B" -> …`. */
    internal fun handledTypes(): Set<String> =
        renderer.readLines()
            .map { it.trim() }
            .filter { Regex("^\"[A-Za-z]+\"(\\s*,\\s*\"[A-Za-z]+\")*\\s*->").containsMatchIn(it) }
            .flatMap { line -> Regex("\"([A-Za-z]+)\"").findAll(line.substringBefore("->")).map { it.groupValues[1] }.toList() }
            .toSet()

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
