#!/usr/bin/env node
// Build an installable bundle from the canonical skills, without package-manager or network access.
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = 'ai/claude-plugin/mateu'
const format = 'mateu-antigravity-plugin-v1'
const encodeJson = (value) => Buffer.from(JSON.stringify(value, null, 2) + '\n')

export function treeFiles(root, prefix = '') {
    const files = new Map()
    for (const name of readdirSync(root).sort()) {
        const path = join(root, name)
        const key = prefix ? `${prefix}/${name}` : name
        const stat = lstatSync(path)
        if (stat.isSymbolicLink()) throw new Error(`symlinks are not allowed in plugin packages: ${path}`)
        if (stat.isDirectory()) {
            for (const [child, data] of treeFiles(path, key)) files.set(child, data)
        } else if (stat.isFile()) files.set(key, readFileSync(path))
        else throw new Error(`not a regular package file: ${path}`)
    }
    return files
}

export function antigravityFiles(repo = repoRoot) {
    const source = join(repo, sourcePath)
    const manifest = JSON.parse(readFileSync(join(source, '.claude-plugin/plugin.json'), 'utf8'))
    const files = treeFiles(join(source, 'skills'), 'skills')
    // Antigravity's documented schema permits name and description, not Claude's version/author.
    files.set('plugin.json', encodeJson({ name: manifest.name, description: manifest.description }))
    files.set('LICENSE.txt', readFileSync(join(repo, 'LICENSE.txt')))
    const hashes = Object.fromEntries([...files].sort(([a], [b]) => a.localeCompare(b, 'en')).map(([path, data]) =>
        [path, createHash('sha256').update(data).digest('hex')]))
    files.set('package-info.json', encodeJson({ format, version: manifest.version, files: hashes }))
    return files
}

export function checkAntigravityPackage(output, repo = repoRoot) {
    const expected = antigravityFiles(repo)
    const actual = treeFiles(output)
    const problems = []
    for (const [path, data] of expected) {
        if (!actual.has(path)) problems.push(`missing ${path}`)
        else if (!actual.get(path).equals(data)) problems.push(`stale or modified ${path}`)
    }
    for (const path of actual.keys()) if (!expected.has(path)) problems.push(`unexpected ${path}`)
    if (problems.length) throw new Error(`Antigravity package differs from its source:\n  ${problems.join('\n  ')}`)
    return expected
}

export function packageAntigravityPlugin(output, repo = repoRoot) {
    output = resolve(output)
    const source = resolve(repo, sourcePath)
    const within = (parent, child) => {
        const path = relative(parent, child)
        return path === '' || (!isAbsolute(path) && path !== '..' && !path.startsWith(`..${sep}`))
    }
    if (within(source, output) || within(output, source)) throw new Error('output must not overlap the canonical plugin')
    // Resolve ancestors too: an output symlink must never turn a build into a source overwrite.
    for (let parent = output; ; parent = dirname(parent)) {
        if (existsSync(parent) && lstatSync(parent).isSymbolicLink()) throw new Error(`output has a symlink ancestor: ${parent}`)
        if (parent === dirname(parent)) break
    }
    const files = antigravityFiles(repo)
    if (existsSync(output)) {
        const marker = join(output, 'package-info.json')
        if (!existsSync(marker) || JSON.parse(readFileSync(marker, 'utf8')).format !== format) {
            throw new Error('refusing to replace an existing directory that is not a generated Mateu package')
        }
        rmSync(output, { recursive: true })
    }
    for (const [path, data] of files) {
        const destination = join(output, path)
        mkdirSync(dirname(destination), { recursive: true })
        writeFileSync(destination, data)
    }
    checkAntigravityPackage(output, repo)
    return output
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const args = process.argv.slice(2)
        if (args.includes('--help')) {
            console.log('Usage: node scripts/package-antigravity-plugin.mjs [--check] [--output <directory>]\n' +
                'Default output: ai/antigravity-plugin/mateu (generated, ignored by Git).\n' +
                'An existing generated package is replaced; unrelated directories are refused.')
        } else {
            let output = join(repoRoot, 'ai/antigravity-plugin/mateu')
            let check = false
            for (let i = 0; i < args.length; i++) {
                if (args[i] === '--check') check = true
                else if (args[i] === '--output' && args[i + 1] && !args[i + 1].startsWith('--')) output = resolve(args[++i])
                else throw new Error(`unknown or incomplete argument: ${args[i]}`)
            }
            if (check) checkAntigravityPackage(output)
            else packageAntigravityPlugin(output)
            console.log(`Antigravity package ${check ? 'verified' : 'built'}: ${output}`)
        }
    } catch (error) {
        console.error(error.message)
        process.exitCode = 1
    }
}
