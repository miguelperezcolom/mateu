// The suites assert the renderer's English chrome texts and Intl's English formatting ("Next",
// "5 seconds"), and Node takes both from the machine's locale: navigator.language and the default
// Intl locale come from LANG / LC_ALL, read once at start-up. On a Spanish machine seven suites
// failed on "Siguiente" and "5 segundos" while CI (English) was green. Imported FIRST by every
// suite: off English, the suite runs again, once, in English, and that run's exit code is this one's.
import { spawnSync } from 'node:child_process'

const PINNED = 'MATEU_TEST_LOCALE_PINNED'
const english = /^en(-|$)/.test(new Intl.DateTimeFormat().resolvedOptions().locale)

if (!english && !process.env[PINNED]) {
  const run = spawnSync(process.execPath, [...process.execArgv, ...process.argv.slice(1)], {
    stdio: 'inherit',
    env: { ...process.env, LANG: 'en_US.UTF-8', LC_ALL: 'en_US.UTF-8', [PINNED]: '1' },
  })
  process.exit(run.status ?? 1)
}
