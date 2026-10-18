import { moneyValueText } from '../core/money.ts';

/**
 * What a listing cell shows for a row value. A column that declares `valueLabels` (an enum column:
 * `IN_HOUSE` → "In house", the labels its form options use) shows the label; the row keeps the raw
 * value, which is what sorting, filtering, selection and editing work on. A structured value shows
 * its message.
 */
export function cellText(
  value: unknown,
  valueLabels?: Record<string, string> | null,
  column?: { dataType?: string; stereotype?: string },
): string {
  if (value === null || value === undefined) return '';
  // an amount of money: "89.50" in the UI's locale, an Amount in its own ("€89.50")
  if (column && (column.dataType === 'money' || column.stereotype === 'money')) return moneyValueText(value);
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    return String(v['message'] ?? v['value'] ?? JSON.stringify(value));
  }
  const label = valueLabels ? valueLabels[String(value)] : undefined;
  return label !== undefined && label !== null ? label : String(value);
}
