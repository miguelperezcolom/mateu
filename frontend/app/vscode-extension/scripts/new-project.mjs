// Command-line front door to the same generator "Mateu: New Project" runs (src/newProject.ts), for
// CI and scripting. Build first (`npm run compile`), then:
//
//   node scripts/new-project.mjs --authoring yaml --runtime spring-mvc --sample listing --pages form,dashboard \
//        --group com.acme --artifact my-app --package com.acme.myapp --renderer vaadin --version 0.0.1-MATEU \
//        --out /tmp/my-app
//
// --version defaults to the latest io.mateu:mateu-bom on Maven Central (else the starters' pin).
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const here = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const np = require(resolve(here, 'out/newProject.js'))

const USAGE = `Usage: node scripts/new-project.mjs --out <dir> [options]

  --authoring  code | yaml | static | both          (default: code)
  --runtime    spring-mvc | spring-webflux | quarkus | micronaut | helidon-mp | dotnet | python
                                                   (default: spring-mvc; ignored by static)
  --renderer   vaadin | redwood                    (default: vaadin)
  --sample     crud | empty | listing              (default: the flavour's first sample)
  --pages      comma-separated page templates, e.g. form,dashboard (YAML flavours)
  --group      Maven groupId                       (default: com.example)
  --artifact   Maven artifactId                    (default: my-app)
  --package    Java package                        (default: <group>.<artifact>)
  --version    Mateu version                       (default: latest on Maven Central)
  --build-tool maven                               (default: maven)

Build the extension first: npm ci && npm run compile.`

let parsed
try {
  parsed = parseArgs({
    options: {
        help: { type: 'boolean', short: 'h' },
        authoring: { type: 'string', default: 'code' },
        runtime: { type: 'string', default: 'spring-mvc' },
        sample: { type: 'string' },
        renderer: { type: 'string', default: 'vaadin' },
        'build-tool': { type: 'string', default: 'maven' },
        pages: { type: 'string', default: '' },
        group: { type: 'string', default: 'com.example' },
        artifact: { type: 'string', default: 'my-app' },
        package: { type: 'string' },
        version: { type: 'string' },
        out: { type: 'string' },
    },
  })
} catch (e) {
  console.error(`${e.message}\n\n${USAGE}`)
  process.exit(2)
}
const a = parsed.values
if (a.help) {
    console.log(USAGE)
    process.exit(0)
}
if (!a.out) {
    console.error(`--out <dir> is required\n\n${USAGE}`)
    process.exit(2)
}
const sources = np.sourcesFor(here)
const manifest = np.loadManifest(sources.starters)
const flavour = manifest.authoring.find((x) => x.id === a.authoring)
const runtimeId = flavour && flavour.runtimes.length > 0 ? a.runtime : undefined
const resolved = np.resolveChoices(manifest, a.authoring, runtimeId)
if (typeof resolved === 'string') {
    console.error(resolved)
    process.exit(2)
}
const version = a.version ?? (await np.latestMateuVersion(manifest, np.pinnedVersion(sources.starters, resolved.starter)))
const options = {
    authoring: a.authoring,
    runtime: runtimeId,
    buildTool: a['build-tool'],
    renderer: resolved.renderers.length > 0 ? a.renderer : undefined,
    sample: a.sample ?? resolved.samples[0],
    pages: a.pages ? a.pages.split(',').filter(Boolean) : [],
    groupId: a.group,
    artifactId: a.artifact,
    packageName: a.package ?? np.defaultPackage(a.group, a.artifact),
    version,
}
const errors = np.validate(manifest, options)
if (errors.length > 0) {
    console.error(errors.join('\n'))
    process.exit(2)
}
np.writeProject(np.generateProject(sources, options), resolve(a.out))
console.log(`Generated ${a.out} (${a.authoring}${runtimeId ? ', ' + runtimeId : ''}, Mateu ${version}). Run: ${np.runCommand(manifest, options)}`)
