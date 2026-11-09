package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase
import java.io.File
import java.util.Locale

/** A task's ETA worded exactly as the shared corpus says (conformance/client/eta-format.json). */
class EtaTextTest : TestCase() {

    private val corpus by lazy {
        val file = generateSequence(File(System.getProperty("user.dir")).absoluteFile) { it.parentFile }
            .map { File(it, "conformance/client/eta-format.json") }.first { it.isFile }
        ObjectMapper().readTree(file)
    }

    fun testTheCorpus() {
        val cases = corpus.path("cases")
        assertTrue(cases.size() > 10)
        for (case in cases) {
            val eta = case.path("etaSeconds").takeIf { it.isNumber }?.asInt()
            for (lang in listOf("en", "es")) {
                val expected = case.path(lang).takeIf { it.isTextual }?.asText()
                assertEquals("etaSeconds=$eta ($lang)", expected, NoticeTexts.eta(eta, Locale.forLanguageTag(lang)))
            }
        }
    }

    fun testTheIndicatorShowsTheEtaOfARunningTaskOnly() {
        val json = ObjectMapper()
        val running = ProgressTasks.of(json.readTree(
            """{"taskId":"t1","title":"Import","text":"Row 12","state":"running","done":12,"total":300,"etaSeconds":125}""",
        ))!!
        assertEquals(125, running.etaSeconds)
        assertEquals("12 of 300 · Row 12 · about 2 min left", ProgressTasks.indicatorText2(running, Locale.ENGLISH))
        assertEquals("12 de 300 · Row 12 · unos 2 min restantes", ProgressTasks.indicatorText2(running, Locale.forLanguageTag("es")))
        // indeterminate: the server sends none, and none is shown
        assertEquals("Row 12", ProgressTasks.indicatorText2(running.copy(done = null, total = null, etaSeconds = null), Locale.ENGLISH))
        // finished: never an ETA, even a stale one
        assertEquals("12 of 300 · Row 12", ProgressTasks.indicatorText2(running.copy(state = TaskState.DONE), Locale.ENGLISH))
    }
}
