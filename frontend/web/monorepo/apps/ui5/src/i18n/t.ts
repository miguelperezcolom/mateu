import { appText } from '@mr/i18n/texts'
import type { Ui5TextKey } from './ui5Texts'

/** One of the SAP renderer's own words (ui5Texts.ts), in the page's language. */
export const t = (key: Ui5TextKey, vars?: Record<string, unknown>) => appText(key, vars)
