#!/usr/bin/env node
// Guards the AI guidance that ships OUTSIDE this repository, so it cannot drift from itself:
//
//   - the Claude Code marketplace (.claude-plugin/marketplace.json) lists the plugin by a path that
//     exists, under the name its plugin.json declares;
//   - ai/claude-plugin/mateu/skills is the ONLY copy of the skills: every .claude/skills/<name> of
//     this repo is a symlink into it (a real directory there would be a second copy that drifts);
//   - every SKILL.md has the portable frontmatter (name = its directory, a description within the
//     Agent Skills limits) and every relative link inside a skill resolves INSIDE the plugin — the
//     plugin is installed alone, so a link to ../../doc/... works in this repo and nowhere else;
//   - the run skill's screenshot script is the same file as e2e/screenshot.mjs;
//   - generated projects point at this marketplace (starters/generator/overlays/common/claude/settings.json).
//
//   node scripts/check-ai-plugin.mjs        (exit 1 and one line per problem on failure)
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const problems = []
const fail = (msg) => problems.push(msg)
const json = (p) => JSON.parse(readFileSync(join(repo, p), 'utf8'))

// --- marketplace + manifest
const market = json('.claude-plugin/marketplace.json')
if (market.name !== 'mateu') fail(`marketplace name is '${market.name}', the install line says mateu@mateu`)
if (!market.owner?.name) fail('marketplace.json: owner.name is required')
const entry = (market.plugins ?? []).find((p) => p.name === 'mateu')
if (!entry) fail("marketplace.json lists no plugin named 'mateu'")
const pluginDir = join(repo, entry?.source ?? './ai/claude-plugin/mateu')
if (entry && (!entry.source.startsWith('./') || entry.source.includes('..'))) fail(`plugin source must be ./relative without '..': ${entry.source}`)
const manifestPath = join(pluginDir, '.claude-plugin/plugin.json')
if (!existsSync(manifestPath)) fail(`missing ${relative(repo, manifestPath)}`)
else {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    if (manifest.name !== entry?.name) fail(`plugin.json name '${manifest.name}' != marketplace entry '${entry?.name}'`)
    if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.]+)?$/.test(manifest.version ?? '')) fail(`plugin.json version '${manifest.version}' is not semver (scripts/bump-example-version.sh sets it)`)
    if (entry?.version) fail('version belongs in plugin.json only (the manifest wins and validate warns on a mismatch)')
}

// --- skills
const skillsDir = join(pluginDir, 'skills')
const skills = existsSync(skillsDir) ? readdirSync(skillsDir).filter((d) => statSync(join(skillsDir, d)).isDirectory()) : []
if (skills.length === 0) fail('the plugin has no skills')
const PORTABLE = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools'])

function frontmatter(text) {
    const m = /^---\n([\s\S]*?)\n---\n/.exec(text)
    if (!m) return null
    const out = {}
    for (const line of m[1].split('\n')) {
        const kv = /^([A-Za-z_-]+):\s*(.*)$/.exec(line)
        if (kv) out[kv[1]] = kv[2].replace(/^["']|["']$/g, '')
    }
    return out
}

function* walk(dir) {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name)
        if (statSync(p).isDirectory()) yield* walk(p)
        else yield p
    }
}

for (const skill of skills) {
    const base = join(skillsDir, skill)
    const md = join(base, 'SKILL.md')
    if (!existsSync(md)) { fail(`skills/${skill}: no SKILL.md`); continue }
    const fm = frontmatter(readFileSync(md, 'utf8'))
    if (!fm) { fail(`skills/${skill}/SKILL.md: no frontmatter`); continue }
    if (fm.name !== skill) fail(`skills/${skill}/SKILL.md: name '${fm.name}' must equal the directory name`)
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name ?? '') || (fm.name ?? '').length > 64) fail(`skills/${skill}: name must be lower-case kebab, <= 64 chars`)
    if (!fm.description) fail(`skills/${skill}: description is required (it is what triggers the skill)`)
    else if (fm.description.length > 1024) fail(`skills/${skill}: description is ${fm.description.length} chars (> 1024)`)
    for (const k of Object.keys(fm)) if (!PORTABLE.has(k)) fail(`skills/${skill}: frontmatter '${k}' is Claude Code only (claude.ai / the Skills API refuse it)`)
    for (const file of walk(base)) {
        if (lstatSync(file).isSymbolicLink()) fail(`${relative(repo, file)}: a symlink inside the plugin (keep plugin files real)`)
        if (!file.endsWith('.md')) continue
        const text = readFileSync(file, 'utf8')
        for (const m of text.matchAll(/\]\(([^)\s#]+)(#[^)]*)?\)/g)) {
            const target = m[1]
            if (/^[a-z]+:/i.test(target) || target.startsWith('/')) continue
            const abs = resolve(dirname(file), target)
            if (!abs.startsWith(pluginDir + '/')) fail(`${relative(repo, file)}: link '${target}' leaves the plugin (installed alone, it would be dead) — use a https://github.com/miguelperezcolom/mateu/... URL`)
            else if (!existsSync(abs)) fail(`${relative(repo, file)}: dead link '${target}'`)
        }
    }
}

// --- the repo's own .claude/skills are links to the plugin, never copies
const localSkills = join(repo, '.claude/skills')
for (const skill of skills) {
    const link = join(localSkills, skill)
    if (!existsSync(link)) { fail(`.claude/skills/${skill} is missing: ln -s ../../ai/claude-plugin/mateu/skills/${skill} .claude/skills/${skill}`); continue }
    if (!lstatSync(link).isSymbolicLink()) { fail(`.claude/skills/${skill} is a real directory — a second copy of the skill; replace it with a symlink to the plugin`); continue }
    if (realpathSync(link) !== realpathSync(join(skillsDir, skill))) fail(`.claude/skills/${skill} does not point at the plugin's skills/${skill}`)
}
if (existsSync(localSkills)) {
    for (const name of readdirSync(localSkills)) {
        const p = join(localSkills, name)
        if (lstatSync(p).isSymbolicLink() && !existsSync(p)) fail(`.claude/skills/${name} is a dangling symlink (skill removed from the plugin?)`)
    }
}

// --- the screenshot script ships with the run skill and is the same file as the repo's
const shipped = join(skillsDir, 'mateu-run/scripts/screenshot.mjs')
const e2e = join(repo, 'e2e/screenshot.mjs')
if (existsSync(shipped) && existsSync(e2e) && readFileSync(shipped, 'utf8') !== readFileSync(e2e, 'utf8')) {
    fail('ai/claude-plugin/mateu/skills/mateu-run/scripts/screenshot.mjs differs from e2e/screenshot.mjs — copy one over the other')
}

// --- generated projects enable the plugin from this marketplace
const settingsPath = 'starters/generator/overlays/common/claude/settings.json'
if (!existsSync(join(repo, settingsPath))) fail(`missing ${settingsPath}`)
else {
    const s = json(settingsPath)
    const src = s.extraKnownMarketplaces?.[market.name]?.source
    if (src?.source !== 'github' || src?.repo !== 'miguelperezcolom/mateu') fail(`${settingsPath}: extraKnownMarketplaces.${market.name} must be the github source miguelperezcolom/mateu`)
    if (s.enabledPlugins?.[`mateu@${market.name}`] !== true) fail(`${settingsPath}: enabledPlugins must enable mateu@${market.name}`)
}

if (problems.length) {
    console.error(`check-ai-plugin: ${problems.length} problem(s)`)
    for (const p of problems) console.error(`  - ${p}`)
    process.exit(1)
}
console.log(`check-ai-plugin: OK (${skills.length} skills: ${skills.join(', ')})`)
