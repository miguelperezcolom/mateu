package io.mateu.ijp.newfile

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase
import org.yaml.snakeyaml.Yaml

/**
 * Every New | Mateu skeleton, rendered with every page width, must be a valid specs/ui file: it is
 * validated (strictly — unknown keys fail) against the generated specs schema the plugin bundles. The
 * catalogue, the bundled .ft templates and the plugin.xml registrations are kept in lockstep, and the
 * catalogue must cover every file kind the schema's top-level oneOf declares.
 */
class NewMateuFileSkeletonsTest : TestCase() {

    private val mapper = ObjectMapper()
    private val schema: JsonNode by lazy {
        mapper.readTree(javaClass.getResourceAsStream("/schema/specs-schema.json") ?: error("schema not on classpath"))
    }
    private val catalogue = MateuNewFiles.catalogue

    private fun parse(yaml: String): JsonNode = mapper.valueToTree(Yaml().load<Any>(yaml))

    private fun assertValid(label: String, yaml: String): JsonNode {
        val node = parse(yaml)
        val errors = MiniSchemaValidator(schema).validate(node)
        assertTrue("$label is not valid against specs-schema.json:\n${errors.joinToString("\n")}\n---\n$yaml", errors.isEmpty())
        return node
    }

    fun testEveryFileKindSkeletonValidatesAndHasItsType() {
        for (kind in catalogue.files.filter { !it.page }) {
            val text = MateuNewFiles.render(MateuNewFiles.bundledTemplateText(kind.template!!), kind.fileName)
            val node = assertValid(kind.id, text)
            val expected = catalogueJson().path("files").first { it.path("id").asText() == kind.id }.path("schemaType").asText()
            assertEquals("${kind.id} type", expected, node.path("type").asText())
        }
    }

    fun testEveryPageTemplateValidatesWithEveryPageWidth() {
        assertTrue(catalogue.pageTemplates.size >= 17)
        for (t in catalogue.pageTemplates) {
            for (w in catalogue.pageWidths) {
                val text = MateuNewFiles.render(MateuNewFiles.bundledTemplateText(t.template), "my-page", pageWidthStyle = w.style)
                val node = assertValid("${t.id}/${w.id}", text)
                assertFalse("${t.id}: unreplaced placeholder", text.contains("__"))
                if (w.style != null) assertEquals("${t.id}/${w.id} root style", w.style, node.path("style").asText())
            }
            assertTrue("${t.id} default width", catalogue.pageWidths.any { it.id == t.pageWidth })
        }
    }

    fun testCatalogueCoversEverySchemaFileKind() {
        val consts = schema.path("oneOf").mapNotNull { it.path("properties").path("type").path("const").asText(null) }
        assertEquals(setOf("UI", "Routes", "Sources", "Actions", "Translations", "Environment", "Types"), consts.toSet())
        val covered = catalogueJson().path("files").map { it.path("schemaType").asText() }.toSet()
        // The component branch is covered twice: the app shell, and pages (any other component).
        for (k in consts + "AppShell") assertTrue("no New | Mateu entry for type $k", k in covered)
        assertTrue(catalogue.files.any { it.page })
        val shell = schema.path("\$defs").path("AppShell")
        assertEquals("AppShell", shell.path("properties").path("type").path("const").asText())
    }

    fun testTemplatesResourcesAndRegistrationsAreInLockstep() {
        val referenced = (catalogue.files.mapNotNull { it.template } + catalogue.pageTemplates.map { it.template }).toSet()
        // From the source tree: on the test classpath /META-INF/plugin.xml resolves to another plugin's.
        val pluginXml = java.io.File("src/main/resources/META-INF/plugin.xml").readText()
        val registered = Regex("<internalFileTemplate name=\"([^\"]+)\"/>").findAll(pluginXml).map { it.groupValues[1] }.toSet()
        assertEquals("plugin.xml <internalFileTemplate> vs new-file-kinds.json", referenced, registered)
        referenced.forEach { assertNotNull("missing fileTemplates/internal/$it.yaml.ft", javaClass.getResource("/fileTemplates/internal/$it.yaml.ft")) }
    }

    fun testValidatorRejectsWhatTheSchemaForbids() {
        val v = MiniSchemaValidator(schema)
        assertTrue(v.validate(parse("type: Form\ntitle: x\n")).isEmpty())
        assertFalse("typo'd key", v.validate(parse("type: Form\ntitel: x\n")).isEmpty())
        assertFalse("unknown component", v.validate(parse("type: Nope\n")).isEmpty())
        assertFalse("bad enum", v.validate(parse("type: Listing\ngridLayout: grid\n")).isEmpty())
        assertFalse("wrong type", v.validate(parse("type: DashboardLayout\ncolumns: two\n")).isEmpty())
        assertFalse("routes without routes", v.validate(parse("type: Routes\n")).isEmpty())
        assertFalse("nested typo", v.validate(parse("type: Form\ncontent:\n  - {type: Text, txt: a}\n")).isEmpty())
        assertTrue("page with viewModel", v.validate(parse("type: Form\nviewModel: a.B\n")).isEmpty())
    }

    fun testRenderReplacesPlaceholders() {
        val t = "type: VerticalLayout\n  __PAGE_WIDTH__\ntitle: __TITLE__\nid: __NAME__\n"
        assertEquals("type: VerticalLayout\n  style: \"padding: 0;\"\ntitle: My orders\nid: my-orders\n",
            MateuNewFiles.render(t, "my-orders", pageWidthStyle = "padding: 0;"))
        assertEquals("type: VerticalLayout\ntitle: My orders\nid: my-orders\n", MateuNewFiles.render(t, "my-orders"))
    }

    fun testTitlesAreYamlSafe() {
        assertEquals("Customer orders", MateuNewFiles.titleOf("customer-orders"))
        assertEquals("Customer orders", MateuNewFiles.titleOf("customerOrders.yaml"))
        assertEquals("App", MateuNewFiles.titleOf("app.ui"))
        assertEquals("\"Orders: open\"", MateuNewFiles.yamlScalar("Orders: open"))
        assertEquals("\"Yes\"", MateuNewFiles.yamlScalar("Yes"))
        val node = parse(MateuNewFiles.render("{type: Text, text: __TITLE__}", "x", title = "a, {b}: \"c\""))
        assertEquals("a, {b}: \"c\"", node.path("text").asText())
    }

    fun testTargetDir() {
        val existing = setOf("/p/mod/src/main/resources", "/p/mod/src/main/resources/specs/ui", "/p/other/src/main/resources")
        val exists = { s: String -> s in existing }
        // inside specs/ui: respect the folder clicked
        assertEquals("/p/mod/src/main/resources/specs/ui/orders", MateuNewFiles.targetDir("/p/mod/src/main/resources/specs/ui/orders", "/p", exists))
        assertEquals("/p/mod/src/main/resources/specs/ui", MateuNewFiles.targetDir("/p/mod/src/main/resources/specs/ui", "/p", exists))
        // the module's existing specs/ui, found from the module or from deeper folders
        assertEquals("/p/mod/src/main/resources/specs/ui", MateuNewFiles.targetDir("/p/mod", "/p", exists))
        assertEquals("/p/mod/src/main/resources/specs/ui", MateuNewFiles.targetDir("/p/mod/src/main/java/com", "/p", exists))
        // a module with resources but no specs/ui yet
        assertEquals("/p/other/src/main/resources/specs/ui", MateuNewFiles.targetDir("/p/other", "/p", exists))
        // anywhere else
        assertEquals("/q/specs/ui", MateuNewFiles.targetDir("/q", "/q", exists))
        assertEquals("/a.yaml", "/" + MateuNewFiles.fileNameOf("a"))
    }

    private fun catalogueJson(): JsonNode = mapper.readTree(javaClass.getResourceAsStream(MateuNewFiles.RESOURCE))
}
