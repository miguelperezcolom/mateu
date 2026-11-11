/**
 * The options a field offers, whatever feeds them — the inline list the server sent, or a REST
 * source (`optionsSource`, `@RestOptions`) fetched on the device — and the values a pick writes back.
 *
 * Widgets compare and key options by STRING (a chip, a checkbox row), while a source's values are
 * often numbers (ids): the widget gets string values, and a pick is written back as the option's own
 * value, so `[5, 11]` stays `[5, 11]` and never becomes `['5', '11']`. Pure; tested with node:test.
 */

export interface TypedOption {
  value: unknown;
  label: string;
}

export interface WidgetOption {
  value: string;
  label: string;
}

/** The stereotypes that hold SEVERAL values when the field is a collection. */
const MULTI_STEREOTYPES = new Set(['multiSelect', 'listBox', 'combobox', 'checkbox']);

/** A field holding several of its options (a collection with an options stereotype). */
export const isMultiValued = (dataType: string | undefined, stereotype: string | undefined, value?: unknown): boolean =>
  stereotype === 'multiSelect' || ((dataType === 'array' || Array.isArray(value)) && MULTI_STEREOTYPES.has(stereotype ?? ''));

/** What the widget draws: string values, labels kept (a missing label shows the value). */
export const widgetOptionsOf = (options: TypedOption[] | null | undefined): WidgetOption[] =>
  (options ?? []).map((o) => ({ value: o.value == null ? '' : String(o.value), label: o.label ?? String(o.value ?? '') }));

/** The field's current value as the widget's string list (a single value, a comma-joined string after a URL restore). */
export const pickedStrings = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw.filter((v) => v != null).map(String);
  if (raw == null || raw === '') return [];
  if (typeof raw === 'string') return raw.split(',').map((s) => s.trim()).filter(Boolean);
  return [String(raw)];
};

/** A multi-value pick back to the options' own values (unknown strings kept as they are). */
export const pickedValues = (options: TypedOption[] | null | undefined, picked: string[]): unknown[] =>
  picked.map((s) => (options ?? []).find((o) => String(o.value) === s)?.value ?? s);

/** A single pick back to the option's own value. */
export const pickedValue = (options: TypedOption[] | null | undefined, picked: string): unknown =>
  (options ?? []).find((o) => String(o.value) === picked)?.value ?? picked;
