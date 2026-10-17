// The numbers and derived texts DisplayRenderer.tsx draws: sparkline/trend bar heights, heatmap
// intensities, funnel stages, checklist and task progress, ledger totals, rating stars, file-type
// icons, avatars and the initial open/selected state of the stateful pieces. Pure TypeScript,
// tested by node's runner.

/** A Stat's bar-sparkline: each value as a bar height from 4 to 26 points. */
export function sparkHeights(spark: number[]): number[] {
  const min = spark.length ? Math.min(...spark) : 0;
  const max = spark.length ? Math.max(...spark) : 1;
  const span = max - min || 1;
  return spark.map((v) => 4 + 22 * ((v - min) / span));
}

/** A TrendChart's bars: 8 to 98 points, the scale always including zero (and at least 1). */
export function trendBarHeights(values: number[]): number[] {
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  return values.map((v) => 8 + 90 * ((v - min) / span));
}

/** A Heatmap: the dated cells only, each with its intensity color (four steps over the max). */
export function heatCells<C extends { date?: string; value?: number }>(cells: C[]): { cell: C; color: string }[] {
  const dated = cells.filter((c) => !!c.date);
  const maxVal = Math.max(1, ...dated.map((c) => c.value ?? 0));
  const intensity = (v: number) => {
    if (v <= 0) return 'rgba(26,115,232,0.08)';
    const t = v / maxVal;
    const a = t > 0.75 ? 1 : t > 0.5 ? 0.75 : t > 0.25 ? 0.5 : 0.3;
    return `rgba(26,115,232,${a})`;
  };
  return dated.map((cell) => ({ cell, color: intensity(cell.value ?? 0) }));
}

/** A Funnel: each stage's value, its conversion from the previous one and its bar width (≥ 8%). */
export function funnelStages<S extends { value?: number }>(stages: S[]): { stage: S; value: number; conversion: string; widthPct: number }[] {
  const maxVal = Math.max(1, ...stages.map((s) => s.value ?? 0));
  return stages.map((stage, i) => {
    const value = stage.value ?? 0;
    const prev = i > 0 ? stages[i - 1].value ?? 0 : value;
    const conversion = i === 0 ? '' : prev > 0 ? `${Math.round((value / prev) * 100)}% of previous` : '';
    return { stage, value, conversion, widthPct: Math.max(8, (value / maxVal) * 100) };
  });
}

/** A rating as five stars, clamped to 0..5: 3 → "★★★☆☆". */
export const ratingStars = (r: number): string =>
  '★'.repeat(Math.max(0, Math.min(5, r))) + '☆'.repeat(5 - Math.max(0, Math.min(5, r)));

/** Indexes flagged by `flag` as the initial open/done map (foldout panels, FAQ, checklist). */
export function initiallyFlagged<T>(items: T[], flag: (item: T) => unknown): Record<number, boolean> {
  const o: Record<number, boolean> = {};
  items.forEach((it, i) => { if (flag(it)) o[i] = true; });
  return o;
}

/** A Checklist's progress: how many are done and the rounded percentage. */
export function checklistProgress(done: Record<number, boolean>, total: number): { doneCount: number; pct: number } {
  const doneCount = Object.values(done).filter(Boolean).length;
  return { doneCount, pct: total > 0 ? Math.round((doneCount / total) * 100) : 0 };
}

/** A TaskProgress banner: whether it is complete and one "i/total" pill per subtask. */
export function taskProgressModel(total: number, done: number): { complete: boolean; pills: { n: number; label: string; done: boolean }[] } {
  return {
    complete: total > 0 && done >= total,
    pills: Array.from({ length: total }, (_, i) => i + 1).map((n) => ({ n, label: `${n}/${total}`, done: n <= done })),
  };
}

/** A Ledger's total: the declared one, else the sum of the lines not marked included. */
export function ledgerTotal(lines: { amount?: number; included?: boolean }[], declared?: number): number {
  return declared ?? lines.filter((l) => !l.included).reduce((sum, l) => sum + (l.amount ?? 0), 0);
}

const FILE_ICONS: Record<string, string> = {
  pdf: '📕', image: '🖼️', img: '🖼️', doc: '📘', docx: '📘', word: '📘',
  xls: '📗', xlsx: '📗', excel: '📗', zip: '🗜️', archive: '🗜️', video: '🎬', audio: '🎵', csv: '📄', txt: '📄',
};

/** A FileList row's icon by its type (case-insensitive); anything unknown is a page. */
export const fileIcon = (type?: string): string => (type && FILE_ICONS[type.toLowerCase()]) || '📄';

/** Whether an avatar is a picture (http/data URI) rather than a glyph. */
export const isImageAvatar = (avatar?: string): boolean =>
  !!avatar && (avatar.startsWith('http') || avatar.startsWith('data:'));

/** A comment's avatar glyph: a non-token avatar, else the author's initial, else "?". */
export const commentAvatar = (c: { avatar?: string; author?: string }): string =>
  c.avatar && !c.avatar.includes(':') ? c.avatar : (c.author?.[0] ?? '?');

/** A ResourceGrid card's width: one column's share, three columns when undeclared. */
export const resourceCardWidth = (columns: number): `${number}%` =>
  columns > 0 ? `${100 / columns}%` as `${number}%` : '33.333%';

/** The skeleton's repeat count: a positive declared count, else 3. */
export const skeletonCount = (count?: number): number => (count && count > 0 ? count : 3);

/** An OfferCard CTA's text: the "added" label once added (falling back to the action label). */
export const offerCtaLabel = (m: { added?: boolean; addedLabel?: string; actionLabel?: string }): string | undefined =>
  m.added === true ? (m.addedLabel ?? m.actionLabel) : m.actionLabel;

/** A TaskQueue's initially selected card: the first item, across groups, flagged selected. */
export const initialQueueSelection = (groups: { items?: { id?: string; selected?: boolean }[] }[]): string | undefined =>
  groups.flatMap((g) => g.items ?? []).find((it) => it.selected)?.id;

/** A PaymentPicker's initial method: the declared one, else the first method. */
export const initialPaymentMethod = (selected: unknown, methods: { id?: string }[]): string | undefined =>
  (selected as string) || methods[0]?.id;

/** Whether a Notice has anything to show: non-blank text or content children. */
export const noticeShows = (text: unknown, childCount: number): { hasText: boolean; shows: boolean } => {
  const hasText = !!((text as string) ?? '').trim();
  return { hasText, shows: hasText || childCount > 0 };
};
