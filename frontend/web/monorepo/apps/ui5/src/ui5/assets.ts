/**
 * UI5's assets, trimmed to what Mateu speaks and draws. The packages' own `dist/Assets.js` register a
 * loader for EVERY UI5 language, every CLDR locale, every theme and every Fiori illustration — each a
 * lazy chunk, 450 files in the jar. Here the same asset registries get only:
 *  - the message bundles and CLDR data of Mateu's six chrome languages (en, es, fr, de, pt, it — the
 *    page language goes through chromeLanguage(), so UI5 is never asked for another one; a locale
 *    without a loader falls back to en inside UI5);
 *  - Horizon and its dark / high-contrast variants;
 *  - the illustrations the renderer shows (empty state, boot failure, IllustratedMessage's default).
 * Every import is spelled out: a template-literal import would make the bundler glob the whole folder.
 */
import { registerI18nLoader } from '@ui5/webcomponents-base/dist/asset-registries/i18n.js'
import { registerLocaleDataLoader } from '@ui5/webcomponents-base/dist/asset-registries/LocaleData.js'
import { registerThemePropertiesLoader } from '@ui5/webcomponents-base/dist/asset-registries/Themes.js'
import { registerIllustrationLoader } from '@ui5/webcomponents-base/dist/asset-registries/Illustrations.js'
import { setLanguage } from '@ui5/webcomponents-base/dist/config/Language.js'
import { chromeLanguage } from '@infra/ui/chromeTexts.ts'

type Loader = () => Promise<{ default: unknown }>
// typed as each registry expects (the JSON's shape is UI5's own)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pick = (loaders: Record<string, Loader>) => async (id: string): Promise<any> => {
  const load = loaders[id]
  if (!load) throw new Error(`[Mateu UI5 assets] not shipped: ${id}`)
  return (await load()).default
}

// ── message bundles ───────────────────────────────────────────────────────────────────────────

const webcomponentsI18n: Record<string, Loader> = {
  en: () => import('@ui5/webcomponents/dist/generated/assets/i18n/messagebundle_en.json'),
  es: () => import('@ui5/webcomponents/dist/generated/assets/i18n/messagebundle_es.json'),
  fr: () => import('@ui5/webcomponents/dist/generated/assets/i18n/messagebundle_fr.json'),
  de: () => import('@ui5/webcomponents/dist/generated/assets/i18n/messagebundle_de.json'),
  pt: () => import('@ui5/webcomponents/dist/generated/assets/i18n/messagebundle_pt.json'),
  it: () => import('@ui5/webcomponents/dist/generated/assets/i18n/messagebundle_it.json'),
}
Object.keys(webcomponentsI18n).forEach((l) => registerI18nLoader('@ui5/webcomponents', l, pick(webcomponentsI18n)))

const webcomponents_fioriI18n: Record<string, Loader> = {
  en: () => import('@ui5/webcomponents-fiori/dist/generated/assets/i18n/messagebundle_en.json'),
  es: () => import('@ui5/webcomponents-fiori/dist/generated/assets/i18n/messagebundle_es.json'),
  fr: () => import('@ui5/webcomponents-fiori/dist/generated/assets/i18n/messagebundle_fr.json'),
  de: () => import('@ui5/webcomponents-fiori/dist/generated/assets/i18n/messagebundle_de.json'),
  pt: () => import('@ui5/webcomponents-fiori/dist/generated/assets/i18n/messagebundle_pt.json'),
  it: () => import('@ui5/webcomponents-fiori/dist/generated/assets/i18n/messagebundle_it.json'),
}
Object.keys(webcomponents_fioriI18n).forEach((l) => registerI18nLoader('@ui5/webcomponents-fiori', l, pick(webcomponents_fioriI18n)))

const webcomponents_iconsI18n: Record<string, Loader> = {
  en: () => import('@ui5/webcomponents-icons/dist/generated/assets/i18n/messagebundle_en.json'),
  es: () => import('@ui5/webcomponents-icons/dist/generated/assets/i18n/messagebundle_es.json'),
  fr: () => import('@ui5/webcomponents-icons/dist/generated/assets/i18n/messagebundle_fr.json'),
  de: () => import('@ui5/webcomponents-icons/dist/generated/assets/i18n/messagebundle_de.json'),
  pt: () => import('@ui5/webcomponents-icons/dist/generated/assets/i18n/messagebundle_pt.json'),
  it: () => import('@ui5/webcomponents-icons/dist/generated/assets/i18n/messagebundle_it.json'),
}
Object.keys(webcomponents_iconsI18n).forEach((l) => registerI18nLoader('@ui5/webcomponents-icons', l, pick(webcomponents_iconsI18n)))

const webcomponents_reactI18n: Record<string, Loader> = {
  en: () => import('@ui5/webcomponents-react/dist/assets/i18n/messagebundle_en.json'),
  es: () => import('@ui5/webcomponents-react/dist/assets/i18n/messagebundle_es.json'),
  fr: () => import('@ui5/webcomponents-react/dist/assets/i18n/messagebundle_fr.json'),
  de: () => import('@ui5/webcomponents-react/dist/assets/i18n/messagebundle_de.json'),
  pt: () => import('@ui5/webcomponents-react/dist/assets/i18n/messagebundle_pt.json'),
  it: () => import('@ui5/webcomponents-react/dist/assets/i18n/messagebundle_it.json'),
}
Object.keys(webcomponents_reactI18n).forEach((l) => registerI18nLoader('@ui5/webcomponents-react', l, pick(webcomponents_reactI18n)))

// ── CLDR (dates, numbers, month and day names) ───────────────────────────────────────────────
const cldr: Record<string, Loader> = {
  en: () => import('@ui5/webcomponents-localization/dist/generated/assets/cldr/en.json'),
  es: () => import('@ui5/webcomponents-localization/dist/generated/assets/cldr/es.json'),
  fr: () => import('@ui5/webcomponents-localization/dist/generated/assets/cldr/fr.json'),
  de: () => import('@ui5/webcomponents-localization/dist/generated/assets/cldr/de.json'),
  pt: () => import('@ui5/webcomponents-localization/dist/generated/assets/cldr/pt.json'),
  it: () => import('@ui5/webcomponents-localization/dist/generated/assets/cldr/it.json'),
}
Object.keys(cldr).forEach((l) => registerLocaleDataLoader(l, pick(cldr)))

// ── themes ──────────────────────────────────────────────────────────────────────────────────
const webcomponents_themingThemes: Record<string, Loader> = {
  sap_horizon: () => import('@ui5/webcomponents-theming/dist/generated/assets/themes/sap_horizon/parameters-bundle.css.json'),
  sap_horizon_dark: () => import('@ui5/webcomponents-theming/dist/generated/assets/themes/sap_horizon_dark/parameters-bundle.css.json'),
  sap_horizon_hcb: () => import('@ui5/webcomponents-theming/dist/generated/assets/themes/sap_horizon_hcb/parameters-bundle.css.json'),
  sap_horizon_hcw: () => import('@ui5/webcomponents-theming/dist/generated/assets/themes/sap_horizon_hcw/parameters-bundle.css.json'),
}
Object.keys(webcomponents_themingThemes).forEach((t) => registerThemePropertiesLoader('@ui5/webcomponents-theming', t, pick(webcomponents_themingThemes)))

const webcomponentsThemes: Record<string, Loader> = {
  sap_horizon: () => import('@ui5/webcomponents/dist/generated/assets/themes/sap_horizon/parameters-bundle.css.json'),
  sap_horizon_dark: () => import('@ui5/webcomponents/dist/generated/assets/themes/sap_horizon_dark/parameters-bundle.css.json'),
  sap_horizon_hcb: () => import('@ui5/webcomponents/dist/generated/assets/themes/sap_horizon_hcb/parameters-bundle.css.json'),
  sap_horizon_hcw: () => import('@ui5/webcomponents/dist/generated/assets/themes/sap_horizon_hcw/parameters-bundle.css.json'),
}
Object.keys(webcomponentsThemes).forEach((t) => registerThemePropertiesLoader('@ui5/webcomponents', t, pick(webcomponentsThemes), 'host'))

const webcomponents_fioriThemes: Record<string, Loader> = {
  sap_horizon: () => import('@ui5/webcomponents-fiori/dist/generated/assets/themes/sap_horizon/parameters-bundle.css.json'),
  sap_horizon_dark: () => import('@ui5/webcomponents-fiori/dist/generated/assets/themes/sap_horizon_dark/parameters-bundle.css.json'),
  sap_horizon_hcb: () => import('@ui5/webcomponents-fiori/dist/generated/assets/themes/sap_horizon_hcb/parameters-bundle.css.json'),
  sap_horizon_hcw: () => import('@ui5/webcomponents-fiori/dist/generated/assets/themes/sap_horizon_hcw/parameters-bundle.css.json'),
}
Object.keys(webcomponents_fioriThemes).forEach((t) => registerThemePropertiesLoader('@ui5/webcomponents-fiori', t, pick(webcomponents_fioriThemes), 'host'))

// ── Fiori illustrations ─────────────────────────────────────────────────────────────────────
const illustrations: Record<string, Loader> = {
  NoData: () => import('@ui5/webcomponents-fiori/dist/illustrations/NoData.js'),
  ErrorScreen: () => import('@ui5/webcomponents-fiori/dist/illustrations/ErrorScreen.js'),
  BeforeSearch: () => import('@ui5/webcomponents-fiori/dist/illustrations/BeforeSearch.js'),
}
Object.keys(illustrations).forEach((name) => registerIllustrationLoader(`fiori/V4/${name}`, async () => (await illustrations[name]()).default as never))

// UI5 reads the browser's language when its first control renders: tell it one of the six now (the
// header's theme hook keeps it in step with the page afterwards), so it never looks for a locale this
// renderer does not ship (an Arabic browser would get UI5's "locale not configured" warning and en)
void setLanguage(chromeLanguage())
