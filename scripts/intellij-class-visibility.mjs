#!/usr/bin/env node
// Which classes the Mateu IntelliJ plugin references that its classloader CANNOT reach in a given IDE.
//
//   node scripts/intellij-class-visibility.mjs <IDE home> <plugin dir (with lib/*.jar)> [--json]
//
// <IDE home> = the folder holding lib/ and plugins/ (macOS: Mateu.app/Contents; Linux/Windows: the
// bundle root). Needs `unzip` and `jdeps` (any JDK ≥ 21) on the PATH. Exit 1 when something is missing.
//
// Why: the plugin compiles against IntelliJ 2025.2, where every platform library sat in the core
// classloader; on the desktop app's 2026.3 base, Jackson is a content module that is NOT embedded
// (and JCEF a plugin of its own), so `NoClassDefFoundError: com/fasterxml/jackson/databind/ObjectMapper`
// only showed when the hub opened (3.0-beta.64). The Plugin Verifier did not flag it: it resolves a
// class anywhere in the IDE, not through the plugin's classloader. This models that classloader for a
// v1 (`<depends>`) plugin, the way ClassLoaderConfigurator does:
//   - the core: every jar in lib/ (and lib/modules/) except the core's content modules declared
//     WITHOUT loading="embedded" (those get classloaders of their own);
//   - each plugin it depends on (required, or optional when installed), transitively: that plugin's
//     lib/*.jar plus ALL its content modules (unlike the core's, verified on 2025.2 and 2026.3);
//   - the plugin's own jars, and the JDK.
// It is a model, not the IDE: the desktop smoke test's runtime self-check (MateuSelfCheck) is the
// final word, this one names every class at once, before anything is launched.
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'

const sh = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] })
const jarsIn = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.jar')).map((f) => join(dir, f)) : [])
const entries = (jar) => { try { return sh('unzip', ['-Z1', jar]).split('\n') } catch { return [] } }
const read = (jar, entry) => { try { return sh('unzip', ['-p', jar, entry]) } catch { return '' } }
const classesOf = (jar) => entries(jar).filter((e) => e.endsWith('.class') && !e.includes('META-INF/versions/'))
    .map((e) => e.slice(0, -6).replaceAll('/', '.'))

/** A plugin descriptor's id, aliases, dependencies and content modules (name → embedded?). */
export function parseDescriptor(xml) {
    const strip = xml.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '')
    const id = strip.match(/<id>\s*([^<\s]+)\s*<\/id>/)?.[1] ?? null
    const aliases = [...strip.matchAll(/<module\s+value="([^"]+)"/g)].map((m) => m[1])
    const depends = [...strip.matchAll(/<depends([^>]*)>\s*([^<\s]+)\s*<\/depends>/g)]
        .map((m) => ({ id: m[2], optional: /optional="true"/.test(m[1]) }))
    const deps = strip.match(/<dependencies>([\s\S]*?)<\/dependencies>/)?.[1] ?? ''
    for (const m of deps.matchAll(/<plugin\s+id="([^"]+)"/g)) depends.push({ id: m[1], optional: false })
    const content = new Map()
    for (const block of strip.matchAll(/<content[^>]*>([\s\S]*?)<\/content>/g)) {
        for (const m of block[1].matchAll(/<module\s+name="([^"]+)"([^>]*)>/g)) {
            const embedded = /loading="embedded"/.test(m[2])
            content.set(m[1], (content.get(m[1]) ?? false) || embedded)
        }
    }
    return { id, aliases, depends, content }
}

/** JDK packages: always reachable. */
export const isJdk = (cls) => /^(java|javax|jdk|sun|com\.sun|org\.w3c|org\.xml|org\.ietf|org\.omg)\./.test(cls)

function descriptorsIn(jars) {
    const found = []
    for (const jar of jars) {
        for (const e of entries(jar)) {
            if (/^META-INF\/[A-Za-z]*\.xml$/.test(e)) {
                const xml = read(jar, e)
                if (/<idea-plugin/.test(xml) && /<id>/.test(xml)) found.push({ jar, ...parseDescriptor(xml) })
            }
        }
    }
    return found
}

export function visibility(ide, pluginDir) {
    const lib = join(ide, 'lib')
    const coreJars = [...jarsIn(lib), ...jarsIn(join(lib, 'modules'))]
    const core = descriptorsIn(jarsIn(lib)).find((d) => d.id === 'com.intellij')
    if (!core) throw new Error(`no core descriptor (id com.intellij) in ${lib}`)
    const notEmbedded = new Set([...core.content].filter(([, emb]) => !emb).map(([n]) => n))
    const visibleJars = coreJars.filter((j) => !notEmbedded.has(basename(j, '.jar')))

    // installed plugins: id/aliases → { dir, descriptor }
    const plugins = new Map()
    const aliasesOfCore = new Set(['com.intellij', ...core.aliases])
    const pluginsDir = join(ide, 'plugins')
    for (const name of existsSync(pluginsDir) ? readdirSync(pluginsDir) : []) {
        const dir = join(pluginsDir, name)
        if (!statSync(dir).isDirectory()) continue
        const d = descriptorsIn(jarsIn(join(dir, 'lib'))).find((x) => x.jar.startsWith(join(dir, 'lib')))
        if (!d) continue
        for (const key of [d.id, ...d.aliases]) plugins.set(key, { dir, d })
    }

    const own = descriptorsIn(jarsIn(join(pluginDir, 'lib')))[0]
    if (!own) throw new Error(`no plugin descriptor in ${pluginDir}/lib`)
    const seen = new Set()
    const queue = own.depends.filter((x) => !x.optional || plugins.has(x.id) || aliasesOfCore.has(x.id)).map((x) => x.id)
    const missingDeps = own.depends.filter((x) => !x.optional && !plugins.has(x.id) && !aliasesOfCore.has(x.id)).map((x) => x.id)
    while (queue.length) {
        const id = queue.shift()
        if (aliasesOfCore.has(id)) continue
        const p = plugins.get(id)
        if (!p || seen.has(p.dir)) continue
        seen.add(p.dir)
        visibleJars.push(...jarsIn(join(p.dir, 'lib')))
        // a `<depends>` on a plugin reaches ALL its content modules, embedded or not (checked on 2025.2
        // and 2026.3: the JSON plugin's intellij.json.backend, the Java plugin's debugger modules)
        for (const [m] of p.d.content) {
            const jar = [join(p.dir, 'lib', 'modules', `${m}.jar`), join(p.dir, 'lib', `${m}.jar`)].find(existsSync)
            if (jar) visibleJars.push(jar)
        }
        queue.push(...p.d.depends.filter((x) => !x.optional).map((x) => x.id))
    }

    const visible = new Set()
    for (const jar of visibleJars) for (const c of classesOf(jar)) visible.add(c)
    const ownJars = jarsIn(join(pluginDir, 'lib'))
    const ownClasses = new Set()
    for (const jar of ownJars) for (const c of classesOf(jar)) ownClasses.add(c)

    // every class the plugin's own code references (jdeps over the plugin's main jar(s) only:
    // a bundled library may reference optional things it never loads)
    const pluginId = own.id
    const mainJars = ownJars.filter((j) => descriptorsIn([j]).some((d) => d.id === pluginId))
    const refs = new Map() // target → first referrer
    for (const jar of mainJars) {
        const out = sh('jdeps', ['--multi-release', '21', '-verbose:class', '-filter:none', jar])
        for (const line of out.split('\n')) {
            const m = line.match(/^\s+(\S+)\s+->\s+(\S+)/)
            if (m && !refs.has(m[2])) refs.set(m[2], m[1])
        }
    }
    const missing = [...refs].filter(([c]) => !isJdk(c) && !ownClasses.has(c) && !visible.has(c))
        .map(([cls, from]) => ({ cls, from }))
    return { missing, missingDeps, visibleJars: visibleJars.length, references: refs.size }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const [ide, pluginDir] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
    if (!ide || !pluginDir) { console.error('usage: intellij-class-visibility.mjs <IDE home> <plugin dir>'); process.exit(2) }
    const r = visibility(ide, pluginDir)
    console.log(`${r.references} referenced classes, ${r.visibleJars} jars visible to the plugin`)
    for (const id of r.missingDeps) console.log(`::error::the IDE has no plugin ${id} (a required <depends>)`)
    const byPkg = new Map()
    for (const { cls, from } of r.missing) {
        const pkg = cls.replace(/\.[^.]+$/, '')
        if (!byPkg.has(pkg)) byPkg.set(pkg, [])
        byPkg.get(pkg).push(`${cls} (from ${from})`)
    }
    for (const [pkg, list] of byPkg) {
        console.log(`::error::not reachable from the plugin's classloader: ${pkg} — ${list.length} class(es), e.g. ${list[0]}`)
    }
    if (r.missing.length || r.missingDeps.length) process.exit(1)
    console.log('✅ every class the plugin references is reachable from its classloader')
}
