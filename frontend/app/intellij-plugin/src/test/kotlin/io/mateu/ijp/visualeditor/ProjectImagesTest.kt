package io.mateu.ijp.visualeditor

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.nio.file.Files
import java.nio.file.Path

/** The image picker's host half: listing a project's images, their served URLs, the copy, the serving. */
class ProjectImagesTest {

    @get:Rule val tmp = TemporaryFolder()

    private fun touch(root: Path, rel: String, bytes: ByteArray = byteArrayOf(1, 2, 3)): Path {
        val f = root.resolve(rel)
        Files.createDirectories(f.parent)
        Files.write(f, bytes)
        return f
    }

    @Test
    fun aFileUnderAWebRootIsServedAtThePathBelowIt() {
        assertEquals("/img/hero.jpg", ProjectImages.servedUrl("src/main/resources/static/img/hero.jpg"))
        assertEquals("/a.png", ProjectImages.servedUrl("src/main/resources/public/a.png"))
        assertEquals("/webjars/x.svg", ProjectImages.servedUrl("src/main/resources/META-INF/resources/webjars/x.svg"))
        assertEquals("/logo.png", ProjectImages.servedUrl("public/logo.png"))
        assertEquals("/images/a.webp", ProjectImages.servedUrl("wwwroot/images/a.webp"))
        assertEquals("/x.avif", ProjectImages.servedUrl("app/static/x.avif"))
        assertEquals("/x.png", ProjectImages.servedUrl("src\\main\\resources\\static\\x.png"))
        assertNull(ProjectImages.servedUrl("src/main/resources/specs/ui/x.png"))
        assertNull(ProjectImages.servedUrl("docs/x.png"))
        assertNull(ProjectImages.servedUrl("static/"))
    }

    @Test
    fun listsTheImagesOfTheWebRootsAndSkipsBuildOutput() {
        val m = tmp.newFolder("shop").toPath()
        touch(m, "pom.xml")
        touch(m, "src/main/resources/static/img/hero.jpg")
        touch(m, "src/main/resources/static/img/notes.txt")
        touch(m, "src/main/resources/public/brand/logo.svg")
        touch(m, "src/main/resources/specs/ui/welcome.yaml")
        touch(m, "target/classes/static/img/hero.jpg")
        touch(m, "node_modules/pkg/public/x.png")
        touch(m, "build/public/y.png")
        touch(m, "docs/screenshot.png")
        val found = ProjectImages.list(m)
        assertEquals(
            listOf(
                ProjectImages.Found("src/main/resources/public/brand/logo.svg", "/brand/logo.svg"),
                ProjectImages.Found("src/main/resources/static/img/hero.jpg", "/img/hero.jpg"),
            ),
            found,
        )
    }

    @Test
    fun theModuleIsTheNearestFolderWithABuildFile() {
        val p = tmp.newFolder("repo").toPath()
        touch(p, "pom.xml")
        touch(p, "app/pom.xml")
        val page = touch(p, "app/src/main/resources/specs/ui/welcome.yaml")
        assertEquals(p.resolve("app"), ProjectImages.moduleRootOf(page))
        val loose = touch(tmp.newFolder("loose").toPath(), "specs/ui/x.yaml")
        assertEquals(loose.parent, ProjectImages.moduleRootOf(loose))
    }

    @Test
    fun addCopiesIntoTheImagesFolderOfTheModulesKind() {
        val java = tmp.newFolder("java").toPath().also { touch(it, "pom.xml") }
        val dotnet = tmp.newFolder("dotnet").toPath().also { touch(it, "Shop.csproj") }
        val python = tmp.newFolder("python").toPath().also { touch(it, "pyproject.toml") }
        val existing = tmp.newFolder("existing").toPath().also { touch(it, "public/favicon.ico") }
        assertEquals(java.resolve("src/main/resources/static/images"), ProjectImages.targetDir(java))
        assertEquals(dotnet.resolve("wwwroot/images"), ProjectImages.targetDir(dotnet))
        assertEquals(python.resolve("static/images"), ProjectImages.targetDir(python))
        assertEquals(existing.resolve("public/images"), ProjectImages.targetDir(existing))

        val source = touch(tmp.newFolder("downloads").toPath(), "hero.jpg", byteArrayOf(9, 9))
        val first = ProjectImages.copyInto(java, source)
        assertEquals(ProjectImages.Found("src/main/resources/static/images/hero.jpg", "/images/hero.jpg"), first)
        assertTrue(Files.exists(java.resolve(first.path)))
        // never over an existing file
        val second = ProjectImages.copyInto(java, source)
        assertEquals("/images/hero-1.jpg", second.url)
        assertEquals(listOf("/images/hero-1.jpg", "/images/hero.jpg"), ProjectImages.list(java).map { it.url })
    }

    @Test
    fun theLoopbackServerAnswersARegisteredModulesImagesAndNothingElse() {
        val m = tmp.newFolder("served").toPath()
        touch(m, "src/main/resources/static/img/hero image.png", byteArrayOf(7, 7, 7))
        touch(m, "secret.yaml")
        val token = MateuVisualEditorServer.registerImageRoot(m)
        val url = MateuVisualEditorServer.imageUrl(token, "src/main/resources/static/img/hero image.png")
        assertTrue(url, url.startsWith("/__mateu-images/$token/") && url.contains("hero%20image.png"))
        assertNotNull(MateuVisualEditorServer.imageFileOf(url))
        assertNull(MateuVisualEditorServer.imageFileOf("/__mateu-images/$token/secret.yaml"))
        assertNull(MateuVisualEditorServer.imageFileOf("/__mateu-images/$token/../../etc/passwd.png"))
        assertNull(MateuVisualEditorServer.imageFileOf("/__mateu-images/unknown/src/main/resources/static/img/hero%20image.png"))

        val port = MateuVisualEditorServer.ensureStarted("http://localhost:1")
        val http = HttpClient.newHttpClient()
        val ok = http.send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:$port$url")).GET().build(), HttpResponse.BodyHandlers.ofByteArray())
        assertEquals(200, ok.statusCode())
        assertEquals("image/png", ok.headers().firstValue("content-type").orElse(""))
        assertEquals(listOf<Byte>(7, 7, 7), ok.body().toList())
        val missing = http.send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:$port/__mateu-images/$token/secret.yaml")).GET().build(), HttpResponse.BodyHandlers.ofByteArray())
        assertEquals(404, missing.statusCode())
    }

    @Test
    fun theBoardWritesOnlyMountYamlFiles() {
        assertTrue(MateuVisualEditor.isWritableSpecPath("routes.yaml"))
        assertTrue(MateuVisualEditor.isWritableSpecPath("sales/orders.yml"))
        for (p in listOf("", "/etc/x.yaml", "../pom.xml", "a/../../x.yaml", "C:/x.yaml", "x.json", "a\\x.yaml")) {
            assertTrue(p, !MateuVisualEditor.isWritableSpecPath(p))
        }
    }
}
