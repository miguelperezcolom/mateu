package io.mateu.ijp.plugin

import junit.framework.TestCase

/** An error stays until dismissed (the sticky group); the rest fade (the plain balloon group). */
class MessageGroupsTest : TestCase() {

    fun testAnErrorGoesToTheStickyGroup() {
        assertEquals("Mateu errors", MessageGroups.groupFor("error"))
    }

    fun testTheRestAreOrdinaryBalloons() {
        assertEquals("Mateu", MessageGroups.groupFor("success"))
        assertEquals("Mateu", MessageGroups.groupFor(null))
    }

    fun testBothGroupsAreDeclared() {
        val xml = java.io.File("src/main/resources/META-INF/plugin.xml").readText()
        assertTrue(Regex("""<notificationGroup\s+id="Mateu errors"\s+displayType="STICKY_BALLOON"""").containsMatchIn(xml))
        assertTrue(Regex("""<notificationGroup\s+id="Mateu"\s+displayType="BALLOON"""").containsMatchIn(xml))
    }

    fun testAMessagesPersistencePicksItsGroup() {
        assertEquals("Mateu messages", MessageGroups.groupFor(io.mateu.ijp.state.Persistence.TOAST))
        assertEquals("Mateu sticky", MessageGroups.groupFor(io.mateu.ijp.state.Persistence.STICKY))
        assertEquals("Mateu inbox (new)", MessageGroups.groupFor(io.mateu.ijp.state.Persistence.INBOX))
        assertEquals("Mateu inbox", MessageGroups.inboxGroup(live = false))
        assertEquals("Mateu inbox (new)", MessageGroups.inboxGroup(live = true))
    }

    fun testEveryGroupItPostsToIsDeclared() {
        val xml = java.io.File("src/main/resources/META-INF/plugin.xml").readText()
        val declared = Regex("""<notificationGroup\s+id="([^"]+)"""").findAll(xml).map { it.groupValues[1] }.toSet()
        listOf(
            MessageGroups.DEFAULT, MessageGroups.ERRORS, MessageGroups.MESSAGES, MessageGroups.STICKY,
            MessageGroups.INBOX, MessageGroups.INBOX_NEW, MessageGroups.TASKS,
        ).forEach { assertTrue("$it declared", it in declared) }
        // the fetched inbox goes to the tool window only; a toast is not kept there
        assertTrue(Regex("""id="Mateu inbox"\s+displayType="NONE"""").containsMatchIn(xml))
        assertTrue(Regex("""id="Mateu messages"\s+displayType="BALLOON"\s+isLogByDefault="false"""").containsMatchIn(xml))
    }
}
