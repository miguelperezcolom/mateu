import assert from 'node:assert/strict'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'
import { checkAntigravityPackage, packageAntigravityPlugin, repoRoot, treeFiles } from './package-antigravity-plugin.mjs'

function scratch(t) {
    const path = mkdtempSync(join(tmpdir(), 'mateu-ai-plugin-'))
    t.after(() => rmSync(path, { recursive: true, force: true }))
    return path
}

function put(root, path, contents) {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), contents)
}

function fixture(t) {
    const root = scratch(t)
    for (const path of ['.agents', '.claude', '.claude-plugin', 'ai/claude-plugin',
        'starters/generator/overlays/common/claude', 'LICENSE.txt']) {
        cpSync(join(repoRoot, path), join(root, path), { recursive: true, verbatimSymlinks: true })
    }
    for (const script of ['check-ai-plugin.mjs', 'package-antigravity-plugin.mjs', 'bump-example-version.sh']) {
        put(root, `scripts/${script}`, readFileSync(join(repoRoot, 'scripts', script)))
    }
    return root
}

const run = (script, args, cwd) => spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' })

test('standalone package contains all eight skills, their resources and the license', (t) => {
    const output = packageAntigravityPlugin(join(scratch(t), 'mateu'))
    const files = treeFiles(output)
    assert.equal([...files.keys()].filter((path) => /^skills\/[^/]+\/SKILL.md$/.test(path)).length, 8)
    assert.deepEqual(JSON.parse(files.get('plugin.json')), {
        name: 'mateu',
        description: JSON.parse(readFileSync(join(repoRoot, 'ai/claude-plugin/mateu/.claude-plugin/plugin.json'))).description
    })
    for (const path of ['mateu/reference/crud.md', 'mateu-run/scripts/screenshot.mjs',
        'mateu-yaml/scripts/validate-specs.mjs', 'mateu-yaml/examples/specs/ui/orders.yaml']) {
        assert.deepEqual(files.get(`skills/${path}`), readFileSync(join(repoRoot, 'ai/claude-plugin/mateu/skills', path)))
    }
    assert.deepEqual(files.get('LICENSE.txt'), readFileSync(join(repoRoot, 'LICENSE.txt')))
    assert.equal(checkAntigravityPackage(output).size, files.size)
})

test('rebuilding is deterministic and removes files left by an earlier generated package', (t) => {
    const output = packageAntigravityPlugin(join(scratch(t), 'mateu'))
    const first = treeFiles(output)
    put(output, 'skills/removed-skill/SKILL.md', 'stale skill')
    packageAntigravityPlugin(output)
    assert.deepEqual(treeFiles(output), first)
})

test('verification rejects modified resources, missing references and unexpected files', (t) => {
    const output = packageAntigravityPlugin(join(scratch(t), 'mateu'))
    put(output, 'skills/mateu-run/scripts/screenshot.mjs', '// modified')
    assert.throws(() => checkAntigravityPackage(output), /stale or modified skills\/mateu-run\/scripts\/screenshot.mjs/)
    packageAntigravityPlugin(output)
    rmSync(join(output, 'skills/mateu/reference/crud.md'))
    assert.throws(() => checkAntigravityPackage(output), /missing skills\/mateu\/reference\/crud.md/)
    packageAntigravityPlugin(output)
    put(output, 'unexpected.txt', 'not part of the bundle')
    assert.throws(() => checkAntigravityPackage(output), /unexpected unexpected.txt/)
})

test('packaging refuses source overlap, unrelated output and symlink escapes', (t) => {
    const root = scratch(t)
    assert.throws(() => packageAntigravityPlugin(repoRoot), /overlap/)
    assert.throws(() => packageAntigravityPlugin(join(repoRoot, 'ai/claude-plugin/mateu/output')), /overlap/)
    put(root, 'unrelated/keep.txt', 'keep me')
    assert.throws(() => packageAntigravityPlugin(join(root, 'unrelated')), /refusing to replace/)
    assert.equal(readFileSync(join(root, 'unrelated/keep.txt'), 'utf8'), 'keep me')
    symlinkSync(join(repoRoot, 'ai/claude-plugin'), join(root, 'link'), 'dir')
    assert.throws(() => packageAntigravityPlugin(join(root, 'link/output')), /symlink ancestor/)
    const source = fixture(t)
    symlinkSync(join(root, 'unrelated/keep.txt'), join(source, 'ai/claude-plugin/mateu/skills/escape.txt'))
    assert.throws(() => packageAntigravityPlugin(join(root, 'bundle'), source), /symlinks are not allowed/)
})

test('CLI works outside the checkout and fails checks for a damaged package', (t) => {
    const root = scratch(t)
    const output = join(root, 'mateu')
    const script = join(repoRoot, 'scripts/package-antigravity-plugin.mjs')
    let result = run(script, ['--output', output], root)
    assert.equal(result.status, 0, result.stderr)
    result = run(script, ['--check', '--output', output], root)
    assert.equal(result.status, 0, result.stderr)
    rmSync(join(output, 'plugin.json'))
    result = run(script, ['--check', '--output', output], root)
    assert.equal(result.status, 1)
    assert.match(result.stderr, /missing plugin.json/)
    result = run(script, ['--output'], root)
    assert.equal(result.status, 1)
    assert.match(result.stderr, /incomplete argument/)
})

test('consistency checker catches a Codex version or catalog path that drifts', (t) => {
    const root = fixture(t)
    const script = join(root, 'scripts/check-ai-plugin.mjs')
    let result = run(script, [], root)
    assert.equal(result.status, 0, result.stderr)
    const path = 'ai/claude-plugin/mateu/.codex-plugin/plugin.json'
    const manifest = JSON.parse(readFileSync(join(root, path)))
    manifest.version = '0.0.0'
    put(root, path, JSON.stringify(manifest))
    result = run(script, [], root)
    assert.equal(result.status, 1)
    assert.match(result.stderr, /Codex manifest version differs/)
    const catalog = JSON.parse(readFileSync(join(root, '.agents/plugins/marketplace.json')))
    catalog.plugins[0].source.path = './elsewhere'
    put(root, '.agents/plugins/marketplace.json', JSON.stringify(catalog))
    result = run(script, [], root)
    assert.equal(result.status, 1)
    assert.match(result.stderr, /must point at the canonical plugin/)
})

test('release bump keeps both manifests and generated package metadata on the same version', (t) => {
    const root = fixture(t)
    for (const path of ['starters/example/pom.xml', 'demo/example/pom.xml', 'doc/public/mateu-ai-test.md']) {
        put(root, path, '<mateu.version>3.0-beta.6</mateu.version>\n')
    }
    for (const path of ['backend/dotnet/README.md', 'backend/python/README.md']) put(root, path, 'V=3.0-beta.6\n')
    put(root, 'backend/pom.xml', '<mateu.japicmp.baseline>3.0-beta.6</mateu.japicmp.baseline>\n')
    for (const [version, semver] of [['3.0-beta.99', '3.0.0-beta.99'], ['3.1.0', '3.1.0']]) {
        const result = spawnSync('bash', [join(root, 'scripts/bump-example-version.sh'), version], { cwd: root, encoding: 'utf8' })
        assert.equal(result.status, 0, result.stderr)
        for (const host of ['.claude-plugin', '.codex-plugin']) {
            assert.equal(JSON.parse(readFileSync(join(root, 'ai/claude-plugin/mateu', host, 'plugin.json'))).version, semver)
        }
        const output = packageAntigravityPlugin(join(root, 'bundle'), root)
        assert.equal(JSON.parse(readFileSync(join(output, 'package-info.json'))).version, semver)
        assert.ok(existsSync(join(output, 'skills/mateu/SKILL.md')))
    }
})
