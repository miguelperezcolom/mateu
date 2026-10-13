/**
 * The optional action of an EntityHeader fact (the pencil next to "EMPRESA"): what its icon button
 * shows and runs — `actionId` with the fact's `parameters`, exactly like a Button — or null for a
 * display-only fact. Icons arrive as web tokens ("vaadin:pencil"): only an emoji/plain glyph renders
 * natively, anything else falls back to a pencil glyph.
 */
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
): { actionId: string; parameters?: Record<string, unknown>; label: string; glyph: string } | null => {
  if (!fact.actionId) return null;
  const label = (fact.actionLabel && fact.actionLabel.trim()) || fact.label || '';
  const glyph = fact.icon && !fact.icon.includes(':') ? fact.icon : FACT_ACTION_GLYPH;
  return { actionId: fact.actionId, parameters: fact.parameters, label, glyph };
};
