import * as vscode from 'vscode'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as http from 'node:http'
import { BuildTool, isHotCodeReplaced, liveRunPlan, LiveRunPlan, reloadUrlOf } from './liveRun'

/**
 * `Mateu: Run App (Live)` starts the workspace's Mateu app in development mode as a task (its own
 * terminal), with the JDWP agent on 5005 for a "Java: Attach" debug session, and opens it once it
 * answers. Spec edits (by hand or in the visual editor, which writes the same files) re-render the
 * open screen by themselves; `Mateu: Reload Screen` — fired automatically after a Java hot code
 * replace — re-renders it after a code change.
 */
export class LiveRunCommand {
    private static appUrl: string | undefined

    static register(): vscode.Disposable {
        return vscode.Disposable.from(
            vscode.commands.registerCommand('mateu.runLive', () => LiveRunCommand.run()),
            vscode.commands.registerCommand('mateu.reloadScreen', () => LiveRunCommand.reload(true)),
            vscode.debug.onDidReceiveDebugSessionCustomEvent((event) => {
                if (isHotCodeReplaced(event)) LiveRunCommand.reload(false)
            }),
        )
    }

    private static async run() {
        const folder = vscode.workspace.workspaceFolders?.[0]
        if (!folder) {
            vscode.window.showWarningMessage('Mateu: open the folder of a Mateu project first.')
            return
        }
        const root = folder.uri.fsPath
        const plan = await LiveRunCommand.planFor(root)
        if (!plan) {
            vscode.window.showWarningMessage('Mateu: no pom.xml or build.gradle with a runnable app found.')
            return
        }
        const { module, run } = plan
        const task = new vscode.Task(
            { type: 'shell', mateu: 'live' }, folder, 'Mateu (live)', 'mateu',
            new vscode.ShellExecution(run.command, { cwd: module, env: run.env }),
        )
        await vscode.tasks.executeTask(task)
        LiveRunCommand.appUrl = run.appUrl
        // the visual editor's Play (and its preview) talk to mateu.baseUrl: point it at the app
        // being run when the workspace has not chosen another backend
        const config = vscode.workspace.getConfiguration('mateu')
        const chosen = config.inspect<string>('baseUrl')
        if (!chosen?.workspaceValue && !chosen?.workspaceFolderValue && config.get('baseUrl') !== run.appUrl) {
            await config.update('baseUrl', run.appUrl, vscode.ConfigurationTarget.Workspace)
        }
        vscode.window.showInformationMessage(
            `Mateu: starting the ${run.framework} app in development mode — attach a "Java: Attach" debugger ` +
            `on port ${run.debugPort} for hot code replace.`)
        const deadline = Date.now() + 5 * 60_000
        const poll = async () => {
            if (await answers(run.appUrl)) {
                vscode.env.openExternal(vscode.Uri.parse(run.appUrl))
                return
            }
            if (Date.now() < deadline) setTimeout(poll, 1000)
        }
        setTimeout(poll, 2000)
    }

    private static async planFor(root: string): Promise<{ module: string; run: LiveRunPlan } | undefined> {
        const builds = await vscode.workspace.findFiles('**/{pom.xml,build.gradle,build.gradle.kts}', '**/{node_modules,target,build}/**', 50)
        const runnable = builds
            .map((uri) => uri.fsPath)
            .filter((file) => {
                const text = fs.readFileSync(file, 'utf8')
                return path.basename(file) === 'pom.xml'
                    ? /spring-boot-maven-plugin|quarkus-maven-plugin|micronaut-maven-plugin|io\.helidon\.applications/.test(text)
                    : /org\.springframework\.boot|io\.quarkus|io\.micronaut\.application/.test(text)
            })
            .sort((a, b) => a.length - b.length)
        const buildFile = runnable[0] ?? [path.join(root, 'pom.xml'), path.join(root, 'build.gradle.kts')]
            .find((f) => fs.existsSync(f))
        if (!buildFile) return undefined
        const module = path.dirname(buildFile)
        const tool: BuildTool = path.basename(buildFile) === 'pom.xml' ? 'maven' : 'gradle'
        const propsFile = ['application.properties', 'application.yml', 'application.yaml']
            .map((f) => path.join(module, 'src/main/resources', f)).find((f) => fs.existsSync(f))
        const specs = (await vscode.workspace.findFiles('**/src/main/resources/specs/ui/**/*.{yaml,yml}', '**/{node_modules,target,build}/**'))
            .map((uri) => uri.fsPath.replace(/([\\/]src[\\/]main[\\/]resources[\\/]specs[\\/]ui)[\\/].*$/, '$1'))
        return {
            module,
            run: liveRunPlan(tool, fs.readFileSync(buildFile, 'utf8'),
                propsFile ? fs.readFileSync(propsFile, 'utf8') : '', [...new Set(specs)], process.platform === 'win32'),
        }
    }

    private static reload(explicit: boolean) {
        const base = LiveRunCommand.appUrl
            ?? vscode.workspace.getConfiguration('mateu').get<string>('baseUrl') ?? 'http://localhost:8080'
        const request = http.request(reloadUrlOf(base), { method: 'POST', timeout: 2000 }, (response) => {
            response.resume()
            if (explicit && (response.statusCode ?? 0) >= 300) {
                vscode.window.showWarningMessage(`Mateu: ${base} is not running in development mode (mateu.dev=true).`)
            }
        })
        request.on('error', () => {
            if (explicit) vscode.window.showWarningMessage(`Mateu: no backend answered at ${base}.`)
        })
        request.end()
    }
}

const answers = (url: string): Promise<boolean> => new Promise((resolve) => {
    const request = http.get(url, { timeout: 2000 }, (response) => {
        response.resume()
        resolve(true)
    })
    request.on('error', () => resolve(false))
    request.on('timeout', () => { request.destroy(); resolve(false) })
})
