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

/**
 * "Mateu: New File…" — the VS Code twin of the IntelliJ New › Mateu group: pick a specs/ui file kind
 * (UI mount, routes, app shell, REST sources, page), for a page its template and page width, then a
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
    const text = render(templateText(roots.internal, template), baseName, undefined, style)
    mkdirSync(dir, { recursive: true })
    writeFileSync(file, text, { flag: 'wx' })
    await vscode.window.showTextDocument(vscode.Uri.file(file))
}
