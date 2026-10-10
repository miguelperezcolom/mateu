// Checks that every internal link and image in the built site (dist/) resolves to a file in dist/.
// Run after `astro build`: `npm run check-links`. Exits non-zero on any broken reference, so CI
// fails on a page that links to a renamed slug or a screenshot that was never generated.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, posix } from 'node:path';

const DIST = resolve(process.argv[2] ?? 'dist');
const SITE = 'https://mateu.io';

function walk(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) walk(p, out);
		else if (p.endsWith('.html')) out.push(p);
	}
	return out;
}

function exists(target) {
	const clean = decodeURIComponent(target.split('#')[0].split('?')[0]);
	const p = join(DIST, clean);
	if (existsSync(p) && statSync(p).isFile()) return true;
	if (existsSync(join(p, 'index.html'))) return true;
	if (existsSync(p + '.html')) return true;
	return false;
}

const broken = new Map();
const ATTR = /\s(?:href|src)=["']([^"']+)["']/g;
for (const file of walk(DIST)) {
	if (file.endsWith(`${DIST}/404.html`)) continue; // its canonical points at a URL that is never a file
	const dir = '/' + relative(DIST, dirname(file)).split('\\').join('/');
	// Strip code blocks: an example URL inside <pre> is not a link.
	const html = readFileSync(file, 'utf8').replace(/<pre[\s\S]*?<\/pre>/g, '');
	for (const m of html.matchAll(ATTR)) {
		let url = m[1].replaceAll('&amp;', '&');
		if (url.startsWith(SITE)) url = url.slice(SITE.length) || '/';
		if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url)) continue; // external, mailto:, data:, anchors
		const abs = url.startsWith('/') ? url : posix.resolve(dir, url);
		if (!exists(abs)) {
			const page = '/' + relative(DIST, file).split('\\').join('/');
			if (!broken.has(page)) broken.set(page, new Set());
			broken.get(page).add(m[1]);
		}
	}
}

if (broken.size) {
	let n = 0;
	for (const [page, urls] of broken) {
		for (const u of urls) {
			console.error(`${page}: ${u}`);
			n++;
		}
	}
	console.error(`\n${n} broken internal link(s)/image(s) in ${broken.size} page(s).`);
	process.exit(1);
}
console.log('All internal links and images resolve.');
