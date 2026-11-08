import * as vscode from 'vscode'
import { execFile } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { editFile, scanWorkspace } from './AddRouteCommand'
import {
    type ImportReport,
    MIN_NODE_MAJOR,
    TOKEN_HELP,
    appendImportedRoute,
    figmaFileKey,
    framesOf,
    nodeCandidates,
    nodeMajor,
    routablePages,
    routeOfPage,
    routesFileFor,
    summaryOf,
    tokenFromEnvOrFiles,
} from './figmaImport'
import { targetDir } from './newFiles'
import { ofKind, routesFileText, specsRoot } from './routesWizard'

/** Where the token is kept in VS Code's SecretStorage (the OS keychain), never in a file or a setting. */
export const TOKEN_SECRET = 'mateu.figmaToken'

const TITLE = 'Mateu: Import from Figma'

/** The driver: staged into the .vsix under figma/ (prepackage.mjs), else the repo's (a dev checkout). */
export function figmaScriptPath(extensionPath: string): string {
    const staged = join(extensionPath, 'figma', 'import', 'figma-import.mjs')
    return existsSync(staged) ? staged : join(extensionPath, '..', '..', '..', 'design', 'figma', 'import', 'figma-import.mjs')
}

function run(cmd: string, args: string[], env: NodeJS.ProcessEnv): Promise<{ code: number; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
        execFile(cmd, args, { env, maxBuffer: 64 * 1024 * 1024, timeout: 10 * 60_000 }, (err, stdout, stderr) => {
            const code = err == null ? 0 : typeof (err as any).code === 'number' ? (err as any).code : -1
            resolve({ code, stdout: String(stdout), stderr: String(stderr) })
        })
    })
}

/** The first node ≥ 20 among the candidates (`mateu.nodePath` setting, PATH, the usual folders). */
export async function findNode(configured: string | undefined): Promise<{ node?: string; seen?: string }> {
    let seen: string | undefined
    for (const c of nodeCandidates(configured, process.env, homedir())) {
        if (!existsSync(c)) continue
        const r = await run(c, ['--version'], process.env)
        const major = nodeMajor(r.stdout)
        if (major != null && major >= MIN_NODE_MAJOR) return { node: c }
        seen = `${c} is ${r.stdout.trim() || 'not runnable'}`
    }
    return { seen }
}

function readFile(p: string): string | undefined {
    try {
        return readFileSync(p, 'utf8')
    } catch {
        return undefined
    }
}

/** SecretStorage, else FIGMA_TOKEN / the secrets files, else asked for (and saved on consent). */
async function tokenFor(secrets: vscode.SecretStorage): Promise<string | undefined> {
    const stored = (await secrets.get(TOKEN_SECRET))?.trim()
    if (stored) return stored
    const found = tokenFromEnvOrFiles(process.env, homedir(), readFile)
    if (found) return found
    const typed = (await vscode.window.showInputBox({
        title: TITLE,
        prompt: `Figma personal access token. ${TOKEN_HELP}`,
        password: true,
        ignoreFocusOut: true,
        validateInput: (v) => (v.trim() === '' ? 'Paste the token' : undefined),
    }))?.trim()
    if (!typed) return undefined
    const save = await vscode.window.showQuickPick(
        [
            { label: 'Save it', detail: "In VS Code's secret storage (the OS keychain)", save: true },
            { label: 'Use it this time only', save: false },
        ],
        { title: TITLE, placeHolder: 'Remember the token?' },
    )
    if (save?.save) await secrets.store(TOKEN_SECRET, typed)
    return typed
}

/**
 * "Mateu: Import from Figma…" — the file's URL (or a downloaded payload) and the frames → the
 * bundled driver run with node writes the pages into the mount's specs/ui, then each new page is
 * registered in its routes file with the minimal append Add Route… uses. The token stays in
 * SecretStorage and reaches node only through its environment.
 */
export class FigmaImportCommand {
    static register(context: vscode.ExtensionContext): vscode.Disposable {
        return vscode.Disposable.from(
            vscode.commands.registerCommand('mateu.importFromFigma', (uri?: vscode.Uri) => importFromFigma(context, uri)),
            vscode.commands.registerCommand('mateu.forgetFigmaToken', async () => {
                await context.secrets.delete(TOKEN_SECRET)
                vscode.window.showInformationMessage('The Figma token was removed from VS Code.')
            }),
        )
    }
}

export async function importFromFigma(context: vscode.ExtensionContext, uri?: vscode.Uri): Promise<void> {
    const target = uri ?? vscode.workspace.workspaceFolders?.[0]?.uri
    if (!target) {
        vscode.window.showErrorMessage('Open a folder first: the pages are written under its specs/ui.')
        return
    }
    const p = target.fsPath
    const folder = existsSync(p) && statSync(p).isDirectory() ? p : dirname(p)
    const wsRoot = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(folder))?.uri.fsPath
    const out = targetDir(folder, wsRoot, (d) => existsSync(d) && statSync(d).isDirectory())

    const input = await vscode.window.showInputBox({
        title: TITLE,
        prompt: `The Figma file's URL (Share › Copy link) or key — or a downloaded payload (.json). Pages go to ${out}`,
        placeHolder: 'https://www.figma.com/design/<key>/…',
        ignoreFocusOut: true,
        validateInput: (v) => {
            if (v.trim().endsWith('.json') && existsSync(v.trim())) return undefined
            try {
                figmaFileKey(v)
                return undefined
            } catch (e) {
                return (e as Error).message
            }
        },
    })
    if (input === undefined) return
    const frames = await vscode.window.showInputBox({
        title: TITLE,
        prompt: 'Frames to import, comma-separated (names or slugs) — empty = every screen frame',
        ignoreFocusOut: true,
    })
    if (frames === undefined) return

    const offline = input.trim().endsWith('.json') && existsSync(input.trim())
    const env: NodeJS.ProcessEnv = { ...process.env }
    const args = [figmaScriptPath(context.extensionPath)]
    if (offline) args.push('--json', input.trim())
    else {
        const token = await tokenFor(context.secrets)
        if (!token) return
        env.FIGMA_TOKEN = token
        args.push('--key', figmaFileKey(input))
    }
    args.push('--out', out, '--report', 'json')
    const wanted = framesOf(frames)
    if (wanted.length) args.push('--frames', wanted.join(','))

    const { node, seen } = await findNode(vscode.workspace.getConfiguration('mateu').get<string>('nodePath'))
    if (!node) {
        vscode.window.showErrorMessage(
            `Importing from Figma needs Node.js ${MIN_NODE_MAJOR} or newer${seen ? ` (${seen})` : ', and none was found on the PATH'}. ` +
                'Install it from https://nodejs.org or set mateu.nodePath.',
        )
        return
    }

    const result = await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Importing from Figma…' },
        () => run(node, args, env),
    )
    let report: ImportReport
    try {
        if (result.code !== 0) throw new Error(result.stderr.trim() || `the import failed (exit ${result.code})`)
        report = JSON.parse(result.stdout)
    } catch (e) {
        vscode.window.showErrorMessage(`Figma import: ${(e as Error).message}`)
        return
    }

    let routesAdded: string[]
    try {
        routesAdded = await registerRoutes(out, report)
    } catch (e) {
        vscode.window.showErrorMessage(`Figma import: the pages were written, but the routes were not registered: ${(e as Error).message}`)
        return
    }
    const summary = summaryOf(report, routesAdded)
    const first = report.files.find((f) => f.status === 'created' || f.status === 'updated')
    if (report.warnings.length) {
        const shown = report.warnings.slice(0, 5).join(' · ') + (report.warnings.length > 5 ? ` · … (${report.warnings.length - 5} more)` : '')
        vscode.window.showWarningMessage(`Figma import: ${summary}. ${shown}`)
    } else {
        const open = first ? 'Open' : undefined
        const choice = await (open ? vscode.window.showInformationMessage(`Figma import: ${summary}.`, open) : vscode.window.showInformationMessage(`Figma import: ${summary}.`))
        if (choice === open && first) await vscode.window.showTextDocument(vscode.Uri.file(join(out, first.path)))
    }
}

/** Append each written page to the specs root's routes file (created when there is none); the routes added. */
export async function registerRoutes(out: string, report: ImportReport): Promise<string[]> {
    const root = specsRoot(out)
    const prefix = relative(root, out).replace(/\\/g, '/')
    const ws = scanWorkspace(root)
    const routesRel = routesFileFor(ofKind(ws, 'routes').map((f) => f.path))
    const rel = routesRel ?? 'routes.yaml'
    let text = routesRel != null ? ws.texts[routesRel] ?? '' : routesFileText()
    const original = text
    const added: string[] = []
    for (const f of routablePages(report)) {
        const layout = prefix ? `${prefix}/${f.path}` : f.path
        const route = routeOfPage(layout)
        const next = appendImportedRoute(text, route, layout)
        if (next != null) {
            text = next
            added.push(route)
        }
    }
    if (text !== original) {
        if (routesRel == null) {
            const edit = new vscode.WorkspaceEdit()
            edit.createFile(vscode.Uri.file(join(root, rel)), { ignoreIfExists: true })
            await vscode.workspace.applyEdit(edit)
        }
        const final = text
        await editFile(join(root, rel), () => final)
    }
    return added
}
