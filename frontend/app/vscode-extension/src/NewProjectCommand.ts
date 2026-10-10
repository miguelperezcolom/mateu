import * as vscode from 'vscode'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { loadCatalogue } from './newFiles'
import {
    ARTIFACT_ID_PATTERN,
    JAVA_NAME_PATTERN,
    NewProjectOptions,
    defaultPackage,
    generateProject,
    incompatibility,
    latestMateuVersion,
    loadManifest,
    pinnedVersion,
    resolveChoices,
    runCommand,
    sourcesFor,
    validate,
    writeProject,
} from './newProject'

/**
 * "Mateu: New Project" — the VS Code front door of the shared project generator (newProject.ts):
 * authoring flavour, runtime, renderer, sample, YAML page templates, coordinates, folder; then the
 * project is written and opened. Same choices and output as the IntelliJ New Project wizard.
 */
export class NewProjectCommand {
    static register(context: vscode.ExtensionContext): vscode.Disposable {
        return vscode.commands.registerCommand('mateu.newProject', () => run(context))
    }
}

async function run(context: vscode.ExtensionContext): Promise<void> {
    const sources = sourcesFor(context.extensionPath)
    const manifest = loadManifest(sources.starters)
    const title = 'Mateu: New Project'

    const aPick = await vscode.window.showQuickPick(
        manifest.authoring.map((a) => ({ label: a.label, detail: a.description, id: a.id })),
        { title, placeHolder: 'How do you want to author the UI?', matchOnDetail: true },
    )
    if (!aPick) return
    const authoring = manifest.authoring.find((a) => a.id === aPick.id)!

    let runtime: string | undefined
    if (authoring.runtimes.length === 1) runtime = authoring.runtimes[0]
    else if (authoring.runtimes.length > 1) {
        const rPick = await vscode.window.showQuickPick(
            authoring.runtimes.map((id) => ({ label: manifest.runtimes.find((r) => r.id === id)?.label ?? id, id })),
            { title, placeHolder: 'Runtime' },
        )
        if (!rPick) return
        runtime = rPick.id
    }
    const resolved = resolveChoices(manifest, authoring.id, runtime)
    if (typeof resolved === 'string') {
        void vscode.window.showErrorMessage(resolved)
        return
    }

    let renderer: string | undefined = resolved.renderers[0]
    if (resolved.renderers.length > 1) {
        const pick = await vscode.window.showQuickPick(
            resolved.renderers.map((id) => ({ label: manifest.renderers.find((r) => r.id === id)?.label ?? id, id })),
            { title, placeHolder: 'Renderer (design system)' },
        )
        if (!pick) return
        renderer = pick.id
    }

    const samples = resolved.samples.filter((s) => !incompatibility(manifest, { authoring: authoring.id, runtime, renderer, sample: s }))
    let sample = samples[0]
    if (samples.length > 1) {
        const pick = await vscode.window.showQuickPick(
            samples.map((id) => {
                const s = manifest.samples.find((x) => x.id === id)
                return { label: s?.label ?? id, detail: s?.description, id }
            }),
            { title, placeHolder: 'Start from' },
        )
        if (!pick) return
        sample = pick.id
    }

    let pages: string[] = []
    if (authoring.pages) {
        const catalogue = loadCatalogue(sources.pageCatalogue)
        const picks = await vscode.window.showQuickPick(
            catalogue.pageTemplates.map((t) => ({ label: t.label, detail: t.description, id: t.id })),
            { title, placeHolder: 'Add sample pages from the page templates (optional)', canPickMany: true, matchOnDetail: true },
        )
        if (!picks) return
        pages = picks.map((p) => p.id)
    }

    const isJava = resolved.language === 'java'
    let groupId = ''
    if (isJava) {
        const g = await vscode.window.showInputBox({
            title, prompt: 'Group id', value: 'com.example',
            validateInput: (v) => (JAVA_NAME_PATTERN.test(v.trim()) ? undefined : 'A dotted Java name, e.g. com.acme'),
        })
        if (g === undefined) return
        groupId = g.trim()
    }
    const a = await vscode.window.showInputBox({
        title, prompt: isJava ? 'Artifact id (also the folder name)' : 'Project name (also the folder name)', value: 'my-app',
        validateInput: (v) => (ARTIFACT_ID_PATTERN.test(v.trim()) ? undefined : 'Lower-case letters, digits and - . _ (e.g. my-shop)'),
    })
    if (a === undefined) return
    const artifactId = a.trim()
    let packageName = ''
    if (isJava) {
        const p = await vscode.window.showInputBox({
            title, prompt: 'Package', value: defaultPackage(groupId, artifactId),
            validateInput: (v) => (JAVA_NAME_PATTERN.test(v.trim()) ? undefined : 'A dotted Java name, e.g. com.acme.shop'),
        })
        if (p === undefined) return
        packageName = p.trim()
    }

    const folder = await vscode.window.showOpenDialog({
        title: `${title}: where to create ${artifactId}/`, canSelectFiles: false, canSelectFolders: true, canSelectMany: false,
        openLabel: 'Create here', defaultUri: vscode.workspace.workspaceFolders?.[0]?.uri,
    })
    if (!folder || folder.length === 0) return
    const target = join(folder[0].fsPath, artifactId)
    if (existsSync(target) && readdirSync(target).length > 0) {
        void vscode.window.showErrorMessage(`${target} already exists and is not empty.`)
        return
    }

    const options: NewProjectOptions = {
        authoring: authoring.id, runtime, buildTool: isJava ? 'maven' : undefined, renderer, sample, pages,
        groupId, artifactId, packageName, version: '',
    }
    try {
        await vscode.window.withProgress(
            { location: vscode.ProgressLocation.Notification, title: `Creating ${artifactId}…` },
            async () => {
                options.version = await latestMateuVersion(manifest, pinnedVersion(sources.starters, resolved.starter))
                const errors = validate(manifest, options)
                if (errors.length > 0) throw new Error(errors.join('\n'))
                writeProject(generateProject(sources, options), target)
            },
        )
    } catch (e) {
        void vscode.window.showErrorMessage(`Could not create the project: ${(e as Error).message}`)
        return
    }

    const open = await vscode.window.showInformationMessage(
        `Created ${artifactId} (Mateu ${options.version}). Run: ${runCommand(manifest, options)}`,
        'Open', 'Open in New Window',
    )
    if (open) {
        await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(target), { forceNewWindow: open === 'Open in New Window' })
    }
}
