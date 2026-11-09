package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/**
 * A federated shell's content target (libs/mateu appContentTarget.ts): a remote screen mounted as
 * the home loads from ITS backend, and a remote menu option names its own view type or none —
 * the desktop used to load both from the shell's backend, which answered 403.
 */
class ContentTargetTest : TestCase() {

    private val shell = "http://localhost:8640"

    fun testAnAbsoluteHomeBaseUrlWinsARelativeOneIsTheShells() {
        assertEquals("http://localhost:8641", ContentTarget.homeBase("http://localhost:8641/", shell))
        assertEquals(shell, ContentTarget.homeBase("/fed", shell))
        assertEquals(shell, ContentTarget.homeBase(null, shell))
        assertTrue(ContentTarget.isForeign(ContentTarget.homeBase("http://localhost:8641", shell), shell))
        assertFalse(ContentTarget.isForeign(ContentTarget.homeBase("", shell), shell))
    }

    fun testARemoteOptionNamesItsOwnTypeOrNoneNeverTheShells() {
        assertEquals("remote.Stock", ContentTarget.optionServerSideType("remote.Stock", "http://localhost:8641", shell, "shell.App"))
        assertNull(ContentTarget.optionServerSideType("", "http://localhost:8642", shell, "shell.App"))
        assertEquals("shell.App", ContentTarget.optionServerSideType("", "", shell, "shell.App"))
    }

    fun testAMenuLeafOfAnotherBackendOpensAsARemoteView() {
        val session = AppSession(shell)
        session.appServerSideType = "shell.App"
        val opened = mutableListOf<String>()
        session.openViewHandler = { _, route, _, sst, _ -> opened += "local $route $sst" }
        session.openRemoteViewHandler = { _, route, _, sst, _, base -> opened += "remote $route $sst $base" }
        val mapper = ObjectMapper()
        session.openMenuEntry(mapper.readTree("""{"label":"Orders","route":"/orders","baseUrl":"http://localhost:8642/"}"""))
        session.openMenuEntry(mapper.readTree("""{"label":"Home","route":"/home","serverSideType":"shell.Home"}"""))
        assertEquals(listOf("remote /orders null http://localhost:8642", "local /home shell.Home"), opened)
    }
}
