package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase
import java.util.Locale

/** A backend message read as semantics: persistence, actions (undo among them), dedup key. */
class MessageSpecsTest : TestCase() {

    private val json = ObjectMapper()

    private fun spec(body: String) = MessageSpecs.of(json.readTree(body))

    fun testTheDeclaredPersistenceWins() {
        assertEquals(Persistence.INBOX, spec("""{"text":"x","variant":"error","persistence":"inbox"}""").persistence)
        assertEquals(Persistence.TOAST, spec("""{"text":"x","persistence":"toast","duration":0}""").persistence)
    }

    fun testWithoutOneAnErrorOrAZeroDurationIsSticky() {
        assertEquals(Persistence.STICKY, spec("""{"text":"x","variant":"error"}""").persistence)
        assertEquals(Persistence.STICKY, spec("""{"text":"x","variant":"success","duration":0}""").persistence)
        assertEquals(Persistence.TOAST, spec("""{"text":"x","variant":"success","duration":3000}""").persistence)
    }

    fun testActionsAreReadAndPositionIsNot() {
        val s = spec(
            """{"text":"Saved","position":"topEnd","key":"k1","actions":[
                {"label":"Open","route":"/r/1"},{"label":"Share","actionId":"share","parameters":{"id":7},"style":"primary"},
                {"label":"nothing to do"}]}""",
        )
        assertEquals("k1", s.key)
        assertEquals(2, s.actions.size)
        assertEquals("/r/1", s.actions[0].route)
        assertEquals("share", s.actions[1].actionId)
        assertEquals(mapOf("id" to 7), s.actions[1].parameters)
    }

    fun testTheLegacyUndoBecomesTheMessagesAction() {
        val s = spec("""{"text":"Deleted","undoActionId":"restore","undoParameters":{"id":3}}""")
        val undo = s.actions.single()
        assertEquals("restore", undo.actionId)
        assertEquals("undo", undo.style)
        assertEquals("Undo", undo.labelFor(Locale.ENGLISH))
        assertEquals("Deshacer", undo.labelFor(Locale.forLanguageTag("es")))
    }

    fun testDeclaredActionsAreNotDoubledByTheLegacyUndo() {
        val s = spec("""{"text":"Deleted","undoActionId":"restore","actions":[{"actionId":"restore","style":"undo"}]}""")
        assertEquals(1, s.actions.size)
    }

    fun testANewNoticeWithTheSameKeyReplacesThePreviousOne() {
        val keyed = KeyedNotices<String>()
        assertNull(keyed.put("k", "first"))
        assertEquals("first", keyed.put("k", "second"))
        assertNull("no key, no dedup", keyed.put(null, "third"))
    }
}
