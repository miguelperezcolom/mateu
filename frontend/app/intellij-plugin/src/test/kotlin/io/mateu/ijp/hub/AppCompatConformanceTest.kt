package io.mateu.ijp.hub

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import java.io.File
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The app/UI compatibility rule (conformance/client/app-compat.json), shared with the React Native
 * app (src/hub/compat.conformance.test.ts, the reference).
 */
class AppCompatConformanceTest {

    private val mapper = ObjectMapper()

    private fun corpus(): JsonNode {
        var dir: File? = File("").absoluteFile
        while (dir != null) {
            val f = File(dir, "conformance/client/app-compat.json")
            if (f.exists()) return mapper.readTree(f)
            dir = dir.parentFile
        }
        error("conformance/client/app-compat.json not found above ${File("").absolutePath}")
    }

    private fun JsonNode.text(field: String): String? = get(field)?.takeIf { it.isTextual }?.asText()

    @Test
    fun theCorpus() {
        val cases = corpus().get("cases")
        assertTrue(cases.size() >= 20)
        for (c in cases) {
            val app = c.get("app")
            val ui = c.get("ui")
            val result = AppCompat.of(
                AppCompat.Ui(ui.text("wireVersion"), ui.text("minAppVersion"), ui.text("mateuVersion")),
                AppCompat.App(app.text("wire")!!, app.text("mateuVersion"), app.text("appVersion")),
            )
            val expect = c.get("expect")
            val name = c.get("name").asText()
            assertEquals(name, expect.get("status").asText(), result.status.name.lowercase())
            assertEquals(name, expect.text("reason"), result.reason?.id)
        }
    }

    @Test
    fun theDesktopAppIgnoresMinAppVersionWhichSpeaksOfThePhoneApp() {
        val result = AppCompat.of(AppCompat.Ui(minAppVersion = "9.0.0"), AppCompat.App("3.0", "3.0-beta.33", appVersion = null))
        assertEquals(AppCompat.Status.COMPATIBLE, result.status)
        assertNull(result.reason)
    }

    @Test
    fun theManifestKeepsOnlyARelease() {
        val base = "https://acme.com/crm"
        fun parsed(v: String) = HubManifest.parse(mapper.readTree("""{"name":"x","mateuVersion":"$v"}"""), base).mateuVersion
        assertEquals("3.0-beta.33", parsed("3.0-beta.33"))
        assertEquals("3.0.0b33", parsed("3.0.0b33"))
        assertNull(parsed("0.0.1-MATEU"))
        assertNull(parsed("<script>"))
    }
}
