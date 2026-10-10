package io.mateu.ijp.state

import junit.framework.TestCase

/** Same cases as the server's TemplateInterpolatorUrlTest: a direct fetch reaches the proxied url. */
class InterpolateUrlTest : TestCase() {

    private fun url(template: String, state: Map<String, Any?>, appState: Map<String, Any?> = emptyMap()) =
        Expressions.interpolateUrl(template, mapOf("state" to state, "appState" to appState))

    fun testAPathValueCannotAddSegmentsOrAQuery() {
        assertEquals(
            "https://api.example.com/people/1%2F..%2F..%2Fadmin%3Fx%3D",
            url("https://api.example.com/people/\${state.id}", mapOf("id" to "1/../../admin?x=")),
        )
    }

    fun testAQueryValueCannotAddParameters() {
        assertEquals(
            "/search?q=a%20b%26page%3D99%23frag&page=1",
            url("/search?q=\${state.q}&page=1", mapOf("q" to "a b&page=99#frag")),
        )
    }

    fun testReservedAndUnicodeCharactersAreEncodedLikeTheServer() {
        assertEquals("/x/%C3%91and%C3%BA%20%21%27%28%29%2A~._-", url("/x/\${state.v}", mapOf("v" to "Ñandú !'()*~._-")))
    }

    fun testClientStateCannotChooseTheOriginButAConfiguredOneIsRaw() {
        assertThrows { url("\${state.base}/people", mapOf("base" to "http://169.254.169.254")) }
        assertThrows { url("https://\${state.host}/people", mapOf("host" to "evil")) }
        assertEquals(
            "https://h/v1/people/7",
            url("\${appState.base}/people/\${state.id}", mapOf("id" to 7), mapOf("base" to "https://h/v1")),
        )
    }

    fun testADotSegmentIsRefusedInThePathButNotInTheQuery() {
        assertThrows { url("/people/\${state.id}", mapOf("id" to "..")) }
        assertEquals("/people?id=..", url("/people?id=\${state.id}", mapOf("id" to "..")))
    }

    private fun assertThrows(block: () -> Unit) {
        try {
            block()
            fail("expected the value to be refused")
        } catch (expected: IllegalArgumentException) {
            // refused, as it should be
        }
    }
}
