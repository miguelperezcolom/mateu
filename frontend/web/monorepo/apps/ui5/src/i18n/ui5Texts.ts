/**
 * The words only the SAP renderer draws (UI5's controls bring their own texts, in the page
 * language — main.tsx sets UI5's language). Everything else comes from the shared tables
 * (@mr/i18n/texts). Six languages; ui5Texts.test.ts checks every key has all six.
 */
const en = {
  more: 'More',
  appMenu: 'Main menu',
  productSwitch: 'Applications',
}
type Keys = keyof typeof en
const es: Record<Keys, string> = { more: 'Más', appMenu: 'Menú principal', productSwitch: 'Aplicaciones' }
const fr: Record<Keys, string> = { more: 'Plus', appMenu: 'Menu principal', productSwitch: 'Applications' }
const de: Record<Keys, string> = { more: 'Mehr', appMenu: 'Hauptmenü', productSwitch: 'Anwendungen' }
const pt: Record<Keys, string> = { more: 'Mais', appMenu: 'Menu principal', productSwitch: 'Aplicações' }
const it: Record<Keys, string> = { more: 'Altro', appMenu: 'Menu principale', productSwitch: 'Applicazioni' }

export const UI5_TEXTS = { en, es, fr, de, pt, it }
export type Ui5TextKey = Keys
