#!/usr/bin/env node
/**
 * Where a framework release stands among the others — what buid-and-publish.yml's `line` job decides
 * before anything reaches users.
 *
 *   newest  the release moves what everybody gets: the over-the-air phone update, the examples'
 *           pins, the IDE plugins, the desktop app and its update feed, npm's `latest`. A final
 *           (v3.0.1) is newest when no final above it exists — a backport v3.0.2 published after
 *           v3.1.0 is NOT (it would downgrade every phone, repin the starters to 3.0, refuse to
 *           publish to the VS Code Marketplace and take npm's `latest`). A pre-release (v3.0-rc.1)
 *           is newest only before the first final release (the GA) and above every other release;
 *           after the GA a pre-release (v3.1-rc.1) never is.
 *   latest  the release should become GitHub's "Latest" — which installed desktop apps
 *           (releases/latest/download/mateu-desktop-update.json), the docs' download links and
 *           mateu.io/add follow — once its installers are attached: newest, and not published as a
 *           pre-release.
 *   hold    while the release is built and tested it must not be "Latest" (its assets are not there
 *           yet, and its tests may fail): when GitHub made it latest on creation (`gh release create`
 *           without --latest=false), the release that should stay latest until then; else empty.
 *
 * Only published framework releases count (tag vX.Y-alpha|beta|rc.N, vX.Y.Z or vX.Y; drafts and
 * other releases — mateu-desktop-* — are ignored).
 *
 * Usage: node scripts/release-line.mjs <tag> <prerelease true|false> <releases.json>
 *   releases.json = `gh release list --json tagName,isDraft,isPrerelease,isLatest --limit 1000`
 * Prints newest=…, latest=…, hold=… lines (for $GITHUB_OUTPUT).
 */
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const STAGES = { alpha: 0, beta: 1, rc: 2 }
const FINAL = 3

/** [major, minor, patch, stage, n] — comparable — or null for a tag that is not a framework release. */
export const versionOf = (tag) => {
  const m = /^v(\d+)\.(\d+)(?:\.(\d+))?(?:-(alpha|beta|rc)\.(\d+))?$/.exec(String(tag ?? ''))
  if (!m || (m[3] !== undefined && m[4] !== undefined)) return null
  return m[4] !== undefined
    ? [Number(m[1]), Number(m[2]), 0, STAGES[m[4]], Number(m[5])]
    : [Number(m[1]), Number(m[2]), Number(m[3] ?? 0), FINAL, 0]
}

export const compare = (a, b) => {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]
  return 0
}

const isFinal = (v) => v[3] === FINAL

/** @param releases [{ tagName, isDraft, isPrerelease, isLatest }] — every release of the repository */
export const decide = (tag, prerelease, releases) => {
  const self = versionOf(tag)
  const published = releases
    .filter((r) => !r.isDraft && r.tagName !== tag)
    .map((r) => ({ ...r, v: versionOf(r.tagName) }))
    .filter((r) => r.v)
  const finals = published.filter((r) => isFinal(r.v))
  // the GA that ends pre-releases is one of THIS major (or a later one): the 2.x finals still on
  // the releases page say nothing about where a 3.0 beta stands (beta.65 shipped no desktop app
  // and no plugins because v2.4.94 counted as "the GA")
  const gaFinals = self ? finals.filter((r) => r.v[0] >= self[0]) : finals

  let newest = false
  if (self && isFinal(self)) newest = finals.every((r) => compare(r.v, self) < 0)
  else if (self) newest = gaFinals.length === 0 && published.every((r) => compare(r.v, self) < 0)

  const latest = newest && !prerelease

  // the release that should be "Latest" when this one is not (yet): the highest published,
  // non-pre-release one that was itself eligible — a pre-release counts only while no final exists
  const eligible = published
    .filter((r) => !r.isPrerelease)
    .filter((r) => isFinal(r.v) || gaFinals.length === 0)
    .sort((a, b) => compare(b.v, a.v))
  const selfIsLatest = releases.some((r) => r.tagName === tag && r.isLatest)
  const hold = selfIsLatest && eligible.length ? eligible[0].tagName : ''

  return { newest, latest, hold }
}

const main = ([tag, prerelease, file]) => {
  if (!tag || !file) {
    console.error('Usage: node scripts/release-line.mjs <tag> <prerelease true|false> <releases.json>')
    return 2
  }
  const { newest, latest, hold } = decide(tag, prerelease === 'true', JSON.parse(readFileSync(file, 'utf8')))
  console.log(`newest=${newest}`)
  console.log(`latest=${latest}`)
  console.log(`hold=${hold}`)
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv.slice(2)))
