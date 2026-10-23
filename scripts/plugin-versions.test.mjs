// The IDE plugins follow the framework's release tag (scripts/plugin-versions.sh, used by
// publish-plugins.yml). VS Code only takes major.minor.patch, so the mapping must never hand it
// anything else — and a tag it cannot map must fail the publish rather than guess.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const script = fileURLToPath(new URL('./plugin-versions.sh', import.meta.url))
const versions = (tag) => {
    const r = spawnSync('bash', [script, tag], { encoding: 'utf8' })
    return r.status === 0 ? Object.fromEntries(r.stdout.trim().split('\n').map((l) => l.split('='))) : null
}

test('a framework beta publishes IntelliJ at its version and VS Code at the beta number as patch', () => {
    assert.deepEqual(versions('v3.0-beta.9'), { INTELLIJ_VERSION: '3.0-beta.9', VSCODE_VERSION: '3.0.9' })
})

test('a numeric release is the same version everywhere', () => {
    assert.deepEqual(versions('v3.0.10'), { INTELLIJ_VERSION: '3.0.10', VSCODE_VERSION: '3.0.10' })
})

test('the old dedicated plugin releases still work', () => {
    assert.deepEqual(versions('plugins-v0.2.17'), { INTELLIJ_VERSION: '0.2.17', VSCODE_VERSION: '0.2.17' })
})

test('a tag VS Code cannot take, or no release of ours, fails', () => {
    for (const tag of ['v3.0', 'v3.0-alpha.426', 'v3.0-rc.1', 'mateu-desktop-1.0']) assert.equal(versions(tag), null, tag)
})
