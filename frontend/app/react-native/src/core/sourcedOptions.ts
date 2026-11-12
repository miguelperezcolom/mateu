/**
 * Which control a field fed by a REST `optionsSource` becomes (pure, unit-tested). Every option
 * field with inline options has its own control (multi-select, checkbox group, list box, tree);
 * before, only the single select read a source, so those others drew an EMPTY control. Now the
 * source's options are fetched and the field's own control is drawn with them.
 *
 * `null` = the single select (RestOptionsField) — or no source at all.
 */
export type SourcedOptionsControl = 'multiSelect' | 'checkbox' | 'listBox' | 'treeSelect' | null;

export function sourcedOptionsControl(field: {
  optionsSource?: unknown;
  options?: unknown[];
  stereotype?: string;
  dataType?: string;
}, rawValue?: unknown): SourcedOptionsControl {
  const src = field.optionsSource as { url?: string; ref?: string } | null | undefined;
  if (!src || typeof src !== 'object' || !(src.url || src.ref)) return null;
  // inline options win, as for the single select
  if ((field.options ?? []).length > 0) return null;
  const st = field.stereotype ?? '';
  const many = field.dataType === 'array' || Array.isArray(rawValue);
  if (st === 'multiSelect') return 'multiSelect';
  if (st === 'checkbox' && many) return 'checkbox';
  if (st === 'listBox') return 'listBox';
  if (st === 'treeSelect') return 'treeSelect';
  // a collection with no stereotype of its own (a multi combobox) takes several: a multi-select
  if (many && (st === '' || st === 'regular' || st === 'combobox')) return 'multiSelect';
  return null;
}
