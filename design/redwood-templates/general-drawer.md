# Redwood «General drawer» — review against the guide (2026-10-23)

Source: the Redwood guide page of `oj-sp-general-drawer-template` (category *Layouts*, since 21D) and
the real `oj-sp` API extracted in `design/vb-page-template-apis.md` §2.8. Format as in
`design/redwood-advanced-create-edit-review.md`.

Working rule: in Redwood, **Spectra/VB rule** — their template/component/contract before an imitation
of ours; an imitation only when Mateu's content cannot meet their contract, and then it is said.

Legend: ✅ supported · 🟡 partial · ❌ missing · ➖ not applicable.

## 1. When it is used

A **read-only**, non-transactional side panel that tells more about one or several objects of the
page without leaving it (a work order next to a schedule, a product's details / similar products /
history next to an order). Never for transactions — that is the create-edit drawer. In Mateu: any
action returning a `Drawer` whose content is read-only (`Drawer.java:16`).

## 2. Regions (anatomy)

| # | Region | Guide | Mateu (model) | Redwood (renderer) | Status |
|---|---|---|---|---|---|
| 1 | Drawer information and actions | title, subtitle, prev/next object, maximize, close, avatar, header slot (tabs) | `headerTitle`, `subtitle`, `peerNav`, `maximizable`, `header` (`Drawer.java:18-28`) | hand-made header inside `oj-drawer-popup`: `h2` title + subtitle only (`main-start-page.html:19082-19093`) | 🟡 only title + subtitle reach the panel |
| 2 | Default slot | read-only content: form, charts, tables, lists, cards, hierarchy | `content` (any component) | content atoms + fields of the overlay projection (`poc/core/tree.mjs:392-473`) | ✅ |
| — | The template itself | `oj-sp-general-drawer-template` in a popup or layout drawer | — | **not used**: plain `oj-drawer-popup edge="end" modality="modal"` (`main-start-page.html:19082`); `oj-sp-*-drawer-template` only appears in a11y selectors (`poc/a11y.mjs:311`) | 🟡 imitation, undeclared |

## 3. Responsive behaviour

| Breakpoint | Guide | Mateu | Status |
|---|---|---|---|
| Large | opens over the parent page at its size | Vaadin: `size`/`width`, capped at 92vw (`mateu-drawer.ts:60-62`); Redwood: `width` or 26rem, capped at 90vw (`main-start-page.html:19087-19089`) | ✅ |
| Small | takes the whole window | neither renderer switches to full window — the panel keeps its width up to the 90–92vw cap | ❌ |
| Small header with > 3 actions | maximize/close move to an overflow menu | no overflow menu | ❌ (minor) |
| Long title/subtitle | wrap to 2 lines, truncate, tooltip | plain wrapping, no clamp/tooltip | 🟡 |

## 4. Configuration

| Element | Guide | Mateu | Vaadin | Redwood | Status |
|---|---|---|---|---|---|
| Size S/M/L/XL (464 / 648 / 968 / 90%) | required choice | `DrawerSize` (`DrawerSize.java:59`), `width` overrides | ✅ | ❌ `size` reaches the context (`reducer.mjs:160`) but the projection drops it (`tree.mjs:451-461`); width = `width` or 26rem | 🟡 |
| Maximize (next size up, not on XL) | optional | `maximizable` | ✅ steps up, no way back (`mateu-drawer.ts:77-80, 289`) | ❌ not projected, no button | 🟡 |
| Title | required (popup) | `headerTitle` | ✅ | ✅ `h2` | ✅ |
| Subtitle | optional | `subtitle` | ✅ | ✅ | ✅ |
| Close action (on/off/disabled) | required | ✕ / Esc / backdrop, always on | ✅ ✕ (`mateu-drawer.ts:291`) | 🟡 **no close button**: Esc / outside click only (`main-start-page.html:19082-19093`); `mateuDrawerDismissed.js` | 🟡 |
| Next/previous object (on/off/disabled) | optional | `peerNav` → `PeerNav` (`PeerNav.java:13`); a null route disables a side | ✅ (`mateu-drawer.ts:242, 278-282`) | ❌ not projected | 🟡 |
| Header slot (tabs, ≤ 6) | optional | `header` component (e.g. a `TabLayout`) | ✅ in the header row | ❌ no header slot in the panel; tabs inside `content` work as content tabs | 🟡 |
| Avatar | optional | — (no `avatar` on `Drawer`) | ❌ | ❌ | ❌ |
| Popup vs layout container | choice | `modeless` (no backdrop) / `layout` (push content) (`Drawer.java:30-37`) | ✅ | ❌ always modal popup | 🟡 |
| Start / end position | choice | `DrawerPosition.start/end` | ✅ | ❌ `edge="end"` hard-coded | 🟡 |
| Go to parent | optional (API) | — | ❌ | ❌ | ❌ |
| Primary / secondary actions (API) | optional | buttons in `content`/`footer` | ✅ footer | ✅ parameterless buttons move to the footer bar (`tree.mjs:409, 431`, `main-start-page.html:21140`) | ✅ |

## 5. Findings

1. **The Redwood drawer ignores most of the `Drawer` record**: `size`, `maximizable`, `peerNav`,
   `position`, `modeless`, `layout` and `header` are on the wire (`DrawerMapper.java:55-72`) but
   `overlayProjectionOf` (`tree.mjs:451-473`) projects only id/title/subtitle/position/width/content/
   fields/actions, and the panel binds neither `edge` nor `modality`. The doc's coverage table claimed
   ✅ — corrected.
2. **No close icon** in the Redwood panel — the guide makes it required.
3. Spectra's `oj-sp-general-drawer-template` (title, subtitle, size, maximize, prev/next, close,
   header slot, default slot) is in the pack and its contract fits the `Drawer` record almost 1:1;
   using it inside the `oj-drawer-popup` would close findings 1–2 at once.
4. Small-screen full-window rule: missing in every web renderer.
5. Avatar in the header: not modelled.

## 6. Proposed plan

1. Redwood: paint `Drawer` with `oj-sp-general-drawer-template` inside `oj-drawer-popup` (or
   `oj-drawer-layout` when `layout`), binding `drawer-size`, `display-options.maximize`,
   `next-item`/`previous-item` (→ `PeerNav`), close; bind `edge` from `position`, `modality` from
   `modeless`.
2. Small screens: full window below the `sm` breakpoint (Vaadin + Redwood).
3. Optional `Drawer.avatar` (reuse `PageDto.avatar`'s shape).

## 7. Status — Spectra adopted (2026-10-24)

The Redwood renderer now paints a read-only `Drawer` with **`oj-sp-general-drawer-template`** inside
the `oj-drawer-popup` (projection `tree.mjs spectraDrawerOf`, markup `#mateuDrawerPanel`, shared body
`poc/templates/drawer-body.html`). Closed: findings 1–3 — `drawer-size` (DrawerSize, or the nearest
size to `width`), `display-options.maximize` (written back through `drawerState`), `previous-item` /
`next-item` from `PeerNav` (a side without a route disabled; a click closes the drawer and navigates),
the required close icon (`close-action`, `spClose`), `edge` from `position` (start/end/bottom) and
`modality` from `modeless`/`layout`; the small-screen full-window rule comes with the template.
Footer: the primary (call-to-action, else the last) + up to two `secondaryActions` (deprecated in
Spectra 2210 but still drawn); more than three keep our own bar in the slot.
Still open: the `header` slot (tabs), `layout` reflow (Redwood draws it as a modeless popup), avatar.
