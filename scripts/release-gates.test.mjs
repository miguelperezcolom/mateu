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
// `newest`: what buid-and-publish.yml's `line` job (scripts/release-line.mjs) says of the release —
// handed to the called workflows as `inputs.newest`, read by its own jobs as needs.line.outputs.newest
const runs = (expression, tag, newest = 'true') => new Function('github', 'inputs', 'needs', 'startsWith', 'contains', `return (${expression})`)(
    { event_name: 'release', event: { release: { tag_name: tag } } }, { newest },
    { line: { outputs: { newest } } }, startsWith, contains)

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

    // GA review S2: a backport v3.0.2 published after v3.1.0 would downgrade every phone, repin the
    // examples to 3.0, fail the VS Code publish and move the desktop feed
    test(`${workflow} ${job} stays out of a release that is not the newest of its line`, () => {
        for (const tag of ['v3.0.2', 'v3.0-beta.63', 'v3.1.0']) assert.equal(runs(expression, tag, 'false'), false, tag)
    })
}

test('a manual run of the desktop/mobile workflows (no `newest` input) is not held back', () => {
    for (const [workflow, job] of [['desktop.yml', 'macos'], ['desktop.yml', 'linux-windows']]) {
        const expression = jobIf(workflow, job)
        const viaDispatch = new Function('github', 'inputs', 'startsWith', 'contains', `return (${expression})`)(
            { event_name: 'workflow_dispatch', event: { release: {} } }, { tag: 'v3.0-beta.64' }, startsWith, contains)
        assert.equal(viaDispatch, true, `${workflow} ${job}`)
    }
})

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
        assert.match(caller, /\n {4}needs: \[e2e, line\]\n/)
        assert.match(caller, new RegExp(`uses: \\./\\.github/workflows/${workflow.replace('.', '\\.')}`))
        // and tells it whether the release is the newest of its line
        assert.match(caller, /\n {4}with:\n {6}newest: \$\{\{ needs\.line\.outputs\.newest \}\}\n/)
        assert.match(workflowText(workflow), /\n {2}workflow_call:\n {4}inputs:\n(?: {6}#.*\n)* {6}newest:\n {8}type: string\n {8}required: false\n {8}default: 'true'\n/)
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
    assert.match(build, /\n {4}needs: \[e2e, line\]\n/)
    assert.match(build, /NEWEST: \$\{\{ needs\.line\.outputs\.newest \}\}/)
    assert.match(build, /npm-version\.sh "\$TAG" "\$NEWEST"/)
    assert.doesNotMatch(build, /secrets\.|id-token: write|contents: write/)
})

test('the npm publish job runs no third-party code and is skipped without an NPM_TOKEN', () => {
    const publish = jobBlock('buid-and-publish.yml', 'npm')
    assert.match(publish, /\n {4}needs: \[npm-build, all\]\n/)
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
    const writers = ['bump-examples', 'redwood-embedded-attach', 'sbom-attach', 'checksums-attach', 'nuget-attach', 'latest-hold', 'latest-mark']
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

// GitHub's "Latest" (GA review S3): installed desktop apps poll releases/latest/download/…, the docs
// and mateu.io/add link to releases/latest. The release being built gives "Latest" back at the start
// (latest-hold) and takes it only at the end, with every installer attached (latest-mark).
const needsOf = (workflow, job) => {
    const block = jobBlock(workflow, job)
    const list = block.match(/\n {4}needs: \[([^\]]+)\]/)
    if (list) return list[1].split(',').map((s) => s.trim())
    const one = block.match(/\n {4}needs: ([a-z0-9-]+)\n/)
    return one ? [one[1]] : []
}

test('line decides read-only, from scripts/release-line.mjs over the published releases', () => {
    const block = withoutComments(jobBlock('buid-and-publish.yml', 'line'))
    assert.doesNotMatch(block, /contents: write|id-token|secrets\./)
    assert.match(block, /node scripts\/release-line\.mjs "\$TAG" "\$PRERELEASE"/)
    assert.match(block, /PRERELEASE: \$\{\{ github\.event\.release\.prerelease \}\}/)
    for (const out of ['newest', 'latest', 'hold']) assert.match(block, new RegExp(`\\n {6}${out}: \\$\\{\\{ steps\\.decide\\.outputs\\.${out} \\}\\}`))
})

test('latest-hold runs right after line, before any test, and only when there is something to hold', () => {
    assert.deepEqual(needsOf('buid-and-publish.yml', 'latest-hold'), ['line'])
    assert.equal(jobIf('buid-and-publish.yml', 'latest-hold'), "needs.line.outputs.hold != ''")
    assert.match(jobBlock('buid-and-publish.yml', 'latest-hold'), /gh release edit "\$HOLD" --latest/)
})

test('latest-mark moves "Latest" only after the installers, the APK and the checksums, and only for the newest final', () => {
    const needs = needsOf('buid-and-publish.yml', 'latest-mark')
    for (const job of ['line', 'e2e', 'all', 'desktop', 'mobile', 'checksums-attach']) assert.ok(needs.includes(job), `latest-mark needs ${job}`)
    const expression = jobIf('buid-and-publish.yml', 'latest-mark')
    for (const part of ["needs.line.outputs.latest == 'true'", "needs.e2e.result == 'success'", "needs.all.result == 'success'",
        "needs.desktop.result == 'success'", "needs.mobile.result == 'success'", '!cancelled()']) {
        assert.ok(expression.includes(part), part)
    }
    assert.match(jobBlock('buid-and-publish.yml', 'latest-mark'), /gh release edit "\$TAG" --latest/)
})

// GA review S5: a version on PyPI, NuGet or npm can never be replaced. They publish only once Maven
// Central has the release, so a Central refusal that needs a commit never leaves the ports with a
// number Java does not have.
test('PyPI, NuGet and npm publish only after the Maven Central deploy succeeded', () => {
    for (const [job, build] of [['pypi', 'pypi-build'], ['nuget', 'nuget-pack'], ['npm', 'npm-build']]) {
        assert.deepEqual(needsOf('buid-and-publish.yml', job).sort(), ['all', build].sort(), job)
        assert.doesNotMatch(jobBlock('buid-and-publish.yml', job), /\n {4}if: .*always\(\)/, `${job} is skipped when all fails`)
    }
})

// GA review M7: every package of a framework release, whatever its major
test('every package build job is gated on the same framework-release rule', () => {
    for (const job of ['all', 'pypi-build', 'nuget-pack', 'npm-build', 'sbom', 'redwood-embedded']) {
        assert.equal(jobIf('buid-and-publish.yml', job), "startsWith(github.event.release.tag_name, 'v')", job)
        assert.equal(runs(jobIf('buid-and-publish.yml', job), 'v4.0.0'), true, `${job} runs for v4.0.0`)
    }
})

// GA review M2: Directory.Build.props builds .snupkg symbol packages; they reach nuget.org with the
// .nupkg they belong to (`dotnet nuget push` sends the x.snupkg next to x.nupkg).
test('the NuGet symbol packages travel with the packages', () => {
    const pack = jobBlock('buid-and-publish.yml', 'nuget-pack')
    assert.match(pack, /\/nupkgs\/\*\.snupkg/)
    assert.match(pack, /no symbol package/)
})

// GA review M5: the Vaadin renderer published to Central is the committed bundle the e2e ran against.
test('the Maven release job publishes the committed renderer bundle, not a fresh build, with its notices', () => {
    const all = withoutComments(jobBlock('buid-and-publish.yml', 'all'))
    assert.doesNotMatch(all, /npm (ci|run|install)|setup-node/)
    assert.match(all, /static\/assets\/THIRD-PARTY-LICENSES\.txt/)
    assert.match(all, /META-INF\/LICENSE\.txt META-INF\/NOTICE/)
})

// GA review S1: the npm package carries the licence, the NOTICE and the bundled packages' notices.
test('the npm package is checked for its licence files before it is handed over', () => {
    const build = jobBlock('buid-and-publish.yml', 'npm-build')
    assert.match(build, /cp \.\.\/\.\.\/\.\.\/\.\.\/\.\.\/LICENSE\.txt \.\.\/\.\.\/\.\.\/\.\.\/\.\.\/NOTICE \./)
    assert.match(build, /for f in dist\/assets\/mateu-vaadin\.js dist\/assets\/THIRD-PARTY-LICENSES\.txt LICENSE\.txt NOTICE; do/)
})

test('every pull request checks the committed bundles carry current third-party notices', () => {
    const lib = jobBlock('run_tests.yml', 'frontend-lib')
    for (const [bundle, file] of [
        ['vaadin', 'backend/shared/frontend/vaadin-lit/src/main/resources/static/assets/THIRD-PARTY-LICENSES.txt'],
        ['vaadin', 'demo/sites/vaadin/assets/THIRD-PARTY-LICENSES.txt'],
        ['visual-editor', 'frontend/app/intellij-plugin/src/main/resources/visual-editor/assets/THIRD-PARTY-LICENSES.txt'],
    ]) assert.ok(lib.includes(`node scripts/third-party-notices.mjs ${bundle} --check ${file}`), file)
    assert.match(workflowText('run_tests.yml'), /node --test .*scripts\/release-gates\.test\.mjs scripts\/release-line\.test\.mjs/)
})

// GA review S6: the archetype's integration test (generate + package its sample projects) runs on
// every pull request that touches the backend or the starters, not first after a release.
test('the Examples workflow runs the archetype integration test against the reactor', () => {
    const job = jobBlock('examples.yml', 'java-starters-and-demos')
    const install = job.indexOf('Install the backend reactor')
    const archetype = job.indexOf('mvn -B verify -Dgpg.skip=true -Darchetype.test.skip=false --file backend/mateu-archetype/pom.xml')
    assert.ok(install >= 0 && archetype > install, 'the archetype IT runs after the reactor is installed')
    assert.doesNotMatch(job.slice(archetype, job.indexOf('\n', archetype)), /maven\.test\.skip|skipTests/)
})

// GA review S4: nuget.org signs every package it accepts INSIDE the package, so its copy never has the
// attested digest. The packages as built go onto the release, where the documented check works.
test('the .nupkg files as built are attached to the release', () => {
    assert.deepEqual(needsOf('buid-and-publish.yml', 'nuget-attach'), ['nuget-pack'])
    assert.match(jobBlock('buid-and-publish.yml', 'nuget-attach'), /gh release upload "\$TAG" nupkgs\/\*\.nupkg/)
    const doc = readFileSync(new URL('../doc/src/content/docs/reference/verify-downloads.md', import.meta.url), 'utf8')
    assert.doesNotMatch(doc, /download the package\s+from nuget\.org first/)
    assert.match(doc, /gh release download v3\.0\.0 --repo miguelperezcolom\/mateu --pattern 'Mateu\.\*\.nupkg'/)
})
