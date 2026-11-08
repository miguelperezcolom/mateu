import { moneyValueText } from './money.ts';

/**
 * What a READ-ONLY field shows — the rule of the web renderers (libs/mateu statusColumnRenderer
 * toStatus, the Vaadin read-only field). A definition-only YAML page has no server mapping its
 * values, so its record page read "249" and "AVAILABLE" where the listing read "249.00" and
 * "Available": an amount (dataType or stereotype money) is formatted in the UI's locale, a value
 * among the field's `options` shows the option's LABEL, and a status is a tone chip.
 */

export interface ReadOnlyFieldLike {
  dataType?: string;
  stereotype?: string;
  options?: { value?: unknown; label?: string }[];
}

/** Whether the field is an amount of money (either channel of the wire's money contract). */
export const isMoneyField = (f: ReadOnlyFieldLike): boolean =>
  f.dataType === 'money' || f.stereotype === 'money' || f.stereotype === 'currency';

/** The label of the option whose value is `value` (`==`, so 3 matches "3"), else undefined. */
export function optionLabelOf(f: ReadOnlyFieldLike, value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  // eslint-disable-next-line eqeqeq
  const option = (f.options ?? []).find((o) => o && o.value == value);
  return option && option.label !== null && option.label !== undefined ? String(option.label) : undefined;
}

/** `OUT_OF_STOCK` / `OutOfStock` / `out-of-stock` → "Out of stock" (Java's enum humanizer). */
export function humanizeConstant(raw: string): string {
  const words = raw
    .replace(/[_\-\s]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Za-z])(\d)/g, '$1 $2')
    .trim()
    .toLowerCase();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : raw;
}

// Lifecycle words a REST API commonly answers with, by the tone they read as (libs/mateu toStatus).
const SUCCESS_WORDS = new Set(['AVAILABLE', 'ACTIVE', 'RUNNING', 'SUCCEEDED', 'SUCCESS', 'OK', 'ENABLED',
  'READY', 'HEALTHY', 'COMPLETED', 'DONE', 'ATTACHED', 'UP']);
const WARNING_WORDS = new Set(['PROVISIONING', 'UPDATING', 'PENDING', 'STARTING', 'STOPPING',
  'IN_PROGRESS', 'TERMINATING', 'DELETING', 'CREATING', 'MOVING', 'WAITING', 'ACCEPTED', 'WARNING',
  'DEGRADED', 'RESTORING', 'SCALING']);
const DANGER_WORDS = new Set(['FAILED', 'TERMINATED', 'ERROR', 'DELETED', 'STOPPED', 'DISABLED',
  'UNHEALTHY', 'DOWN', 'CANCELED', 'CANCELLED', 'REJECTED', 'INACTIVE']);

/** The tone a plain status WORD reads as ("AVAILABLE" → success, "in-progress" → warning). */
export function toneOfStatusWord(word: string): 'success' | 'warning' | 'danger' | 'neutral' {
  // camel case splits first (InProgress → IN_PROGRESS), then separators fold to `_`
  const w = word.trim().replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase().replace(/[\s-]+/g, '_');
  if (SUCCESS_WORDS.has(w)) return 'success';
  if (WARNING_WORDS.has(w)) return 'warning';
  if (DANGER_WORDS.has(w)) return 'danger';
  return 'neutral';
}

/**
 * A status value as a chip: a Mateu `{type, message}` keeps its own; a plain word gets the tone its
 * usual meaning gives it and reads as the field's option label, else as words ("Out of stock").
 * null when there is nothing to show.
 */
export function readOnlyStatus(f: ReadOnlyFieldLike, value: unknown): { label: string; tone: string } | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    return { label: String(v['message'] ?? v['value'] ?? ''), tone: String(v['type'] ?? 'neutral').toLowerCase() };
  }
  const raw = String(value);
  return { label: optionLabelOf(f, raw) ?? humanizeConstant(raw), tone: toneOfStatusWord(raw) };
}

/** The text of a read-only (non-status) field: money formatted, an option's label, else as is. */
export function readOnlyFieldText(f: ReadOnlyFieldLike, value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (isMoneyField(f)) return moneyValueText(value);
  const label = optionLabelOf(f, value);
  if (label !== undefined) return label;
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    return String(v['message'] ?? v['value'] ?? JSON.stringify(value));
  }
  return String(value);
}
