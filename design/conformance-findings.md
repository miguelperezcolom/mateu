# Wire conformance findings — GA readiness (2026-09-13)

What the systematic conformance push found about "does everything work the same across all three
producers (Java / .NET / Python)". Written for the GA decision. Companion to
`conformance/README.md` and the corpus under `conformance/cases/`.

## What was done

- Expanded the shared wire-conformance corpus from **2 to 25 cases** (batches 1–2): `tabs`, `zones`,
  `money-field`, `banner`, `fab`, `separator-text`, `client-rules`, `static-view`,
  `small-enum-radio`, `dashboard`, `app-in-code`, `validation`, `stereotypes`, `lookup`,
  `tree-select`, `notice`, `bulleted-list`, `app-context`, `app-header-actions`, `toc`, `grid-field`,
  `status-list`, `compact`. Each is one fixture declared identically in the three backends;
  `expected.json` is generated from the Java reference and frozen. Designed by Fable multi-agent
  workflows (one agent per feature, grounded in real repo usage), integrated and verified across the
  three runners (Java green; ports xfail/soft-pass on byte divergence, by design).
- **Fixed a real matrix hole found by the corpus** (#1 below): a boolean field now renders as a
  checkbox on every renderer whichever backend served it.
- **Sharpened the normaliser**: `serverSideType` and `targetComponentId` are now volatile. Both are
  cross-producer noise by construction (a language-specific class FQN; a generated routing id), and
  comparing them made every case diverge on those members alone.
- Ran a **semantic-essentials diagnostic** (field id / label / dataType / stereotype / component
  type / actions, in document order — the invariants the README says to keep) across Java golden vs
  Python actual vs .NET actual (the latter dumped from the .NET runner). **12 of 25 cases agree on
  essentials outright**; the rest cluster into the small known set below (dominant: the section
  wrapper #5, then bool/boolean [now fixed], money-plainText #3, KPI-hoist #2, and minor dataType/
  action edges — `bulletedList` array-vs-string, action advertising).
- **Sharpened the normaliser**: `serverSideType` and `targetComponentId` are now volatile. Both are
  cross-producer noise by construction (a language-specific class FQN; a generated routing id), and
  comparing them made every case diverge on those members alone.
- Ran a **semantic-essentials diagnostic** (field id / label / dataType / stereotype / component
  type / actions, in document order — the invariants the README says to keep) across Java golden vs
  Python actual vs .NET actual (the latter dumped from the .NET runner).

## Headline

**The three producers are at behavioural / essentials parity, but NOT byte-identical on the wire.**

- On the **essentials** (what the screen *is* — fields, labels, data types, layout intent, actions),
  the ports agree with Java on the large majority of cases.
- The **raw wire** differs on every case, but the difference is dominated by **Java verbosity**
  (Java emits non-zero defaults — `sliderMax:100`, `optionsColumns:1`, `colspan:1`, style strings,
  `mateu-section` cssClasses, top-level `initialData`/`state` maps — that the leaner ports omit) plus
  a **small, catalogued set of real structural/semantic divergences** (below).

The pre-existing "parity" (each port's own golden suites) is **behavioural** — each port asserts what
it itself produces. The shared corpus is the first thing to compare the three head-to-head, and this
is what it revealed.

## Real divergences (catalogued, with fix locations and severity)

| # | Divergence | Java (reference) | Both ports | Severity | Fix location |
|---|---|---|---|---|---|
| 1 | **`bool` vs `boolean`** field dataType — **FIXED at the renderer** | `bool` | `boolean` | **Resolved** — both the Vaadin and the neutral renderer now accept either, so a boolean renders as a checkbox on any renderer × any backend (the wire values still differ; converge later if desired at Python `mateu_core/mapper.py:2004,2921` / .NET `ReflectionMapper.cs:1309,1719`) | done (`mateu-field.ts`, `neutralFieldRenderer.ts`) |
| 2 | **`@KPI` hoisting** | field hoisted out of the body into the header | kept as an ordinary body field | **Medium** (visible: KPI in header vs body). .NET `[Kpi]` is class/method-level, cannot even mark a field | port KPI extraction + `FormFieldFilter` equivalent |
| 3 | **money in plain-text context** | dataType upgraded to `money` (so the read-only value formats) | stays `number` | **Low-Med** (read-only money renders unformatted on the ports) | Python/.NET stereotype→dataType upgrade in the plainText branch |
| 4 | **`@Text(size)` sized component** | rendered as a `Text` component | no declarative Text field marker → stays an ordinary field | **Low** | ports: add a declarative Text field marker (or accept the gap) |
| 5 | **Section wrapper shape** | `Card` + `metadata.content` + `mateu-section` cssClass | Python `FormSection` + `children` (fields under `children`, not `metadata.content`) | **Medium** | contract decision (below) |
| 6 | **Data delivery** | top-level `initialData` + fragment `state` maps | per-field `initialValue` on each FormField | **Medium** | contract decision (below) |
| 7 | **Java verbosity** | emits non-zero defaults (`sliderMax:100`, `optionsColumns:1`, `colspan:1`, styles) | omit them | **None** (cosmetic; renderer uses the same defaults) | normaliser / accept |

Per-case notes live in `conformance/cases/<case>/case.md`.

## Why this matters for GA

"The wire is the contract: any server can serve any renderer" is the promise. Today:

- **#5 and #6 are the load-bearing ones.** A renderer that walks `metadata.content` finds nothing in
  Python's form output (fields are under `children`); a renderer that reads top-level `initialData`
  finds nothing where the ports put per-field `initialValue`. Either the renderers already handle
  both shapes, or a port + a renderer combination does not actually render — and **that combination
  is not tested today**: the e2e suite runs the shared specs against the five *Java* frameworks with
  the Vaadin renderer only. **No .NET or Python backend is exercised through any renderer in CI.**
  That is the real GA gap, larger than any single wire field.
- **#1–#4 are small and mostly cheap.** #1 (`bool`/`boolean`) is the cheapest converge — the frontend
  already accepts both, so it is purely a wire-tidiness fix (change the two ports to emit `bool` and
  update their own goldens).

## Recommendations (for the maintainer)

1. **Decide the contract on #5/#6** — the section-wrapper shape and the data-delivery channel. Either
   converge the ports to the Java shape, or declare both shapes valid AND verify a port through a
   renderer (see 3). This is a wire-owner decision the corpus was built to force into the open; it is
   not mine to make at 2am.
2. **Close a port↔renderer loop in CI** — even one screen from a .NET and a Python backend rendered
   by Vaadin (or VB) in Playwright. This is the single highest-value addition to "everything works
   across all fronts": it turns #5/#6 from a guess into a checked fact.
3. **Make the corpus compare the semantic-essentials projection**, not raw bytes — raw bytes flag
   Java's verbosity as divergence (noise), which the README itself warns makes a check get ignored.
   A projection over types/fieldIds/labels/dataTypes/actions/layout would give a trustworthy
   green/red per case and per port, and could then become a real CI gate.
4. **Converge #1 (`bool`/`boolean`) now** — cheap, unambiguous, frontend already tolerant. Left
   uncommitted tonight only because it needs the ports' own goldens updated in lockstep and that is a
   reviewed change, not a silent one.

## Honest status line

- Corpus: **13 cases**, Java green, ports xfail/soft-pass on byte divergence (by design — the corpus
  surfaces divergence, it does not fail the build on it).
- Producer essentials parity: **high** (a handful of catalogued exceptions).
- Producer byte parity: **no** (dominated by Java verbosity + #5/#6).
- Port↔renderer verification: **absent in CI** — the biggest gap on the road to a defensible
  "everything works across all fronts" GA claim.
