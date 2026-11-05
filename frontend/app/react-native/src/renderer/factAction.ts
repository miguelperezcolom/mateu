/**
 * The optional action of an EntityHeader fact (the pencil next to "EMPRESA"): what its icon button
 * shows and runs — `actionId` with the fact's `parameters`, exactly like a Button — or null for a
 * display-only fact. Icons arrive as web tokens ("vaadin:pencil", Redwood's "oj-ux-ico-…"): a known
 * one is its Material icon, a short emoji is drawn as it is, anything else is Material's pencil —
 * never the token as text.
 */
import { materialIconOf } from '../ui/wireIcons.ts';
export interface FactWithAction {
  label?: string;
  actionId?: string;
  icon?: string;
  actionLabel?: string;
  parameters?: Record<string, unknown>;
}

export const FACT_ACTION_GLYPH = '✎';

export const factAction = (
  fact: FactWithAction,
): { actionId: string; parameters?: Record<string, unknown>; label: string; glyph: string; icon?: string } | null => {
  if (!fact.actionId) return null;
  const label = (fact.actionLabel && fact.actionLabel.trim()) || fact.label || '';
  const token = (fact.icon ?? '').trim();
  const emoji = !!token && token.length <= 4 && !/^[a-z0-9-]+$/i.test(token);
  const glyph = emoji ? token : FACT_ACTION_GLYPH;
  const icon = emoji ? undefined : (materialIconOf(token) ?? 'pencil-outline');
  return { actionId: fact.actionId, parameters: fact.parameters, label, glyph, ...(icon ? { icon } : {}) };
};
