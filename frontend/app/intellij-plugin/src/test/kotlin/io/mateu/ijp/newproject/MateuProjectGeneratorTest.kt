package io.mateu.ijp.newproject

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.newfile.MateuNewFiles
import io.mateu.ijp.newfile.MiniSchemaValidator
import io.mateu.ijp.newproject.MateuProjectGenerator.Options
import java.io.File
import java.nio.file.Files
import junit.framework.TestCase
import org.yaml.snakeyaml.Yaml

/**
 * The New Project generator, run over the starters BUNDLED with the plugin (so the copyStarters
 * staging is tested too). Mirrors the VS Code extension's newProject.test.ts: the same shared cases
 * (starters/generator/cases.json), every combination, and — when node and the extension's compiled
 * engine are around — a byte-for-byte comparison with the TypeScript engine.
 */
class MateuProjectGeneratorTest : TestCase() {

    private val mapper = ObjectMapper()
    private val sources = MateuProjectGenerator.Bundled
    private val manifest = MateuProjectGenerator.manifest(sources)
    private val cases: List<JsonNode> by lazy {
        mapper.readTree(sources.read("generator/cases.json") ?: error("cases.json not bundled")).path("cases").toList()
    }
    private val schema: JsonNode by lazy {
        mapper.readTree(javaClass.getResourceAsStream("/schema/specs-schema.json") ?: error("schema not on classpath"))
    }

    private fun options(n: JsonNode) = Options(
        authoring = n.path("authoring").asText(),
        runtime = n.path("runtime").takeIf { it.isTextual }?.asText(),
        buildTool = n.path("buildTool").takeIf { it.isTextual }?.asText(),
        renderer = n.path("renderer").takeIf { it.isTextual }?.asText(),
        sample = n.path("sample").asText(),
        pages = n.path("pages").map { it.asText() },
        groupId = n.path("groupId").asText(),
        artifactId = n.path("artifactId").asText(),
        packageName = n.path("packageName").asText(),
        version = n.path("version").asText(),
    )

    private fun Map<String, ByteArray>.text(p: String) = String(this[p] ?: error("not generated: $p"))

    fun testTheStartersAreBundled() {
        val all = sources.list()
        assertTrue(all.contains("generator/new-project.json"))
        for (d in listOf("spring-mvc", "yaml", "static", "dotnet", "python")) assertTrue("$d/AGENTS.md", all.contains("$d/AGENTS.md"))
        assertFalse("build output is not bundled", all.any { it.contains("/target/") })
    }

    fun testSharedCases() {
        assertTrue(cases.size >= 8)
        for (c in cases) {
            val name = c.path("name").asText()
            val files = MateuProjectGenerator.generate(sources, options(c.path("options")))
            c.path("files").forEach { assertTrue("$name: ${it.asText()} generated", files.containsKey(it.asText())) }
            c.path("absent").forEach { assertFalse("$name: ${it.asText()} absent", files.containsKey(it.asText())) }
            c.path("contains").fields().forEach { (p, subs) -> subs.forEach { assertTrue("$name: $p ∋ ${it.asText()}", files.text(p).contains(it.asText())) } }
            c.path("lacks").fields().forEach { (p, subs) -> subs.forEach { assertFalse("$name: $p ∌ ${it.asText()}", files.text(p).contains(it.asText())) } }
        }
    }

    private fun everyCombination(): List<Options> {
        val all = mutableListOf<Options>()
        val pages = MateuNewFiles.catalogue.pageTemplates.map { it.id }
        for (a in manifest.path("authoring")) {
            val id = a.path("id").asText()
            val runtimes = a.path("runtimes").map { it.asText() }.ifEmpty { listOf(null) }
            for (rt in runtimes) {
                val r = MateuProjectGenerator.resolve(manifest, id, rt).getOrThrow()
                for (sample in r.samples) for (renderer in r.renderers.ifEmpty { listOf(null) }) {
                    if (MateuProjectGenerator.incompatibility(manifest, id, rt, renderer, sample) != null) continue
                    all += Options(
                        authoring = id, runtime = rt, renderer = renderer, sample = sample,
                        pages = if (a.path("pages").asBoolean(false)) pages else emptyList(),
                        groupId = "com.acme", artifactId = "my-app", packageName = "com.acme.myapp", version = "3.0-alpha.999",
                    )
                }
            }
        }
        return all
    }

    fun testEveryCombination() {
        val all = everyCombination()
        assertEquals(setOf("code", "yaml", "static", "both"), all.map { it.authoring }.toSet())
        assertEquals(manifest.path("runtimes").map { it.path("id").asText() }.toSet(), all.mapNotNull { it.runtime }.toSet())
        val leftover = Regex("__(ROUTES|MENU|APP_TITLE|NUGET_VERSION|PYPI_VERSION|TITLE|NAME|PAGE_WIDTH)__")
        for (o in all) {
            val label = "${o.authoring}/${o.runtime}/${o.sample}/${o.renderer}"
            val files = MateuProjectGenerator.generate(sources, o)
            assertTrue("$label AGENTS.md", files.containsKey("AGENTS.md"))
            assertTrue("$label CLAUDE.md imports AGENTS.md", files.text("CLAUDE.md").contains("@AGENTS.md"))
            for ((p, bytes) in files) {
                assertFalse("$label: $p moved", p.contains("com/example/app"))
                val t = String(bytes)
                assertFalse("$label: $p placeholders", leftover.containsMatchIn(t))
                assertFalse("$label: $p starter ids", t.contains("mateu-starter-"))
                assertFalse("$label: $p package", t.contains("com.example.app"))
                assertFalse("$label: $p repository paths", t.contains("../../backend"))
                // Every generated YAML under specs/ui is a valid specs file (strict schema check).
                if (p.contains("specs/ui/") && p.endsWith(".yaml")) {
                    val node = mapper.valueToTree<JsonNode>(Yaml().load<Any>(t)) as com.fasterxml.jackson.databind.node.ObjectNode
                    node.remove("\$schema")
                    val errors = MiniSchemaValidator(schema).validate(node)
                    assertTrue("$label: $p invalid:\n${errors.joinToString("\n")}", errors.isEmpty())
                }
            }
        }
    }

    fun testHelpers() {
        assertEquals("My shop", MateuProjectGenerator.appTitleOf("my-shop"))
        assertEquals("MyShop", MateuProjectGenerator.namespaceOf("my-shop"))
        assertEquals("App1stApp", MateuProjectGenerator.namespaceOf("1st-app"))
        assertEquals("com.acme.myshop", MateuProjectGenerator.defaultPackage("com.acme", "my-shop"))
        assertEquals("3.0.0-alpha.408", MateuProjectGenerator.nugetVersion("3.0-alpha.408"))
        assertEquals("3.0.0a408", MateuProjectGenerator.pypiVersion("3.0-alpha.408"))
        assertEquals("3.1.0", MateuProjectGenerator.pypiVersion("3.1"))
        val xml = "<metadata><versioning><latest>3.0-alpha.410</latest><release>3.0-alpha.409</release></versioning></metadata>"
        assertEquals("3.0-alpha.409", MateuProjectGenerator.latestMateuVersion(manifest, "x") { xml })
        assertEquals("fallback", MateuProjectGenerator.latestMateuVersion(manifest, "fallback") { error("offline") })
        assertTrue(MateuProjectGenerator.pinnedVersion(sources, "static").matches(Regex("^\\d+\\.\\d+.*")))
    }

    fun testValidation() {
        val base = Options(authoring = "code", runtime = "quarkus", renderer = "vaadin", sample = "crud", groupId = "com.acme", artifactId = "x", packageName = "com.acme.x", version = "3.0-alpha.1")
        assertEquals(emptyList<String>(), MateuProjectGenerator.validate(manifest, base))
        assertTrue(MateuProjectGenerator.validate(manifest, base.copy(renderer = "redwood")).joinToString().contains("renderer"))
        assertTrue(MateuProjectGenerator.validate(manifest, base.copy(buildTool = "gradle")).joinToString().contains("Build tool"))
        assertTrue(MateuProjectGenerator.validate(manifest, base.copy(artifactId = "My App")).joinToString().contains("Artifact id"))
        assertTrue(MateuProjectGenerator.validate(manifest, base.copy(authoring = "yaml")).joinToString().contains("runs on"))
        assertEquals(emptyList<String>(), MateuProjectGenerator.validate(manifest, base.copy(runtime = "spring-mvc", renderer = "redwood")))
        val withRule = (manifest.deepCopy() as com.fasterxml.jackson.databind.node.ObjectNode).also {
            it.putArray("incompatible").addObject().put("renderer", "redwood").put("sample", "crud").put("reason", "not on Redwood yet")
        }
        assertTrue(MateuProjectGenerator.validate(withRule, base.copy(runtime = "spring-mvc", renderer = "redwood")).joinToString().contains("not on Redwood yet"))
        assertEquals(emptyList<String>(), MateuProjectGenerator.validate(manifest, base.copy(authoring = "static", runtime = null, sample = "listing")))
    }

    fun testWritesIntoAnEmptyFolderOnly() {
        val dir = Files.createTempDirectory("mateu-new-project").toFile()
        try {
            val target = File(dir, "app")
            MateuProjectGenerator.write(MateuProjectGenerator.generate(sources, options(cases.first().path("options"))), target)
            assertTrue(File(target, "src/main/java/com/acme/shop/Products.java").isFile)
            assertTrue(File(target, ".gitignore").isFile)
            try {
                MateuProjectGenerator.write(mapOf("x" to "y".toByteArray()), target)
                fail("wrote into a non-empty folder")
            } catch (_: IllegalArgumentException) {
            }
        } finally {
            dir.deleteRecursively()
        }
    }

    /**
     * The two engines must agree byte for byte. Runs the TypeScript engine (the VS Code extension's
     * compiled out/newProject.js) when node and the compiled extension are available; skipped otherwise.
     */
    fun testAgreesWithTheTypeScriptEngine() {
        val ext = File("../vscode-extension").canonicalFile
        val engine = File(ext, "out/newProject.js")
        val node = listOf("/opt/homebrew/bin/node", "/usr/local/bin/node", "/usr/bin/node").map(::File).firstOrNull { it.canExecute() }
            ?: System.getenv("PATH")?.split(File.pathSeparator)?.map { File(it, "node") }?.firstOrNull { it.canExecute() }
        if (!engine.isFile || node == null) {
            println("SKIP testAgreesWithTheTypeScriptEngine: no node or no compiled ${engine.path}")
            return
        }
        val repoStarters = File("../../../starters").canonicalFile
        val tmp = Files.createTempDirectory("mateu-engines").toFile()
        try {
            for ((i, c) in cases.withIndex()) {
                val opts = c.path("options")
                val out = File(tmp, "ts-$i")
                val script = """
                    const np = require(${mapper.writeValueAsString(engine.path)});
                    const sources = { starters: ${mapper.writeValueAsString(repoStarters.path)},
                      pageCatalogue: ${mapper.writeValueAsString(File("src/main/resources/mateu/new-file-kinds.json").canonicalPath)},
                      pageTemplatesDir: ${mapper.writeValueAsString(File("src/main/resources/fileTemplates/internal").canonicalPath)} };
                    np.writeProject(np.generateProject(sources, ${mapper.writeValueAsString(opts)}), ${mapper.writeValueAsString(out.path)});
                """.trimIndent()
                val p = ProcessBuilder(node.path, "-e", script).redirectErrorStream(true).start()
                val log = p.inputStream.bufferedReader().readText()
                assertEquals("node failed: $log", 0, p.waitFor())
                val ts = out.walkTopDown().filter { it.isFile }.associate { it.relativeTo(out).invariantSeparatorsPath to it.readBytes() }
                val kt = MateuProjectGenerator.generate(MateuProjectGenerator.Directory(repoStarters), options(opts))
                assertEquals("${c.path("name").asText()}: same files", ts.keys.sorted(), kt.keys.sorted())
                for ((path, bytes) in kt) assertEquals("${c.path("name").asText()}: $path", String(ts[path]!!), String(bytes))
            }
        } finally {
            tmp.deleteRecursively()
        }
    }
}
