package io.mateu.ijp.mcp

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase
import java.io.File

/**
 * The authoring vocabulary bundled for `mateu_show_screen`: COPIES of backend/shared/uidl, pinned
 * byte-equal here (like the Python package's and the sidecar's copies). Fails after the schemas are
 * regenerated until they are copied again:
 *   cp backend/shared/uidl/{authoring-guide.md,uidl-catalog.json,specs-schema.json} \
 *      frontend/app/intellij-plugin/src/main/resources/mateu/authoring/
 */
class AuthoringResourcesTest : TestCase() {

    private val mapper = ObjectMapper()

    private val uidlDir: File by lazy {
        generateSequence(File(System.getProperty("user.dir")).absoluteFile) { it.parentFile }
            .map { File(it, "backend/shared/uidl") }
            .first { File(it, "authoring-guide.md").isFile }
    }

    fun testTheBundledCopiesAreTheSources() {
        for ((_, file) in AuthoringResources.RESOURCES) {
            val source = File(uidlDir, file).readBytes()
            val bundled = AuthoringResources::class.java.getResourceAsStream("/mateu/authoring/$file")!!.use { it.readBytes() }
            assertTrue("$file differs from backend/shared/uidl/$file: copy it again", source.contentEquals(bundled))
        }
    }

    fun testTheResourcesAreTheBackendsUris() {
        assertEquals(listOf("mateu://guide", "mateu://catalog", "mateu://schema/specs"), AuthoringResources.RESOURCES.map { it.first.uri })
        assertTrue(AuthoringResources.byUri("mateu://guide")!!.isNotBlank())
        assertNull(AuthoringResources.byUri("mateu://nope"))
    }

    fun testListingComponents() {
        val all = AuthoringResources.list("", mapper)
        assertTrue(all.path("count").asInt() > 50)
        val forms = AuthoringResources.list("formfield", mapper)
        assertTrue(forms.path("components").any { it.path("type").asText() == "FormField" })
        assertTrue(forms.path("count").asInt() < all.path("count").asInt())
    }

    fun testASchemaWithItsDefinitions() {
        val s = AuthoringResources.schemaOf("FormField", mapper)
        assertEquals("FormField", s.path("type").asText())
        assertTrue(s.path("schema").isObject)
        assertTrue(s.path("definitions").isObject)
    }

    fun testAnUnknownTypeSuggests() {
        val e = runCatching { AuthoringResources.schemaOf("FormFeld", mapper) }.exceptionOrNull()
        assertTrue(e is McpToolError)
        assertTrue(e!!.message!!, e.message!!.contains("Did you mean \"FormField\"?"))
    }
}
