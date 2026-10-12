# Road to beta/GA — status and how to resume

This file is the hand-off point: any session (local, at work, or a cloud session on claude.ai/code) can
continue the work from here. **Update it at the end of every block of work.** Last update: 2026-10-12 evening.

## Owner rules (Miguel)
- Mateu ships **UI only**; a non-UI concern is at most an interface the app implements (no DB, no PDF engine, no
  auth — the framework principal or a `PrincipalResolver`). MCP endpoint, Figma pipeline and the openapi/server
  generator stay.
- **Everything supported everywhere**: Java/YAML/editor/.NET/Python × Vaadin/Redwood/React Native/IntelliJ ×
  served/static. A gap that should work is a bug.
- **Stay on alphas** (`v3.0-alpha.N`) until the pre-beta review WITH Miguel. Releases: `gh release create
  v3.0-alpha.N --target master --title "Mateu v3.0-alpha.N" --notes-file <notes>`; CI publishes Maven Central,
  PyPI (`mateu-ui`) and NuGet (`Mateu.*`, Trusted Publishing; workflow file is `buid-and-publish.yml`, typo kept).
- The main session may merge PRs, cut releases and change GitHub settings; sub-agents never push or touch GitHub.
- Read-only for us: `opera-pms-challenge` (never read `evaluacion/`), `ec-demo1`, EventConductor. The Oracle OPERA
  user guide is confidential: never quote it. Never quote Oracle documentation. No secrets/IPs/account ids in the
  repo or docs.
- Communication with Miguel in Spanish; repo content in English.

## The plan (agreed 2026-10-12)
1. ~~Close the blockers~~ ✅ · ~~UX review~~ ✅ (no real-user tests: it's all on us)
2. **Exhaustive walkthrough** ← IN PROGRESS. A matrix feature × authoring × renderer × serving, walked with real
   interaction; every cell → fix at the root + a permanent test. Brief: [`walkthrough-brief.md`](walkthrough-brief.md).
   Seven areas, one branch each (from master):
   | area | branch | port block |
   |---|---|---|
   | app shell & navigation | `walkthrough/app-shell` | 18100–18199 |
   | forms, fields, layouts, wizards | `walkthrough/forms` | 18200–18299 |
   | listings & CRUD | `walkthrough/listings` | 18300–18399 |
   | page archetypes & display components | `walkthrough/pages` | 18400–18499 |
   | actions, events, overlays | `walkthrough/actions` | 18500–18599 |
   | YAML authoring, data, tooling (wizards, editor, bundle, openapi) | `walkthrough/authoring` | 18600–18699 |
   | native renderers (RN, IntelliJ) + .NET/Python as servers | `walkthrough/native-ports` | 18700–18799 |
   Each delivers `design/walkthrough/<area>.md` (✅ / 🔧 fixed / ❌ needs owner / N/A per cell). Branches are pushed
   to origin periodically as WIP; **to resume an area, check out its branch, read its matrix file and continue the
   cells not marked yet** (same brief).
3. **Coverage** — measured in [`../coverage/coverage-map.md`](../coverage/coverage-map.md) (PR #800): 8 streams
   S1–S8 with target floors. Launch AFTER the walkthrough is integrated (its tests change the numbers).
4. **Refactor/optimization** backed by those tests.
5. **Pre-beta review with Miguel** (page: https://claude.ai/artifact/LwGdbZQ2QSRVbj71EAJwVE — update it first),
   then beta, then GA.

## Integration practice
Branch protection needs up-to-date PRs, so green PRs are merged in **integration batches**: a branch
`integration/batch-N` from master, merge the PR heads; if the only conflicts are generated bundles, take either
side and rebuild everything once (Redwood: `npx -y npm@11 ci --workspace mateu-redwood --ignore-scripts`, then in
apps/redwood `npm run bridge && npm test && npm run build && npm run copy`; then `npx -y npm@11 ci --workspace mateu
--workspace mateu-visual-editor --workspace mateu-vaadin --include-workspace-root --ignore-scripts` and `npm run copy`
in apps/visual-editor and apps/vaadin), check `bash scripts/check-bundle-freshness.sh` and
`node scripts/check-design-tokens.mjs`, open one PR, merge it when green (SonarCloud is not required). Merging the
batch closes the included PRs. Agent worktrees live under `.claude/worktrees/` — remove them once pushed (they slow
IntelliJ down; `.claude` is excluded in Miguel's IDE).

## State at last update
- Latest release: **v3.0-alpha.414** (lambda `Button`s advertised again; YAML card menus; demo index page).
- Open PRs: #800 (coverage map, docs only).
- Demos: `swapi.mateu.io` (root → Swagger UI) and `demo.mateu.io` — redeploy of `demo-vaadin-webflux` on alpha.414
  (index page + counter fix) pending; ops in [`../../deploy/demos/README.md`](../../deploy/demos/README.md)
  (needs the owner's machine: kube context, Docker Hub, Netlify).
- Owner-side pending: mobile store accounts (Apple Team ID, App Store app id, Android SHA-256, upload credentials,
  privacy policy URL); GitGuardian incident to mark as test credential.
- Known follow-ups not yet scheduled: flaky .NET `ActionCatalogueTests`; RN module-wide registries should be
  per-session; Java manifest settings only from system properties/env; Redwood federation doesn't know static remotes
  or remote custom elements; console registry (`design/control-plane-and-newsletter.md`) queued.

## What needs Miguel's machine vs what can run anywhere
- **Anywhere** (a cloud session on claude.ai/code with this repo): the walkthrough, coverage, refactor, docs,
  integration batches, releases (`gh`), anything in this repo.
- **Only the owner's machine**: redeploying the demos (cluster context, Docker Hub push, Netlify DNS), the IntelliJ
  sandbox for manual testing, emails, the `frontend-public-reference` repo.
