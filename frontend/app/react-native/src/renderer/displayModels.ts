// Small decisions of DisplayRenderer.tsx that are not drawing: amount formatting (meters, add-on
// pickers, ledgers), the hero's height, and the add-on picker's selection and total. Pure
// TypeScript, tested by node's runner.

/** Fixed 2-decimals + thousands-dot (de-DE style) amount: 1234.5 → "1.234,50". */
export const fmtAmount = (n: number): string => {
  const sign = n < 0 ? '-' : '';
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  return `${sign}${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`;
};

/** A ledger line: the sign before the currency ("-EUR 12,00"). */
export const ledgerAmount = (amount: number, currency: string): string =>
  `${amount < 0 ? '-' : ''}${currency ? `${currency} ` : ''}${fmtAmount(Math.abs(amount))}`;

/** A CSS height (px, rem/em at 16px) as points; 180 when absent or unparseable. */
export const heroHeight = (height?: string): number => {
  if (!height) return 180;
  const value = parseFloat(height);
  if (isNaN(value)) return 180;
  if (height.includes('rem') || height.includes('em')) return value * 16;
  return value;
};

/** The total price of the add-ons in `added`. */
export function addOnTotal(items: { id?: string; price?: number }[], added: Set<string>): number {
  return items.filter((it) => added.has(it.id ?? '')).reduce((sum, it) => sum + (it.price ?? 0), 0);
}

/** Toggling an add-on: the new selection, whether it is now added, and the action's payload. */
export function toggleAddOn(
  items: { id?: string; price?: number }[],
  added: Set<string>,
  id: string,
): { next: Set<string>; nowAdded: boolean; parameters: { _item: string; _added: boolean; _total: number } } {
  const next = new Set(added);
  const nowAdded = !next.has(id);
  if (nowAdded) next.add(id);
  else next.delete(id);
  return { next, nowAdded, parameters: { _item: id, _added: nowAdded, _total: addOnTotal(items, next) } };
}
