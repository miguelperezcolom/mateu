// The legacy regex matcher behind client-side validation: the safety net for condition syntax
// the expression parser does not cover — `state['x']` truthiness and numeric comparisons. Pure
// TypeScript, tested by node's runner.

type Json = Record<string, any>;

/** Client-side validation conditions: `state['x']` truthiness and simple numeric comparisons. */
export function evalCondition(condition: string, state: Json): boolean {
  const comparison = /state\['([^']+)'\]\s*(>=|<=|==|!=|>|<)\s*(-?\d+(?:\.\d+)?)/.exec(condition.trim());
  if (comparison) {
    const left = toNumber(state[comparison[1]]);
    const right = Number(comparison[3]);
    switch (comparison[2]) {
      case '>=': return left >= right;
      case '<=': return left <= right;
      case '>': return left > right;
      case '<': return left < right;
      case '==': return left === right;
      case '!=': return left !== right;
      default: return true;
    }
  }
  const truthy = /state\['([^']+)'\]/.exec(condition.trim());
  if (truthy) return isTruthy(state[truthy[1]]);
  return true;
}

/** Whether a field value counts as filled: non-blank text, non-zero, true, a non-empty list, an object. */
export function isTruthy(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'boolean') return v;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

/** A value as a number; unparseable → 0. */
export function toNumber(v: unknown): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isNaN(n) ? 0 : n;
}
