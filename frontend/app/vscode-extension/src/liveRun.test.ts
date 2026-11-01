import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
    desktopFound, desktopLinkOf, desktopOpenCommandOf, desktopProbeOf, frameworkOf, isHotCodeReplaced, liveRunPlan,
    portOf, reloadUrlOf,
} from './liveRun'

describe('the Mateu desktop app as where a live run opens', () => {
    it('hands it the hub add link — the same the IntelliJ plugin and a phone use', () => {
        const link = desktopLinkOf('http://localhost:8080/app')
        expect(link).toBe('mateu://add?u=http%3A%2F%2Flocalhost%3A8080%2Fapp')
        // the corpus the desktop app parses links with accepts it (allowLoopbackHttp)
        const corpus = JSON.parse(readFileSync(join(__dirname, '../../../../conformance/client/hub-links.json'), 'utf8'))
        expect(corpus.links.find((c: { input: string }) => c.input === 'mateu://add?u=http%3A%2F%2Flocalhost%3A8080').result)
            .toEqual({ kind: 'add', baseUrl: 'http://localhost:8080' })
    })
    it('asks each OS where the desktop app is (macOS by bundle id: the phone app claims mateu:// too)', () => {
        expect(desktopProbeOf('darwin')?.at(-1)).toContain("URLForApplicationWithBundleIdentifier('io.mateu.desktop')")
        expect(desktopProbeOf('win32')).toEqual(['reg', 'query', 'HKCR\\mateu\\shell\\open\\command', '/ve'])
        expect(desktopProbeOf('linux')).toEqual(['xdg-mime', 'query', 'default', 'x-scheme-handler/mateu'])
        expect(desktopProbeOf('aix')).toBeUndefined()
    })
    it('reads the answer', () => {
        expect(desktopFound('darwin', 0, '/Applications/Mateu.app\n')).toBe(true)
        expect(desktopFound('darwin', 0, '\n')).toBe(false)
        expect(desktopFound('linux', 0, 'mateu.desktop')).toBe(true)
        expect(desktopFound('linux', 0, '')).toBe(false)
        expect(desktopFound('win32', 0, '')).toBe(true)
        expect(desktopFound('win32', 1, 'ERROR')).toBe(false)
        expect(desktopFound('aix', 0, 'x')).toBe(false)
    })
    it('opens the link with the desktop app, not with whatever claims the scheme', () => {
        const link = 'mateu://add?u=x'
        expect(desktopOpenCommandOf('darwin', link)).toEqual(['open', '-b', 'io.mateu.desktop', link])
        expect(desktopOpenCommandOf('win32', link)).toEqual(['rundll32', 'url.dll,FileProtocolHandler', link])
        expect(desktopOpenCommandOf('linux', link)).toEqual(['xdg-open', link])
        expect(desktopOpenCommandOf('aix', link)).toBeUndefined()
    })
})

const springPom = '<project><build><plugins><plugin><artifactId>spring-boot-maven-plugin</artifactId></plugin></plugins></build></project>'

describe('live run plan', () => {
    it('reads the framework off the build file', () => {
        expect(frameworkOf(springPom)).toBe('spring-boot')
        expect(frameworkOf('<artifactId>quarkus-maven-plugin</artifactId>')).toBe('quarkus')
        expect(frameworkOf('id("io.micronaut.application")')).toBe('micronaut')
        expect(frameworkOf('<project/>')).toBe('unknown')
    })

    it('starts a Spring Boot app with spring-boot:run, the debug agent and dev mode', () => {
        const plan = liveRunPlan('maven', springPom, 'server.port=8093', ['/w/app/src/main/resources/specs/ui'])
        expect(plan.command).toBe(
            'mvn spring-boot:run "-Dspring-boot.run.jvmArguments=-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005'
            + ' -Dmateu.dev=true -Dmateu.dev.specs-dir=/w/app/src/main/resources/specs/ui"')
        expect(plan.env).toEqual({ MATEU_DEV: 'true', MATEU_DEV_SPECS_DIR: '/w/app/src/main/resources/specs/ui' })
        expect(plan.appUrl).toBe('http://localhost:8093')
        expect(plan.debugPort).toBe(5005)
    })

    it('uses quarkus:dev, mn:run and bootRun for the others', () => {
        expect(liveRunPlan('maven', 'quarkus-maven-plugin', 'quarkus.http.port=9000', []).command)
            .toBe('mvn quarkus:dev -Dmateu.dev=true')
        expect(portOf('quarkus', 'quarkus.http.port=9000')).toBe(9000)
        expect(liveRunPlan('maven', 'micronaut-maven-plugin', '', []).command).toContain('mn:run -Dmn.debug=true')
        expect(liveRunPlan('gradle', 'id("org.springframework.boot")', '', []).command).toBe('./gradlew bootRun --debug-jvm')
    })

    it('reloads at the server root and after a Java hot code replace', () => {
        expect(reloadUrlOf('http://localhost:8080/console')).toBe('http://localhost:8080/mateu/dev/reload')
        expect(reloadUrlOf('http://localhost:8080', 'app')).toBe('http://localhost:8080/mateu/dev/reload?scope=app')
        expect(isHotCodeReplaced({ event: 'hotcodereplace', body: { changeType: 'END' } })).toBe(true)
        expect(isHotCodeReplaced({ event: 'hotcodereplace', body: { changeType: 'STARTING' } })).toBe(false)
        expect(isHotCodeReplaced({ event: 'other' })).toBe(false)
    })

    it('is contributed as Mateu: Run App (Live) and Mateu: Reload Screen', () => {
        const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'))
        const commands = pkg.contributes.commands.map((c: { command: string }) => c.command)
        expect(commands).toEqual(expect.arrayContaining(['mateu.runLive', 'mateu.reloadScreen']))
        expect(pkg.activationEvents).toEqual(expect.arrayContaining(['onCommand:mateu.runLive']))
    })
})
