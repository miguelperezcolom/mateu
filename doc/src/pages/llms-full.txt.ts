// /llms-full.txt — the WHOLE documentation as one plain-text file, generated at build time from the
// same content collection the site is built from, so it can never drift from the pages. It is the
// companion of the hand-written index /llms.txt (https://llmstxt.org): an index links, this file
// carries the text, for tools that ingest a site in one request. Order: the pages a reader meets
// first (what Mateu is, the paths, the concepts), then the authoring paths, deployment, patterns
// and reference; everything else after, alphabetically. Each page keeps its source Markdown and is
// headed by its title and canonical URL.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { resolveVersion } from '../plugins/remark-mateu-version.mjs';

export const prerender = true;

const SITE = 'https://mateu.io';
const FIRST = [
	'mateu-about/what-is-mateu',
	'start-here/choose-your-path',
	'build-uis-with-ai',
	'concepts',
	'define',
	'java-user-manual',
	'java-ui-definition',
	'java-create-your-project',
	'csharp-user-manual',
	'python-user-manual',
	'deploy',
	'ux-patterns',
	'reference',
];

function rank(id: string): number {
	const i = FIRST.findIndex((p) => id === p || id.startsWith(p + '/'));
	return i < 0 ? FIRST.length : i;
}

export const GET: APIRoute = async () => {
	const version = await resolveVersion();
	const pages = (await getCollection('docs'))
		.filter((p) => !p.data.draft && p.id !== '404')
		.sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id));
	const out: string[] = [
		'# Mateu — full documentation',
		'',
		`> Every page of ${SITE}, in one file, generated from the docs at build time (Mateu ${version}).`,
		`> The index with links is ${SITE}/llms.txt; the curated AI references are ${SITE}/mateu-ai-compact.md`,
		`> and ${SITE}/mateu-ai-full.md; Claude Code users can install the skills with`,
		'> `/plugin marketplace add miguelperezcolom/mateu` and `/plugin install mateu@mateu`.',
		'',
	];
	for (const p of pages) {
		const slug = p.id === 'index' ? '' : `${p.id.replace(/\/index$/, '')}/`;
		out.push('', '---', '', `# ${p.data.title}`, '', `URL: ${SITE}/${slug}`);
		if (p.data.description) out.push('', `> ${p.data.description}`);
		out.push('', (p.body ?? '').replaceAll('MATEU_VERSION', version).trim(), '');
	}
	return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
