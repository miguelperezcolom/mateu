package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** A page with no app shell: the REST sources a response names resolve its refs (= libs/mateu). */
class ReferencedRestSourcesTest : TestCase() {

    private val mapper = ObjectMapper()

    override fun tearDown() {
        RestFetch.registerRestSources(null)
        RestFetch.clearReferencedRestSources()
    }

    fun testAResponsesSourcesResolveItsRefs() {
        RestFetch.registerRestSources(null)
        RestFetch.addReferencedRestSources(mapper.readTree("""[{"name":"late","source":{"url":"https://late.example.com/x"}}]"""))
        assertEquals("https://late.example.com/x", RestFetch.restSource("late")?.path("source")?.path("url")?.asText())
    }

    fun testTheAppCatalogueStillWinsANameClash() {
        RestFetch.addReferencedRestSources(mapper.readTree("""[{"name":"late","source":{"url":"/response"}}]"""))
        RestFetch.registerRestSources(mapper.readTree("""[{"name":"late","source":{"url":"/app"}}]"""))
        assertEquals("/app", RestFetch.restSource("late")?.path("source")?.path("url")?.asText())
    }
}
