import * as vscode from 'vscode'
import { existsSync, statSync } from 'node:fs'
import { dirname } from 'node:path'
import { targetDir } from './newFiles'
import {
    type NewRoute,
    type SpecsWorkspace,
    appendRoute,
    classify,
    existingRoutes,
    homeOf,
    mountOf,
    ofKind,
    routeNameOf,
    scanSpecs,
    setHome,
    specsRoot,
} from './routesWizard'

/** Scan a specs/ui root, preferring the unsaved content of open documents. */
export function scanWorkspace(root: string): SpecsWorkspace {
    const open = new Map(vscode.workspace.textDocuments.map((d) => [d.uri.fsPath, d.getText()]))
    return scanSpecs(root, (abs) => open.get(abs))
}

/** Replace a file's text through a WorkspaceEdit (undoable, an open editor follows) and save it. */
export async function editFile(abs: string, transform: (text: string) => string): Promise<void> {
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(abs))
    const before = doc.getText()
    const after = transform(before)
    if (after === before) return
    const edit = new vscode.WorkspaceEdit()
    edit.replace(doc.uri, new vscode.Range(doc.positionAt(0), doc.positionAt(before.length)), after)
    if (!(await vscode.workspace.applyEdit(edit))) throw new Error(`Could not edit ${abs}`)
    await doc.save()
}

/**
 * Append `route` to `routesRel` and, when `makeHome`, set it as the home of the mount listing that
 * routes file. Shared by Add Route… and the page flow of New File….
 */
export async function applyRoute(ws: SpecsWorkspace, routesRel: string, route: NewRoute, makeHome: boolean): Promise<void> {
    await editFile(`${ws.root}/${routesRel}`, (t) => appendRoute(t, route))
    if (makeHome) {
        const mount = mountOf(ws, routesRel)
        if (mount == null) throw new Error(`No mount lists ${routesRel}`)
        await editFile(`${ws.root}/${mount}`, (t) => setHome(t, route.route))
    }
}

/** Ask "Make this the home page?" when a mount lists the routes file; false (with no prompt) otherwise. */
export async function askMakeHome(ws: SpecsWorkspace, routesRel: string, title: string): Promise<boolean | undefined> {
    const mount = mountOf(ws, routesRel)
    if (mount == null) return false
    const current = homeOf(ws.texts[mount] ?? '') ?? '(none)'
    const pick = await vscode.window.showQuickPick(
        [
            { label: 'Keep the current home page', detail: `Current home: ${current}`, home: false },
            { label: 'Make this the home page', detail: `Sets home: in ${mount}`, home: true },
        ],
        { title, placeHolder: `Home page of the mount (current: ${current})` },
    )
    return pick?.home
}

export function validateRoute(ws: SpecsWorkspace, routesRel: string, v: string): string | undefined {
    const r = v.trim().replace(/^\/+|\/+$/g, '')
    if (/\s/.test(r)) return 'A route cannot contain spaces'
    if (existingRoutes(ws.texts[routesRel] ?? '').includes(r)) return `Route "${r}" is already declared in ${routesRel}`
    return undefined
}

/**
 * "Mateu: Add Route…" — append ONE entry to a `type: Routes` file: the routes file (preselected when
 * invoked on one), the layout (a discovered page or app shell, or none), the route (relative to the
 * mount, "" = its root), an optional view model and parent route, and optionally make it the mount's
 * home page. The rest of the file is untouched.
 */
export class AddRouteCommand {
    static register(): vscode.Disposable {
        const routesKey = () => {
            const doc = vscode.window.activeTextEditor?.document
            const isRoutes = doc != null && /\.ya?ml$/.test(doc.fileName) && classify(doc.getText()) === 'routes'
            vscode.commands.executeCommand('setContext', 'mateu.isRoutesFile', isRoutes)
        }
        routesKey()
        return vscode.Disposable.from(
            vscode.commands.registerCommand('mateu.addRoute', (uri?: vscode.Uri) => run(uri)),
            vscode.window.onDidChangeActiveTextEditor(routesKey),
            vscode.workspace.onDidSaveTextDocument(routesKey),
        )
    }
}

async function run(uri?: vscode.Uri): Promise<void> {
    const target = uri ?? vscode.window.activeTextEditor?.document.uri ?? vscode.workspace.workspaceFolders?.[0]?.uri
    if (!target) {
        vscode.window.showErrorMessage('Open a folder first: Mateu routes live under specs/ui.')
        return
    }
    const p = target.fsPath
    const isDir = existsSync(p) && statSync(p).isDirectory()
    const folder = isDir ? p : dirname(p)
    const wsRoot = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(folder))?.uri.fsPath
    const root = specsRoot(targetDir(folder, wsRoot, (d) => existsSync(d) && statSync(d).isDirectory()))
    const ws = scanWorkspace(root)
    const routesFiles = ofKind(ws, 'routes').map((f) => f.path)
    if (routesFiles.length === 0) {
        vscode.window.showErrorMessage(`There is no type: Routes file in ${root}. Create one with Mateu: New File… › Routes File.`)
        return
    }
    const title = 'Mateu: Add Route'
    let routesRel = !isDir && p.startsWith(`${root}/`) ? p.substring(root.length + 1) : undefined
    if (routesRel == null || !routesFiles.includes(routesRel)) {
        routesRel = routesFiles.length === 1 ? routesFiles[0] : (await vscode.window.showQuickPick(routesFiles, { title, placeHolder: 'Routes file' }))
        if (routesRel == null) return
    }

    const layoutPick = await vscode.window.showQuickPick(
        [
            { label: '(none)', detail: 'The view model supplies its own tree', layout: null as string | null, shell: false },
            ...ofKind(ws, 'page', 'appShell').map((f) => ({
                label: f.path,
                description: f.kind === 'appShell' ? 'app shell' : undefined,
                layout: f.path as string | null,
                shell: f.kind === 'appShell',
            })),
        ],
        { title, placeHolder: 'Layout the route renders (key layout:, relative to specs/ui)', matchOnDescription: true },
    )
    if (!layoutPick) return

    const existing = existingRoutes(ws.texts[routesRel] ?? '').filter((r) => r !== '')
    let parent: string | null = null
    if (existing.length > 0) {
        const parentPick = await vscode.window.showQuickPick(
            [{ label: '(none)', detail: 'A top-level route', parent: null as string | null }, ...existing.map((r) => ({ label: r, parent: r as string | null }))],
            { title, placeHolder: "Parent route (optional: renders in that screen's slot, emits parent:)" },
        )
        if (!parentPick) return
        parent = parentPick.parent
    }

    const base = layoutPick.layout == null || layoutPick.shell ? '' : routeNameOf(layoutPick.layout)
    const suggested = parent != null ? `${parent}/${base.substring(base.lastIndexOf('/') + 1)}` : base
    const route = await vscode.window.showInputBox({
        title,
        prompt: 'Route, relative to the mount (empty = the mount root; :name segments are path parameters)',
        value: suggested,
        validateInput: (v) => validateRoute(ws, routesRel!, v),
    })
    if (route === undefined) return

    const viewModel = await vscode.window.showInputBox({
        title,
        prompt: 'View model: optional fully qualified class (empty = a definition-only route)',
        validateInput: (v) => (layoutPick.layout == null && v.trim() === '' ? 'Pick a layout or enter a view model' : undefined),
    })
    if (viewModel === undefined) return

    const makeHome = await askMakeHome(ws, routesRel, title)
    if (makeHome === undefined) return

    try {
        await applyRoute(ws, routesRel, { route, layout: layoutPick.layout, viewModel, parent }, makeHome)
        await vscode.window.showTextDocument(vscode.Uri.file(`${root}/${routesRel}`))
    } catch (e) {
        vscode.window.showErrorMessage(e instanceof Error ? e.message : String(e))
    }
}
