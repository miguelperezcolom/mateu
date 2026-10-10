/**
 * Matrix grids (wire type `MatrixGrid`): rows (metrics, room types…) × columns (dates…), the shape
 * of an availability or forecast grid. Same contract as the web renderers:
 *
 *  - consecutive columns sharing a `group` get ONE spanning header above theirs;
 *  - a section with a non-blank title is a header row that toggles its rows (client-side, initial
 *    state = `collapsed`); a blank title puts its rows at the top level, with no header;
 *  - a cell tone wins over its column tone (info, success, warning, danger, neutral);
 *  - a `link` cell dispatches `cellActionId`, an edited cell of an `editable` row dispatches
 *    `editActionId` — both with `{ _rowId, _columnId, _value }`; an unchanged value dispatches nothing.
 *
 * Pure logic (no react-native import) so it runs under `node --test`.
 */

export type Tone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export interface MatrixColumnMeta { id?: string | null; label?: string | null; group?: string | null; tone?: string | null }
export interface MatrixCellMeta { value?: string | null; tone?: string | null; link?: boolean }
export interface MatrixRowMeta {
  id?: string | null; label?: string | null; cells?: MatrixCellMeta[] | null; editable?: boolean; emphasis?: boolean;
}
export interface MatrixSectionMeta { id?: string | null; title?: string | null; collapsed?: boolean; rows?: MatrixRowMeta[] | null }
export interface MatrixGridMeta {
  rowHeaderLabel?: string | null;
  columns?: MatrixColumnMeta[] | null;
  sections?: MatrixSectionMeta[] | null;
  cellActionId?: string | null;
  editActionId?: string | null;
}

export interface GroupHeader {
  /** The group label; '' for a run of ungrouped columns (an empty spacer). */
  label: string;
  /** Index of the first column of the run. */
  start: number;
  span: number;
}

export type MatrixLine =
  | { kind: 'section'; key: string; sectionIndex: number; title: string; collapsed: boolean }
  | { kind: 'row'; key: string; sectionIndex: number; row: MatrixRowMeta };

const TONES: ReadonlySet<string> = new Set(['info', 'success', 'warning', 'danger', 'neutral']);

const normTone = (tone: string | null | undefined): Tone | undefined => {
  const t = (tone ?? '').trim().toLowerCase();
  return TONES.has(t) ? (t as Tone) : undefined;
};

/** The tone a cell paints with: its own when it has one, else its column's, else none. */
export const cellTone = (cell: MatrixCellMeta | undefined, column: MatrixColumnMeta | undefined): Tone | undefined =>
  normTone(cell?.tone) ?? normTone(column?.tone);

/**
 * The spanning headers above the column headers: one per run of consecutive columns sharing a
 * group. Empty when no column declares a group (no extra header row then).
 */
export const groupHeaders = (columns: MatrixColumnMeta[] | null | undefined): GroupHeader[] => {
  const cols = columns ?? [];
  if (!cols.some((c) => (c.group ?? '').trim())) return [];
  const out: GroupHeader[] = [];
  cols.forEach((c, i) => {
    const label = (c.group ?? '').trim();
    const last = out[out.length - 1];
    if (last && last.label === label) last.span++;
    else out.push({ label, start: i, span: 1 });
  });
  return out;
};

export const sectionKey = (section: MatrixSectionMeta, index: number): string =>
  (section.id ?? '').trim() || `#${index}`;

const hasTitle = (section: MatrixSectionMeta): boolean => !!(section.title ?? '').trim();

/** The initial collapse state: the keys of the titled sections the wire marks `collapsed`. */
export const initialCollapsed = (meta: MatrixGridMeta): Set<string> => {
  const out = new Set<string>();
  (meta.sections ?? []).forEach((s, i) => {
    if (hasTitle(s) && s.collapsed) out.add(sectionKey(s, i));
  });
  return out;
};

/** Returns a new set with `key` toggled. */
export const toggleSection = (collapsed: ReadonlySet<string>, key: string): Set<string> => {
  const next = new Set(collapsed);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
};

/**
 * The lines to paint, top to bottom: a header line per titled section, followed by its rows unless
 * collapsed; the rows of an untitled section at the top level.
 */
export const matrixLines = (meta: MatrixGridMeta, collapsed: ReadonlySet<string>): MatrixLine[] => {
  const out: MatrixLine[] = [];
  (meta.sections ?? []).forEach((section, sectionIndex) => {
    const key = sectionKey(section, sectionIndex);
    const titled = hasTitle(section);
    const isCollapsed = titled && collapsed.has(key);
    if (titled) out.push({ kind: 'section', key, sectionIndex, title: (section.title ?? '').trim(), collapsed: isCollapsed });
    if (isCollapsed) return;
    (section.rows ?? []).forEach((row, rowIndex) => {
      out.push({ kind: 'row', key: `${key}/${(row.id ?? '').trim() || rowIndex}`, sectionIndex, row });
    });
  });
  return out;
};

export interface CellParameters { _rowId: string; _columnId: string; _value: string }

export const cellParameters = (
  row: MatrixRowMeta, column: MatrixColumnMeta, value: string | null | undefined,
): CellParameters => ({ _rowId: row.id ?? '', _columnId: column.id ?? '', _value: value ?? '' });

/** A link cell is tappable only when the grid declares a cellActionId. */
export const isActionableLink = (meta: MatrixGridMeta, cell: MatrixCellMeta | undefined): boolean =>
  !!cell?.link && !!(meta.cellActionId ?? '').trim();

/** Whether committing `next` over `previous` must dispatch: only when there is somewhere to send it and it changed. */
export const shouldCommit = (
  meta: MatrixGridMeta, previous: string | null | undefined, next: string | null | undefined,
): boolean => !!(meta.editActionId ?? '').trim() && (previous ?? '') !== (next ?? '');

/** The screen-reader name of a cell: "Available, Sat 10: 12". */
export const cellA11yLabel = (row: MatrixRowMeta, column: MatrixColumnMeta, value: string | null | undefined): string =>
  `${row.label ?? ''}, ${column.label ?? ''}: ${value ?? ''}`;
