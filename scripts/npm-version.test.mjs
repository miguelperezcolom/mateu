// The `mateu-vaadin` npm package follows the framework's release tag (scripts/npm-version.sh, used by
// buid-and-publish.yml's npm job): SemVer spelled like the NuGet packages, and a dist-tag that never
// lets a pre-release of a later line replace the current release.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const script = fileURLToPath(new URL('./npm-version.sh', import.meta.url))
const versions = (tag, ...rest) => {
    const r = spawnSync('bash', [script, tag, ...rest], { encoding: 'utf8' })
    return r.status === 0 ? Object.fromEntries(r.stdout.trim().split('\n').map((l) => l.split('='))) : null
}

test('a 3.0 beta or rc is published as SemVer, as latest (it replaces the stale 0.0.15)', () => {
    assert.deepEqual(versions('v3.0-beta.58'), { NPM_VERSION: '3.0.0-beta.58', NPM_TAG: 'latest' })
    assert.deepEqual(versions('v3.0-rc.2'), { NPM_VERSION: '3.0.0-rc.2', NPM_TAG: 'latest' })
})

test('final releases keep their number (a two-part one gets its .0)', () => {
    assert.deepEqual(versions('v3.0.0'), { NPM_VERSION: '3.0.0', NPM_TAG: 'latest' })
    assert.deepEqual(versions('v3.0.1'), { NPM_VERSION: '3.0.1', NPM_TAG: 'latest' })
    assert.deepEqual(versions('v3.1'), { NPM_VERSION: '3.1.0', NPM_TAG: 'latest' })
})

test('a pre-release of a later line goes out as next, never as latest', () => {
    assert.deepEqual(versions('v3.1-rc.1'), { NPM_VERSION: '3.1.0-rc.1', NPM_TAG: 'next' })
    assert.deepEqual(versions('v4.0-beta.1'), { NPM_VERSION: '4.0.0-beta.1', NPM_TAG: 'next' })
})

test('anything else fails instead of guessing', () => {
    for (const tag of ['v3.0-alpha.412', 'mateu-desktop-1.0', 'plugins-v0.2.17', 'v3']) assert.equal(versions(tag), null, tag)
})

test('a final release that is not the newest of its line (a backport) never takes latest', () => {
    assert.deepEqual(versions('v3.0.2', 'false'), { NPM_VERSION: '3.0.2', NPM_TAG: 'release-3.0' })
    assert.deepEqual(versions('v3.1', 'false'), { NPM_VERSION: '3.1.0', NPM_TAG: 'release-3.1' })
    assert.deepEqual(versions('v3.0-rc.1', 'false'), { NPM_VERSION: '3.0.0-rc.1', NPM_TAG: 'next' })
    assert.deepEqual(versions('v3.0.2', 'true'), { NPM_VERSION: '3.0.2', NPM_TAG: 'latest' })
})
