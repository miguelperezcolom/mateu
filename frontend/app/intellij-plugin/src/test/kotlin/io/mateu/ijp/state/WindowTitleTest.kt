package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** A YAML record page's title follows its own template once the record is in (web windowTitle.ts). */
class WindowTitleTest : TestCase() {

    private val mapper = ObjectMapper()
    private val recordPage = mapper.readTree(
        """{"type":"ServerSide","children":[{"type":"ClientSide","metadata":{"type":"Form","title":"${'$'}{state.name}"},"children":[]}]}""",
    )

    fun testTheTitleResolvesOnceTheRecordIsIn() {
        assertEquals("\${state.name}", WindowTitle.template(recordPage))
        assertNull("nothing yet: the server's title stays", WindowTitle.resolved(recordPage, emptyMap()))
        assertEquals("Voyager 1", WindowTitle.resolved(recordPage, mapOf("name" to "Voyager 1")))
    }

    fun testAPlainTitleIsLeftToTheServer() {
        val plain = mapper.readTree("""{"type":"ClientSide","metadata":{"type":"Form","title":"Missions"},"children":[]}""")
        assertNull(WindowTitle.template(plain))
        assertNull(WindowTitle.resolved(null, mapOf("name" to "x")))
    }
}
