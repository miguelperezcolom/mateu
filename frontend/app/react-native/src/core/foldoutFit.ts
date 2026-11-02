// Which foldout panels are open on first paint — the rule of conformance/client/foldout-auto.json,
// the same as libs/mateu foldoutGeometry.ts, Redwood poc/foldouts.mjs and IntelliJ FoldoutFit.kt.
// A panel with autoOpen (a YAML panel whose author wrote no `open:`) opens while it fits the
// available width, in declaration order; any other follows `open`. The overview, the panels declared
// open and every folded strip are counted first; each auto panel then takes its width in place of
// its strip. An unknown width (null / <= 0) opens every auto panel.

export interface FoldoutFitOptions {
  overviewPx?: number;
  stripPx?: number;
  defaultPanelPx?: number;
  remPx?: number;
  gapPx?: number;
}

export interface FoldoutFitPanel { open?: boolean | null; autoOpen?: boolean | null; width?: string | null }

/** A panel's CSS width in px: px / rem / em / a bare number / % of the row; else null. */
export function foldoutWidthPx(width: string | null | undefined, available: number, remPx = 16): number | null {
  const m = /^(\d+(?:\.\d+)?)(px|rem|em|%)?$/.exec((width ?? '').trim());
  if (!m) return null;
  const n = Number.parseFloat(m[1]);
  if (m[2] === 'rem' || m[2] === 'em') return n * remPx;
  if (m[2] === '%') return (n * available) / 100;
  return n;
}

export function foldoutOpenStates(
  panels: FoldoutFitPanel[] | null | undefined,
  available: number | null | undefined,
  options: FoldoutFitOptions = {},
): boolean[] {
  const list = panels ?? [];
  const { overviewPx = 400, stripPx = 48, defaultPanelPx = 352, remPx = 16, gapPx = 0 } = options;
  const auto = (p: FoldoutFitPanel | null | undefined) => p?.autoOpen === true;
  if (available == null || available <= 0) return list.map((p) => auto(p) || p?.open !== false);
  const widthOf = (p: FoldoutFitPanel) => foldoutWidthPx(p.width, available, remPx) ?? defaultPanelPx;
  let used = overviewPx;
  for (const p of list) used += gapPx + (!auto(p) && p?.open !== false ? widthOf(p) : stripPx);
  return list.map((p) => {
    if (!auto(p)) return p?.open !== false;
    const grown = used - stripPx + widthOf(p);
    if (grown > available) return false;
    used = grown;
    return true;
  });
}
