// The OrgChart's focus presentation (OrgChartDto.display = "focus", Redwood's hierarchy viewer):
// one node in focus, its chain of ancestors above, its children below. The decisions that are not
// drawing — which presentation, where the chart opens, the ancestor chain, the initials, how many
// ancestors a phone hides — live here, pure, tested by node's runner (orgChart.test.ts).

export interface OrgChartNode {
  id?: string;
  title?: string;
  subtitle?: string;
  avatar?: string;
  children?: OrgChartNode[];
}

/** The presentation: "focus" only when the wire says so; null, unknown or "tree" read as tree. */
export const orgDisplay = (display: unknown): 'tree' | 'focus' =>
  typeof display === 'string' && display.trim().toLowerCase() === 'focus' ? 'focus' : 'tree';

/** The children of a node (none when absent). */
export const orgChildren = <T extends OrgChartNode>(node: T | undefined): T[] =>
  ((node?.children ?? []) as T[]).filter((c) => !!c);

/**
 * The path root → … → the node whose `id` equals `id` (compared as strings), depth first; undefined
 * when no node has that id (or `id` is null/blank).
 */
export function orgPathTo<T extends OrgChartNode>(root: T | undefined, id: unknown): T[] | undefined {
  if (!root || id === null || id === undefined) return undefined;
  const wanted = String(id);
  if (!wanted) return undefined;
  const walk = (node: T, trail: T[]): T[] | undefined => {
    const path = [...trail, node];
    if (node.id !== undefined && node.id !== null && String(node.id) === wanted) return path;
    for (const child of orgChildren(node)) {
      const found = walk(child, path);
      if (found) return found;
    }
    return undefined;
  };
  return walk(root, []);
}

/** The node with that id, or undefined. */
export const findOrgNode = <T extends OrgChartNode>(root: T | undefined, id: unknown): T | undefined => {
  const path = orgPathTo(root, id);
  return path ? path[path.length - 1] : undefined;
};

/** Where a focused chart opens: the path to the node `focus` names, else just the root. */
export const initialOrgPath = <T extends OrgChartNode>(root: T | undefined, focus: unknown): T[] =>
  root ? (orgPathTo(root, focus) ?? [root]) : [];

/** The ancestors of the focused node (root first) — the path without its last node. */
export const orgAncestors = <T>(path: T[]): T[] => path.slice(0, Math.max(0, path.length - 1));

/**
 * The ancestors shown above the focused card: all of them, except on a phone, where only the direct
 * parent shows and the rest fold behind "N more levels" (until expanded).
 */
export function visibleAncestors<T>(ancestors: T[], phone: boolean, expanded: boolean): { hidden: number; shown: T[] } {
  if (!phone || expanded || ancestors.length <= 1) return { hidden: 0, shown: ancestors };
  return { hidden: ancestors.length - 1, shown: ancestors.slice(-1) };
}

/** The fold's label: "1 more level", "3 more levels". */
export const moreLevelsLabel = (n: number): string => `${n} more level${n === 1 ? '' : 's'}`;

/** The heading above the focused node's children. */
export const reportsLabel = (n: number): string => `Reports (${n})`;

/** Whether an avatar is a picture (http/data URI) rather than a glyph. */
const isPicture = (avatar?: string): boolean =>
  !!avatar && (avatar.startsWith('http') || avatar.startsWith('data:'));

/**
 * What the card's round badge shows when the avatar is not a picture: the avatar glyph (an emoji, a
 * letter), else the initials of the first two words of the title ("Ada Lovelace" → "AL"), else "?".
 */
export function orgInitials(node: OrgChartNode): string {
  if (node.avatar && !isPicture(node.avatar) && !node.avatar.includes(':')) return node.avatar;
  const words = (node.title ?? '').trim().split(/\s+/).filter(Boolean);
  const letters = words.slice(0, 2).map((w) => Array.from(w)[0] ?? '').join('').toUpperCase();
  return letters || '?';
}

/** A node as a screen reader names it: "title, subtitle". */
export const orgNodeLabel = (node: OrgChartNode): string =>
  [node.title, node.subtitle].filter((s) => !!s && String(s).trim()).join(', ');
