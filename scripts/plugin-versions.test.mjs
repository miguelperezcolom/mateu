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

test('a framework beta publishes IntelliJ at its version and VS Code BELOW the GA (2.99.N)', () => {
    assert.deepEqual(versions('v3.0-beta.9'), { INTELLIJ_VERSION: '3.0-beta.9', VSCODE_VERSION: '2.99.9' })
})

test('a release candidate sits above every beta and below the GA (2.999.N)', () => {
    assert.deepEqual(versions('v3.0-rc.1'), { INTELLIJ_VERSION: '3.0-rc.1', VSCODE_VERSION: '2.999.1' })
})

test('from the GA on, every release is the same version everywhere', () => {
    assert.deepEqual(versions('v3.0.0'), { INTELLIJ_VERSION: '3.0.0', VSCODE_VERSION: '3.0.0' })
    assert.deepEqual(versions('v3.0.1'), { INTELLIJ_VERSION: '3.0.1', VSCODE_VERSION: '3.0.1' })
    assert.deepEqual(versions('v3.0'), { INTELLIJ_VERSION: '3.0', VSCODE_VERSION: '3.0.0' })
})

test('VS Code versions only grow: 0.2.17 (the last plugin release) < every beta < every rc < the GA < its patches', () => {
    const order = ['plugins-v0.2.17', 'v3.0-beta.9', 'v3.0-beta.10', 'v3.0-beta.120', 'v3.0-rc.1', 'v3.0-rc.2', 'v3.0.0', 'v3.0.1', 'v3.1.0']
        .map((t) => versions(t).VSCODE_VERSION.split('.').map(Number))
    for (let i = 1; i < order.length; i++) {
        const [a, b] = [order[i - 1], order[i]]
        const cmp = a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
        assert.ok(cmp < 0, `${a.join('.')} < ${b.join('.')}`)
    }
})

test('the old dedicated plugin releases still work', () => {
    assert.deepEqual(versions('plugins-v0.2.17'), { INTELLIJ_VERSION: '0.2.17', VSCODE_VERSION: '0.2.17' })
})

test('a tag VS Code cannot take, or no release of ours, fails', () => {
    for (const tag of ['v3.0-alpha.426', 'v3.1-rc.1', 'v3.1-beta.1', 'mateu-desktop-1.0']) assert.equal(versions(tag), null, tag)
})
