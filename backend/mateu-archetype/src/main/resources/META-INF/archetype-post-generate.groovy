// Turns the generated folder (every flavour, untouched) into the chosen project — the archetype twin
// of the IDE generators (IntelliJ MateuProjectGenerator, VS Code newProject.ts), driven by the same
// data: generator/new-project.json's java `replacements`, `sampleFiles`, `incompatible` and overlays.
// The archetype covers the Spring Boot flavours (code = starters/spring-mvc, yaml, static); the IDE
// wizards add the other runtimes, Code + YAML and the page templates.
import groovy.json.JsonSlurper
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardCopyOption

Path root = Path.of(request.outputDirectory.toString()).resolve(request.artifactId)
def props = request.properties
String authoring = props.getProperty('authoring', 'code')
String renderer = props.getProperty('renderer', 'vaadin')
String sample = authoring == 'code' ? props.getProperty('sample', 'crud') : 'listing'
String groupId = request.groupId
String artifactId = request.artifactId
String pkg = props.getProperty("package") ?: request.getPackage() ?: groupId

Path gen = root.resolve('generator')
def manifest = new JsonSlurper().parse(gen.resolve('new-project.json').toFile())
String version = Files.readString(gen.resolve('mateu.version')).trim()
def java = manifest.languages.java

def fail = { String why ->
    root.toFile().deleteDir()
    throw new IllegalArgumentException(why)
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

def move = { Path from, Path to ->
    Files.walk(from).sorted().toList().each { Path p ->
        Path t = to.resolve(from.relativize(p).toString())
        if (Files.isDirectory(p)) Files.createDirectories(t)
        else { Files.createDirectories(t.parent); Files.move(p, t, StandardCopyOption.REPLACE_EXISTING) }
    }
}

// (1) the chosen starter at the root
move(root.resolve("variants/${authoring}"), root)
// (2) the sample: the Empty overlay replaces the CRUD
if (authoring == 'code' && sample == 'empty') {
    java.sampleFiles.each { Files.deleteIfExists(root.resolve(it)) }
    Path empty = gen.resolve('overlays/java/empty')
    if (Files.isDirectory(empty)) move(empty, root)
}
// (4) overlays: common (gitignore → .gitignore) and the renderer's
move(gen.resolve('overlays/common'), root)
Path rendererOverlay = gen.resolve("overlays/java/${renderer}")
if (Files.isDirectory(rendererOverlay)) move(rendererOverlay, root)
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
Files.walk(root).filter { Files.isRegularFile(it) }.toList().each { Path f ->
    if (binary.any { f.fileName.toString().toLowerCase().endsWith(it) }) return
    String text = Files.readString(f)
    String out = text.readLines().findAll { !(it.trim() in markers) }.join('\n') + (text.endsWith('\n') ? '\n' : '')
    java.replacements.each { r ->
        String to = expand(r.to)
        out = r.regex ? out.replaceAll(r.regex, java.util.regex.Matcher.quoteReplacement(to)) : out.replace(expand(r.from), to)
    }
    if (out != text) Files.writeString(f, out)
}
java.renames.each { r ->
    Path from = root.resolve(expand(r.from))
    if (Files.exists(from)) Files.move(from, root.resolve(expand(r.to)), StandardCopyOption.REPLACE_EXISTING)
}
Path pkgDir = root.resolve(java.packageDir)
if (Files.isDirectory(pkgDir)) {
    Path target = root.resolve(java.sourceRoot).resolve(vars.packagePath)
    if (target != pkgDir) {
        move(pkgDir, target)
        // remove the emptied starter package folders (com/example/app), innermost first
        Path d = pkgDir
        while (d != root.resolve(java.sourceRoot) && Files.isDirectory(d) && d.toFile().list().length == 0) {
            Files.delete(d)
            d = d.parent
        }
    }
}
println "Mateu ${version}: ${authoring} project ${artifactId} created. Run: ${expand(flavour.run ?: runtime?.run ?: '')}"
