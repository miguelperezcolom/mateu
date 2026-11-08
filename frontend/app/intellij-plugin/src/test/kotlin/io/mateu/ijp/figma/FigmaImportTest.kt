package io.mateu.ijp.figma

import java.io.File
import java.nio.file.Files
import junit.framework.TestCase

/**
 * The pure parts of Import from Figma… and the runner for real: the bundled driver (staged by
 * copyFigmaImport) extracted and run with this machine's node over the Star Wars fixture. The
 * runner cases are skipped when no node ≥ 20 is installed.
 */
class FigmaImportTest : TestCase() {

    private fun repoFile(rel: String): File {
        var dir: File? = File("").absoluteFile
        while (dir != null) {
            val f = File(dir, rel)
            if (f.exists()) return f
            dir = dir.parentFile
        }
        error("$rel not found")
    }

    private fun node(): String? = runCatching {
        FigmaImportRunner().findNode(FigmaImport.nodeCandidates(null, System.getenv(), System.getProperty("user.home"), false))
    }.getOrNull()

    fun testNodeCandidatesVersionsAndTokens() {
        assertEquals(listOf("/x/node"), FigmaImport.nodeCandidates(" /x/node ", emptyMap(), "/h", false))
        assertEquals(listOf("/a/node", "/b/node"), FigmaImport.nodeCandidates(null, mapOf("PATH" to "/a:/b/"), "/h", false).take(2))
        assertEquals(listOf("C:\\n/node.exe", "C:\\n/node.cmd"), FigmaImport.nodeCandidates(null, mapOf("Path" to "C:\\n"), "/h", true).take(2))
        assertEquals(22, FigmaImport.nodeMajor("v22.3.0"))
        assertNull(FigmaImport.nodeMajor("nope"))
        assertEquals(listOf("a", "b"), FigmaImport.framesOf(" a, ,b "))
        val files = mutableMapOf("/h/.config/mateu/figma-token" to " c\n")
        assertEquals("e", FigmaImport.tokenFromEnvOrFiles(mapOf("FIGMA_TOKEN" to " e "), "/h") { files[it] })
        assertEquals("c", FigmaImport.tokenFromEnvOrFiles(emptyMap(), "/h") { files[it] })
        files["/h/.mateu-secrets/figma-token"] = "b"
        assertEquals("b", FigmaImport.tokenFromEnvOrFiles(emptyMap(), "/h") { files[it] })
        assertNull(FigmaImport.inputProblem("https://www.figma.com/design/AbCdEf123456XyZ/x"))
        assertTrue(FigmaImport.inputProblem("https://example.com/x")!!.startsWith("Not a Figma file URL"))
    }

    fun testReportRoutesAndSummary() {
        val report = FigmaImport.parseReport(
            """{"files":[{"path":"a.yaml","frame":"a","type":"Form","partial":false,"status":"created"},
               {"path":"partials/p.yaml","frame":"p","type":null,"partial":true,"status":"created"},
               {"path":"shell.yaml","frame":"s","type":"AppShell","partial":false,"status":"updated"},
               {"path":"h.yaml","frame":"h","type":"Form","partial":false,"status":"skipped"}],"warnings":["w"],"frames":[]}""",
        )
        assertEquals(listOf("a.yaml"), FigmaImport.routablePages(report).map { it.path })
        val (text, added) = FigmaImport.registerAll("type: Routes\nroutes: []\n", report, "sub")
        assertEquals("type: Routes\nroutes:\n  - route: sub/a\n    layout: sub/a.yaml\n", text)
        assertEquals(listOf("sub/a"), added)
        assertEquals("2 created, 1 updated, 0 unchanged, 1 skipped; 1 route(s) added (sub/a); 1 warning(s)", FigmaImport.summaryOf(report, added))
        assertTrue(runCatching { FigmaImport.parseReport("") }.isFailure)
    }

    fun testTheBundledDriverRunsOverTheFixture() {
        val node = node() ?: return // no node ≥ 20 on this machine
        val out = Files.createTempDirectory("figma-ij").toFile()
        try {
            val fixture = repoFile("design/figma/to-yaml/test/fixtures/starwars.figma.json")
            val report = FigmaImportRunner().run(node, listOf("--json", fixture.path, "--out", out.path, "--frames", "species"), token = "figd_unused")
            assertEquals(listOf("species.yaml", "partials/species-list.yaml"), report.files.map { it.path })
            assertEquals(repoFile("design/figma/to-yaml/test/golden/species.yaml").readText(), File(out, "species.yaml").readText())

            val failure = runCatching {
                FigmaImportRunner().run(node, listOf("--json", fixture.path, "--out", out.path, "--frames", "nope"), token = null)
            }.exceptionOrNull()
            assertTrue(failure is FigmaImportRunner.ImportFailure && failure.message!!.contains("No frame called \"nope\""))
        } finally {
            Files.walk(out.toPath()).use { s -> s.sorted(Comparator.reverseOrder()).forEach { Files.deleteIfExists(it) } }
        }
    }

    fun testAMissingNodeIsAClearError() {
        val e = runCatching { FigmaImportRunner().findNode(listOf("/definitely/not/node")) }.exceptionOrNull()
        assertTrue(e is FigmaImportRunner.ImportFailure && e.message!!.contains("Node.js 20 or newer"))
    }
}
