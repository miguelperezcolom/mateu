// Compiles the C# snippets of the docs against backend/dotnet/src (Mateu.Uidl, Mateu.Dtos,
// Mateu.Core and Mateu.AspNetCore, referenced as projects — so it is the current source, not a
// package) with ONE `dotnet build` of a generated project.
//
// Each snippet becomes one file. Its top-level pieces are split at bracket depth 0 and placed
// where they can live, keeping the page's line numbers with `#line` directives:
//   - type declarations (`[UI("x")] public class Products : Crud<Product> { … }`) → its namespace;
//   - members (`[Tab("Identity")] public string? Name { get; set; }`, `public override …`) → a
//     synthetic `partial class Snippet`;
//   - statements (`builder.Services.AddMateu();`) and bare expressions (`new Text("…")`) → the body
//     of an async method of that class (an expression becomes `_ = expr;`).
// The usual `using Mateu.Uidl;`, `using Mateu.Dtos;`, `using Mateu.Core;`, `using Mateu.AspNetCore;`
// and `System.ComponentModel.DataAnnotations` are global (samples omit them), as are the ASP.NET
// Core implicit usings. A type declared by another snippet of the same page is visible.
// `{ ... }` / `…` are elisions.
//
// Tolerated (a sample is not an application): types and names that are not Mateu's (CS0246/CS0103:
// the sample's `Store`, `repo`, `XLWorkbook`), members of non-Mateu types, namespaces outside
// Mateu, `override` on a member shown without its class, a body that returns nothing, and abstract
// members left out when the sample elides its body. Everything else fails — in particular a Mateu
// type, attribute, member or argument that does not exist.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const MATEU_LOOKING = /^(Mateu\w*)$/;

function dotnet() {
  const bin = process.env.DOTNET ?? 'dotnet';
  return spawnSync(bin, ['--version']).status === 0 ? bin : null;
}

function mateuTypes(repoRoot, root = 'backend/dotnet/src', ext = '.cs') {
  const names = new Set();
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) { if (!['bin', 'obj'].includes(e.name)) walk(p); }
      else if (e.name.endsWith(ext)) {
        for (const m of readFileSync(p, 'utf8').matchAll(/\b(?:class|record|interface|enum|struct)\s+([A-Z]\w*)/g)) {
          names.add(m[1]);
          if (m[1].endsWith('Attribute')) names.add(m[1].slice(0, -'Attribute'.length));
        }
      }
    }
  };
  walk(join(repoRoot, root));
  return names;
}

/** `…` and `...` in code (never in strings or comments) become comments. */
function elide(code) {
  let out = '';
  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    if (code.startsWith('//', i)) { const e = code.indexOf('\n', i); const end = e < 0 ? code.length : e; out += code.slice(i, end); i = end - 1; }
    else if (code.startsWith('/*', i)) { const e = code.indexOf('*/', i + 2); const end = e < 0 ? code.length : e + 2; out += code.slice(i, end); i = end - 1; }
    else if (c === '"' || c === "'") {
      let j = i + 1;
      const verbatim = code[i - 1] === '@';
      while (j < code.length && code[j] !== c && code[j] !== '\n') j += !verbatim && code[j] === '\\' ? 2 : 1;
      out += code.slice(i, j + 1); i = j;
    }
    else if (c === '…' || code.startsWith('...', i)) {
      // where a value is expected (`=> …;`, `= …;`) the elision stands for one
      const value = /(=>|=)\s*$/.test(out);
      out += value ? 'default!' : c === '…' ? '/*…*/' : '/*...*/';
      if (c !== '…') i += 2;
    }
    else out += c;
  }
  return out;
}

const TYPE_DECL = /^(?:\[[^\]]*\]\s*)*(?:(?:public|internal|private|protected|sealed|abstract|static|partial|readonly|file)\s+)*(?:record\s+(?:class|struct)\s+|class\s+|record\s+|interface\s+|enum\s+|struct\s+)([A-Z]\w*)/;
const MEMBER = /^(?:\[[^\]]*\]\s*)*(?:public|private|protected|internal|static|override|virtual|abstract|async|readonly|sealed|const|required|extern|unsafe|event)\b/;
const STATEMENT = /^(?:if|for|foreach|while|do|using|var|return|await|try|switch|lock|throw|yield|const|goto|break|continue|checked)\b/;

/** Splits code into its top-level pieces: [{start, lines}], start = 1-based snippet line. */
function chunks(code) {
  const lines = code.split('\n');
  const out = [];
  let depth = 0, cur = null;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim();
    if (!cur && (t === '' || t.startsWith('//'))) continue;
    if (!cur) cur = { start: i + 1, lines: [] };
    cur.lines.push(raw);
    // depth over code only (strings/comments stripped crudely)
    const codeOnly = raw.replace(/@?"(?:[^"\\\n]|\\.)*"/g, '""').replace(/'(?:[^'\\\n]|\\.)'/g, "''").replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
    for (const ch of codeOnly) {
      if ('([{'.includes(ch)) depth++;
      else if (')]}'.includes(ch)) depth--;
    }
    const end = codeOnly.trim();
    const next = lines.slice(i + 1).find((l) => l.trim() && !l.trim().startsWith('//'))?.trim() ?? '';
    const continues = /^(\.|=>|\?|:|\+|-|\*|&&|\|\||\{|where\b)/.test(next) || /(\]|,|=>|=|\(|\+|&&|\|\||\?|:)$/.test(end);
    if (depth <= 0 && !continues && (end.endsWith(';') || end.endsWith('}') || !next || !/^[\[{(.]/.test(next))) {
      out.push(cur);
      cur = null;
      depth = 0;
    }
  }
  if (cur) out.push(cur);
  return out;
}

/** Drops `//` comments, never a `//` inside a string ("http://…"). */
const noComments = (text) => text.replace(/(@?"(?:[^"\\\n]|\\.)*")|\/\/[^\n]*/g, (m, str) => str ?? '');

function classify(chunk) {
  const head = noComments(chunk.lines.join('\n')).trim();
  if (TYPE_DECL.test(head.replace(/\s+/g, ' '))) return 'type';
  if (MEMBER.test(head.replace(/\s+/g, ' ')) || /^\[/.test(head)) return 'member';
  return 'statement';
}

export function checkCsharp(blocks, { repoRoot, work }) {
  const bin = dotnet();
  if (!bin) return null;
  const mateu = mateuTypes(repoRoot);
  // a name of the JAVA API that .NET lacks (`AutoCrud`, `CrudStore`) is a sample written in the
  // wrong language's vocabulary, not the sample's own type
  const javaOnly = new Set([
    ...mateuTypes(repoRoot, 'backend/shared/uidl/src/main/java', '.java'),
    ...mateuTypes(repoRoot, 'backend/shared/core/src/main/java/io/mateu/core/infra/declarative', '.java'),
  ].filter((n) => !mateu.has(n)));
  // under the repo, not the system temp dir: a project reference across the /var → /private
  // symlink resolves to a path that does not exist, and obj/ survives for a faster next run
  const dir = join(repoRoot, 'doc/scripts/snippets/target/csharp');
  mkdirSync(dir, { recursive: true });
  for (const f of readdirSync(dir)) if (/^S\d+\.cs$/.test(f)) rmSync(join(dir, f));
  mkdirSync(join(dir, 'lines'), { recursive: true });
  const units = blocks.map((b) => {
    const usings = [];
    const code = elide(b.code).split('\n').map((l) => {
      if (/^\s*using\s+(static\s+)?[\w.]+(\s*=\s*[\w.<>]+)?\s*;\s*(\/\/.*)?$/.test(l)) { usings.push(l.replace(/\/\/.*$/, '').trim()); return ''; }
      return l;
    }).join('\n');
    const parts = chunks(code).map((c) => ({ ...c, kind: classify(c) }));
    const declared = new Set();
    for (const p of parts.filter((p) => p.kind === 'type'))
      for (const m of p.lines.join('\n').matchAll(/\b(?:class|record|interface|enum|struct)\s+([A-Z]\w*)/g)) declared.add(m[1]);
    const generic = new Set([...code.matchAll(/\b(?:class|record|interface|struct)\s+([A-Z]\w*)\s*</g)].map((m) => m[1]));
    // the names used as attributes: `[UI("x"), Title("y")]`
    const attributes = new Set([...code.matchAll(/^\s*\[(.*)\]\s*(?:$|\S)/gm)]
      .flatMap((l) => [...l[1].matchAll(/(?:^|,|\[)\s*([A-Z]\w*)\s*(?=\(|,|\]|$)/g)].map((x) => x[1])));
    return { b, usings, parts, declared, generic, code, attributes, elided: /\/\*(\.\.\.|…)\*\/|\/\/\s*(\.\.\.|…)/.test(code) };
  });

  // a type of another snippet of the same page: aliased in from the nearest one declaring it
  const byPage = new Map();
  for (const u of units) byPage.set(u.b.file, [...(byPage.get(u.b.file) ?? []), u]);
  const ns = (u) => `Snippets.S${u.b.id}`;
  for (const u of units) {
    const page = byPage.get(u.b.file);
    const i = page.indexOf(u);
    const used = new Set([...u.code.matchAll(/\b([A-Z]\w*)\b/g)].map((m) => m[1]));
    u.aliases = [];
    for (const name of used) {
      if (u.declared.has(name)) continue;
      const order = [...page.slice(0, i).reverse(), ...page.slice(i + 1)];
      const from = order.find((o) => o.declared.has(name));
      if (!from) continue;
      if (from.generic.has(name)) u.aliases.push(`using ${ns(from)};`);
      else u.aliases.push(`using ${name} = ${ns(from)}.${name};`);
    }
  }

  for (const u of units) {
    // the compiler opens the file a #line names: point it at a placeholder that is not compiled
    const f = join(dir, 'lines', `snip-${u.b.id}.txt`);
    writeFileSync(f, '');
    const line = (p) => `#line ${p.start} "${f}"`;
    const types = u.parts.filter((p) => p.kind === 'type');
    const members = u.parts.filter((p) => p.kind === 'member');
    const statements = u.parts.filter((p) => p.kind === 'statement');
    const stmt = (p) => {
      const text = p.lines.join('\n');
      const bare = noComments(text).trim();
      const isStatement = STATEMENT.test(bare) || /^[\w.<>\[\]?]+\s+\w+\s*(=|;)/.test(bare) || /^\w[\w.]*\s*(=|\+=|-=)[^=]/.test(bare);
      if (!isStatement && !bare.endsWith(';')) return `_ = (\n${text}\n);`;
      if (!isStatement && /^new\b/.test(bare)) return `_ = ${text}`;
      return text;
    };
    const src = [
      ...new Set([...u.usings, ...u.aliases]),
      `namespace ${ns(u)} {`,
      ...types.flatMap((p) => [line(p), ...p.lines, '#line default']),
      `partial class Snippet {`,
      ...members.flatMap((p) => [line(p), ...p.lines, '#line default']),
      `async System.Threading.Tasks.Task<object?> __Run(string[] args) {`,
      ...statements.flatMap((p) => [line(p), stmt(p), '#line default']),
      `await System.Threading.Tasks.Task.CompletedTask; return null; }`,
      '}',
      '}',
    ].join('\n');
    writeFileSync(join(dir, `S${u.b.id}.cs`), src);
  }
  writeFileSync(join(dir, 'GlobalUsings.cs'), [
    'global using Mateu.Uidl;', 'global using Mateu.Dtos;', 'global using Mateu.Core;', 'global using Mateu.AspNetCore;',
    'global using System.ComponentModel.DataAnnotations;',
  ].join('\n'));
  writeFileSync(join(dir, 'Snippets.csproj'), `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <OutputType>Library</OutputType>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>annotations</Nullable>
    <LangVersion>latest</LangVersion>
    <TreatWarningsAsErrors>false</TreatWarningsAsErrors>
    <NoWarn>$(NoWarn);CS0105;CS8019;CS1998;CS0168;CS0219;CS4014</NoWarn>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="${join(repoRoot, 'backend/dotnet/src/Mateu.AspNetCore/Mateu.AspNetCore.csproj')}" />
  </ItemGroup>
</Project>
`);
  const build = spawnSync(bin, ['build', join(dir, 'Snippets.csproj'), '-nologo', '-v', 'q', '-clp:ErrorsOnly;NoSummary', '-p:TargetFrameworks=net10.0'], {
    encoding: 'utf8', env: { ...process.env, DOTNET_CLI_UI_LANGUAGE: 'en', DOTNET_NOLOGO: '1', DOTNET_CLI_TELEMETRY_OPTOUT: '1' }, maxBuffer: 64 * 1024 * 1024 });
  const output = (build.stdout ?? '') + (build.stderr ?? '');

  const results = new Map(units.map((u) => [u.b.id, { id: u.b.id, status: 'pass', errors: [], assumed: [] }]));
  const unitById = new Map(units.map((u) => [u.b.id, u]));
  const seen = new Set();
  let unattributed = [];
  for (const raw of output.split('\n')) {
    const m = /(?:^|[\\/\s])(?:snip-(\d+)\.txt|S(\d+)\.cs)\((\d+),\d+\): error (CS\d+): (.*?)(?: \[[^\]]*\])?$/.exec(raw.trim());
    if (!m) { if (/error/.test(raw) && !/snip-|\bS\d+\.cs/.test(raw)) unattributed.push(raw.trim()); continue; }
    const key = m.slice(1).join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    const synthetic = m[1] === undefined;
    const id = Number(m[1] ?? m[2]);
    const [code, msg] = [m[4], m[5]];
    const u = unitById.get(id);
    const r = results.get(id);
    if (!u || !r) continue;
    const quoted = [...msg.matchAll(/'([^']+)'/g)].map((q) => q[1]);
    const last = (s) => (s ?? '').replace(/<.*$/, '').split('.').pop();
    if (code === 'CS0246' || code === 'CS0103') {
      const name = last(quoted[0]);
      // an unknown ATTRIBUTE is not the sample's own type (that one would be declared on the page)
      const attribute = /Attribute$/.test(name) || u.attributes.has(name);
      if (!MATEU_LOOKING.test(name) && !javaOnly.has(name) && !(code === 'CS0246' && attribute && !synthetic)) {
        r.assumed.push(name);
        continue;
      }
    }
    if (code === 'CS0234' && !(quoted[1] ?? '').startsWith('Mateu')) continue;
    if (code === 'CS1061' || code === 'CS0117') {
      if (!mateu.has(last(quoted[0])) || u.declared.has(last(quoted[0]))) continue;
    }
    if (['CS0115', 'CS0506', 'CS0513', 'CS0621'].includes(code) && /^Snippet\./.test(quoted[0] ?? '')) continue;
    if (code === 'CS0161') continue;
    if (code === 'CS0534' && u.elided) continue;
    r.status = 'fail';
    r.errors.push({ line: synthetic ? 0 : Number(m[3]), message: `${code}: ${msg}` });
  }
  if (build.status !== 0 && [...results.values()].every((r) => r.status === 'pass') && unattributed.length) {
    throw new Error(`dotnet build failed outside the snippets:\n${unattributed.slice(0, 20).join('\n')}`);
  }
  return [...results.values()];
}
