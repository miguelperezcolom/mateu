package io.mateu.ijp.hub

import com.intellij.testFramework.fixtures.BasePlatformTestCase
import com.intellij.util.xmlb.XmlSerializer

/** The hub's list must survive the app: its state serialises (what the platform writes to mateu-hub.xml)
 *  and reads back. A state the serialiser cannot write is silently never saved. */
class HubStorePersistenceTest : BasePlatformTestCase() {

    fun testTheListSerialisesAndReadsBack() {
        val store = HubStore()
        store.edit { it.add("https://museums-rw.ec1.mateu.io", HubManifest.Manifest(name = "Museums")) }
        val xml = XmlSerializer.serialize(store.state)
        assertTrue(com.intellij.openapi.util.JDOMUtil.write(xml), com.intellij.openapi.util.JDOMUtil.write(xml).contains("museums-rw.ec1.mateu.io"))
        val back = XmlSerializer.deserialize(xml, HubStore.StateBean::class.java)
        val other = HubStore().also { it.loadState(back) }
        assertEquals(listOf("https://museums-rw.ec1.mateu.io"), other.list.entries.map { it.baseUrl })
    }
}
