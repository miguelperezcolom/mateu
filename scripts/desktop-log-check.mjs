#!/usr/bin/env node
// Reads the idea.log of a desktop-app smoke launch (scripts/desktop-smoke.sh on macOS/Linux, the
// smoke-windows job on Windows) and decides whether the app REALLY works — not only "the plugin loaded":
//
//   node scripts/desktop-log-check.mjs <idea.log> [--hub] [--link]
//
//   - the Mateu plugin loaded ("Loaded custom plugins … Mateu");
//   - its self-check found every library and platform module (MateuSelfCheck: "Mateu self-check: OK");
//   - NOTHING went wrong in Mateu's code: no error the platform blames on Mateu ("Plugin to blame:
//     Mateu"), no NoClassDefFoundError / ClassNotFoundException / LinkageError naming Mateu's
//     classloader or thrown from io.mateu.* frames (3.0-beta.64: ObjectMapper missing on the 2026.3
//     base — the plugin LOADED, and the hub never showed);
//   - --hub: the hub came up ("Mateu hub: showing My UIs");
//   - --link: a mateu:// link (MATEU_OPEN_LINK) reached the hub's add flow.
// Exit 0 = pass; 1 = the problems are printed (as ::error:: lines on CI).
import { readFileSync } from 'node:fs'

const LINKAGE = /\b(NoClassDefFoundError|ClassNotFoundException|NoSuchMethodError|NoSuchFieldError|AbstractMethodError|IncompatibleClassChangeError|LinkageError|ExceptionInInitializerError)\b/

/** idea.log as entries: a header line ("2026-… [ ms]  LEVEL - category - message") + its continuation lines. */
export function entriesOf(log) {
    const entries = []
    for (const line of log.split(/\r?\n/)) {
        const head = line.match(/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d,\d+ \[\s*\d+\]\s+(\w+) - (\S+) - (.*)$/)
        if (head) entries.push({ level: head[1], category: head[2], text: head[3], lines: [line] })
        else if (entries.length) entries[entries.length - 1].lines.push(line)
    }
    return entries
}

/** Why an entry is a Mateu failure, or null. */
export function mateuFailure(entry) {
    const body = entry.lines.join('\n')
    if (/Plugin to blame: Mateu\b/.test(body)) return 'the platform blames an error on the Mateu plugin'
    // 2025.2: "PluginClassLoader(plugin=Mateu io.mateu…"; 2026.x: "PluginClassLoader(state=active, plugin=PluginMainDescriptor(name=Mateu, id=io.mateu…"
    if (/PluginClassLoader\((?:[^)]*name=Mateu\b|plugin=Mateu\b)/.test(body) && LINKAGE.test(body)) {
        return `a class the Mateu plugin needs is missing (${body.match(LINKAGE)[1]})`
    }
    if (LINKAGE.test(body) && /\bat io\.mateu\./.test(body)) return `${body.match(LINKAGE)[1]} in Mateu's code`
    if (/^(ERROR|SEVERE)$/.test(entry.level) && /\bat io\.mateu\./.test(body)) return 'an ERROR thrown from Mateu\'s code'
    if (entry.text.includes('Mateu self-check FAILED')) return entry.text.slice(entry.text.indexOf('Mateu self-check FAILED'))
    return null
}

export function check(log, { hub = false, link = false } = {}) {
    const problems = []
    const entries = entriesOf(log)
    if (!/Loaded custom plugins.*\bMateu\b/.test(log)) problems.push('the Mateu plugin did not load')
    if (!/Mateu self-check: OK/.test(log) && !/Mateu self-check FAILED/.test(log)) problems.push('the Mateu self-check never ran (the plugin\'s startup did not get that far)')
    for (const e of entries) {
        const why = mateuFailure(e)
        if (why) problems.push(`${why}: ${e.lines.slice(0, 3).join(' | ').slice(0, 400)}`)
    }
    if (hub && !/Mateu hub: showing My UIs/.test(log)) problems.push('the hub ("My UIs") never showed')
    if (link && !/Mateu hub: a link asks to add/.test(log)) problems.push('the mateu:// link (MATEU_OPEN_LINK) never reached the hub')
    return [...new Set(problems)]
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('desktop-log-check.mjs')) {
    const args = process.argv.slice(2)
    const file = args.find((a) => !a.startsWith('--'))
    if (!file) { console.error('usage: desktop-log-check.mjs <idea.log> [--hub] [--link]'); process.exit(2) }
    let log = ''
    try { log = readFileSync(file, 'utf8') } catch { console.log(`::error::no idea.log at ${file}`); process.exit(1) }
    const problems = check(log, { hub: args.includes('--hub'), link: args.includes('--link') })
    for (const p of problems) console.log(`::error::${p}`)
    if (problems.length) process.exit(1)
    console.log('✅ idea.log: Mateu loaded, its self-check passed, no Mateu error' +
        (args.includes('--hub') ? ', the hub showed' : '') + (args.includes('--link') ? ', the link reached the hub' : ''))
}
