#!/usr/bin/env node
// Keeps the code samples of the docs true to the API: every ```java, ```csharp, ```python and
// ```yaml block under src/content/docs is compiled / type-checked / schema-validated against the
// CURRENT sources of the repo. `npm run check:snippets` (from doc/); CI runs it in the `snippets`
// job of .github/workflows/docs.yml when the docs or the authoring APIs change.
//
//   node scripts/check-snippets.mjs [--lang java,csharp,python,yaml] [--only <path substring>]
//                                   [--require] [--verbose]
//
// --require   fail when a language's toolchain is missing (CI); locally such a language is skipped
//             with a notice.
// --verbose   also list, per snippet, the names it was allowed to assume (the sample's own types).
//
// Toolchains (each one optional locally):
//   java    a JDK 21+ and the classpath of scripts/snippets/pom.xml: taken from
//           $MATEU_SNIPPETS_CLASSPATH (a file holding it, or the classpath itself), else resolved
//           with Maven into scripts/snippets/target/classpath.txt — which needs mateu-core
//           INSTALLED first: `cd backend && mvn -pl shared/core -am install -DskipTests`. Extra
//           Maven flags (e.g. -Dmaven.repo.local=…) go in $MAVEN_ARGS.
//   python  an interpreter with mateu-ui, mypy and jsonschema: $MATEU_SNIPPETS_PYTHON, else python3
//           (`pip install "./backend/python[dev,all]" jsonschema`). Also runs the YAML check.
//   csharp  the .NET SDK (`dotnet`, or $DOTNET); builds backend/dotnet/src/Mateu.AspNetCore.
//
// How each language is checked, what a sample may leave out and what fails: the header comments of
// scripts/snippets/JavaSnippetCheck.java, check_python_yaml.py and check_csharp.mjs.
// Opting a block out: ```java nocheck — see CONTRIBUTING.md, "Documentation snippets".
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractAll } from './snippets/extract.mjs';
import { checkCsharp } from './snippets/check_csharp.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const docRoot = resolve(here, '..');
const repoRoot = resolve(docRoot, '..');
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const langs = (option('--lang') ?? 'java,csharp,python,yaml').split(',');
const only = option('--only');
const require = flag('--require');
const verbose = flag('--verbose');

const work = mkdtempSync(join(tmpdir(), 'mateu-snippets-'));
const all = extractAll(join(docRoot, 'src/content/docs'), docRoot)
  .filter((b) => !only || b.file.includes(only))
  .map((b, id) => ({ id, ...b }));

let failed = 0;
const summary = [];
const missing = [];

function run(lang, checker) {
  const blocks = all.filter((b) => b.lang === lang);
  const optedOut = blocks.filter((b) => b.optOut);
  const checked = blocks.filter((b) => !b.optOut);
  if (!langs.includes(lang) || checked.length === 0) return;
  const results = checker(checked);
  if (results === null) {
    missing.push(lang);
    summary.push({ lang, blocks: blocks.length, checked: 0, passed: 0, failed: 0, optedOut: optedOut.length, note: 'toolchain missing — skipped' });
    return;
  }
  const byId = new Map(checked.map((b) => [b.id, b]));
  let passed = 0, failures = 0, skipped = 0;
  for (const r of results) {
    const b = byId.get(r.id);
    if (r.status === 'skipped') { skipped++; continue; }
    if (r.status === 'pass') {
      passed++;
      if (verbose && r.assumed?.length) console.log(`  ${b.file}:${b.line}: assumed ${r.assumed.join(', ')}`);
      continue;
    }
    failures++;
    for (const e of r.errors.length ? r.errors : [{ line: 0, message: r.status }]) {
      const line = e.line > 0 ? b.line + e.line - 1 : b.line;
      console.log(`${b.file}:${line}: [${lang}] ${String(e.message).replace(/\s*\n\s*/g, ' | ')}`);
    }
  }
  failed += failures;
  summary.push({ lang, blocks: blocks.length, checked: checked.length - skipped, passed, failed: failures, optedOut: optedOut.length, note: skipped ? `${skipped} without a type/$schema not validated` : '' });
}

// ---------------------------------------------------------------------------------------------
// Java

function javaClasspath() {
  const env = process.env.MATEU_SNIPPETS_CLASSPATH;
  if (env) return existsSync(env) ? readFileSync(env, 'utf8').trim() : env;
  const file = join(here, 'snippets/target/classpath.txt');
  mkdirSync(dirname(file), { recursive: true });
  const mvn = spawnSync('mvn', ['-B', '-q', '-f', join(here, 'snippets/pom.xml'), 'dependency:build-classpath', `-Dmdep.outputFile=${file}`], { stdio: 'inherit' });
  if (mvn.status !== 0 || !existsSync(file)) {
    console.error('Could not resolve the Java snippet classpath. Install mateu-core first:\n  cd backend && mvn -pl shared/core -am install -DskipTests');
    return null;
  }
  return readFileSync(file, 'utf8').trim();
}

function checkJava(blocks) {
  if (spawnSync('java', ['-version']).status !== 0) return null;
  const cp = javaClasspath();
  if (!cp) return null;
  const input = join(work, 'java.json'), output = join(work, 'java-results.json');
  writeFileSync(input, JSON.stringify(blocks));
  execFileSync('java', ['-cp', cp, join(here, 'snippets/JavaSnippetCheck.java'), input, output], { stdio: 'inherit' });
  return JSON.parse(readFileSync(output, 'utf8'));
}

// ---------------------------------------------------------------------------------------------
// Python + YAML (one interpreter)

const python = process.env.MATEU_SNIPPETS_PYTHON ?? 'python3';
function pythonReady() {
  return spawnSync(python, ['-c', 'import mateu_ui.uidl, mypy, jsonschema, yaml']).status === 0;
}

function checkWithPython(lang, extra = []) {
  return (blocks) => {
    if (!pythonReady()) return null;
    const input = join(work, `${lang}.json`), output = join(work, `${lang}-results.json`);
    writeFileSync(input, JSON.stringify(blocks));
    execFileSync(python, ['-W', 'ignore', join(here, 'snippets/check_python_yaml.py'), lang, input, output, ...extra], { stdio: 'inherit' });
    return JSON.parse(readFileSync(output, 'utf8'));
  };
}

run('java', checkJava);
run('csharp', (blocks) => checkCsharp(blocks, { repoRoot, work }));
run('python', checkWithPython('python'));
run('yaml', checkWithPython('yaml', [join(repoRoot, 'backend/shared/uidl/specs-schema.json')]));

console.log('\nDocumentation snippets');
console.table(summary);
if (missing.length && require) {
  console.error(`Toolchain missing for: ${missing.join(', ')} (--require).`);
  process.exit(1);
}
if (failed) {
  console.error(`${failed} snippet(s) do not match the API. Fix the sample (or the API), or — only for a deliberate sketch — mark the fence \`nocheck\`.`);
  process.exit(1);
}
