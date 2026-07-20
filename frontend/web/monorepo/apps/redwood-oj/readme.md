for adding a new oj component, you need to touch:

- demo-card.js
- public/main.js
- public/jet-composites/demo-card/loader.js

## Offline skin (no CDN)

The renderer runs fully offline: the Redwood base skin is already vendored under
`public/styles/redwood/19.0.0` + `oj-redwood-min.css`. The remaining `static.oracle.com` `<link>`s
were removed and replaced with a local subset under `public/styles/oracle-fnd/`:

- `OracleFont/` — the Latin OracleSans variable woff2 (the multilingual Noto `@font-face` rules stay
  in `OracleFont.min.css` but are only fetched if CJK/Arabic/Hebrew glyphs are actually rendered).
- `images/iconfont/` — the `ojuxIconFont_*.woff2` glyph font behind `oj-ux-ico-*` (also used by the
  Spectra shell). The decorative gallery PNGs referenced by `ojuxIconFont.min.css` are not vendored
  and degrade gracefully.

## Spectra Shell page templates

`public/oj-sp/oj-sp-component-bundle.css` is the Oracle **Spectra Shell** stylesheet (vendored from a
Visual Builder Redwood preview), loaded in `index.html`. It styles the `oj-sp-*` classes emitted by
the Spectra-based page templates. First one: **`mateu-redwood-foldout`** (`src/components/`), the
redwood-oj override for `ComponentMetadataType.FoldoutLayout` — it emits the
`oj-sp-foldout-layout` / `oj-sp-header-navigation` / `oj-sp-foldout-panel` light-DOM driven by
mateu's UIDL (`FoldoutLayout` metadata + children slotted `overview` / `panel-N`), replacing the
design-system-neutral `mateu-foldout` for this renderer. See `design/redwood-page-templates-plan.md`.
