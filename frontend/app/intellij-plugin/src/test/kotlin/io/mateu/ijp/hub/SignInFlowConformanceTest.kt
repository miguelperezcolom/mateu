package io.mateu.ijp.hub

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import java.io.File
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The sign-in flow corpus (conformance/client/sign-in-flow.json), shared with the React Native app
 * (src/core/signInFlow.conformance.test.ts): the desktop offers the providers the corpus says, in its
 * order, straight to one or with a chooser. Native platforms only (`web` cases are the web renderers').
 */
class SignInFlowConformanceTest {

    private val mapper = ObjectMapper()

    private fun corpus(): JsonNode {
        var dir: File? = File("").absoluteFile
        while (dir != null) {
            val f = File(dir, "conformance/client/sign-in-flow.json")
            if (f.exists()) return mapper.readTree(f)
            dir = dir.parentFile
        }
        error("conformance/client/sign-in-flow.json not found above ${File("").absolutePath}")
    }

    @Test
    fun `every native case offers the providers the corpus says`() {
        val cases = corpus().path("cases").filter { it.path("platform").asText() != "web" }
        assertTrue("the corpus has desktop cases", cases.count { it.path("platform").asText() == "desktop" } >= 2)
        for (c in cases) {
            val auth = c.get("auth")?.takeUnless { it.isNull }
            val providers = SignInProviders.parse(auth, c.path("platform").asText())
            val name = c.path("name").asText()
            assertEquals(name, c.path("expect").path("providers").map { it.asText() }, providers.map { it.id })
            assertEquals(name, c.path("expect").path("mode").asText(), SignInProviders.modeOf(providers).name.lowercase())
        }
    }
}
