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
}
