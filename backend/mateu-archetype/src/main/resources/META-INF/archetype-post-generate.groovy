// Turns the generated folder (every flavour, untouched) into the chosen project — the archetype twin
// of the IDE generators (IntelliJ MateuProjectGenerator, VS Code newProject.ts), driven by the same
// data: generator/new-project.json's java `replacements`, `sampleFiles`, `incompatible` and overlays.
// The archetype covers the Spring Boot flavours (code = starters/spring-mvc, yaml, static); the IDE
// wizards add the other runtimes, Code + YAML and the page templates.
//
// RULE — NEVER NAME A JDK CLASS IN THIS SCRIPT (no `import java.…`, no `new File(…)`, no `Files.x`,
// no typed `{ Path p -> }` parameter). The script runs inside whatever maven-archetype-plugin the
// user's `mvn archetype:generate` resolves (3.4.1 → Groovy 4.0.28), and that Groovy's compiler reads
// every class a script names with its own ASM, which cannot read the class files of a newer JDK
// (JDK 26 = major 70: "BUG! exception in phase 'semantic analysis' … Unsupported class file major
// version 70"). Nothing in our pom can change the user's plugin, so the script stays readable on any
// JDK by naming only what Groovy never decompiles — String/Object/Class/List/Map and Groovy's own
// classes — and reaching the JDK at run time: jdk('java.nio.file.Files') + dynamic calls.
import groovy.json.JsonSlurper

def jdk = { String name -> Class.forName(name) }
def nioFiles = jdk('java.nio.file.Files')
def nioPaths = jdk('java.nio.file.Paths')
def replaceExisting = jdk('java.nio.file.StandardCopyOption').REPLACE_EXISTING
def path = { String first -> nioPaths.get(first) }
def listOf = { stream -> try { stream.iterator().toList() } finally { stream.close() } }

def root = path(request.outputDirectory.toString()).resolve(request.artifactId)
def props = request.properties
String authoring = props.getProperty('authoring', 'code')
String renderer = props.getProperty('renderer', 'vaadin')
String sample = authoring == 'code' ? props.getProperty('sample', 'crud') : 'listing'
String groupId = request.groupId
String artifactId = request.artifactId
String pkg = props.getProperty("package") ?: request.getPackage() ?: groupId

def gen = root.resolve('generator')
def manifest = new JsonSlurper().parse(gen.resolve('new-project.json').toFile())   // parse(File): parseText needs groovy-json's FastStringService, which the plugin realm cannot load
String version = nioFiles.readString(gen.resolve('mateu.version')).trim()
def java = manifest.languages.java

def fail = { String why ->
    // Only what this archetype wrote: the target folder may already hold the user's own files (the
    // archetype plugin refuses a folder only when it has a pom.xml, so that pom.xml is ours too).
    ['variants', 'generator', 'pom.xml'].each { root.resolve(it).toFile().with { isDirectory() ? deleteDir() : delete() } }
    throw jdk('java.lang.IllegalArgumentException').newInstance(why)
}
if (!(authoring in ['code', 'yaml', 'static'])) fail("authoring must be code, yaml or static (was '${authoring}')")
def flavour = manifest.authoring.find { it.id == authoring }
def runtime = authoring == 'code' ? manifest.runtimes.find { it.id == 'spring-mvc' } : null
List<String> renderers = flavour.renderers ?: (runtime ?: manifest.runtimes.find { it.id == 'spring-mvc' }).renderers
if (!(renderer in renderers)) fail("the ${authoring} flavour supports the renderers: ${renderers.join(', ')}")
def clash = manifest.incompatible?.find { x ->
    (x.renderer == null || x.renderer == renderer) && (x.sample == null || x.sample == sample) &&
        (x.authoring == null || x.authoring == authoring)
}
if (clash) fail(clash.reason)
if (!(pkg ==~ /[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*/)) fail("package must be a dotted Java name (was '${pkg}')")

def isDir = { p -> p.toFile().isDirectory() }
def isEmptyDir = { p -> isDir(p) && p.toFile().list().length == 0 }
def walk = { from -> listOf(nioFiles.walk(from)).sort() }
def move = { from, to ->
    walk(from).each { p ->
        def t = to.resolve(from.relativize(p).toString())
        if (isDir(p)) t.toFile().mkdirs()
        else {
            t.parent.toFile().mkdirs()
            nioFiles.move(p, t, replaceExisting)
        }
    }
}

// (1) the chosen starter at the root
move(root.resolve("variants/${authoring}"), root)
// (2) the sample: the Empty overlay replaces the CRUD
if (authoring == 'code' && sample == 'empty') {
    java.sampleFiles.each {
        def f = root.resolve(it)
        f.toFile().delete()
        // a sample test's folders (src/test/java/com/example/app) go with it
        def d = f.parent
        while (d != root && isEmptyDir(d)) {
            d.toFile().delete()
            d = d.parent
        }
    }
    def empty = gen.resolve('overlays/java/empty')
    if (isDir(empty)) move(empty, root)
}
// (4) overlays: common (gitignore → .gitignore, claude/settings.json → .claude/settings.json) and the renderer's
move(gen.resolve('overlays/common'), root)
def rendererOverlay = gen.resolve("overlays/java/${renderer}")
if (isDir(rendererOverlay)) move(rendererOverlay, root)
// (5) no page templates here: drop the YAML markers
// (6) replacements, renames, the package directory
String starter = authoring == 'code' ? 'spring-mvc' : authoring
def title = artifactId.split(/[-._]+/).findAll { it }.join(' ')
title = title ? title[0].toUpperCase() + title.substring(1) : 'My app'
def vars = [
    groupId: groupId, artifactId: artifactId, 'package': pkg, packagePath: pkg.replace('.', '/'),
    appTitle: title, version: version, renderer: renderer,
    rendererArtifactId: manifest.renderers.find { it.id == renderer }.artifactId,
    runtime: runtime?.id ?: '', starter: starter,
]
def expand = { String s -> s.replaceAll(/\$\{([A-Za-z]+)\}/) { all, k -> vars.containsKey(k) ? vars[k] : all } }
def binary = manifest.binaryExtensions as List<String>
def markers = ['# __ROUTES__', '# __MENU__']

['variants', 'generator'].each { root.resolve(it).toFile().deleteDir() }
walk(root).findAll { !isDir(it) }.each { f ->
    if (binary.any { f.fileName.toString().toLowerCase().endsWith(it) }) return
    String text = nioFiles.readString(f)
    String out = text.readLines().findAll { !(it.trim() in markers) }.join('\n') + (text.endsWith('\n') ? '\n' : '')
    java.replacements.each { r ->
        String to = expand(r.to)
        // a closure replacement is literal: no `$`/`\` group syntax to quote
        out = r.regex ? out.replaceAll(r.regex) { to } : out.replace(expand(r.from), to)
    }
    if (out != text) nioFiles.writeString(f, out)
}
java.renames.each { r ->
    def from = root.resolve(expand(r.from))
    if (!from.toFile().exists()) return
    def to = root.resolve(expand(r.to))
    to.parent.toFile().mkdirs()   // claude/settings.json → .claude/settings.json
    nioFiles.move(from, to, replaceExisting)
    // remove the folders the move emptied (src/test/java/com/example/app), innermost first
    def d = from.parent
    while (d != root && isEmptyDir(d)) {
        d.toFile().delete()
        d = d.parent
    }
}
def pkgDir = root.resolve(java.packageDir)
if (isDir(pkgDir)) {
    def target = root.resolve(java.sourceRoot).resolve(vars.packagePath)
    if (target != pkgDir) {
        move(pkgDir, target)
        // remove the emptied starter package folders (com/example/app), innermost first
        def d = pkgDir
        while (d != root.resolve(java.sourceRoot) && isEmptyDir(d)) {
            d.toFile().delete()
            d = d.parent
        }
    }
}
println "Mateu ${version}: ${authoring} project ${artifactId} created. Run: ${expand(flavour.run ?: runtime?.run ?: '')}"
