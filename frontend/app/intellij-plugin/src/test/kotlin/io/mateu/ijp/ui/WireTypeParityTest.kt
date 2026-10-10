package io.mateu.ijp.ui

import junit.framework.TestCase
import java.io.File

/**
 * Parity gate: every wire component type the backend can send (the `@JsonSubTypes` of
 * `ComponentMetadataDto`) must have a case in [ComponentRenderer] — a new DTO without a Swing
 * rendering fails the build here instead of showing "Unsupported component" in the IDE.
 */
class WireTypeParityTest : TestCase() {

    private val dto = File("../../../backend/shared/dtos/src/main/java/io/mateu/dtos/ComponentMetadataDto.java")
    private val renderer = File("src/main/kotlin/io/mateu/ijp/ui/ComponentRenderer.kt")

    /** The `name = "X"` entries of the JsonSubTypes list. */
    internal fun wireTypes(): Set<String> =
        Regex("name\\s*=\\s*\"([A-Za-z]+)\"").findAll(dto.readText()).map { it.groupValues[1] }.toSet()

    /** The string labels of the dispatcher's `when` branches: lines like `"A", "B" -> …`. */
    internal fun handledTypes(): Set<String> =
        renderer.readLines()
            .map { it.trim() }
            .filter { Regex("^\"[A-Za-z]+\"(\\s*,\\s*\"[A-Za-z]+\")*\\s*->").containsMatchIn(it) }
            .flatMap { line -> Regex("\"([A-Za-z]+)\"").findAll(line.substringBefore("->")).map { it.groupValues[1] }.toList() }
            .toSet()

    fun testEveryWireTypeHasACase() {
        assertTrue("backend DTO not found at ${dto.absolutePath}", dto.exists())
        val wire = wireTypes()
        assertTrue("suspiciously few wire types: ${wire.size}", wire.size > 100)
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
