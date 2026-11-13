// Where a release stands among the others (scripts/release-line.mjs, buid-and-publish.yml's `line`
// job): only the newest release of the line moves what everybody gets, and GitHub's "Latest" moves
// only once a release's installers are there (GA review 2026-11, S2/S3).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { decide, versionOf } from './release-line.mjs'

const rel = (tagName, extra = {}) => ({ tagName, isDraft: false, isPrerelease: false, isLatest: false, ...extra })

test('framework tags have a comparable version; anything else has none', () => {
    assert.deepEqual(versionOf('v3.0-beta.64'), [3, 0, 0, 1, 64])
    assert.deepEqual(versionOf('v3.0-rc.1'), [3, 0, 0, 2, 1])
    assert.deepEqual(versionOf('v3.0.0'), [3, 0, 0, 3, 0])
    assert.deepEqual(versionOf('v3.1'), [3, 1, 0, 3, 0])
    for (const tag of ['mateu-desktop-1.0', 'plugins-v0.2.17', 'v3', 'v3.0.1-rc.1', '']) assert.equal(versionOf(tag), null, tag)
})

test('before the GA every newer 3.0 pre-release is the newest, and becomes latest', () => {
    const releases = [rel('v3.0-beta.63', { isLatest: true }), rel('v3.0-beta.64')]
    assert.deepEqual(decide('v3.0-beta.64', false, releases), { newest: true, latest: true, hold: '' })
})

test('a re-run of an older release is not the newest', () => {
    const releases = [rel('v3.0-beta.63'), rel('v3.0-beta.64', { isLatest: true })]
    assert.equal(decide('v3.0-beta.63', false, releases).newest, false)
})

test('GA day: v3.0.0 is the newest, and the last beta stays latest until its installers are attached', () => {
    const releases = [rel('v3.0-beta.64'), rel('v3.0-rc.1'), rel('v3.0.0', { isLatest: true })]
    assert.deepEqual(decide('v3.0.0', false, releases), { newest: true, latest: true, hold: 'v3.0-rc.1' })
})

test('created with --latest=false, nothing needs holding', () => {
    const releases = [rel('v3.0-rc.1', { isLatest: true }), rel('v3.0.0')]
    assert.equal(decide('v3.0.0', false, releases).hold, '')
})

test('a backport after a later minor is not the newest, and gives "Latest" back', () => {
    const releases = [rel('v3.0.0'), rel('v3.0.1'), rel('v3.1.0'), rel('v3.0.2', { isLatest: true })]
    assert.deepEqual(decide('v3.0.2', false, releases), { newest: false, latest: false, hold: 'v3.1.0' })
})

test('a patch of the current line is the newest', () => {
    const releases = [rel('v3.0.0'), rel('v3.1.0'), rel('v3.1.1', { isLatest: true }), rel('v3.2-rc.1', { isPrerelease: true })]
    assert.deepEqual(decide('v3.1.1', false, releases), { newest: true, latest: true, hold: 'v3.1.0' })
})

test('after the GA a pre-release of a later line is never the newest, even if it was not marked pre-release', () => {
    const releases = [rel('v3.0.0'), rel('v3.0.1'), rel('v3.1-rc.1', { isLatest: true })]
    assert.deepEqual(decide('v3.1-rc.1', false, releases), { newest: false, latest: false, hold: 'v3.0.1' })
    assert.deepEqual(decide('v3.1-rc.1', true, [rel('v3.0.0', { isLatest: true }), rel('v3.1-rc.1', { isPrerelease: true })]),
        { newest: false, latest: false, hold: '' })
})

test('the release after it ignores it: v3.0.2 is still the newest and the rc is never held as latest', () => {
    const releases = [rel('v3.0.1'), rel('v3.1-rc.1'), rel('v3.0.2', { isLatest: true })]
    assert.deepEqual(decide('v3.0.2', false, releases), { newest: true, latest: true, hold: 'v3.0.1' })
})

test('a release published as a pre-release is never made latest', () => {
    assert.deepEqual(decide('v3.0-rc.2', true, [rel('v3.0-rc.1', { isLatest: true }), rel('v3.0-rc.2', { isPrerelease: true })]),
        { newest: true, latest: false, hold: '' })
})

test('drafts and non-framework releases do not count', () => {
    const releases = [rel('v3.1.0', { isDraft: true }), rel('mateu-desktop-9.9'), rel('v3.0.0'), rel('v3.0.1', { isLatest: true })]
    assert.deepEqual(decide('v3.0.1', false, releases), { newest: true, latest: true, hold: 'v3.0.0' })
})

test('a tag that is not a framework release is never the newest', () => {
    assert.equal(decide('mateu-desktop-1.0', false, [rel('mateu-desktop-1.0')]).newest, false)
})

test('the command line prints the three outputs for $GITHUB_OUTPUT', () => {
    const dir = mkdtempSync(join(tmpdir(), 'release-line-'))
    const file = join(dir, 'releases.json')
    writeFileSync(file, JSON.stringify([rel('v3.0.0'), rel('v3.1.0'), rel('v3.0.2', { isLatest: true })]))
    const script = fileURLToPath(new URL('./release-line.mjs', import.meta.url))
    const r = spawnSync(process.execPath, [script, 'v3.0.2', 'false', file], { encoding: 'utf8' })
    assert.equal(r.status, 0, r.stderr)
    assert.equal(r.stdout, 'newest=false\nlatest=false\nhold=v3.1.0\n')
})

test('finals of an earlier major (the 2.x line) do not end the 3.0 pre-releases', () => {
    const releases = [rel('v2.4.93'), rel('v2.4.94'), rel('v3.0-beta.64', { isLatest: true })]
    assert.deepEqual(decide('v3.0-beta.65', false, releases), { newest: true, latest: true, hold: '' })
    assert.equal(decide('v3.0-beta.64', false, [...releases, rel('v3.0-beta.65')]).newest, false)
    assert.equal(decide('v3.1-rc.1', false, [rel('v2.4.94'), rel('v3.0.0')]).newest, false)
})
