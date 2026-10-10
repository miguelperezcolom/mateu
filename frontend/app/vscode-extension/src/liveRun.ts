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
    const match = new RegExp('^\\s*' + key.replace(/\./g, '\\.') + '\\s*[=:]\\s*(\\d+)\\s*$', 'm').exec(properties)
    return match ? Number(match[1]) : 8080
}

const quote = (arg: string) => (/[\s"']/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg)

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
    const agent = `-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:${DEBUG_PORT}`
    const mvn = isWindows ? 'mvn.cmd' : 'mvn'
    const gradle = isWindows ? 'gradlew.bat' : './gradlew'
    let args: string[]
    if (buildTool === 'maven') {
        if (framework === 'quarkus') args = [mvn, 'quarkus:dev', ...devProps]
        else if (framework === 'micronaut') args = [mvn, 'mn:run', '-Dmn.debug=true', `-Dmn.debug.port=${DEBUG_PORT}`,
            '-Dmn.watch=true', `-Dmn.appArgs=${devProps.join(' ')}`]
        else args = [mvn, 'spring-boot:run', `-Dspring-boot.run.jvmArguments=${agent} ${devProps.join(' ')}`]
    } else {
        if (framework === 'quarkus') args = [gradle, 'quarkusDev', ...devProps]
        else if (framework === 'micronaut') args = [gradle, 'run', '--continuous']
        else args = [gradle, 'bootRun', '--debug-jvm']
    }
    const env: Record<string, string> = { MATEU_DEV: 'true' }
    if (specs) env.MATEU_DEV_SPECS_DIR = specs
    if (buildTool === 'gradle' && framework === 'micronaut') env.JAVA_TOOL_OPTIONS = agent
    return {
        framework,
        command: args.map(quote).join(' '),
        env,
        debugPort: DEBUG_PORT,
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
