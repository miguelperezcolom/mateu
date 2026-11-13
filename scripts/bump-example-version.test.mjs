// What scripts/bump-example-version.sh changes on the first FINAL release of a line (GA review M3):
// the pre-release wording that would otherwise ship with the GA. The step is run on copies of the
// real files, in a temporary directory.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const repo = new URL('..', import.meta.url)
const script = readFileSync(new URL('scripts/bump-example-version.sh', repo), 'utf8')
const step = script.slice(script.indexOf('# The first FINAL release of a line'))

const run = (version) => {
    const dir = mkdtempSync(join(tmpdir(), 'bump-'))
    mkdirSync(join(dir, 'backend/python'), { recursive: true })
    copyFileSync(new URL('SECURITY.md', repo), join(dir, 'SECURITY.md'))
    copyFileSync(new URL('backend/python/pyproject.toml', repo), join(dir, 'backend/python/pyproject.toml'))
    writeFileSync(join(dir, 'step.sh'), `set -euo pipefail\nnew="$1"\n${step}`)
    const r = spawnSync('bash', ['step.sh', version], { cwd: dir, encoding: 'utf8' })
    assert.equal(r.status, 0, r.stderr)
    return {
        pyproject: readFileSync(join(dir, 'backend/python/pyproject.toml'), 'utf8'),
        security: readFileSync(join(dir, 'SECURITY.md'), 'utf8'),
    }
}

test('the GA moves the Python classifier to Production/Stable and the supported-versions row to 3.0.x', () => {
    const { pyproject, security } = run('3.0.0')
    assert.match(pyproject, /"Development Status :: 5 - Production\/Stable"/)
    assert.doesNotMatch(pyproject, /Development Status :: 4 - Beta/)
    assert.match(security, /^\| 3\.0\.x — the latest 3\.0 release \| ✅ security fixes, in the next patch release \|$/m)
    assert.doesNotMatch(security, /until 3\.0\.0 is out/)
})

test('a pre-release changes neither', () => {
    const { pyproject, security } = run('3.0-rc.1')
    assert.match(pyproject, /Development Status :: 4 - Beta/)
    assert.match(security, /Latest 3\.0 beta \(until 3\.0\.0 is out\)/)
})
