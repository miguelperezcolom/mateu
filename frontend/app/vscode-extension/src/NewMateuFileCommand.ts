import * as vscode from 'vscode'
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
    baseNameOf,
    fileNameOf,
    fileNameProblem,
    loadCatalogue,
    pageFileName,
    render,
    targetDir,
    templateText,
    templatesRoot,
    uniqueBaseName,
} from './newFiles'
import { ofKind, registerInMount, relativePath, routeNameOf, setHome, specsRoot, withBasePath } from './routesWizard'
import { applyRoute, askMakeHome, editFile, reconfirmRoute, scanWorkspace, validateRoute } from './AddRouteCommand'
import { hasDescriptor, projectRenderer } from './ProjectSettingsCommand'
import { coordinatesOf, rendererInfo } from './projectDescriptor'

/**
 * "Mateu: New File…" — the VS Code twin of the IntelliJ New › Mateu group: pick a specs/ui file kind
 * (UI mount, routes, app shell, REST sources, action catalogue, field types, translations, environment, page), for a page its template and page width, then a
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

    // the project descriptor is one per project: offered only while there is none
    const offered = (await hasDescriptor()) ? catalogue.files.filter((k) => !k.singleton) : catalogue.files
    const kindPick = await vscode.window.showQuickPick(
        offered.map((k) => ({ label: k.label, detail: k.description, fileKind: k })),
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

    // a page template proposes a FREE name: picking one already used here must not start on an error
    if (kind.page) defaultName = uniqueBaseName(defaultName, dir, existsSync)
    const askName = (value: string) => vscode.window.showInputBox({
        title: `New Mateu ${kind.label.replace(/…$/, '')}`,
        prompt: `Created in ${dir}`,
        value,
        // inline, re-checked on every keystroke: the clash clears as soon as the name changes
        validateInput: (v) => fileNameProblem(v, dir, existsSync),
    })
    const name = await askName(defaultName)
    if (name === undefined) return
    let baseName = baseNameOf(name)
    const skeleton = templateText(roots.internal, template)
    let edits: (t: string) => string = (t) => t

    // The specs/ui files around the target: what routes and mounts reference (relative to the root).
    const ws = scanWorkspace(specsRoot(dir))
    const relOf = (n: string) => {
        const f = join(dir, fileNameOf(n))
        return f.startsWith(`${ws.root}/`) ? f.substring(ws.root.length + 1) : fileNameOf(n)
    }
    const title = `New Mateu ${kind.label.replace(/…$/, '')}`
    // checked right before writing (false = the user gave up); nothing is created when it fails
    let beforeCreate: (() => Promise<boolean>) | null = null
    // what to do once the file exists, given its path relative to specs/ui (the name may still change)
    let afterCreate: ((rel: string) => Promise<void>) | null = null

    if (kind.id === 'mount') {
        const renderer = await projectRenderer()
        const home = await vscode.window.showInputBox({
            title,
            prompt: 'Home page route (optional): a route of this mount, relative. Usually empty now — set it later with Mateu: Add Route…' +
                ` Renderer: ${rendererInfo(renderer).label} (specs/ui/project.yaml) — the app serving it depends on ${coordinatesOf(renderer)}.`,
        })
        if (home === undefined) return
        if (home.trim() !== '') edits = (t) => setHome(t, home)
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
        edits = (t) => withBasePath(t, basePath)
        if (mount != null) {
            const m = mount
            afterCreate = (rel) => {
                const entry = relativePath(m.includes('/') ? m.substring(0, m.lastIndexOf('/')) : '', rel)
                return editFile(`${ws.root}/${m}`, (t) => registerInMount(t, entry))
            }
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
                let route = await vscode.window.showInputBox({
                    title,
                    prompt: `Route in ${routesRel}, relative to the mount`,
                    value: routeNameOf(relOf(baseName)),
                    validateInput: (v) => validateRoute(ws, routesRel, v),
                })
                if (route === undefined) return
                const makeHome = await askMakeHome(ws, routesRel, title)
                if (makeHome === undefined) return
                beforeCreate = async () => {
                    // a route declared meanwhile is asked again (the reason inline) BEFORE anything
                    // is written — never a page created without the route it was meant to get
                    route = await reconfirmRoute(ws, routesRel, route!, title)
                    return route !== undefined
                }
                afterCreate = (rel) => applyRoute(ws, routesRel, { route: route!, layout: rel }, makeHome)
            }
        }
    }

    // A file that appeared since the name was typed does not abort the flow: the name is asked again
    // (the clash shown inline) and every other choice made so far is kept.
    if (beforeCreate && !(await beforeCreate())) return
    mkdirSync(dir, { recursive: true })
    let file = join(dir, fileNameOf(baseName))
    while (!createExclusive(file, edits(render(skeleton, baseName, undefined, style)))) {
        const again = await askName(baseName)
        if (again === undefined) return
        baseName = baseNameOf(again)
        file = join(dir, fileNameOf(baseName))
    }
    try {
        await afterCreate?.(relOf(baseName))
    } catch (e) {
        vscode.window.showErrorMessage(e instanceof Error ? e.message : String(e))
    }
    await vscode.window.showTextDocument(vscode.Uri.file(file))
}

/** Create `file` with `text` unless it exists (false then); any other failure throws. */
function createExclusive(file: string, text: string): boolean {
    try {
        writeFileSync(file, text, { flag: 'wx' })
        return true
    } catch (e) {
        if ((e as NodeJS.ErrnoException).code === 'EEXIST') return false
        throw e
    }
}
