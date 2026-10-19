// Extracts the fenced code blocks of the docs (doc/src/content/docs/**/*.md{,x}) that the snippet
// checker understands. A block is { file, line, lang, info, code, optOut }: `line` is the 1-based
// line of the first code line, so a compiler error maps back to the page; `optOut` is true when the
// fence info carries `nocheck` (```java nocheck) — see CONTRIBUTING.md, "Documentation snippets".
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const LANGS = {
  java: 'java',
  csharp: 'csharp', cs: 'csharp', 'c#': 'csharp',
  python: 'python', py: 'python',
  yaml: 'yaml', yml: 'yaml',
};

function walk(dir, out = []) {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.mdx?$/.test(name)) out.push(p);
  }
  return out;
}

export function extractFile(path, root) {
  const lines = readFileSync(path, 'utf8').split('\n');
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const open = /^(\s*)(`{3,}|~{3,})\s*([^\s`]*)(.*)$/.exec(lines[i]);
    if (!open) continue;
    const [, indent, fence, rawLang, rest] = open;
    // find the closing fence (same char, at least as long)
    let j = i + 1;
    const close = new RegExp(`^\\s*${fence[0] === '`' ? '`' : '~'}{${fence.length},}\\s*$`);
    while (j < lines.length && !close.test(lines[j])) j++;
    const lang = LANGS[rawLang.toLowerCase()];
    if (lang) {
      const body = lines.slice(i + 1, j).map((l) => (l.startsWith(indent) ? l.slice(indent.length) : l.trimStart()));
      const info = rest.trim();
      blocks.push({
        file: relative(root, path),
        line: i + 2,
        lang,
        info,
        code: body.join('\n'),
        optOut: /(^|\s)nocheck(\s|$)/.test(info),
      });
    }
    i = j;
  }
  return blocks;
}

export function extractAll(docsDir, root) {
  return walk(docsDir).flatMap((f) => extractFile(f, root));
}
