# Mateu documentation site

The source of [mateu.io](https://mateu.io): an [Astro](https://astro.build) +
[Starlight](https://starlight.astro.build) site.

## Layout

```
doc/
├── astro.config.mjs        ← site config + the SIDEBAR (a new page is not reachable until it is listed here)
├── src/content/docs/       ← the pages (.md / .mdx); the path is the URL slug
├── src/plugins/            ← remark-mateu-version.mjs: replaces MATEU_VERSION in snippets
├── public/                 ← served as-is: images (public/images/docs/<topic>/…), llms.txt, mateu-ai-*.md
└── scripts/check-links.mjs ← fails on any internal link or image that does not resolve in dist/
```

## Commands (Node 22+)

| Command                | What it does                                                   |
| :--------------------- | :------------------------------------------------------------- |
| `npm ci`               | install the locked dependencies                                |
| `npm run dev`          | dev server at `http://localhost:4321`                          |
| `npm run build`        | build the static site into `dist/`                             |
| `npm run check-links`  | check every internal link and image in `dist/` (run after build) |
| `npm run verify`       | build + check-links — what CI runs on every PR touching `doc/` |

## Conventions

- **The version in snippets**: write `MATEU_VERSION`, never a literal version. The plugin resolves it
  from `$MATEU_VERSION`, else Maven Central's latest release of `io.mateu:mateu-mvc`, else the newest
  `v*` git tag — and fails the build if none answers.
- **Links between pages** are absolute slugs with a trailing slash: `[forms](/java-ui-definition/forms/)`.
  A relative `./sibling` from a non-index page resolves *under* the current page and 404s.
- **Screenshots** are generated, not hand-made — see "Generating Documentation Screenshots" in the
  repository's `CLAUDE.md` (`e2e/screenshot.mjs` against the SUT app). Store them under
  `public/images/docs/<topic>/<name>.png` and reference them as `/images/docs/<topic>/<name>.png`.
- **Public pages only**: internal design notes live in `/design` at the repository root, not here,
  and pages should not link to them or to commit hashes.

## Publishing

`.github/workflows/docs.yml` builds the site on every PR that touches `doc/` (failing on build errors
and broken internal links) and deploys it to Netlify on every push to `master` and every release.
