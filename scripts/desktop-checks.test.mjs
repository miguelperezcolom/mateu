// The desktop app's smoke checks, against REAL idea.logs of the 2026.3 base (fixtures/desktop-log,
// captured 2026-11-13 by launching IntelliJ 2026.3 with the plugin in a scratch profile):
//   beta64-on-2026.3.log — the 3.0-beta.64 plugin (no bundled Jackson): loads, then every Mateu path
//                          dies on NoClassDefFoundError: ObjectMapper and the hub never shows;
//   fixed-on-2026.3.log  — the fixed plugin: self-check OK, hub shown, the link reached the hub.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { check, entriesOf, mateuFailure } from './desktop-log-check.mjs'
import { isJdk, parseDescriptor } from './intellij-class-visibility.mjs'

const fixture = (name) => readFileSync(new URL(`./fixtures/desktop-log/${name}`, import.meta.url), 'utf8')

test('the beta.64 log fails: Mateu blamed, ObjectMapper missing, no hub, no link', () => {
    const problems = check(fixture('beta64-on-2026.3.log'), { hub: true, link: true })
    assert.ok(problems.some((p) => p.startsWith('the platform blames an error on the Mateu plugin')))
    assert.ok(problems.some((p) => /NoClassDefFoundError in Mateu's code/.test(p)))
    assert.ok(problems.some((p) => p.startsWith('Mateu self-check FAILED')))
    assert.ok(problems.includes('the hub ("My UIs") never showed'))
    assert.ok(problems.includes('the mateu:// link (MATEU_OPEN_LINK) never reached the hub'))
})

test('"the plugin loaded" alone is not enough any more (what beta.64 passed)', () => {
    const onlyLoaded = '2026-11-13 18:54:05,303 [    682]   INFO - #c.i.p.i.b.AppStarter - Loaded custom plugins: Mateu (io.mateu.ijp.plugin, 3.0-beta.64)\n'
    assert.deepEqual(check(onlyLoaded), ["the Mateu self-check never ran (the plugin's startup did not get that far)"])
})

test('the fixed log passes, hub and link included', () => {
    assert.deepEqual(check(fixture('fixed-on-2026.3.log'), { hub: true, link: true }), [])
})

test('a missing class named by Mateu\'s classloader is caught on both platform lines', () => {
    for (const loader of [
        'PluginClassLoader(plugin=Mateu io.mateu.ijp.plugin 3.0-beta.64, isBundled=false)', // the owner's 2025.2-style text
        'PluginClassLoader(state=active, plugin=PluginMainDescriptor(name=Mateu, id=io.mateu.ijp.plugin, version=3.0-beta.64)', // 2026.3
    ]) {
        const [entry] = entriesOf('2026-11-13 10:00:00,000 [  100]  ERROR - #c.i.Foo - boom\n'
            + 'java.lang.NoClassDefFoundError: com/fasterxml/jackson/databind/ObjectMapper\n'
            + `Caused by: java.lang.ClassNotFoundException: com.fasterxml.jackson.databind.ObjectMapper ${loader}\n`)
        assert.match(mateuFailure(entry), /a class the Mateu plugin needs is missing/)
    }
})

test('another plugin\'s error is not Mateu\'s', () => {
    const log = '2026-11-13 10:00:00,000 [  100]  ERROR - #c.i.Foo - boom\njava.lang.IllegalStateException: x\n\tat com.other.Plugin.run(Plugin.java:1)\n'
    assert.equal(mateuFailure(entriesOf(log)[0]), null)
})

test('the class-visibility model reads a descriptor the way ClassLoaderConfigurator does', () => {
    const d = parseDescriptor(`<idea-plugin><id>com.intellij</id><module value="com.intellij.modules.platform"/>
      <depends>com.intellij.modules.lang</depends><depends optional="true" config-file="x.xml">com.intellij.modules.jcef</depends>
      <content namespace="jetbrains">
        <module name="intellij.libraries.jackson.databind"><![CDATA[<idea-plugin visibility="public"><dependencies><module name="x"/></dependencies></idea-plugin>]]></module>
        <module name="intellij.libraries.snakeyaml" loading="embedded"/>
      </content></idea-plugin>`)
    assert.equal(d.id, 'com.intellij')
    assert.deepEqual(d.aliases, ['com.intellij.modules.platform'])
    assert.deepEqual(d.depends, [{ id: 'com.intellij.modules.lang', optional: false }, { id: 'com.intellij.modules.jcef', optional: true }])
    assert.equal(d.content.get('intellij.libraries.jackson.databind'), false, 'not embedded: a <depends> plugin cannot see it')
    assert.equal(d.content.get('intellij.libraries.snakeyaml'), true)
    assert.ok(isJdk('com.sun.net.httpserver.HttpServer') && !isJdk('com.fasterxml.jackson.databind.ObjectMapper'))
})
