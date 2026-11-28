# The shared half of Mateu's React renderers

Mateu's React renderers — **Primer** (`apps/primer`) and, next, **SAP** (UI5 Web Components) and
**Salesforce** (SLDS) — all run on the React Native renderer's platform-free core
(`frontend/app/react-native/src`, alias `@rn`). Between that core and a design system there is a
second layer every one of them needs and none should copy: hosting a view, the boot, the URL, the
shell's behaviour, the listings' state, texts, resilience. It lives here, alias **`@mr`**.

Nothing here imports a design system. The shared **views** (`views/`) draw every screen with an
abstract **kit** (`@kit`, `@kit/icons`) that each renderer app aliases to its design system; a
renderer only adds its kit, a few app files and, where its design system needs a different
STRUCTURE, an override of a view.

## How a renderer app uses it

It is source, not a package: no `package.json`, no install. The consuming app

- aliases `@mr` to this folder in its `vite.config.ts` and its `tsconfig.json` `paths`, and adds it
  to `include` and to `server.fs.allow`;
- resolves this tree's bare imports from ITS OWN install: `resolve.dedupe: ['react', 'react-dom',
  'dompurify', 'marked']` in vite, `paths` for `react`, `react/*`, `react-dom`, `dompurify`, `marked`
  in tsconfig — so there is ONE React;
- aliases `react-native`, `expo-web-browser`, `expo-file-system` to `@mr/shims/*` (the two RN core
  modules that import them get web versions);
- lists `frontend/web/react-renderer` among its sources in `scripts/check-bundle-freshness.sh`;
- runs this tree's tests with its own (`node --test "src/**/*.test.ts"
  "../../../react-renderer/**/*.test.ts"` — Primer's `npm test`, run by CI's frontend-lib job).

- aliases `@kit` / `@kit/icons` to its kit (`src/kit/index.ts`, `src/kit/icons.ts`) in vite and in
  tsconfig `paths`, and adds the override plugin
  (`viewOverrides({ views: <this>/views, overrides: overridesOf(appDir) })` from `vite/overrides.ts`)
  BEFORE `react()`; `vite/` and `scripts/` stay out of the app's tsconfig `include`;
- draws its root as `<MateuApp baseUrl bundle accentCss />` (`views/shell/MateuApp.tsx`) inside its
  own theme provider, with `RendererKitProvider value={{ ViewBody, PresenceChip }}` from the views.

See `apps/primer` for the reference wiring.

## The views and the kit

`views/` mirrors what a renderer draws: `render/` (components, fields, listings, page, catalogue)
and `shell/` (app shell, header, global layer, overlays, toasts, resilience, sign-in chooser). They
were Primer's views, and Primer's kit is Primer React itself (`apps/primer/src/kit`: `export * from
'@primer/react'` + the experimental components) — so the kit API IS Primer React's: the same
component names and the props the views pass. Another renderer implements those names in its design
system (SLDS blueprints, UI5 web components).

**The kit contract** — every name the views import, kept in `views/kit-contract.json` (written by
`node scripts/write-kit-contract.ts`; `scripts/kitContract.test.ts` fails when it is stale). Each
app's typecheck of the shared views against ITS kit is the full check (names and props).

- `@kit` (48): `ActionList`, `ActionMenu`, `AnchoredOverlay`, `Avatar`, `Banner`, `BaseStyles`, `Blankslate`, `Breadcrumbs`, `Button`, `ButtonGroup`, `Checkbox`, `CheckboxGroup`, `CounterLabel`, `DataTable`, `Dialog`, `Flash`, `FormControl`, `Heading`, `IconButton`, `Label`, `Link`, `NavList`, `PageHeader`, `PageLayout`, `ProgressBar`, `Radio`, `RadioGroup`, `SegmentedControl`, `Select`, `SelectPanel`, `SelectPanelItemInput`, `SkeletonText`, `Spinner`, `Stack`, `Table`, `Text`, `TextInput`, `Textarea`, `ThemeProvider`, `Timeline`, `ToggleSwitch`, `Token`, `Tooltip`, `TreeView`, `UnderlineNav`, `UnderlinePanels`, `VisuallyHidden`, `useConfirm`
- `@kit/icons` (141 Octicon-named icons, `<Name>Icon`): the list in `views/kit-contract.json`. A kit
  maps each to its design system's icon (or draws nothing), keeping the name.

**Contract tokens** — the views' stylesheets are written in Primer's primitives' CSS custom
properties (`--fgColor-*`, `--bgColor-*`, `--borderColor-*`, `--borderWidth-*`, `--borderRadius-*`,
`--base-size-*`, `--stack-gap-*`, `--text-*`, `--fontStack-*`, `--shadow-*`). **A kit must define
the contract tokens**: Primer's primitives already are them; another renderer maps them onto its
design system's own hooks in its stylesheet (the SLDS app does it onto `--slds-g-*`).

**Overrides** — where a design system needs its own STRUCTURE (a Fiori floorplan, SLDS's global
header), the app puts `src/overrides/<path below views/>`; the vite plugin hands it to every import
of that view. An override exports at least the names of the view it replaces
(`scripts/overrides.test.ts` checks every app); it imports shared code through `@mr/views/…`, and a
relative import from it resolves from the original's place. Prefer a kit component to an override,
and an override to a fork of the views: an override is a second copy of one file, kept in step by
hand.

Two shared modules exist only to keep overrides small: `render/fields/native.tsx` (`NATIVE_RULES`,
empty here — a renderer's own field controls, tried before the generic select and text input: the
SAP renderer's date pickers, step input and combo box) and `render/AccordionPanel.tsx` (one
expandable panel — the SAP renderer's `ui5-panel`). When a design system needs ONE control of a
large view, extract that control into its own shared module and override the module, not the view.
A custom component is registered on `window.MateuRenderer` (also `window.MateuPrimer`, and the name a renderer gives it with `installCustomComponentGlobal` — `window.MateuSlds`).

## The contract

**At the root**

```tsx
installAnnouncer()                                    // @mr/shims/react-native: the live regions, first
setRendererName('ui5')                                // @rn/core/buildSkew: X-Mateu-Renderer
const baseUrl = baseUrlOfPage(document, 'mateu-ui5') // @mr/shell/pageConfig: the mount
await signInFirst(baseUrl)                            // @mr/shell/signIn: the page's built-in sign-in, if any
const bundle = await openPageBundle(bundleUrlOfPage(document)) // @mr/shell/staticBundle
registerTexts(UI5_TEXTS)                              // @mr/i18n/texts: the words only this DS needs

<RendererKitProvider value={{ ViewBody, PresenceChip }}>  {/* @mr/render/RendererKit */}
  <MyApp baseUrl={baseUrl} bundle={bundle} />
</RendererKitProvider>
```

**The app component** calls `useMateuApp({ baseUrl, bundle, confirm, accentCss })`
(`@mr/shell/useMateuApp`) and draws what it returns:

- `confirm(request)` — the DS's confirmation dialog, resolving true/false (neutral words in, a
  Promise out); `accentCss(color)` — the CSS that puts `@App(accentColor)` on the DS's accent hooks;
- `boot` (`loading` / `failure` / `app`), `content` and `preview` → a `ViewHost` per screen
  (`@mr/render/ViewHost`: give it `key={app.contentKey}`, `session={app.screenSession}`,
  `onController={app.onScreenController}`, `onNavigate={app.go}`);
- `toasts` (`ToastsState`: draw them with `useToastLifetime` from `@mr/shell/toasts`) and
  `overlays` (`OverlaysState` from `@mr/shell/overlays`: one dialog/drawer layer per entry, its
  content a `ViewHost` with `serverSideNode` + `opener`);
- `navigate` for the menu (asks about unsaved changes), `retryBoot`, `showPreview`.
- The skip link targets `#mateu-main` (`focusMain`); the content region must carry that id.

**The views it must draw** (the RendererKit, plus what its app component composes):

| View | Its behaviour, from here |
|---|---|
| `ViewBody` (kit) — loading, failure, the component tree of one view | `ViewHost` owns the controller; `RenderedView` from `@rn/core/MateuViewController` |
| `PresenceChip` (kit, optional) | `usePresence(controller)` — `@mr/shell/live` |
| App shell: header, menu in every variant | `menuLayoutOf`, `useMediaQuery(NARROW_SHELL)` (`shell/layout`), `useMenuActivation`, `holdsCurrent`, `firstLeaf`, `filterMenu` (`shell/menu`), `useLiveUpdates`, `useHeaderValues` (`shell/live`) |
| @AppContext pickers | `useAppContextSelectors`, `useAppContextPicker`, `useAppContextSearch` (`shell/appContext`) |
| Header actions, app-level answers | `runAndApply`, `runAppLevel`, `applyAppAnswer` (`shell/appLevel`, `shell/appActions`) |
| Notification bell | `useInbox`, `INBOX_FILTERS` (`shell/inbox`); OS notifications `shell/osNotifications` |
| Theme toggle | `useColorScheme` (`shell/colorScheme`) — hand `choice` to the DS's theme |
| Connect AI / agent strip | `useAgentChannel(session, app, rendererName)`, `useAgentStatus` (`shell/agentPush`) |
| Global layer: palette, help, FABs, assistant | `useGlobalLayer` (`shell/globalLayer`), `usePalette` + `flattenMenu` (`shell/palette`), `useAssistant` + `answerHtml` (`shell/assistant`, lazy-load the view), `useIdleSession` (`shell/idle`), access keys `addAccessKeyCandidates` for custom-element buttons (`shell/accessKeys`) |
| Resilience | `usePressedControls`, `useBusyIndicator`, `useConnectivityStatus` (`resilience/useResilience`) |
| Listings | `useListing` (`listing/useListing`): search, filters, URL contract (`listing/listingUrl`), REST sources, paging, sort; rows helpers `listing/rows` |
| Page | `sectionsOf` / `showsToc` / `tocShortcutIndex` (`page/toc`), `pageWidthOf` (`page/pageWidth`) |
| Catalogue | `CatalogueProps` / `Catalogue` and the wire readers (`render/wire`: `str`, `list`, `metaOf`, `childrenOf`, `safeHref`, `useRun`, `useOpenRoute`…), `styleOf`, `Markdown` / `SafeHtml`, `Embedded` (MicroFrontend, Element), `useButtonPress`, `usePending` |

## Texts

`tx(key)` (`@mr/i18n/texts`) is a shared word: `rendererTexts.ts` (the React renderers' own
chrome) first, else the web catalogue (`libs/mateu` `chromeTexts.ts`), in the page's language
(en/es/fr/de/pt/it, the web's rule). Typed: a misspelt key fails the typecheck. A word only ONE
design system needs goes in that app's table — `registerTexts({ en, es, fr, de, pt, it })` at boot,
read with `appText(key)` (wrap it with the app's own key type). Add a completeness test like
`i18n/texts.test.ts` for the app's table. A new shared word goes in `rendererTexts.ts`, in all six.

## Rules

- **No design system here**: no `@primer/*`, `@ui5/*`, `@salesforce-ux/*`, no app's source; the
  views draw through `@kit` only and import only their own stylesheets (no stylesheet outside
  `views/`, never a package's) — `boundary.test.ts` fails on any. A hook takes what is DS-specific
  as a parameter (`confirm`, `accentCss`, the renderer name).
- **No hard-coded chrome text**: Primer's `texts.lint.test.ts` lints this tree too.
- **The RN core decides**; this tree only adapts it to the browser and React. A rule that belongs to
  every renderer (native included) goes in the core, with its test.
- A file here is DS-neutral or it does not belong here: a hook outside `views/`, a view written
  against the kit inside it. What only one design system can do is that app's kit or override.

## The tooling every renderer app shares

One copy each, an app only names itself:

- `vite/rendererConfig.ts` — the whole vite configuration (aliases `@rn` `@mr` `@kit` `@app`
  `@infra`, the shims, the view overrides, the dev proxy to `MATEU_BACKEND`, the build's
  `assets/mateu-<name>*` names and relative chunk urls). An app's `vite.config.ts` is
  `defineConfig(rendererConfig({ appDir: import.meta.dirname, name, port, react: react(), kit }))`.
- `scripts/package-renderer.mjs <name>` — an app's `npm run copy`: typecheck, build, the
  third-party notices, `_index.html`, into `backend/shared/frontend/<name>/src/main/resources/static`.
- `scripts/chromeLint.ts` — the chrome-text lint; an app's `src/i18n/texts.lint.test.ts` calls
  `chromeTextsLint({ appSrc, protocolWords })` (protocolWords: its design system's enumerated
  property values, which are not chrome).

## Seams a design system overrides

Where Primer, Fiori and SLDS draw the same thing differently, the shared view keeps the logic and the
drawing is its own small file — override that file, never the whole view:
`page/PageHeaderMarkup.tsx` (the header, from `HeaderParts`), `page/PageTocAside.tsx`
(+ `TOC_IN_HEADER`), `ListingFrame` / `ListingToolbar` (+ the shared `ListingSearch`) /
`ListingTable` / `ListingPager`, `Box` (cards), `AccordionPanel`, `fields/FieldLabel`,
`fields/ChoiceAnchor`, `fields/native.tsx` (`NATIVE_RULES`: a design system's own field controls),
`fields/MultiSelect`, `fields/valueControls`, `catalogue/status/{StepsTrack,MetricCard,Directory}`,
`catalogue/display/{Breadcrumbs,Timeline,MessageList}`, `shell/bootViews.tsx` (confirm dialog, boot
failure / wait, the page without a shell), `shell/header/BellButton.tsx`, and the whole
`shell/AppShell.tsx` over `useAppShell` + `ShellBand` (`shell/appShellState.tsx`).
