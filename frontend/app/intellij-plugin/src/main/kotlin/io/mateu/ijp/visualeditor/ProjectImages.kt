package io.mateu.ijp.visualeditor

import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardCopyOption
import kotlin.io.path.extension
import kotlin.io.path.isDirectory
import kotlin.io.path.isRegularFile
import kotlin.io.path.name
import kotlin.io.path.nameWithoutExtension

/**
 * The project's images, for the visual editor's image picker: the image files under the folders the
 * app SERVES (Spring's `src/main/resources/static` / `public` / `META-INF/resources`, a `public/`
 * folder, .NET's `wwwroot`, Python's `static`), each with the URL it is served at — `static/img/hero.jpg`
 * is `/img/hero.jpg` — so the property is set to what the running app answers.
 *
 * Plain java.nio over the module's directory, so it is tested on a temp folder with no IDE; the editor
 * refreshes the VFS after a copy. Build output (target, build, node_modules, dist…) is never listed.
 */
object ProjectImages {

    val EXTENSIONS = setOf("png", "jpg", "jpeg", "gif", "svg", "webp", "avif")

    /** Directories never walked: build output, dependencies, VCS and IDE metadata. */
    val SKIPPED = setOf("target", "build", "node_modules", "dist", "out", "bin", "obj", ".git", ".gradle", ".idea", ".vscode")

    /** The web roots, as module-relative paths, most specific first. */
    val WEB_ROOTS = listOf(
        "src/main/resources/static",
        "src/main/resources/public",
        "src/main/resources/META-INF/resources",
        "wwwroot",
        "public",
        "static",
    )

    /** A module-relative image file and the URL the app serves it at. */
    data class Found(val path: String, val url: String)

    fun isImage(name: String): Boolean = name.substringAfterLast('.', "").lowercase() in EXTENSIONS

    /**
     * The URL the app serves a module-relative file at (`/`-separated), or null when it is not under a
     * web root. A root counts where it starts a segment run (`app/static/x.png` is `/x.png`), the
     * earliest one wins and, there, the longest.
     */
    fun servedUrl(relativePath: String): String? {
        val rel = relativePath.replace('\\', '/').trimStart('/')
        var best: Pair<Int, String>? = null
        for (root in WEB_ROOTS) {
            val at = if (rel.startsWith("$root/")) 0 else rel.indexOf("/$root/").let { if (it < 0) -1 else it + 1 }
            if (at < 0) continue
            val current = best
            if (current == null || at < current.first || (at == current.first && root.length > current.second.length)) best = at to root
        }
        val (at, root) = best ?: return null
        val rest = rel.substring(at + root.length + 1)
        return if (rest.isEmpty()) null else "/$rest"
    }

    /** The nearest ancestor of `file` that is a module (a build file in it), else `fallback`. */
    fun moduleRootOf(file: Path, fallback: Path? = null): Path {
        var dir: Path? = if (file.isDirectory()) file else file.parent
        while (dir != null) {
            val isModule = listOf("pom.xml", "build.gradle", "build.gradle.kts", "pyproject.toml", "setup.py", "package.json")
                .any { Files.exists(dir!!.resolve(it)) } ||
                (Files.isDirectory(dir) && Files.list(dir).use { s -> s.anyMatch { it.name.endsWith(".csproj") } })
            if (isModule) return dir
            dir = dir.parent
        }
        return fallback ?: (if (file.isDirectory()) file else file.parent)
    }

    /** Every image under a web root of the module (at most `limit`), sorted by URL. */
    fun list(moduleRoot: Path, limit: Int = 1000): List<Found> {
        if (!Files.isDirectory(moduleRoot)) return emptyList()
        val out = mutableListOf<Found>()
        fun walk(dir: Path) {
            if (out.size >= limit) return
            val children = runCatching { Files.list(dir).use { it.sorted().toList() } }.getOrDefault(emptyList())
            for (child in children) {
                if (out.size >= limit) return
                if (child.isDirectory()) {
                    if (child.name !in SKIPPED && !child.name.startsWith(".")) walk(child)
                } else if (child.isRegularFile() && isImage(child.name)) {
                    val rel = moduleRoot.relativize(child).joinToString("/")
                    servedUrl(rel)?.let { out.add(Found(rel, it)) }
                }
            }
        }
        walk(moduleRoot)
        return out.sortedBy { it.url }
    }

    /**
     * Where "Add image to project…" copies a file: `images/` under the module's existing web root
     * (the first of [WEB_ROOTS] present), else under the one its kind serves — .NET `wwwroot`, Python
     * `static`, everything else (Java) `src/main/resources/static`.
     */
    fun targetDir(moduleRoot: Path): Path {
        WEB_ROOTS.map { moduleRoot.resolve(it) }.firstOrNull { Files.isDirectory(it) }?.let { return it.resolve("images") }
        val dotnet = Files.list(moduleRoot).use { s -> s.anyMatch { it.name.endsWith(".csproj") } }
        val python = Files.exists(moduleRoot.resolve("pyproject.toml")) || Files.exists(moduleRoot.resolve("setup.py"))
        return when {
            dotnet -> moduleRoot.resolve("wwwroot/images")
            python && !Files.isDirectory(moduleRoot.resolve("src/main")) -> moduleRoot.resolve("static/images")
            else -> moduleRoot.resolve("src/main/resources/static/images")
        }
    }

    /** Copy an image into the project (never over an existing file: `hero-1.jpg`, `hero-2.jpg`…). */
    fun copyInto(moduleRoot: Path, source: Path): Found {
        require(isImage(source.name)) { "Not an image: ${source.name}" }
        val dir = targetDir(moduleRoot)
        Files.createDirectories(dir)
        var target = dir.resolve(source.name)
        var n = 1
        while (Files.exists(target)) target = dir.resolve("${source.nameWithoutExtension}-${n++}.${source.extension}")
        Files.copy(source, target, StandardCopyOption.COPY_ATTRIBUTES)
        val rel = moduleRoot.relativize(target).joinToString("/")
        return Found(rel, servedUrl(rel) ?: "/$rel")
    }
}
