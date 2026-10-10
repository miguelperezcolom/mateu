// Stages everything the .vsix needs that is NOT committed in this folder, so `vsce package` runs
// non-interactively from a clean checkout:
//   - LICENSE           ← repo-root LICENSE.txt (vsce warns/prompts without one)
//   - schema/specs-schema.json ← backend/shared/uidl/specs-schema.json (the generated authoring
//                         schema, contributed through `yamlValidation` for specs/ui/**)
//   - media/            ← the shared visual-editor web bundle. Built fresh from
//                         frontend/web/monorepo/apps/visual-editor when that workspace is installed,
//                         otherwise copied from the bundle committed in the IntelliJ plugin
//                         (src/main/resources/visual-editor — the exact same `dist/`).
// All three outputs are gitignored: the sources of truth live elsewhere in the repo.
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repo = resolve(here, '../../..')

function copy(from, to) {
    if (!existsSync(from)) throw new Error(`prepackage: missing ${from}`)
    mkdirSync(dirname(to), { recursive: true })
    cpSync(from, to, { recursive: true })
    console.log(`prepackage: ${from.replace(repo + '/', '')} -> ${to.replace(here + '/', '')}`)
}

copy(join(repo, 'LICENSE.txt'), join(here, 'LICENSE'))
copy(join(repo, 'backend/shared/uidl/specs-schema.json'), join(here, 'schema/specs-schema.json'))

const webApp = join(repo, 'frontend/web/monorepo/apps/visual-editor')
const committedBundle = join(repo, 'frontend/app/intellij-plugin/src/main/resources/visual-editor')
const media = join(here, 'media')
if (process.env.MATEU_SKIP_MEDIA === '1' && existsSync(join(media, 'index.html'))) {
    console.log('prepackage: keeping existing media/ (MATEU_SKIP_MEDIA=1)')
} else if (existsSync(join(repo, 'frontend/web/monorepo/node_modules'))) {
    execSync('npm run build', { cwd: webApp, stdio: 'inherit' })
    rmSync(media, { recursive: true, force: true })
    copy(join(webApp, 'dist'), media)
} else {
    console.log('prepackage: web workspace not installed — using the bundle committed in the IntelliJ plugin')
    rmSync(media, { recursive: true, force: true })
    copy(committedBundle, media)
}
