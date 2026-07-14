import { css } from "lit";

/**
 * Shared bits for the front-office UX components (EntityHeader, Meter, TaskQueue, …):
 * the badge-palette chip styles (normal | success | warning | error | contrast, Lumo vars
 * with fallbacks, dark-mode friendly) and the client-side money formatting helpers.
 */

/** Small pill chip following the badge palette. Apply class="chip <color>". */
export const chipStyles = css`
    .chip {
        display: inline-flex;
        align-items: center;
        padding: .1rem .5rem;
        border-radius: 999px;
        font-size: var(--lumo-font-size-xxs, .7rem);
        font-weight: 600;
        letter-spacing: .02em;
        line-height: 1.4;
        white-space: nowrap;
        color: var(--lumo-primary-text-color, #1a73e8);
        background: var(--lumo-primary-color-10pct, rgba(26, 115, 232, .12));
    }
    .chip.success {
        color: var(--lumo-success-text-color, #1a7f37);
        background: var(--lumo-success-color-10pct, rgba(18, 183, 106, .12));
    }
    .chip.warning {
        color: var(--lumo-warning-text-color, #b45309);
        background: var(--lumo-warning-color-10pct, rgba(245, 158, 11, .15));
    }
    .chip.error {
        color: var(--lumo-error-text-color, #c5221f);
        background: var(--lumo-error-color-10pct, rgba(225, 29, 72, .12));
    }
    .chip.contrast {
        color: var(--lumo-contrast-80pct, #333);
        background: var(--lumo-contrast-10pct, rgba(0, 0, 0, .08));
    }
`

const NUMBER_FORMAT = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 1234.5 → "1.234,50" (money stereotype convention). */
export const formatNumber = (value: number): string => NUMBER_FORMAT.format(value)

/** Currency symbol BEFORE the amount: (1540, '€') → "€ 1.540,00"; (-154, '€') → "-€ 154,00". */
export const formatMoney = (value: number, currency?: string): string => {
    const sign = value < 0 ? '-' : ''
    const formatted = formatNumber(Math.abs(value))
    return currency ? `${sign}${currency} ${formatted}` : `${sign}${formatted}`
}

/** Currency-like unit AFTER the amount: (1240, '€') → "1.240,00 €" (Meter convention). */
export const formatWithUnit = (value: number, unit?: string): string =>
    unit ? `${formatNumber(value)} ${unit}` : formatNumber(value)
