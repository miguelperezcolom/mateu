# Adding a web renderer: every place its name must go

Written while making `primer` a first-class renderer (2026-11-23), so the UI5 (`ui5`,
`io.mateu:mateu-ui5`) and SLDS (`slds`, `io.mateu:mateu-slds`) branches follow the same path. Each
line is a place the repo enumerates renderers today; a renderer missing from one of them fails a
gate, or silently behaves like Vaadin there. `<x>` = the renderer id, `mateu-<x>` its artifact.

## The React layer it builds on

- [ ] A React renderer (Primer, and next UI5 and SLDS) draws its design system over the shared,
      DS-free tree `frontend/web/react-renderer` (alias `@mr`: view hosting, boot, URL, shell
      behaviour, listing state, texts, resilience), itself over the React Native core (`@rn`). It is
      source, not a package: alias `@mr` in `vite.config.ts` + `tsconfig.json` `paths`/`include` +
      `server.fs.allow`, `resolve.dedupe` for `react`/`react-dom`/`dompurify`/`marked` (ONE React),
      `react-native`/`expo-*` aliased to `@mr/shims/*`, and its tests run by the app's `npm test`.
      See `frontend/web/react-renderer/README.md` and `apps/primer` for the reference wiring.
- [ ] The VIEWS are shared too (`frontend/web/react-renderer/views`, drawn with `@kit`): the app
      writes a KIT (`src/kit/index.ts` + `src/kit/icons.ts`, aliased `@kit` / `@kit/icons`) that
      exports every name in `views/kit-contract.json` with Primer React's props, defines the
      contract CSS tokens, adds the `viewOverrides` vite plugin, and puts a view that needs its
      design system's own STRUCTURE in `src/overrides/<path>` — never a copy of the views.
- [ ] `scripts/check-bundle-freshness.sh`: the app's block lists its own sources AND
      `frontend/web/react-renderer` plus the RN core folders it imports (`src/core`, `src/api`,
      `src/a11y`, …), as Primer's does. A CI job building the renderer from source needs nothing
      extra for `@mr` (imported by path).

## The jar and its gates

- [ ] `backend/shared/frontend/<x>/pom.xml` (artifactId `mateu-<x>`), listed in
      `backend/shared/frontend/pom.xml` `<modules>` and in `backend/mateu-bom/pom.xml`
      (`MateuBomCompletenessTest` fails otherwise). Assets ONCE, under `static/`.
- [ ] The app's `npm run copy` writes `static/_index.html` (the page contract: AQUIELTITULODELAPAGINA,
      AQUIFAVICON, AQUIJS/HASTAAQUIJS, AQUIUI/HASTAAQUIUI) and `static/assets/…` incl.
      `THIRD-PARTY-LICENSES.txt`.
- [ ] A file ONLY this renderer ships, its marker (Primer: `static/assets/mateu-primer.js`).
- [ ] `scripts/frontend-deps.mjs` (TARGET + BUNDLE), `scripts/check-frontend-licenses.mjs` (target,
      REVIEWED entries for anything outside the SPDX allowlist), `scripts/third-party-notices.mjs
      <x> --check` in `.github/workflows/run_tests.yml`.
- [ ] `scripts/check-bundle-freshness.sh`: the bundle against its sources (and any core it imports).
- [ ] `.github/workflows/buid-and-publish.yml`: the jar must carry `META-INF/LICENSE.txt`, `NOTICE`,
      `THIRD-PARTY-LICENSES.txt` and its entry script.
- [ ] Its own lockfile when it must not touch the monorepo's (`!apps/<x>` in the workspaces), and its
      install in the CI jobs that typecheck / test it.

## The renderer as a project setting

- [ ] `backend/shared/uidl/.../data/ProjectRenderer.java`: the enum constant (`<x>("mateu-<x>")`),
      then regenerate the schemas (`mvn -pl shared/uidl test -Dtest=UidlSchemaTest
      -Duidl.schema.write=true`) and re-copy `specs-schema.json` byte for byte to
      `backend/python/mateu_ui/core/authoring/resources/`, `frontend/app/intellij-plugin/src/main/resources/mateu/authoring/`
      and `frontend/mcp-server/resources/` (.NET links it).
- [ ] `ProjectSettings.java` comment; `backend/shared/core/.../infra/ProjectRendererCheck.java`: the
      marker constant and its branch in `servedBy` (BEFORE the `_index.html` fallback, which means
      Vaadin) + `ProjectRendererCheckTest`.
- [ ] `ClasspathAssets.java` comment; check the Quarkus asset paths (`MateuQuarkusRoutes.rendererAssets`)
      cover every top-level folder the renderer serves (Primer only uses `/assets`).
- [ ] `backend/mateu-bundle-maven-plugin`: `BundleWriter` picks the static app by
      `ProjectRendererCheck.servedBy` (nothing to add unless the renderer needs special copying);
      `BundleMojo` javadoc; decide whether `specsOnly` works (a renderer with no client-side expander
      must pre-render, like Redwood) + `BundleWriterTest`.
- [ ] .NET `src/Mateu.Core/ProjectRendererCheck.cs` (`Known`, the marker, `Served`) + `UiPage.cs` /
      `MateuExtensions.cs` texts + `ParityFeatureTests`.
- [ ] Python `mateu_ui/core/project_renderer.py` (`RENDERERS`, the marker, `served`) + `ui_page.py` /
      `fastapi/__init__.py` texts + `tests/test_parity_ga.py`, `tests/test_ui_serving.py` (served from
      the checked-in `static/`).

## Front doors

- [ ] `starters/generator/new-project.json`: `renderers[]` entry (label, artifactId), the runtimes /
      flavours offering it, `rendererOverlays`; `starters/generator/overlays/java/<x>/…/project.yaml`
      (`renderer: <x>`); a case in `starters/generator/cases.json` (both engines: VS Code
      `src/newProject.test.ts`, IntelliJ `MateuProjectGeneratorTest`).
- [ ] Archetype: `backend/mateu-archetype/pom.xml` (usage line + `<include>overlays/java/<x>/**`) and
      `archetype-metadata.xml` (`validationRegex`).
- [ ] IntelliJ `newfile/ProjectDescriptor.kt` (`Renderer` enum, `newText`), `Mateu Project.yaml.ft`,
      `mateu/new-file-kinds.json`; VS Code `src/projectDescriptor.ts` (`RendererId`, `RENDERERS`,
      `newDescriptor`), `package.json` `mateu.renderer` enum + enumDescriptions,
      `scripts/new-project.mjs` usage.
- [ ] The visual editor's canvas (`apps/visual-editor/src/canvas/canvasRenderer.ts`): an unknown
      renderer previews with Vaadin — say so in the docs until a canvas exists.

## Docs and AI

- [ ] `doc/src/content/docs/design-systems/<page>.md` + the sidebar in `doc/astro.config.mjs` + the
      tables in `design-systems/index.mdx`; `define/yaml/project-settings.md`, `visual-editor.mdx`,
      `deploy/static-ui.mdx`, `java-create-your-project/index.mdx`, `native/ide-tooling.md`
      (`npm run verify` in `doc/`).
- [ ] `ai/claude-plugin/mateu/skills/mateu-yaml/reference/other-kinds.md` (`renderer:` values).
- [ ] CLAUDE.md: the renderer list in the repository layout and the "Project settings" bullet.

## CI

- [ ] A `renderer-<x>` job in `run_tests.yml` (model: `renderer-primer` / `renderer-vb`): build the
      bundle FROM SOURCE, install the jar, build `e2e/sut/apps/mvc-app1` with
      `-Dmateu.renderer=mateu-<x> -Dsut.build.dir=target-<x>`, start it, run the renderer's
      conformance probe (`e2e/conformance-fixtures.json`), a11y probe, slow-network probe and
      sign-in probe.
- [ ] Sonar: a by-design duplicate (a per-language text table, probes repeating another renderer's
      scenarios) goes into `.sonarcloud.properties` `sonar.cpd.exclusions` with its reason.
