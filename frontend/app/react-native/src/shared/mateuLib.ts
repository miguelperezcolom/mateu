/**
 * The ONE door to code shared with the web renderers (frontend/web/monorepo/libs/mateu): instead of
 * porting the static-bundle resolution rules and the client-side expander — ~1,200 lines that must
 * answer exactly as the web does (the #557 shell/content rule, route-parameter precedence, specs-mode
 * expansion) — the native renderer imports them.
 *
 * Only a platform-neutral closure is reachable from here: http/bundleResolver.ts, the expander
 * (expander/*), the action / field-type / business-component catalogues and the i18n helpers. Those
 * files import each other relatively with a `.ts` extension, import types with `import type` and use
 * no TS `enum` at runtime, so Metro (metro.config.js watches the folder) and `node --test` (type
 * stripping) both load them as they are. Keep it that way when editing them: a Lit / DOM / alias
 * import there breaks this app's build, and `src/shared/mateuLib.test.ts` catches it. (Their
 * type-only `@mateu/…` imports are erased at runtime; tsconfig.json maps them for `npm run typecheck`.)
 */
export {
  appShellOf,
  isBundleManifest,
  parseBundleManifest,
  resolveLoad,
  rootIncrement,
  toSyncPath,
  type BundleManifest,
  type BundleState,
  type Localize,
} from '../../../../web/monorepo/libs/mateu/src/mateu/ui/infra/http/bundleResolver.ts';
export { setActionCatalogue } from '../../../../web/monorepo/libs/mateu/src/mateu/ui/infra/ui/actionCatalogue.ts';
export { setFieldTypeCatalogue } from '../../../../web/monorepo/libs/mateu/src/mateu/ui/infra/expander/fieldTypes.ts';
export { setComponentCatalogue } from '../../../../web/monorepo/libs/mateu/src/mateu/ui/infra/http/componentCatalogue.ts';
export {
  mentionsI18n,
  pickLocale,
  translateDeep,
  type TranslationCatalogue,
} from '../../../../web/monorepo/libs/mateu/src/mateu/ui/infra/i18n/translations.ts';
