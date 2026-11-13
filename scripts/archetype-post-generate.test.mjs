// The archetype validates its options after generating, in a folder that may hold the user's own
// files (the plugin refuses a folder only when it has a pom.xml): a rejected option must never remove it.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const script = readFileSync(new URL('../backend/mateu-archetype/src/main/resources/META-INF/archetype-post-generate.groovy', import.meta.url), 'utf8')

test('nothing in the script deletes the target folder', () => {
    assert.doesNotMatch(script, /\broot\.toFile\(\)\s*\.\s*deleteDir/)
})

test('a rejected option removes only what the archetype wrote', () => {
    const fail = script.slice(script.indexOf('def fail ='), script.indexOf('if (!(authoring in'))
    assert.match(fail, /\['variants', 'generator', 'pom\.xml'\]/)
})

// GA review S6: the archetype carries the generator's overlays through a HAND-KEPT <include> list
// (backend/mateu-archetype/pom.xml `generator-data`). An overlay added to new-project.json and the two
// engines but not to that list builds green everywhere and breaks `mvn archetype:generate` on Central.
test('the archetype packages every overlay its flavours (code, yaml, static) and renderers use', () => {
    const generator = JSON.parse(readFileSync(new URL('../starters/generator/new-project.json', import.meta.url), 'utf8'))
    const pom = readFileSync(new URL('../backend/mateu-archetype/pom.xml', import.meta.url), 'utf8')
    const included = new Set([...pom.matchAll(/<include>overlays\/([^<]+)\/\*\*<\/include>/g)].map((m) => m[1]))
    const needed = new Set(['common'])
    for (const flavour of generator.authoring.filter((f) => ['code', 'yaml', 'static'].includes(f.id))) {
        for (const overlay of Object.values(flavour.overlays ?? {})) needed.add(`java/${overlay}`)
    }
    for (const overlay of Object.values(generator.languages.java.rendererOverlays ?? {})) needed.add(`java/${overlay}`)
    for (const overlay of needed) assert.ok(included.has(overlay), `the archetype pom must <include>overlays/${overlay}/**</include>`)
})
