import { visit } from 'unist-util-visit';

const PLACEHOLDER = 'MATEU_VERSION';
const FALLBACK = '3.0-alpha.180';

let cachedVersion = null;

async function fetchLatestVersion() {
	if (cachedVersion) return cachedVersion;

	// Try GitHub releases first (versions like 3.0-alpha.X live here)
	try {
		const res = await fetch(
			'https://api.github.com/repos/miguelperezcolom/mateu/releases/latest',
			{ headers: { Accept: 'application/vnd.github+json' } }
		);
		if (res.ok) {
			const data = await res.json();
			if (data.tag_name) {
				cachedVersion = data.tag_name.replace(/^v/, '');
				console.log(`[mateu-version] GitHub release: ${cachedVersion}`);
				return cachedVersion;
			}
		}
	} catch (e) {
		console.warn('[mateu-version] GitHub releases fetch failed:', e.message);
	}

	// Fallback: Maven Central
	try {
		const res = await fetch(
			'https://search.maven.org/solrsearch/select?q=g:"io.mateu"+AND+a:"mvc-core"&rows=1&wt=json'
		);
		if (res.ok) {
			const data = await res.json();
			const version = data.response?.docs?.[0]?.latestVersion;
			if (version) {
				cachedVersion = version;
				console.log(`[mateu-version] Maven Central: ${cachedVersion}`);
				return cachedVersion;
			}
		}
	} catch (e) {
		console.warn('[mateu-version] Maven Central fetch failed:', e.message);
	}

	console.warn(`[mateu-version] Using fallback version: ${FALLBACK}`);
	cachedVersion = FALLBACK;
	return cachedVersion;
}

/** Remark plugin: replaces MATEU_VERSION in text, code blocks and inline code */
export function remarkMateuVersion() {
	return async (tree) => {
		const version = await fetchLatestVersion();

		visit(tree, 'text', (node) => {
			if (node.value.includes(PLACEHOLDER)) {
				node.value = node.value.replaceAll(PLACEHOLDER, version);
			}
		});

		visit(tree, 'code', (node) => {
			if (node.value.includes(PLACEHOLDER)) {
				node.value = node.value.replaceAll(PLACEHOLDER, version);
			}
		});

		visit(tree, 'inlineCode', (node) => {
			if (node.value.includes(PLACEHOLDER)) {
				node.value = node.value.replaceAll(PLACEHOLDER, version);
			}
		});
	};
}
