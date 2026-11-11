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

const workflowText = (workflow) => readFileSync(new URL(`../.github/workflows/${workflow}`, import.meta.url), 'utf8')
const jobBlock = (workflow, job) => {
    const text = workflowText(workflow)
    const start = text.indexOf(`\n  ${job}:\n`)
    assert.ok(start >= 0, `${workflow} has job ${job}`)
    const rest = text.slice(start + 1)
    const next = rest.slice(1).search(/\n  [a-z][a-z0-9-]*:\n/)
    return next < 0 ? rest : rest.slice(0, next + 1)
}

// What ships outside the registries waits for the tests, like Maven Central (deep review 2026-11).
for (const [job, workflow] of [['plugins', 'publish-plugins.yml'], ['desktop', 'desktop.yml'], ['mobile', 'mobile.yml']]) {
    test(`${workflow} runs only after e2e passed`, () => {
        const caller = jobBlock('buid-and-publish.yml', job)
        assert.match(caller, /\n {4}needs: e2e\n/)
        assert.match(caller, new RegExp(`uses: \\./\\.github/workflows/${workflow.replace('.', '\\.')}`))
        const on = workflowText(workflow).match(/\non:\n([\s\S]*?)\n\S/)[1]
        assert.doesNotMatch(on, /^ {2}release:/m, `${workflow} must not start on the release event by itself`)
        assert.match(on, /^ {2}workflow_call:/m)
    })
}

// The jobs that build (npm, Gradle, Expo: third-party code) never hold a write token.
for (const [workflow, writers] of [['desktop.yml', ['attach']], ['mobile.yml', ['android-attach']], ['publish-plugins.yml', []]]) {
    test(`${workflow}: only ${writers.join(', ') || 'no job'} holds contents: write`, () => {
        const jobs = [...workflowText(workflow).matchAll(/\n {2}([a-z][a-z0-9-]*):\n/g)].map((m) => m[1])
        for (const job of jobs) {
            const writes = /contents: write/.test(jobBlock(workflow, job))
            assert.equal(writes, writers.includes(job), `${workflow} ${job}`)
            if (writes) assert.doesNotMatch(jobBlock(workflow, job), /actions\/checkout|npm |gradlew|intellij-gradle/, `${job} only uploads`)
        }
    })
}

test('the desktop installer releases are not framework releases', () => {
    for (const [workflow, job] of GATED) assert.equal(runs(jobIf(workflow, job), 'mateu-desktop-1.0'), false, `${workflow} ${job}`)
    assert.equal(runs(jobIf('buid-and-publish.yml', 'npm-build'), 'mateu-desktop-1.0'), false, 'npm-build')
})

// The npm package (mateu-vaadin): built after the tests, the token only in the job that publishes.
test('the npm package is built only after e2e passed, with no secret and no write token', () => {
    const build = jobBlock('buid-and-publish.yml', 'npm-build')
    assert.match(build, /\n {4}needs: e2e\n/)
    assert.doesNotMatch(build, /secrets\.|id-token: write|contents: write/)
})

test('the npm publish job runs no third-party code and is skipped without an NPM_TOKEN', () => {
    const publish = jobBlock('buid-and-publish.yml', 'npm')
    assert.match(publish, /\n {4}needs: npm-build\n/)
    assert.doesNotMatch(publish, /actions\/checkout|npm ci|npm install|npm run|contents: write/)
    assert.match(publish, /HAS_TOKEN: \$\{\{ secrets\.NPM_TOKEN != '' \}\}/)
    const steps = publish.split('\n      - ').slice(1).filter((s) => !s.startsWith('name: Choose the credential'))
    assert.ok(steps.length >= 3)
    for (const step of steps) assert.match(step, /if: steps\.auth\.outputs\.mode == 'token'/, step.split('\n')[0])
    assert.equal((publish.match(/secrets\.NPM_TOKEN \}\}/g) ?? []).length, 1, 'the token reaches one step only')
})
