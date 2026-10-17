package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** A page with no app shell: the REST sources a response names resolve its refs (= libs/mateu). */
class ReferencedRestSourcesTest : TestCase() {

    private val mapper = ObjectMapper()

    private val sources = RestSourceCatalogue()

    fun testAResponsesSourcesResolveItsRefs() {
        sources.registerRestSources(null)
        sources.addReferencedRestSources(mapper.readTree("""[{"name":"late","source":{"url":"https://late.example.com/x"}}]"""))
        assertEquals("https://late.example.com/x", sources.restSource("late")?.path("source")?.path("url")?.asText())
    }

    fun testTheAppCatalogueStillWinsANameClash() {
        sources.addReferencedRestSources(mapper.readTree("""[{"name":"late","source":{"url":"/response"}}]"""))
        sources.registerRestSources(mapper.readTree("""[{"name":"late","source":{"url":"/app"}}]"""))
        assertEquals("/app", sources.restSource("late")?.path("source")?.path("url")?.asText())
    }
}
