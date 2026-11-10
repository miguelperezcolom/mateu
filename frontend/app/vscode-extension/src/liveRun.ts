// Live development of a Mateu app from VS Code — the pure half (unit-tested without VS Code): what
// build the folder declares and the command that starts its app in DEVELOPMENT MODE (mateu.dev=true:
// specs read from the sources and watched, /mateu/dev/** served) with the JDWP agent on 5005, so a
// Java debugger can attach and hot-replace code. Mirrors the IntelliJ plugin's LiveRunPlan.kt.

export type Framework = 'spring-boot' | 'quarkus' | 'micronaut' | 'helidon' | 'unknown'
export type BuildTool = 'maven' | 'gradle'

export interface LiveRunPlan {
    framework: Framework
    /** One shell command line (run as a VS Code shell task). */
    command: string
    env: Record<string, string>
    debugPort: number
    /** Gradle's --debug-jvm starts the app suspended: it waits until a debugger attaches. */
    waitsForDebugger: boolean
    appUrl: string
}

export const DEBUG_PORT = 5005

export const frameworkOf = (buildFile: string): Framework => {
    if (buildFile.includes('quarkus-maven-plugin') || buildFile.includes('io.quarkus')) return 'quarkus'
    if (buildFile.includes('micronaut-maven-plugin') || buildFile.includes('io.micronaut.application')
        || buildFile.includes('micronaut-parent')) return 'micronaut'
    if (buildFile.includes('helidon')) return 'helidon'
    if (buildFile.includes('spring-boot') || buildFile.includes('org.springframework.boot')) return 'spring-boot'
    return 'unknown'
}

export const portOf = (framework: Framework, properties: string): number => {
    const key = framework === 'quarkus' ? 'quarkus.http.port'
        : framework === 'micronaut' ? 'micronaut.server.port' : 'server.port'
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const match = new RegExp('^\\s*' + escaped + '\\s*[=:]\\s*(\\d+)\\s*$', 'm').exec(properties)
    return match ? Number(match[1]) : 8080
}

const quote = (arg: string) => (/[\s"'\\]/.test(arg) ? `"${arg.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : arg)

export const liveRunPlan = (
    buildTool: BuildTool,
    buildFile: string,
    properties: string,
    specsDirs: string[],
    isWindows = false,
): LiveRunPlan => {
    const framework = frameworkOf(buildFile)
    const specs = specsDirs.join(',')
    const devProps = ['-Dmateu.dev=true', ...(specs ? [`-Dmateu.dev.specs-dir=${specs}`] : [])]
    // JDWP has no authentication: loopback only, the IDE attaches locally
    const agent = `-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=127.0.0.1:${DEBUG_PORT}`
    const mvn = isWindows ? 'mvn.cmd' : 'mvn'
    const gradle = isWindows ? 'gradlew.bat' : './gradlew'
    let args: string[]
    if (buildTool === 'maven') {
        if (framework === 'quarkus') args = [mvn, 'quarkus:dev', ...devProps]
        // Both plugins split these values on spaces, so the specs path (which may have one) stays
        // out of them: it reaches the app in MATEU_DEV_SPECS_DIR.
        else if (framework === 'micronaut') args = [mvn, 'mn:run', '-Dmn.debug=true', `-Dmn.debug.port=${DEBUG_PORT}`,
            '-Dmn.watch=true', '-Dmn.appArgs=-Dmateu.dev=true']
        else args = [mvn, 'spring-boot:run', `-Dspring-boot.run.jvmArguments=${agent} -Dmateu.dev=true`]
    } else {
        if (framework === 'quarkus') args = [gradle, 'quarkusDev', ...devProps]
        // not JAVA_TOOL_OPTIONS: the wrapper and the daemon would inherit the agent too, and the
        // second JVM to bind the port dies with "Address already in use"
        else if (framework === 'micronaut') args = [gradle, 'run', '--continuous', '--debug-jvm']
        else args = [gradle, 'bootRun', '--debug-jvm']
    }
    const env: Record<string, string> = { MATEU_DEV: 'true' }
    if (specs) env.MATEU_DEV_SPECS_DIR = specs
    return {
        framework,
        command: args.map(quote).join(' '),
        env,
        debugPort: DEBUG_PORT,
        waitsForDebugger: buildTool === 'gradle' && framework !== 'quarkus',
        appUrl: `http://localhost:${portOf(framework, properties)}`,
    }
}

/** POST /mateu/dev/reload lives at the server root, whatever path the app is opened at. */
export const reloadUrlOf = (appUrl: string, scope?: string): string => {
    const url = new URL(appUrl)
    return `${url.protocol}//${url.host}/mateu/dev/reload${scope ? `?scope=${scope}` : ''}`
}

/**
 * The Java debugger (vscode-java-debug) reports hot code replace as a custom debug-session event;
 * `changeType` END means the classes were replaced — the moment to re-render the open screen.
 */
export const isHotCodeReplaced = (event: { event?: string; body?: { changeType?: unknown } }): boolean =>
    event.event === 'hotcodereplace' && (event.body?.changeType === 'END' || event.body?.changeType === 2)

// ── the Mateu desktop app (a separate IntelliJ) as the place a live run opens in ───────────────────
// Mirrors the IntelliJ plugin's DesktopApp.kt: the hub's add link (`mateu://add?u=<appUrl>`), how to
// ask each OS whether the desktop app is installed, and the command that hands it the link.

/** Where the installers are (one per OS on every release). */
export const DESKTOP_DOWNLOAD_URL = 'https://github.com/miguelperezcolom/mateu/releases/latest'
/** The hub build's macOS bundle id: on Apple silicon the PHONE app claims mateu:// too. */
export const DESKTOP_MAC_BUNDLE_ID = 'io.mateu.desktop'

/** The link the desktop app receives — the same hub grammar a phone scans. */
export const desktopLinkOf = (appUrl: string): string => `mateu://add?u=${encodeURIComponent(appUrl)}`

/** [command, ...args] that asks the OS where the desktop app is, or undefined when it cannot be asked. */
export const desktopProbeOf = (platform: string): string[] | undefined => {
    if (platform === 'darwin') {
        return ['osascript', '-l', 'JavaScript', '-e',
            "ObjC.import('AppKit'); var u = $.NSWorkspace.sharedWorkspace" +
            `.URLForApplicationWithBundleIdentifier('${DESKTOP_MAC_BUNDLE_ID}'); u.isNil() ? '' : ObjC.unwrap(u.path)`]
    }
    if (platform === 'win32') return ['reg', 'query', 'HKCR\\mateu\\shell\\open\\command', '/ve']
    if (platform === 'linux') return ['xdg-mime', 'query', 'default', 'x-scheme-handler/mateu']
    return undefined
}

/** Whether the probe's answer names the desktop app. */
export const desktopFound = (platform: string, exitCode: number, stdout: string): boolean => {
    if (platform === 'win32') return exitCode === 0
    if (platform === 'darwin' || platform === 'linux') return exitCode === 0 && stdout.trim() !== '' && stdout.trim() !== 'null'
    return false
}

/** [command, ...args] that hands the link to the desktop app (macOS: by bundle id, not the default handler). */
export const desktopOpenCommandOf = (platform: string, link: string): string[] | undefined => {
    if (platform === 'darwin') return ['open', '-b', DESKTOP_MAC_BUNDLE_ID, link]
    if (platform === 'win32') return ['rundll32', 'url.dll,FileProtocolHandler', link]
    if (platform === 'linux') return ['xdg-open', link]
    return undefined
}
