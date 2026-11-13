import { visit } from 'unist-util-visit';
import { execFileSync } from 'node:child_process';
import { chooseVersion, metadataVersions, starterPin } from './mateu-version.mjs';

/**
 * Replaces the MATEU_VERSION placeholder in the docs with the version a reader can actually
 * download. Resolution order:
 *
 *   1. the MATEU_VERSION environment variable, when a build sets it by hand (the docs workflow
 *      does not: it builds daily and on every push, not per release);
 *   2. io.mateu:mateu-mvc's versions in Maven Central's metadata — what a pom can resolve today (a
 *      GitHub release can exist minutes or hours before its artifacts reach Central) — chosen by
 *      the New Project generator's rule (mateu-version.mjs): the highest FINAL of the starters'
 *      major, or before its GA the newest pre-release. Never `<release>`, which is only the last one
 *      deployed (a later line's rc, or a backport published after a newer minor);
 *   3. the repository's `vX.Y…` git tags, chosen the same way.
 *
 * If none answers, the build FAILS. A hard-coded fallback silently published a version two
 * hundred releases old in every snippet, which is worse than no build.
 */
const PLACEHOLDER = 'MATEU_VERSION';

let cached = null;

function fromEnv() {
	const v = process.env.MATEU_VERSION?.trim();
	return v ? v.replace(/^v/, '') : null;
}

// the starters' pinned release: its major is the docs' major
const pinOr = (versions) => starterPin() ?? versions.find(Boolean) ?? null;

// mateu-mvc is the artifact's name from the mateu-* rename on; mvc-core answers for the releases
// before it.
const METADATA = ['mateu-mvc', 'mvc-core'].map(
	(id) => `https://repo1.maven.org/maven2/io/mateu/${id}/maven-metadata.xml`
);

async function fromMavenCentral() {
	for (const url of METADATA) {
		try {
			const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
			if (!res.ok) continue;
			const versions = metadataVersions(await res.text());
			const chosen = chooseVersion(versions, pinOr(versions));
			if (chosen) return chosen;
		} catch (e) {
			console.warn('[mateu-version] Maven Central lookup failed:', e.message);
		}
	}
	return null;
}

function fromGitTags() {
	try {
		// the system's git by its absolute path, never whatever an inherited PATH names first (on a
		// machine without /usr/bin/git this fallback answers null and the pinned version is used)
		const out = execFileSync('/usr/bin/git', ['tag', '--list', 'v[0-9]*'], {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		});
		const versions = out.split('\n').map((t) => t.trim().replace(/^v/, '')).filter(Boolean);
		return chooseVersion(versions, pinOr(versions));
	} catch {
		return null;
	}
}

export async function resolveVersion() {
	if (cached) return cached;
	const sources = [
		['MATEU_VERSION env', fromEnv],
		['Maven Central', fromMavenCentral],
		['git tags', fromGitTags],
	];
	for (const [name, source] of sources) {
		const v = await source();
		if (v) {
			console.log(`[mateu-version] ${v} (from ${name})`);
			cached = v;
			return v;
		}
	}
	throw new Error(
		'[mateu-version] Could not resolve the Mateu version: set MATEU_VERSION, or build with network ' +
			'access to Maven Central, or from a git clone that has the release tags.'
	);
}

function replaceIn(node, version) {
	if (node.value?.includes(PLACEHOLDER)) {
		node.value = node.value.replaceAll(PLACEHOLDER, version);
	}
}

/** Remark plugin: replaces MATEU_VERSION in text, code blocks and inline code */
export function remarkMateuVersion() {
	return async (tree) => {
		const version = await resolveVersion();
		visit(tree, 'text', (node) => replaceIn(node, version));
		visit(tree, 'code', (node) => replaceIn(node, version));
		visit(tree, 'inlineCode', (node) => replaceIn(node, version));
	};
}
