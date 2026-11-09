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
