import * as vscode from 'vscode'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { targetDir } from './newFiles'
import {
    PROJECT_FILE_NAME, RENDERERS, RendererId, coordinatesOf, isProjectDescriptor, parseRenderer, rendererOf, withRenderer,
} from './projectDescriptor'

/**
 * The project-level renderer, kept in specs/ui/project.yaml — the file is the truth:
 *  - "Mateu: Project Settings…" picks the renderer and writes the file;
 *  - the `mateu.renderer` setting is a view of it: on activation and whenever the file changes the
 *    setting is synced FROM the file, and changing the setting writes the file.
 *
 * Also the hook the New Project wizard (queued) calls: [projectRenderer] / [setProjectRenderer], with
 * the artifact from projectDescriptor.ts — never a hard-coded one.
 */
export class ProjectSettingsCommand {
    static register(): vscode.Disposable {
        const subs: vscode.Disposable[] = []
        subs.push(vscode.commands.registerCommand('mateu.projectSettings', pickRenderer))
        const watcher = vscode.workspace.createFileSystemWatcher(`**/specs/ui/**/${PROJECT_FILE_NAME}`)
        const sync = () => void syncSettingFromFile()
        watcher.onDidCreate(sync)
        watcher.onDidChange(sync)
        watcher.onDidDelete(sync)
        subs.push(watcher)
        subs.push(vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('mateu.renderer')) void writeFileFromSetting()
        }))
        sync()
        return vscode.Disposable.from(...subs)
    }
}

/** The project's descriptor file, or undefined when it has none yet. */
export async function findDescriptor(): Promise<string | undefined> {
    const found = await vscode.workspace.findFiles(`**/specs/ui/**/${PROJECT_FILE_NAME}`, '**/{node_modules,target,build,dist,out}/**', 20)
    for (const uri of found.sort((a, b) => a.fsPath.length - b.fsPath.length)) {
        try {
            if (isProjectDescriptor(readFileSync(uri.fsPath, 'utf8'))) return uri.fsPath
        } catch { /* unreadable: not ours */ }
    }
    return undefined
}

/** Whether the project already has a descriptor (New File… offers "Project Settings" only when not). */
export async function hasDescriptor(): Promise<boolean> {
    return (await findDescriptor()) !== undefined
}

/** HOOK: the project's renderer (vaadin when it declares none). */
export async function projectRenderer(): Promise<RendererId> {
    const file = await findDescriptor()
    return rendererOf(file ? readFileSync(file, 'utf8') : undefined)
}

/** Where a NEW descriptor goes: the first workspace folder's specs/ui. */
function defaultDescriptorPath(): string | undefined {
    const ws = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    if (!ws) return undefined
    return join(targetDir(ws, ws, (p) => existsSync(p) && statSync(p).isDirectory()), PROJECT_FILE_NAME)
}

/** HOOK: write `renderer` into the descriptor (creating it when missing). Returns the file, if written. */
export async function setProjectRenderer(renderer: RendererId): Promise<string | undefined> {
    const file = (await findDescriptor()) ?? defaultDescriptorPath()
    if (!file) return undefined
    const before = existsSync(file) ? readFileSync(file, 'utf8') : undefined
    if (before !== undefined && isProjectDescriptor(before) && rendererOf(before) === renderer && /^renderer\s*:/m.test(before)) return file
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, withRenderer(before, renderer))
    return file
}

async function pickRenderer(): Promise<void> {
    const current = await projectRenderer()
    const pick = await vscode.window.showQuickPick(
        RENDERERS.map((r) => ({
            label: r.label,
            description: r.id === current ? 'current' : undefined,
            detail: `Served by ${coordinatesOf(r.id)}`,
            id: r.id,
        })),
        { title: 'Mateu: Project Settings — renderer', placeHolder: 'The renderer the whole project paints with (saved in specs/ui/project.yaml)' },
    )
    if (!pick) return
    const file = await setProjectRenderer(pick.id)
    if (!file) {
        vscode.window.showErrorMessage('Open a folder first: the project descriptor lives under specs/ui.')
        return
    }
    await syncSettingFromFile()
    vscode.window.showInformationMessage(
        `Mateu renderer: ${pick.label} (${file}). A served app renders with its Maven dependency — it should depend on ${coordinatesOf(pick.id)}.`,
    )
}

let syncing = false

/** The setting follows the file (the file wins). */
async function syncSettingFromFile(): Promise<void> {
    const renderer = await projectRenderer()
    const config = vscode.workspace.getConfiguration('mateu')
    if (config.get<string>('renderer') === renderer) return
    syncing = true
    try {
        await config.update('renderer', renderer, vscode.ConfigurationTarget.Workspace)
    } catch { /* no workspace to write the setting into */ } finally {
        syncing = false
    }
}

/** A user change of the setting edits the file. */
async function writeFileFromSetting(): Promise<void> {
    if (syncing) return
    const wanted = parseRenderer(vscode.workspace.getConfiguration('mateu').get<string>('renderer'))
    // nothing to change (also: the echo of our own sync, which may arrive after `syncing` is reset)
    if (!wanted || wanted === (await projectRenderer())) return
    await setProjectRenderer(wanted)
}
