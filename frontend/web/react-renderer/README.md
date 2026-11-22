# The shared half of Mateu's React renderers

Mateu's React renderers — **Primer** (`apps/primer`) and, next, **SAP** (UI5 Web Components) and
**Salesforce** (SLDS) — all run on the React Native renderer's platform-free core
(`frontend/app/react-native/src`, alias `@rn`). Between that core and a design system there is a
second layer every one of them needs and none should copy: hosting a view, the boot, the URL, the
shell's behaviour, the listings' state, texts, resilience. It lives here, alias **`@mr`**.

Nothing here draws a design system. A renderer app supplies the looks; this tree supplies what
those looks do.

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

See `apps/primer` for the reference wiring.

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

- **No design system here**: no `@primer/*`, `@ui5/*`, `@salesforce-ux/*`, no stylesheet, no app's
  source — `boundary.test.ts` fails on any. A hook takes what is DS-specific as a parameter
  (`confirm`, `accentCss`, the renderer name) or leaves it to the view.
- **No hard-coded chrome text**: Primer's `texts.lint.test.ts` lints this tree too.
- **The RN core decides**; this tree only adapts it to the browser and React. A rule that belongs to
  every renderer (native included) goes in the core, with its test.
- A file here is DS-neutral or it does not belong here. When a view and its behaviour are mixed,
  split them: the hook here, the view in the app.
