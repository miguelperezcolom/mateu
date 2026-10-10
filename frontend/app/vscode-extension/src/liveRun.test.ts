import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { frameworkOf, isHotCodeReplaced, liveRunPlan, portOf, reloadUrlOf } from './liveRun'

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
