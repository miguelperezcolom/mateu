import { visit } from 'unist-util-visit';
import { execFileSync } from 'node:child_process';

/**
 * Replaces the MATEU_VERSION placeholder in the docs with the version a reader can actually
 * download. Resolution order:
 *
 *   1. the MATEU_VERSION environment variable (the docs workflow sets it from the release tag);
 *   2. the <release> of io.mateu:mvc-core in Maven Central's metadata — what a pom can resolve
 *      today (a GitHub release can exist minutes or hours before its artifacts reach Central);
 *   3. the newest `vX.Y…` git tag of this repository.
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

async function fromMavenCentral() {
	try {
		const res = await fetch(
			'https://repo1.maven.org/maven2/io/mateu/mvc-core/maven-metadata.xml',
			{ signal: AbortSignal.timeout(15000) }
		);
		if (!res.ok) return null;
		const xml = await res.text();
		return xml.match(/<release>([^<]+)<\/release>/)?.[1] ?? null;
	} catch (e) {
		console.warn('[mateu-version] Maven Central lookup failed:', e.message);
		return null;
	}
}

function fromGitTags() {
	try {
		const out = execFileSync(
			'git',
			['tag', '--list', 'v[0-9]*', '--sort=-version:refname'],
			{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
		);
		const tag = out.split('\n').find((t) => t.trim());
		return tag ? tag.trim().replace(/^v/, '') : null;
	} catch {
		return null;
	}
}

async function resolveVersion() {
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
