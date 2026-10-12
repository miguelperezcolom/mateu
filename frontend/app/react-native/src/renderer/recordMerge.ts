/**
 * Compare and merge (wire type `RecordMerge`) — the pure model, a port of libs/mateu's
 * recordMerge.ts so the merge action receives exactly the same parameters on every renderer:
 * the component's own `parameters`, `_merged` (fieldId → value) and `_choices` (fieldId → the id
 * of the record the value was taken from, or "custom" when it was typed).
 *
 * The phone layout is one card per FIELD (records as columns do not fit a phone); the picks are
 * the same.
 */
export const CUSTOM = 'custom';

export interface MergeRecordMeta {
  id: string;
  label: string;
  caption?: string | null;
}

export interface MergeFieldMeta {
  fieldId: string;
  label: string;
  values?: unknown[] | null;
  chosen?: string | null;
  editable?: boolean;
  differs?: boolean;
}

export interface RecordMergeMeta {
  title?: string | null;
  records?: MergeRecordMeta[] | null;
  fields?: MergeFieldMeta[] | null;
  mergeActionId?: string | null;
  mergeLabel?: string | null;
  parameters?: Record<string, unknown> | null;
  differencesOnly?: boolean;
}

export type MergePicks = Record<string, string>;

export const valueText = (value: unknown): string =>
  value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);

/** The picks to begin with: the server's `chosen`, else the first record with a value. */
export const initialPicks = (merge: RecordMergeMeta): MergePicks => {
  const picks: MergePicks = {};
  const ids = (merge.records ?? []).map((r) => r.id);
  for (const field of merge.fields ?? []) {
    let chosen = field.chosen && ids.includes(field.chosen) ? field.chosen : undefined;
    if (!chosen) {
      const i = (field.values ?? []).findIndex((v) => valueText(v).trim() !== '');
      chosen = ids[i >= 0 ? i : 0];
    }
    if (chosen) picks[field.fieldId] = chosen;
  }
  return picks;
};

/** The value a row ends up with, given its pick. */
export const mergedValue = (
  merge: RecordMergeMeta,
  field: MergeFieldMeta,
  picks: MergePicks,
  custom: Record<string, string>,
): unknown => {
  const pick = picks[field.fieldId];
  if (pick === CUSTOM) return custom[field.fieldId] ?? '';
  const index = (merge.records ?? []).findIndex((r) => r.id === pick);
  return index >= 0 ? (field.values ?? [])[index] ?? null : null;
};

/** The merge action's parameters: the component's own, `_merged` and `_choices`. */
export const mergeParameters = (
  merge: RecordMergeMeta,
  picks: MergePicks,
  custom: Record<string, string>,
): Record<string, unknown> => {
  const merged: Record<string, unknown> = {};
  const choices: Record<string, string> = {};
  for (const field of merge.fields ?? []) {
    merged[field.fieldId] = mergedValue(merge, field, picks, custom);
    choices[field.fieldId] = picks[field.fieldId] ?? '';
  }
  return { ...(merge.parameters ?? {}), _merged: merged, _choices: choices };
};

/** The rows to show: all, or only those whose values differ. */
export const visibleFields = (merge: RecordMergeMeta, differencesOnly: boolean): MergeFieldMeta[] =>
  (merge.fields ?? []).filter((f) => !differencesOnly || f.differs);

/** Fields, how many differ, how many were typed by hand. */
export const mergeSummary = (merge: RecordMergeMeta, picks: MergePicks) => ({
  fields: (merge.fields ?? []).length,
  differ: (merge.fields ?? []).filter((f) => f.differs).length,
  custom: Object.values(picks).filter((p) => p === CUSTOM).length,
});

export const summaryText = (s: { fields: number; differ: number; custom: number }): string =>
  `${s.fields} fields: ${s.differ} differ; ${s.custom} typed by hand`;

/** The accessible name of a pick: "Use value from Profile 1021 for Email". */
export const pickLabel = (record: string, field: string): string => `Use value from ${record} for ${field}`;
