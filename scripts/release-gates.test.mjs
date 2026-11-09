// Which release tags reach users beyond the package registries. Until the GA every v3.0-beta.N and
// v3.0-rc.N does; after it, a pre-release of a later minor or major (v3.1-rc.1) must not ship to
// production phones, repin the examples, or publish IDE plugins and desktop apps. The tests evaluate
// the real `if:` of each job.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const jobIf = (workflow, job) => {
    const text = readFileSync(new URL(`../.github/workflows/${workflow}`, import.meta.url), 'utf8')
    const start = text.indexOf(`\n  ${job}:\n`)
    assert.ok(start >= 0, `${workflow} has job ${job}`)
    const line = text.slice(start).match(/\n {4}if: (.+)\n/)
    assert.ok(line, `${job} has an if`)
    return line[1]
}

const startsWith = (a, b) => String(a ?? '').startsWith(b)
const contains = (a, b) => String(a ?? '').includes(b)
const runs = (expression, tag) => new Function('github', 'inputs', 'startsWith', 'contains', `return (${expression})`)(
    { event_name: 'release', event: { release: { tag_name: tag } } }, {}, startsWith, contains)

const GATED = [
    ['mobile.yml', 'ota'],
    ['buid-and-publish.yml', 'bump-examples'],
    ['publish-plugins.yml', 'intellij'],
    ['publish-plugins.yml', 'vscode'],
    ['desktop.yml', 'macos'],
    ['desktop.yml', 'linux-windows'],
]

for (const [workflow, job] of GATED) {
    const expression = jobIf(workflow, job)

    test(`${workflow} ${job} runs for the 3.0 pre-releases and every final release`, () => {
        for (const tag of ['v3.0-beta.55', 'v3.0-beta.1', 'v3.0-rc.1', 'v3.0.0', 'v3.0.1', 'v3.1.0']) {
            assert.equal(runs(expression, tag), true, tag)
        }
    })

    test(`${workflow} ${job} stays out of a pre-release of a later minor or major`, () => {
        for (const tag of ['v3.1-rc.1', 'v3.1-beta.2', 'v4.0-rc.1']) assert.equal(runs(expression, tag), false, tag)
    })
}

test('the old dedicated plugin releases still publish the plugins', () => {
    assert.equal(runs(jobIf('publish-plugins.yml', 'intellij'), 'plugins-v0.2.17'), true)
    assert.equal(runs(jobIf('publish-plugins.yml', 'vscode'), 'plugins-v0.2.17'), true)
})

test('the desktop installer releases are not framework releases', () => {
    for (const [workflow, job] of GATED) assert.equal(runs(jobIf(workflow, job), 'mateu-desktop-1.0'), false, `${workflow} ${job}`)
})
