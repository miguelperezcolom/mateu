// How a HorizontalLayout / VerticalLayout lays its children out (pure, tested by node's runner) —
// the wire's own attributes, as the web's vaadin-horizontal/vertical-layout reads them:
// - a row's children keep their NATURAL size (they used to be stretched into equal cells,
//   `flex: 1, minWidth: 120`, so a badge row or a pair of buttons became a 2-column grid and a
//   spaced row pushed its last button to the far right); `flexGrows` / a child's own `flex-grow`
//   make them grow, in proportion;
// - `verticalAlignment` (START, CENTER, END, STRETCH, BASELINE) / `horizontalAlignment` place them
//   across the axis, `justification` along it;
// - `spacing` is the gap between children, `padding` / `margin` the box's own;
// - a row WRAPS on a phone whatever it declares (a touch adaptation: a row wider than the screen
//   would otherwise be cut off — there is no sideways page scroll); a row whose children declare
//   grow factors and does not ask to wrap keeps them on one line, sharing the width.
import { cssToRn, type RnStyle } from './cssStyle.ts';
import { declaresWrapPoint } from './phoneLayout.ts';
import { rowJustification } from './uxRules.ts';

type Dict = Record<string, unknown>;

const ALIGN: Record<string, string> = {
  START: 'flex-start', CENTER: 'center', END: 'flex-end', STRETCH: 'stretch', BASELINE: 'baseline',
  start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch', baseline: 'baseline',
};

export const SPACING = 12;
/** a row of controls never has its items touching (tap targets), even with spacing off */
export const MIN_ROW_GAP = 6;

export interface StackLayout {
  container: RnStyle;
  items: RnStyle[];
}

/** A child's declared grow factor: the layout's `flexGrows[i]`, else its own `flex-grow`/`flex`. */
function growOf(metadata: Dict, child: unknown, i: number): number | null {
  const grows = metadata['flexGrows'];
  if (Array.isArray(grows) && typeof grows[i] === 'number') return grows[i] as number;
  const own = cssToRn(((child as Dict)?.['style'] as string) ?? '', new Set(['flex-grow', 'flex']));
  return typeof own.flexGrow === 'number' ? own.flexGrow : null;
}

export function stackLayout(direction: 'row' | 'column', metadata: Dict, children: unknown[]): StackLayout {
  const spacing = metadata['spacing'] === true;
  const container: RnStyle = { flexDirection: direction };
  if (metadata['padding'] === true) container.padding = SPACING;
  if (metadata['margin'] === true) container.margin = SPACING;
  if (metadata['fullWidth'] === true) container.alignSelf = 'stretch';

  if (direction === 'column') {
    if (spacing) container.gap = SPACING;
    const align = ALIGN[String(metadata['horizontalAlignment'] ?? '')];
    if (align) container.alignItems = align;
    const justify = rowJustification(metadata['justification'] as string | null | undefined);
    if (justify) container.justifyContent = justify;
    return { container, items: children.map(() => ({})) };
  }

  container.gap = spacing ? SPACING : MIN_ROW_GAP;
  const align = ALIGN[String(metadata['verticalAlignment'] ?? '')];
  if (align) container.alignItems = align;
  const justify = rowJustification(metadata['justification'] as string | null | undefined);
  if (justify) container.justifyContent = justify;

  const grows = children.map((c, i) => growOf(metadata, c, i));
  const shares = grows.some((g) => g !== null && g > 0) && metadata['wrap'] !== true;
  container.flexWrap = shares ? 'nowrap' : 'wrap';

  const items = children.map((child, i) => {
    const style = ((child as Dict)?.['style'] as string) ?? '';
    // a zone column (min-width: min(20rem…)) / a fixed-width side panel: a full-width share that
    // stacks below its neighbour once squeezed under 300dp
    if (declaresWrapPoint(style)) return { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 300 } as RnStyle;
    const grow = grows[i];
    if (shares) return grow && grow > 0 ? { flexGrow: grow, flexShrink: 1, flexBasis: 0, minWidth: 0 } : { flexShrink: 1 };
    return grow && grow > 0 ? { flexGrow: grow, flexShrink: 1 } : { flexShrink: 1, maxWidth: '100%' };
  });
  return { container, items };
}
