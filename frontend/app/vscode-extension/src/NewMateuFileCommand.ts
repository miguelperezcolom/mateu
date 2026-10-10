import * as vscode from 'vscode'
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
    FILE_NAME_PATTERN,
    baseNameOf,
    fileNameOf,
    loadCatalogue,
    pageFileName,
    render,
    targetDir,
    templateText,
    templatesRoot,
} from './newFiles'
import { ofKind, registerInMount, relativePath, routeNameOf, setHome, specsRoot, withBasePath } from './routesWizard'
import { applyRoute, askMakeHome, editFile, scanWorkspace, validateRoute } from './AddRouteCommand'

/**
 * "Mateu: New File…" — the VS Code twin of the IntelliJ New › Mateu group: pick a specs/ui file kind
 * (UI mount, routes, app shell, REST sources, action catalogue, page), for a page its template and page width, then a
 * name. Same catalogue and skeletons as the IntelliJ plugin (see newFiles.ts).
 */
export class NewMateuFileCommand {
    static register(context: vscode.ExtensionContext): vscode.Disposable {
        return vscode.commands.registerCommand('mateu.newFile', (uri?: vscode.Uri) => run(context, uri))
    }
}

async function run(context: vscode.ExtensionContext, uri?: vscode.Uri): Promise<void> {
    const roots = templatesRoot(context.extensionPath)
    const catalogue = loadCatalogue(roots.catalogue)

    const kindPick = await vscode.window.showQuickPick(
        catalogue.files.map((k) => ({ label: k.label, detail: k.description, fileKind: k })),
        { title: 'Mateu: New File', placeHolder: 'What do you want to create?', matchOnDetail: true },
    )
    if (!kindPick) return
    const kind = kindPick.fileKind

    let template = kind.template
    let style: string | null = null
    let defaultName = kind.fileName
    if (kind.page) {
        const tPick = await vscode.window.showQuickPick(
            catalogue.pageTemplates.map((t) => ({ label: t.label, detail: t.description, template: t })),
            { title: 'Mateu: New Page', placeHolder: 'Page template', matchOnDetail: true },
        )
        if (!tPick) return
        template = tPick.template.template
        defaultName = pageFileName(tPick.template.id)
        const widths = [...catalogue.pageWidths].sort(
            (a, b) => Number(b.id === tPick.template.pageWidth) - Number(a.id === tPick.template.pageWidth),
        )
        const wPick = await vscode.window.showQuickPick(
            widths.map((w) => ({
                label: w.label,
                description: w.id === tPick.template.pageWidth ? 'default for this template' : undefined,
                width: w,
            })),
            { title: 'Mateu: New Page', placeHolder: 'Page width (applied as the root layout style)' },
        )
        if (!wPick) return
        style = wPick.width.style
    }
    if (!template) return

    const base = uri?.fsPath ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    if (!base) {
        vscode.window.showErrorMessage('Open a folder first: Mateu files are created under specs/ui.')
        return
    }
    const folder = existsSync(base) && statSync(base).isDirectory() ? base : join(base, '..')
    const wsRoot = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(folder))?.uri.fsPath
    const dir = targetDir(folder, wsRoot, (p) => existsSync(p) && statSync(p).isDirectory())

    const name = await vscode.window.showInputBox({
        title: `New Mateu ${kind.label.replace(/…$/, '')}`,
        prompt: `Created in ${dir}`,
        value: defaultName,
        validateInput: (v) => {
            const n = baseNameOf(v)
            if (n === '') return 'Enter a file name'
            if (!FILE_NAME_PATTERN.test(n)) return "Use letters, digits, '.', '-' or '_'"
            if (existsSync(join(dir, fileNameOf(n)))) return `${fileNameOf(n)} already exists there`
            return undefined
        },
    })
    if (name === undefined) return
    const baseName = baseNameOf(name)
    const file = join(dir, fileNameOf(baseName))
    if (existsSync(file)) {
        vscode.window.showErrorMessage(`${fileNameOf(baseName)} already exists in ${dir}`)
        return
    }
    let text = render(templateText(roots.internal, template), baseName, undefined, style)

    // The specs/ui files around the target: what routes and mounts reference (relative to the root).
    const ws = scanWorkspace(specsRoot(dir))
    const rel = file.startsWith(`${ws.root}/`) ? file.substring(ws.root.length + 1) : fileNameOf(baseName)
    const title = `New Mateu ${kind.label.replace(/…$/, '')}`
    let afterCreate: (() => Promise<void>) | null = null

    if (kind.id === 'mount') {
        const home = await vscode.window.showInputBox({
            title,
            prompt: 'Home page route (optional): a route of this mount, relative. Usually empty now — set it later with Mateu: Add Route…',
        })
        if (home === undefined) return
        if (home.trim() !== '') text = setHome(text, home)
    } else if (kind.id === 'routes') {
        const mounts = ofKind(ws, 'mount')
        let mount: string | null = null
        if (mounts.length > 0) {
            const items = [
                ...mounts.map((m) => ({ label: m.path, detail: "Append this file to the mount's routes: list", mount: m.path as string | null })),
                { label: '(none)', detail: 'Do not register it in a mount', mount: null as string | null },
            ]
            const pick = await vscode.window.showQuickPick(items, { title, placeHolder: 'Mount (type: UI) to register the routes file in' })
            if (!pick) return
            mount = pick.mount
        }
        const basePath = await vscode.window.showInputBox({
            title,
            prompt: 'Base path (optional, ONLY for a class-declared @UI("/shop") mount). Leave empty for a type: UI mount.',
        })
        if (basePath === undefined) return
        text = withBasePath(text, basePath)
        if (mount != null) {
            const m = mount
            const entry = relativePath(m.includes('/') ? m.substring(0, m.lastIndexOf('/')) : '', rel)
            afterCreate = () => editFile(`${ws.root}/${m}`, (t) => registerInMount(t, entry))
        }
    } else if (kind.page) {
        const routesFiles = ofKind(ws, 'routes').map((f) => f.path)
        if (routesFiles.length > 0) {
            const pick = await vscode.window.showQuickPick(
                [
                    ...routesFiles.map((r) => ({ label: `Add a route to ${r}`, routes: r as string | null })),
                    { label: "Don't add a route", routes: null as string | null },
                ],
                { title, placeHolder: 'Route to the new page' },
            )
            if (!pick) return
            const routesRel = pick.routes
            if (routesRel != null) {
                const route = await vscode.window.showInputBox({
                    title,
                    prompt: `Route in ${routesRel}, relative to the mount`,
                    value: routeNameOf(rel),
                    validateInput: (v) => validateRoute(ws, routesRel, v),
                })
                if (route === undefined) return
                const makeHome = await askMakeHome(ws, routesRel, title)
                if (makeHome === undefined) return
                afterCreate = () => applyRoute(ws, routesRel, { route, layout: rel }, makeHome)
            }
        }
    }

    mkdirSync(dir, { recursive: true })
    writeFileSync(file, text, { flag: 'wx' })
    try {
        await afterCreate?.()
    } catch (e) {
        vscode.window.showErrorMessage(e instanceof Error ? e.message : String(e))
    }
    await vscode.window.showTextDocument(vscode.Uri.file(file))
}
