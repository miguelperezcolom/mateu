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

// A called workflow cannot ask for more than its caller job grants: GitHub refuses the WHOLE release
// run at startup (no job runs, nothing is published). beta.59 and beta.60 were lost to it — desktop.yml's
// sign-windows asked for `actions: read` and the caller granted only `contents: write`.
const LEVEL = { none: 0, read: 1, write: 2 }
const permissionsIn = (block, indent) => {
    const m = block.match(new RegExp(`\\n {${indent}}permissions:\\n((?: {${indent + 2}}[a-z-]+: [a-z]+.*\\n)+)`))
    if (!m) return null
    return Object.fromEntries([...m[1].matchAll(/([a-z-]+): ([a-z]+)/g)].map((p) => [p[1], p[2]]))
}
for (const [caller, workflow] of [['e2e', 'run_tests.yml'], ['plugins', 'publish-plugins.yml'], ['desktop', 'desktop.yml'], ['mobile', 'mobile.yml']]) {
    test(`buid-and-publish.yml ${caller} grants every permission ${workflow} asks for`, () => {
        const granted = permissionsIn(jobBlock('buid-and-publish.yml', caller), 4)
            ?? permissionsIn('\n' + workflowText('buid-and-publish.yml'), 0)
        const text = workflowText(workflow)
        const asked = [['(workflow)', permissionsIn('\n' + text, 0) ?? {}]]
        for (const m of text.matchAll(/\n {2}([a-z][a-z0-9-]*):\n/g)) asked.push([m[1], permissionsIn(jobBlock(workflow, m[1]), 4) ?? {}])
        for (const [job, perms] of asked) {
            for (const [scope, level] of Object.entries(perms)) {
                assert.ok((LEVEL[granted[scope] ?? 'none'] ?? 0) >= LEVEL[level],
                    `${workflow} ${job} asks for ${scope}: ${level}, the caller ${caller} grants ${granted[scope] ?? 'none'}`)
            }
        }
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

// Provenance and the OIDC token (2026-11, GA): `id-token: write` mints a Sigstore / registry identity
// for the workflow, so it lives only in the small jobs that publish (PyPI, NuGet trusted publishing,
// npm provenance)
// or attest (provenance) — never in a job that checks code out or runs a build tool. And
// `attestations: write` belongs to provenance alone.
const withoutComments = (text) => text.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n')
const jobsOf = (workflow) => {
    const text = workflowText(workflow)
    const body = text.slice(text.indexOf('\njobs:\n'))
    return [...body.matchAll(/\n {2}([a-z][a-z0-9-]*):\n/g)].map((m) => m[1])
}

for (const [workflow, idToken, attestations] of [
    ['buid-and-publish.yml', ['pypi', 'nuget', 'npm', 'provenance'], ['provenance']],
    ['desktop.yml', [], []],
    ['mobile.yml', [], []],
    ['publish-plugins.yml', [], []],
]) {
    test(`${workflow}: id-token: write only in ${idToken.join(', ') || 'no job'}, attestations: write only in ${attestations.join(', ') || 'no job'}`, () => {
        const header = withoutComments(workflowText(workflow).split('\njobs:\n')[0])
        assert.doesNotMatch(header, /id-token: write|attestations: write/, `${workflow}: not at workflow level`)
        for (const job of jobsOf(workflow)) {
            const block = withoutComments(jobBlock(workflow, job))
            assert.equal(/id-token: write/.test(block), idToken.includes(job), `${workflow} ${job} id-token`)
            assert.equal(/attestations: write/.test(block), attestations.includes(job), `${workflow} ${job} attestations`)
            if (idToken.includes(job)) {
                assert.doesNotMatch(block, /actions\/checkout|npm (ci|install|run|pack)|gradlew|mvn |dotnet (build|pack|restore)|python -m build/, `${job} runs no build`)
            }
        }
    })
}

test('buid-and-publish.yml: only the upload jobs (and bump-examples) hold contents: write', () => {
    const writers = ['bump-examples', 'redwood-embedded-attach', 'sbom-attach', 'checksums-attach']
    for (const job of jobsOf('buid-and-publish.yml')) {
        const block = withoutComments(jobBlock('buid-and-publish.yml', job))
        // the reusable-workflow callers (desktop, mobile) pass contents: write down to their own
        // attach jobs, which the tests above pin
        if (/\n {4}uses: \.\/\.github\/workflows\//.test(block)) continue
        const writes = /\n {6}contents: write/.test(block)
        assert.equal(writes, writers.includes(job), `buid-and-publish.yml ${job}`)
        if (writes && job !== 'bump-examples') assert.doesNotMatch(block, /actions\/checkout|npm |mvn |gradlew/, `${job} only uploads`)
    }
})

test('the provenance job waits for every job that attaches a release asset or builds a package', () => {
    const block = jobBlock('buid-and-publish.yml', 'provenance')
    const needs = block.match(/\n {4}needs: \[([^\]]+)\]/)[1].split(',').map((s) => s.trim())
    for (const job of ['e2e', 'all', 'plugins', 'desktop', 'mobile', 'redwood-embedded-attach', 'sbom-attach', 'pypi-build', 'nuget-pack']) {
        assert.ok(needs.includes(job), `provenance needs ${job}`)
    }
    assert.match(block, /actions\/attest-build-provenance@[0-9a-f]{40} /, 'the attest action is pinned by SHA')
    assert.match(block, /!cancelled\(\)/, 'a skipped optional part (APK, desktop) does not skip the attestation')
})

// macOS desktop app (3.0-beta.64 did not start on a Mac: "Failed to load libjli.dylib … different Team
// IDs"). The checks run on what is PUBLISHED, and the re-sign never goes back to `codesign --deep`.
const repoText = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const withoutShellComments = (text) => text.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n')

test('desktop.yml checks and launches the published macOS app (zip and dmg), not the build folder', () => {
    const macos = withoutComments(jobBlock('desktop.yml', 'macos'))
    assert.match(macos, /ditto -x -k "\$zip"/, 'the published zip is unpacked')
    assert.match(macos, /hdiutil attach "\$dmg" -nobrowse -readonly/, 'the published dmg is mounted')
    for (const app of ['PUBLISHED_ZIP_APP', 'PUBLISHED_DMG_APP']) {
        assert.match(macos, new RegExp(`scripts/desktop-smoke\\.sh macos "\\$${app}"`), `smoke on ${app}`)
    }
    assert.match(macos, /for app in "\$PUBLISHED_ZIP_APP" "\$PUBLISHED_DMG_APP"/)
    assert.match(macos, /scripts\/macos-signature-check\.sh "\$app" \|\| rc=1/, 'the signature check fails the step')
    assert.doesNotMatch(macos, /desktop-smoke\.sh macos [^\n]*build\/installer/, 'never the build folder')
    assert.doesNotMatch(macos, /::warning::[^\n]*allow-jit/, 'a lost JVM entitlement is an error, not a warning')
    assert.ok(macos.indexOf('macos-signature-check.sh') < macos.indexOf('actions/upload-artifact'), 'checked before it is handed on')
})

test('the macOS re-sign is inside-out with the entitlements kept, never --deep', () => {
    const gradle = repoText('frontend/app/intellij-plugin/build.gradle.kts')
    assert.doesNotMatch(gradle, /run\("codesign"/, 'buildInstaller signs only through installer/macos/sign-app.sh')
    assert.match(gradle, /macos\/sign-app\.sh/)
    const sign = withoutShellComments(repoText('frontend/app/intellij-plugin/installer/macos/sign-app.sh'))
    assert.match(sign, /--preserve-metadata=entitlements/, 'JetBrains entitlements (allow-jit, disable-library-validation) survive')
    assert.match(sign, /--options runtime --timestamp/)
    assert.doesNotMatch(sign.replace(/codesign --verify --deep --strict/g, ''), /--deep/, 'no --deep signing')
})

test('the macOS signature check refuses mixed Team IDs and a hardened JVM without its entitlements', () => {
    const check = withoutShellComments(repoText('scripts/macos-signature-check.sh'))
    assert.match(check, /not signed with the app's Team ID/)
    for (const e of ['com.apple.security.cs.allow-jit', 'com.apple.security.cs.disable-library-validation']) assert.ok(check.includes(e), e)
    assert.match(check, /exit "\$fail"/)
})
