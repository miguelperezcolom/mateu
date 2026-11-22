import { NUMERIC, type Dict } from './rows'

/**
 * A column's geometry on Primer's DataTable, from what the wire says (GridColumnDto):
 * - `@ColumnWidth("9rem")` (width + flexGrow 0) → exactly that width; with a flexGrow it is the
 *   column's minimum and it still grows;
 * - `@ColumnWidth("auto")` (autoWidth) → as wide as its widest cell;
 * - nothing → shares the room left ('grow').
 * `align` (start | center | end) wins over the numeric-right default; DataTable aligns start or end
 * only, so a centred column is centred by its cell (`centered`).
 */
export function columnGeometry(meta: Dict, dataType: string): { width?: string; minWidth?: string; align?: 'start' | 'end'; centered: boolean } {
  const width = typeof meta['width'] === 'string' && meta['width'].trim() ? meta['width'].trim() : undefined
  const flexGrow = meta['flexGrow'] === undefined || meta['flexGrow'] === null || meta['flexGrow'] === '' ? undefined : Number(meta['flexGrow'])
  const declared = typeof meta['align'] === 'string' ? meta['align'].toLowerCase() : ''
  const align = declared === 'end' || declared === 'right' ? 'end'
    : declared === 'start' || declared === 'left' || declared === 'center' ? 'start'
      : NUMERIC.has(dataType) ? 'end' : undefined
  const centered = declared === 'center'
  if (meta['autoWidth'] === true) return { width: 'auto', align, centered }
  if (width && width !== 'auto') return flexGrow && flexGrow > 0 ? { width: 'grow', minWidth: width, align, centered } : { width, align, centered }
  if (width === 'auto') return { width: 'auto', align, centered }
  return { width: 'grow', align, centered }
}

/** The listing's table looks the wire declares (Vaadin's grid themes), as class names. */
export function tableLookClasses(metadata: Dict): string {
  return [
    ['rowStripes', 'mateu-row-stripes'],
    ['columnBorders', 'mateu-column-borders'],
    ['noRowBorder', 'mateu-no-row-border'],
    ['noBorder', 'mateu-no-border'],
    ['wrapCellContent', 'mateu-wrap-cells'],
  ].filter(([k]) => metadata[k] === true).map(([, c]) => c).join(' ')
}
