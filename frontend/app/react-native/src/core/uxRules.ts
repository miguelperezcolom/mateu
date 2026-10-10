/**
 * Pure UX decisions of the React Native renderer, kept out of the components so they can be
 * unit-tested with `node --test` (the components import react-native, which node cannot load).
 * Each rule names the finding of the pre-beta native UX review it implements
 * (design/ux-review/native-findings.md).
 */

type Json = Record<string, unknown>;

/**
 * The action a toolbar/button DTO dispatches. The wire carries it in `actionId` (ButtonDto); `id`
 * is the component id and only a fallback for older payloads. RN-01: the crud toolbar read `id`
 * alone, so New / Delete / bulk actions dispatched an empty action and did nothing.
 */
export function buttonActionId(button: { actionId?: string | null; id?: string | null } | null | undefined): string {
  return (button?.actionId || button?.id || '') as string;
}

/**
 * The state a ServerSide component renders against: its own `initialData`, overlaid with the state
 * the FRAGMENT carries (UIFragmentDto.state — where the server puts a reflected view's field values).
 * RN-02: only `initialData` was read, so a page whose values travel in the fragment state rendered
 * every field EMPTY (e.g. a contact card showing labels with no values).
 */
export function serverSideState(component: Json | null | undefined, fragmentState: unknown): Json {
  const initialData = (component?.['initialData'] as Json | undefined) ?? {};
  const state = fragmentState && typeof fragmentState === 'object' && !Array.isArray(fragmentState) ? (fragmentState as Json) : {};
  return { ...initialData, ...state };
}

/** Width below which a window is "compact" (Material 3 window size classes: < 600dp = phones). */
export const COMPACT_WIDTH = 600;

/**
 * The layout a listing renders in on this device. A listing that declares its layout gets it; an
 * undeclared one (`auto`) is a TABLE on the web, but on a compact (phone) window a multi-column
 * table only fits by scrolling sideways — columns are cut at the edge and the row's identity is
 * lost while comparing (RN-14; Material 3 lists, HIG table views). There it becomes a LIST:
 * first column as the row title, the rest as its supporting line. Decided per device class, not
 * per resize, so one device always shows the same screen the same way.
 */
export function effectiveListingLayout(gridLayout: string | null | undefined, windowWidth: number): string {
  const declared = (gridLayout ?? '').trim() || 'auto';
  if (declared !== 'auto') return declared;
  return windowWidth > 0 && windowWidth < COMPACT_WIDTH ? 'list' : 'table';
}

/**
 * The placeholder an input shows. Only one the developer DECLARED: echoing the label inside the box
 * (as the renderer did) makes an empty field look already filled in and adds nothing the label above
 * does not say (RN-10; NN/g "Placeholders in form fields are harmful").
 */
export function fieldPlaceholder(metadata: { placeholder?: string | null } | null | undefined): string | undefined {
  const p = metadata?.placeholder;
  return p && p.trim() ? p : undefined;
}

/** Whether a drawer menu entry is the screen currently shown (its active indicator). */
export function isCurrentDestination(item: { route?: string | null }, currentRoute: string): boolean {
  const norm = (r: string | null | undefined) => (r ?? '').replace(/\/+$/, '').replace(/^\/?/, '/');
  return !!item.route && norm(item.route) === norm(currentRoute);
}

/**
 * A plain-language explanation for a failed load, with what to do about it — instead of the raw
 * transport text ("Failed to fetch", "Network request failed", an HTTP status). RN-05 / Nielsen #9:
 * say what happened and how to recover.
 */
export function loadFailureMessage(raw: string | null | undefined): { title: string; detail: string } {
  const text = (raw ?? '').trim();
  if (/failed to fetch|network request failed|networkerror|load failed|ECONNREFUSED|ERR_CONNECTION/i.test(text)) {
    return {
      title: "Can't reach the server",
      detail: 'Check your connection and try again. If it keeps failing, the service may be down.',
    };
  }
  if (/timeout|timed out/i.test(text)) {
    return { title: 'The server is taking too long', detail: 'Try again in a moment.' };
  }
  if (/\b(401|403)\b|unauthori[sz]ed|forbidden/i.test(text)) {
    return { title: "You don't have access", detail: 'Sign in again, or ask for access to this screen.' };
  }
  if (/\b5\d\d\b/.test(text)) {
    return { title: 'Something went wrong on the server', detail: 'Try again. If it keeps failing, contact support.' };
  }
  return { title: "This screen couldn't be loaded", detail: text || 'Try again.' };
}

/**
 * Space to keep free at the bottom of the content when floating action buttons are shown, so they
 * never cover the content's last controls — a crud's pagination "Next", a form's Save (RN-13;
 * Material 3: a FAB must not obscure content). FAB 52 + its 16 margin + 8 breathing room.
 */
export const FAB_SIZE = 52;
export const FAB_MARGIN = 16;
export function fabInset(fabCount: number): number {
  return fabCount > 0 ? FAB_SIZE + FAB_MARGIN + 8 : 0;
}

/**
 * The flexbox justification of a row whose layout DECLARES one (wire `justification`: START, CENTER,
 * END, BETWEEN/SPACE_BETWEEN, AROUND, EVENLY). Null for an undeclared row (its items share the width).
 */
export function rowJustification(
  justification: string | null | undefined,
): 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly' | null {
  switch ((justification ?? '').toUpperCase()) {
    case 'START': return 'flex-start';
    case 'CENTER': return 'center';
    case 'END': return 'flex-end';
    case 'BETWEEN': case 'SPACE_BETWEEN': return 'space-between';
    case 'AROUND': case 'SPACE_AROUND': return 'space-around';
    case 'EVENLY': case 'SPACE_EVENLY': return 'space-evenly';
    default: return null;
  }
}

/** Heading level of a Text component's container (h1–h6 → 1–6), or 0 when it is not a heading. */
export function headingLevel(container: string | null | undefined): number {
  const m = /^h([1-6])$/i.exec((container ?? '').trim());
  return m ? Number(m[1]) : 0;
}

/** A compact axis value: 1200 → "1.2k", 3_400_000 → "3.4M", 87 → "87". */
export function formatTick(value: number): string {
  if (!Number.isFinite(value)) return '';
  const abs = Math.abs(value);
  const trim = (n: number) => String(Math.round(n * 10) / 10);
  if (abs >= 1_000_000) return `${trim(value / 1_000_000)}M`;
  if (abs >= 1_000) return `${trim(value / 1_000)}k`;
  return trim(value);
}

/**
 * A chart's text alternative (RN-11, WCAG 1.1.1): a chart is announced as an image, so the
 * label must carry the data itself — category: value pairs per series, capped so a long series
 * stays listenable. Pie: share of each slice.
 */
export function chartTextAlternative(
  labels: string[],
  datasets: { label?: string; data?: number[] }[],
  isPie: boolean,
  maxPoints = 12,
): string {
  if (datasets.length === 0) return 'Chart, no data';
  if (isPie) {
    const values = datasets[0].data ?? [];
    const total = values.reduce((a, b) => a + b, 0) || 1;
    const parts = values.slice(0, maxPoints).map((v, i) => `${labels[i] ?? `Slice ${i + 1}`}: ${Math.round((v / total) * 100)}%`);
    return `Pie chart. ${parts.join(', ')}`;
  }
  const series = datasets.map((ds, di) => {
    const values = ds.data ?? [];
    const pairs = values.slice(0, maxPoints).map((v, i) => `${labels[i] ?? i + 1}: ${v}`);
    const more = values.length > maxPoints ? `, and ${values.length - maxPoints} more` : '';
    const name = ds.label || (datasets.length > 1 ? `Series ${di + 1}` : '');
    return `${name ? `${name}. ` : ''}${pairs.join(', ')}${more}`;
  });
  return `Chart. ${series.join('. ')}`;
}

/** The accessible name of a row's selection checkbox: says WHICH row it selects. */
export function rowCheckboxLabel(rowTitle: unknown): string {
  const t = rowTitle == null ? '' : String(rowTitle).trim();
  return t ? `Select ${t}` : 'Select row';
}
