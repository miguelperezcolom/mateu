package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.testFramework.PlatformTestUtil
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.Container
import java.io.File
import javax.swing.AbstractButton
import javax.swing.JComponent
import javax.swing.JLabel
import javax.swing.text.JTextComponent

/**
 * Renders the REAL wire of every case of the shared conformance corpus (conformance/cases — the
 * Java reference's frozen output, which the .NET and Python servers must also produce) through the
 * plugin's increment pipeline, the way a server answer arrives.
 *
 * The parity fixture (wire-types.json) is hand-written; this one is what servers actually send,
 * nested the way they nest it — so a renderer change that throws, falls back to "Unsupported
 * component", or leaves a field unnamed on a real screen fails here.
 */
class ConformanceCorpusRenderTest : BasePlatformTestCase() {

    private val mapper = ObjectMapper()

    private val casesDir: File by lazy {
        generateSequence(File(System.getProperty("user.dir")).absoluteFile) { it.parentFile }
            .map { File(it, "conformance/cases") }
            .first { it.isDirectory }
    }

    private fun cases(): List<Pair<String, JsonNode>> =
        casesDir.listFiles { f -> File(f, "expected.json").isFile }!!.sortedBy { it.name }
            .map { it.name to mapper.readTree(File(it, "expected.json")) }

    private fun all(c: Container): Sequence<java.awt.Component> = sequenceOf<java.awt.Component>(c) +
        c.components.asSequence().flatMap { if (it is Container) all(it) else sequenceOf(it) }

    private fun render(increment: JsonNode): Pair<AppContext, JComponent> {
        val ctx = AppContext(AppSession("http://127.0.0.1:9"))
        ctx.silentErrors = true
        val pane = ctx.newSlot()
        ctx.contentPane = pane
        ctx.titleConsumer = {}
        ctx.applyIncrement(increment)
        PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
        return ctx to pane
    }

    fun testTheCorpusIsThere() {
        assertTrue("the shared corpus moved: ${casesDir.path}", cases().size >= 20)
    }

    fun testEveryCaseRendersWithoutTheUnsupportedFallback() {
        val failures = ArrayList<String>()
        for ((name, increment) in cases()) {
            try {
                val (_, pane) = render(increment)
                assertTrue("$name rendered nothing", pane.componentCount > 0)
                all(pane).filterIsInstance<JLabel>()
                    .firstOrNull { it.text.orEmpty().contains("Unsupported component") }
                    ?.let { failures.add("$name: ${it.text}") }
            } catch (t: Throwable) {
                failures.add("$name threw ${t.javaClass.simpleName}: ${t.message}")
            }
        }
        assertTrue(failures.joinToString("\n"), failures.isEmpty())
    }

    fun testEveryEditableInputAndButtonOfARealScreenIsNamed() {
        val failures = ArrayList<String>()
        for ((name, increment) in cases()) {
            val (_, pane) = render(increment)
            all(pane).filterIsInstance<JComponent>()
                .filter { (it is JTextComponent && it.isEditable && it.isEnabled) || it is AbstractButton }
                .filter { it.accessibleContext?.accessibleName.isNullOrBlank() }
                .forEach { failures.add("$name: unnamed ${it.javaClass.simpleName}") }
        }
        assertTrue(failures.joinToString("\n"), failures.isEmpty())
    }

    fun testFormFieldsOfTheSimpleFormCarryTheirWireIds() {
        val (_, pane) = render(cases().toMap().getValue("simple-form"))
        val ids = all(pane).filterIsInstance<JComponent>()
            .mapNotNull { it.getClientProperty("mateu.fieldId") as String? }.toSet()
        assertTrue("simple-form fields: $ids", ids.isNotEmpty())
    }

    fun testTheValidationCaseRefusesAnEmptySaveClientSide() {
        val (ctx, pane) = render(cases().toMap().getValue("validation"))
        // a crud `save` (bubbled to the mediator, which validates) with the conditions the wire carries
        // the case seeds a valid record (Ada, 36): empty the required fields and go under the minimum
        ctx.currentComponentState.putAll(mapOf("name" to "", "email" to null, "age" to 15))
        ctx.runAction("save", null, silent = true)
        assertEquals(
            mapOf("name" to "Cannot be empty", "email" to "Cannot be empty", "age" to "Must be at least 18"),
            ctx.currentFieldErrors.toMap(),
        )
        PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
        assertTrue(all(pane).filterIsInstance<JLabel>().any { it.text == "Must be at least 18" })
        ctx.currentComponentState.putAll(mapOf("name" to "Ada", "email" to "a@b.c", "age" to 120))
        ctx.runAction("save", null, silent = true)
        assertEquals(mapOf("age" to "Must be at most 99"), ctx.currentFieldErrors.toMap())
    }

    fun testTheWindowTitleCommandOfEachCaseReachesTheView() {
        for ((name, increment) in cases()) {
            val title = increment.path("commands").firstOrNull { it.path("type").asText() == "SetWindowTitle" }
                ?.path("data")?.asText() ?: continue
            val (ctx, _) = render(increment)
            if (!title.startsWith("[")) assertEquals(name, title, ctx.lastWindowTitle)
        }
    }
}
