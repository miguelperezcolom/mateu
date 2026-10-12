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
        val xml = javaClass.getResource("/META-INF/plugin.xml")!!.readText()
        assertTrue(xml.contains("""<notificationGroup id="Mateu errors" displayType="STICKY_BALLOON"/>"""))
        assertTrue(xml.contains("""<notificationGroup id="Mateu" displayType="BALLOON"/>"""))
    }
}
