#!/usr/bin/env node
// npm run e2e — the whole designer pipeline, end to end, with no Figma: for every
// design/figma/e2e/*.figma.json (the synthetic fixture and, when it is there, a real download) it
// converts the file to specs/ui YAML (design/figma/to-yaml), serves the pages with the e2e app
// (app/: starters/yaml + a sample API, at the Mateu release starters/yaml pins) on a free port, and
// runs the Playwright checks (tests/) against it.
//
//   node bin/run.mjs [--fixture <file.figma.json>] [--skip-build] [--serve]
//
// --serve converts and starts the first fixture only, prints the URL and keeps it running (Ctrl+C
// stops it) — to look at the screens by hand. MATEU_VERSION overrides the pinned release.
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { basename, join } from 'node:path'
import { E2E, SCREENS, convertFixture, fixtures } from '../src/pipeline.mjs'

const args = process.argv.slice(2)
const opt = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const flag = (name) => args.includes(name)
const APP = join(E2E, 'app')
const JAR = join(APP, 'target', 'figma-e2e-app.jar')

/** The Mateu release starters/yaml pins (the version a new YAML project starts with). */
export function pinnedVersion() {
  const pom = readFileSync(join(E2E, '../../../starters/yaml/pom.xml'), 'utf8')
  const m = pom.match(/<mateu\.version>([^<]+)<\/mateu\.version>/)
  if (!m) throw new Error('no <mateu.version> in starters/yaml/pom.xml')
  return m[1]
}

function freePort() {
  return new Promise((resolve, reject) => {
    const s = createServer()
    s.once('error', reject)
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address()
      s.close(() => resolve(port))
    })
  })
}

async function waitFor(url, child, timeoutMs = 120_000) {
  const until = Date.now() + timeoutMs
  while (Date.now() < until) {
    if (child.exitCode !== null) throw new Error(`the app exited (${child.exitCode}) before answering`)
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) })
      if (res.ok) return
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`the app did not answer ${url} within ${timeoutMs / 1000}s`)
}

function run(cmd, cmdArgs, opts = {}) {
  const r = spawnSync(cmd, cmdArgs, { stdio: 'inherit', ...opts })
  if (r.status !== 0) throw new Error(`${cmd} ${cmdArgs.join(' ')} failed (${r.status ?? r.signal})`)
}

async function main() {
  const version = process.env.MATEU_VERSION || pinnedVersion()
  const list = opt('--fixture') ? [opt('--fixture')] : fixtures()
  if (list.length === 0) throw new Error(`no *.figma.json in ${E2E}`)

  if (!flag('--skip-build') || !existsSync(JAR)) {
    console.log(`▶ building the e2e app against Mateu ${version}`)
    run('mvn', ['-q', '-B', 'package', '-DskipTests', `-Dmateu.version=${version}`], { cwd: APP })
  }

  let failed = 0
  for (const fixture of flag('--serve') ? list.slice(0, 1) : list) {
    const name = basename(fixture, '.figma.json')
    const root = join(APP, 'target', 'figma-specs', name)
    const { files, warnings } = convertFixture(fixture, join(root, 'specs', 'ui'))
    console.log(`▶ ${name}: ${files.length} pages${warnings.length ? `, ${warnings.length} converter warnings` : ''}`)
    for (const w of warnings) console.log(`  warning: ${w}`)
    const missing = SCREENS.filter((s) => !files.some((f) => f.path === `${s}.yaml`))
    if (missing.length) {
      console.error(`✘ ${name}: no page for ${missing.join(', ')} — the file must have frames named ${SCREENS.join(', ')}`)
      failed++
      continue
    }

    const port = await freePort()
    const base = `http://localhost:${port}`
    const app = spawn('java', [`-Dloader.path=${root}`, '-jar', JAR, `--server.port=${port}`], {
      cwd: APP, stdio: ['ignore', 'pipe', 'pipe'],
    })
    let log = ''
    app.stdout.on('data', (d) => (log += d))
    app.stderr.on('data', (d) => (log += d))
    const stop = () => { if (app.exitCode === null) app.kill('SIGTERM') }
    process.on('exit', stop)
    try {
      await waitFor(`${base}/`, app)
      if (flag('--serve')) {
        console.log(`▶ serving ${name} at ${base}/welcome (Ctrl+C to stop)`)
        await new Promise(() => {})
      }
      const r = spawnSync('npx', ['--no', '--', 'playwright', 'test'], {
        cwd: E2E, stdio: 'inherit', env: { ...process.env, BASE_URL: base, FIXTURE: name, CONVERTER_WARNINGS: String(warnings.length) },
      })
      if (r.status !== 0) {
        failed++
        console.error(`✘ ${name}: the browser checks failed — the app's log follows\n${log.split('\n').slice(-80).join('\n')}`)
      } else console.log(`✔ ${name}: every screen renders and works`)
    } catch (e) {
      failed++
      console.error(`✘ ${name}: ${e.message}\n${log.split('\n').slice(-80).join('\n')}`)
    } finally {
      stop()
    }
  }
  process.exit(failed ? 1 : 0)
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
