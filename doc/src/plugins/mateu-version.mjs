/**
 * Which released Mateu version the docs print (remark-mateu-version.mjs). No dependencies, so the
 * rule is tested from the repository root (doc/src/plugins/mateu-version.test.mjs).
 *
 * The SAME rule as the New Project generator (frontend/app/vscode-extension/src/newProject.ts
 * `versionFromMetadata`): the highest version with no qualifier and the same major as the starters'
 * pin; before that major's GA, only pre-releases exist, so the newest of them. Maven Central's
 * `<release>` is no answer — it is just the LAST one deployed: after the GA a `3.1-rc.1` or a
 * backport `3.0.2` published after `3.1.0` would be printed in every snippet, while the starters,
 * plugins and examples stay on the stable release.
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const VERSION = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-(alpha|beta|rc)\.(\d+))?$/;
const QUALIFIER_RANK = { alpha: 0, beta: 1, rc: 2 };

/** `[major, minor, patch, qualifier rank, qualifier number]`, or null for a version that is none of ours. */
export function versionKey(version) {
	const m = VERSION.exec(String(version ?? '').trim());
	if (!m) return null;
	return [Number(m[1]), Number(m[2] ?? 0), Number(m[3] ?? 0), m[4] ? QUALIFIER_RANK[m[4]] : 3, Number(m[5] ?? 0)];
}

const compareKeys = (a, b) => a.map((n, i) => n - b[i]).find((d) => d !== 0) ?? 0;

/** The version to print among `versions`, given the starters' `pin`; null when none qualifies. */
export function chooseVersion(versions, pin) {
	const pinKey = versionKey(pin);
	if (!pinKey) return null;
	const sameMajor = versions
		.map((version) => ({ version: String(version).trim(), key: versionKey(version) }))
		.filter((v) => v.key && v.key[0] === pinKey[0]);
	const stable = sameMajor.filter((v) => v.key[3] === 3);
	const candidates = stable.length ? stable : sameMajor;
	return candidates.sort((a, b) => compareKeys(b.key, a.key))[0]?.version ?? null;
}

/** Every `<version>` of a maven-metadata.xml. */
export const metadataVersions = (xml) => [...xml.matchAll(/<version>([^<]+)<\/version>/g)].map((m) => m[1].trim());

/** The starters' pinned release (`<mateu.version>` of starters/spring-mvc/pom.xml), or null. */
export function starterPin(pom = fileURLToPath(new URL('../../../starters/spring-mvc/pom.xml', import.meta.url))) {
	if (!existsSync(pom)) return null;
	return /<mateu\.version>([^<]+)<\/mateu\.version>/.exec(readFileSync(pom, 'utf8'))?.[1]?.trim() ?? null;
}
