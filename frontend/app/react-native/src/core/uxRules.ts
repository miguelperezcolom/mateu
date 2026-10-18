import { moneyValueText } from './money.ts';
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
/**
 * Why the BOOT load drew nothing: an increment with no fragment carries its reason as a message
 * (the server's error boundary answers "Something went wrong / Reference: …", a 403, a missing
 * route). Without this the first screen was blank — no message, nothing to press.
 * Null when the increment has something to render.
 */
export function bootFailureOf(increment: unknown): string | null {
  const res = (increment ?? {}) as { fragments?: unknown[]; messages?: { variant?: string; title?: string | null; text?: string }[] };
  if ((res.fragments ?? []).some((f) => !!(f as { component?: unknown })?.component)) return null;
  const message = (res.messages ?? []).find((m) => m.variant === 'error') ?? (res.messages ?? [])[0];
  if (!message) return 'The server answered with nothing to show.';
  return [message.title, message.text].filter((t) => !!t && t.trim()).join(': ') || 'The server answered with nothing to show.';
}

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
/** Where a page's floating buttons sit: above the page's bottom button bar when it has one (the
 *  bar used to cover them — a tap on the FAB pressed the bar's button underneath). */
export const PAGE_BOTTOM_BAR_HEIGHT = 76; // 16px padding a side + a 44px button
export function fabBottom(hasBottomBar: boolean): number {
  return hasBottomBar ? PAGE_BOTTOM_BAR_HEIGHT + 24 : 24;
}

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

/**
 * Where a crud mediator's state-only `_route` move (view / cancel / save / delete answers) takes a
 * native screen stack. `current` is the inner route this screen was seeded with by its own load
 * (`null` when its load carried none — a pushed record screen). The listing answers to two names,
 * `""` and `"list"`, so a delete on the listing STAYS (the RunAction search in the same increment
 * refreshes it) instead of pushing a copy of itself; and a record screen sent to the list goes BACK
 * to the listing it was opened from instead of stacking a second listing on top of it.
 */
export type MediatorMove = 'stay' | 'backToList' | 'detail' | 'inPlace';

export function mediatorMove(routeSuffix: string, current: string | null, canStack: boolean): MediatorMove {
  const trim = (s: string) => s.replace(/^\/+|\/+$/g, '');
  const next = trim(routeSuffix);
  const isList = (r: string) => r === '' || r === 'list';
  if (current !== null && (trim(current) === next || (isList(trim(current)) && isList(next)))) return 'stay';
  if (isList(next)) return canStack ? 'backToList' : 'inPlace';
  return canStack ? 'detail' : 'inPlace';
}

/**
 * How full a ProgressBar is (0..1). Its value is read from the state under `valueKey` when the bar
 * names one (a LongTask's dialog moves it step by step), and a 0 bound means "unset" on the wire —
 * the dialog sends min 0, max 0 with a 0..1 value, which the web's vaadin-progress-bar reads as its
 * 0..1 default; dividing by max - min = 0 left the bar empty to the end.
 */
export function progressFraction(metadata: Record<string, unknown>, state: Record<string, unknown>): number {
  const min = Number(metadata['min']) || 0;
  const max = Number(metadata['max']) || 1;
  const key = (metadata['valueKey'] as string) ?? '';
  const raw = key && state[key] != null ? Number(state[key]) : Number(metadata['value'] ?? 0);
  if (max - min === 0 || Number.isNaN(raw)) return 0;
  return Math.max(0, Math.min(1, (raw - min) / (max - min)));
}

/**
 * Money values. A field typed `Amount` travels as an OBJECT `{value, currency, locale}` (the web's
 * mateu-money-field edits its `value` and keeps the rest); a plain numeric money field as a
 * number. Showing the object as text printed "[object Object]" in the input.
 */
type AmountValue = { value?: unknown; currency?: unknown; locale?: unknown };
const isAmount = (raw: unknown): raw is AmountValue => !!raw && typeof raw === 'object' && !Array.isArray(raw) && 'value' in (raw as object);

/** What a money input shows: the amount's number, or the plain value; '' when unset. */
export function moneyInputText(raw: unknown): string {
  const v = isAmount(raw) ? raw.value : raw;
  return v === null || v === undefined ? '' : String(v);
}

/** The value a money input commits: an Amount keeps its currency/locale (a cleared amount is 0,
 *  as on the web); a plain money number is null when cleared. */
export function moneyInputCommit(raw: unknown, text: string): unknown {
  const n = text.trim() === '' ? null : parseFloat(text.replace(',', '.'));
  if (isAmount(raw)) return { ...raw, value: n === null || Number.isNaN(n) ? 0 : n };
  return n === null || Number.isNaN(n) ? null : n;
}

/** Read-only money text: an Amount formats with its OWN locale and currency, a number with two
 *  decimals in the UI's locale (the app's, else the device's — see money.ts). */
export function moneyText(raw: unknown): string {
  return moneyValueText(raw);
}

/** A stepper's value: null (unset — shown empty, as the web's integer field) or a number. */
export function stepperValue(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

/**
 * A decimal input keeps what the user is TYPING ("12.", "0,", "") while the committed value is the
 * parsed number: re-deriving the text from the number turned "12." into "12" (so 12.5 became 125)
 * and a cleared amount into "0". The draft gives way only when the value changes from elsewhere.
 */
export function decimalDraft(draft: string, externalText: string): string {
  const num = (t: string) => (t.trim() === '' ? null : parseFloat(t.replace(',', '.')));
  const a = num(draft);
  const b = num(externalText);
  const same = (a === null || Number.isNaN(a)) ? b === null || b === 0 || Number.isNaN(b as number) : a === b;
  return same ? draft : externalText;
}

/**
 * A crud's create/edit form screen (`…/new`, `…/edit`). When its save lands on the record, the
 * record REPLACES the form on the native stack: Back then returns to where the user came from (the
 * listing, or the record before Edit), not to a form already submitted.
 */
export function isFormRoute(route: string | null | undefined): boolean {
  return /\/(new|edit)\/?$/.test((route ?? '').trim());
}

/**
 * The native screen stack after navigating to `target` from a pushed screen: a route ALREADY on the
 * stack (or the tab's own base route) is gone BACK to — no second copy of the listing over the
 * record; otherwise it is pushed, or takes the top's place when `replaceTop` (a saved form).
 */
export function stackAfterGoTo<T extends { route: string }>(stack: T[], baseRoute: string, target: T, replaceTop: boolean): T[] {
  const norm = (r: string) => r.replace(/^\/+|\/+$/g, '');
  const want = norm(target.route);
  for (let i = stack.length - 1; i >= 0; i--) if (norm(stack[i].route) === want) return stack.slice(0, i + 1);
  if (norm(baseRoute) === want) return [];
  if (replaceTop && stack.length > 0) return [...stack.slice(0, -1), target];
  return [...stack, target];
}
