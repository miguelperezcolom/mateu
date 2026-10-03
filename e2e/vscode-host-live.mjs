// LIVE run of the VSCode host: a real VS Code (Electron) with the extension loaded from source, a
// specs/ui file opened in the Mateu custom editor, and the web editor driven inside its webview.
//
// Proves the round trip a person does: open → the canvas renders (through the extension's backend
// proxy, with the project's REST sources) → select → edit a property → the document goes dirty →
// Cmd/Ctrl+S → the file on disk changed, comments intact.
//
// Needs: VS Code installed, the extension compiled with a fresh media/ bundle
// (`cd frontend/app/vscode-extension && npm run copy:web && npm run compile`), a Mateu backend for
// `mateu.baseUrl` (demo-starwars on :8600) and the demo-static-vcn API on :8790.
//
// Usage: node vscode-host-live.mjs [--code "/Applications/Visual Studio Code.app/Contents/MacOS/Code"] [--shots dir]
import { _electron as electron } from '@playwright/test'
import { parseArgs } from 'node:util'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const { values } = parseArgs({
    options: {
        code: { type: 'string', default: '/Applications/Visual Studio Code.app/Contents/MacOS/Code' },
        backend: { type: 'string', default: 'http://localhost:8600' },
        shots: { type: 'string', default: './visual-editor-shots' },
    },
})
const here = path.dirname(new URL(import.meta.url).pathname)
const extension = path.resolve(here, '../frontend/app/vscode-extension')
const specs = path.resolve(here, '../demo/demo-static-vcn/yaml/src/main/resources/specs/ui')

const checks = []
const check = (name, ok, detail = '') => { checks.push({ name, ok }); console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`) }

// A throwaway workspace (a copy of the VCN specs) and a throwaway VS Code profile.
const tmp = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'mateu-vscode-'))
const ws = path.join(tmp, 'ws')
fs.mkdirSync(path.join(ws, 'specs/ui'), { recursive: true })
for (const f of fs.readdirSync(specs)) fs.copyFileSync(path.join(specs, f), path.join(ws, 'specs/ui', f))
const userData = path.join(tmp, 'user')
fs.mkdirSync(path.join(userData, 'User'), { recursive: true })
fs.writeFileSync(path.join(userData, 'User/settings.json'), JSON.stringify({
    'mateu.baseUrl': values.backend,
    // Open specs/ui files straight in the visual editor (the extension registers it as "option").
    'workbench.editorAssociations': { '**/specs/ui/*.yaml': 'mateu.visualEditor' },
    'security.workspace.trust.enabled': false,
    'workbench.startupEditor': 'none',
    'workbench.tips.enabled': false,
    'update.mode': 'none',
    'telemetry.telemetryLevel': 'off',
    'extensions.autoUpdate': false,
}, null, 2))
fs.mkdirSync(values.shots, { recursive: true })
const target = path.join(ws, 'specs/ui/vcn.yaml')
const original = fs.readFileSync(target, 'utf8')

const app = await electron.launch({
    executablePath: values.code,
    args: [
        `--extensionDevelopmentPath=${extension}`,
        `--user-data-dir=${userData}`,
        `--extensions-dir=${path.join(tmp, 'ext')}`,
        '--disable-workspace-trust', '--skip-welcome', '--skip-release-notes', '--new-window',
        ws, target,
    ],
    timeout: 60000,
})
let exitCode = 1
try {
    const win = await app.firstWindow()
    await win.waitForLoadState('domcontentloaded')
    // The custom editor's webview: an iframe inside an iframe. Find the frame hosting the editor.
    let frame
    for (let i = 0; i < 60 && !frame; i++) {
        for (const f of win.frames()) {
            if (await f.locator('mateu-visual-editor').count().catch(() => 0)) { frame = f; break }
        }
        if (!frame) await win.waitForTimeout(1000)
    }
    check('VS Code opens the specs/ui file in the Mateu visual editor (webview mounted)', !!frame)
    if (!frame) throw new Error('webview not found')
    const ed = frame.locator('mateu-visual-editor')
    await win.waitForTimeout(6000)
    const deepText = () => frame.evaluate(() => {
        const out = []
        const walk = (n) => { if (!n) return; if (n.nodeType === 3) out.push(n.textContent); if (n.shadowRoot) walk(n.shadowRoot); for (const c of (n.childNodes || [])) walk(c) }
        walk(document.querySelector('mateu-visual-editor')?.shadowRoot?.querySelector('editor-canvas'))
        return out.join(' ').replace(/\s+/g, ' ')
    })
    const text = await deepText()
    check('the canvas renders the page (via the extension\'s backend proxy)', text.includes('Virtual cloud network') && text.includes('CIDR block'), text.slice(0, 120))
    const status = await ed.locator('.status').first().textContent().catch(() => '')
    check('the preview is live (rendered by the backend, not a fallback)', /live/.test(status ?? ''), `status chip: ${status}`)
    const files = await ed.locator('editor-outline .row').count()
    check('host bridge answers init + listFiles (Layers populated, file name shown)', files > 3 && (await ed.locator('.toolbar .file').textContent()) === 'vcn.yaml')
    await win.screenshot({ path: path.join(values.shots, 'vscode-host-open.png') })

    // select the "Delete" toolbar button and relabel it
    await ed.locator('editor-outline .row').filter({ hasText: 'Button' }).filter({ hasText: 'Delete' }).first().click()
    const label = ed.locator('editor-properties label:text-is("label") + input').first()
    await label.fill('Remove')
    await label.press('Enter')
    await label.evaluate((e) => e.dispatchEvent(new Event('change', { bubbles: true })))
    await win.waitForTimeout(1500)
    const tabTitle = await win.locator('.tabs-container .tab.active').first().getAttribute('class').catch(() => '')
    check('an edit marks the VS Code document dirty', /dirty/.test(tabTitle ?? ''), tabTitle ?? '')
    // focus back on the editor area and save through VS Code's own command
    await ed.locator('.breadcrumb').click()
    await win.keyboard.press(process.platform === 'darwin' ? 'Meta+S' : 'Control+S')
    await win.waitForTimeout(2000)
    const saved = fs.readFileSync(target, 'utf8')
    const changedLines = saved.split('\n').filter((l, i) => l !== original.split('\n')[i])
    check('Cmd/Ctrl+S writes the file through VS Code', saved.includes('label: Remove'), changedLines.join(' | ').slice(0, 160))
    check('the save keeps the file\'s comments and touches only the edited line', changedLines.length === 1
        && original.split('\n').filter((l) => l.trim().startsWith('#')).length === saved.split('\n').filter((l) => l.trim().startsWith('#')).length)
    await win.screenshot({ path: path.join(values.shots, 'vscode-host-saved.png') })

    // an out-of-band change (the text editor / disk) reaches the canvas
    await frame.evaluate(() => { window.__msgs = []; window.addEventListener('message', (e) => window.__msgs.push(e.data?.type)) })
    fs.writeFileSync(target, saved.replace('label: Remove', 'label: Erase'))
    let reached = false
    for (let i = 0; i < 15 && !reached; i++) { await win.waitForTimeout(1000); reached = (await deepText()).includes('Erase') || (await ed.locator('editor-outline .row', { hasText: 'Erase' }).count()) > 0 }
    check('a change on disk reaches the open visual editor (externalChange)', reached, `messages seen: ${JSON.stringify(await frame.evaluate(() => window.__msgs))}`)
    exitCode = checks.every((c) => c.ok) ? 0 : 1
} catch (e) {
    console.log('✗ run aborted:', e.message)
} finally {
    await app.close().catch(() => {})
    fs.rmSync(tmp, { recursive: true, force: true })
}
console.log(`\n${checks.filter((c) => c.ok).length}/${checks.length} checks passed`)
process.exit(exitCode)
