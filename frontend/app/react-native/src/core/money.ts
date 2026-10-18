/**
 * How the native renderer writes an amount of money — the rule of the web renderers (libs/mateu
 * moneyFormat): an Amount ({value, currency, locale}) in ITS locale and currency; a bare number
 * declared money with two decimals grouped the way the UI's LOCALE groups them — the app's
 * (`AppDto.locale`, remembered by the view controller when the shell arrives), else the device's.
 * It used to be hard-wired to de-DE, so an English app read "1.234,50".
 */

let appLocale: string | undefined;

/** The app's locale (AppDto.locale); undefined/blank goes back to the device's. */
export function setAppLocale(locale: string | null | undefined): void {
  appLocale = locale && locale.trim() ? locale.trim() : undefined;
}

/** The UI's locale: the app's, else the device's, else English. */
export function uiLocale(): string {
  if (appLocale) return appLocale;
  try {
    return new Intl.NumberFormat().resolvedOptions().locale || 'en';
  } catch {
    return 'en';
  }
}

function intl(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  try {
    return new Intl.NumberFormat(locale, options);
  } catch {
    try {
      return new Intl.NumberFormat(locale.replace(/_/g, '-'), options);
    } catch {
      return new Intl.NumberFormat('en', options);
    }
  }
}

const TWO_DECIMALS: Intl.NumberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

/** A money number with two decimals in `locale` (default: the UI's); not a finite number → ''. */
export function moneyNumberText(value: number, locale: string = uiLocale()): string {
  if (!Number.isFinite(value)) return '';
  return intl(locale, TWO_DECIMALS).format(value);
}

/** Any money value as text: an Amount in its own locale/currency, a number in the UI's locale. */
export function moneyValueText(raw: unknown, locale: string = uiLocale()): string {
  const amount = raw && typeof raw === 'object' && 'value' in (raw as Record<string, unknown>)
    ? (raw as { value?: unknown; locale?: unknown; currency?: unknown })
    : null;
  const v = amount ? amount.value : raw;
  if (v === null || v === undefined || v === '') return '';
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (Number.isNaN(n)) return String(v);
  const own = (amount && typeof amount.locale === 'string' && amount.locale) || locale;
  const currency = amount && typeof amount.currency === 'string' && amount.currency ? amount.currency : null;
  if (currency) {
    try {
      return new Intl.NumberFormat(own, { style: 'currency', currency, ...TWO_DECIMALS }).format(n);
    } catch {
      return `${moneyNumberText(n, own)} ${currency}`;
    }
  }
  return moneyNumberText(n, own);
}
