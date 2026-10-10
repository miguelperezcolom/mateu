/**
 * What a listing cell shows for a row value. A column that declares `valueLabels` (an enum column:
 * `IN_HOUSE` → "In house", the labels its form options use) shows the label; the row keeps the raw
 * value, which is what sorting, filtering, selection and editing work on. A structured value shows
 * its message.
 */
export function cellText(value: unknown, valueLabels?: Record<string, string> | null): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    return String(v['message'] ?? v['value'] ?? JSON.stringify(value));
  }
  const label = valueLabels ? valueLabels[String(value)] : undefined;
  return label !== undefined && label !== null ? label : String(value);
}
