import { appText } from '@mr/i18n/texts'
import type { SldsTextKey } from './sldsTexts'

/** One of the Salesforce renderer's own words (sldsTexts.ts, registered at boot), in the page's language. */
export const st = (key: SldsTextKey, vars?: Record<string, unknown>): string => appText(key, vars)
