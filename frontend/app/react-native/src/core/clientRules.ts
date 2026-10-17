// The client-side rule engine (RuleMapper wire: filter → action on fields/state), lifted out of
// the view controller. It mutates the live state and the field-attribute overrides it is handed
// and reports whether anything the renderers read changed. Tested by node's runner.
import { evaluateExpression } from './expressions.ts';
import { str } from './viewWire.ts';

type Json = Record<string, any>;

/**
 * Evaluates `rules` in order against `ctx`: a rule whose filter holds (no filter = holds; a filter
 * that throws does not) runs its action — SetStateValue/SetDataValue write `state`,
 * SetAttributeValue writes `fieldAttributes`, RunAction calls `runAction`; `result: Stop` ends the
 * pass. RunJS / SetCssClass / SetStyle need a DOM + eval and are not applicable on this renderer.
 * Returns true when a state value or a field attribute changed.
 */
export function applyClientRules(
  rules: Json[],
  ctx: Record<string, unknown>,
  state: Json,
  fieldAttributes: Record<string, Json>,
  runAction: (actionId: string) => void,
): boolean {
  let changed = false;
  for (const rule of rules) {
    let matches = true;
    const filter = str(rule['filter']);
    if (filter) {
      try {
        matches = Boolean(evaluateExpression(filter, ctx));
      } catch {
        matches = false;
      }
    }
    if (!matches) continue;
    const action = str(rule['action']);
    const value = () => {
      const expression = str(rule['expression']);
      if (expression) {
        try {
          return evaluateExpression(expression, ctx);
        } catch {
          return rule['value'];
        }
      }
      return rule['value'];
    };
    if (action === 'SetStateValue' || action === 'SetDataValue') {
      for (const fieldName of str(rule['fieldName']).split(',')) {
        const attr = str(rule['fieldAttribute']);
        const key = !attr || attr === 'none' ? fieldName : `${fieldName}.${attr}`;
        const v = value();
        if (state[key] !== v) {
          state[key] = v;
          changed = true;
        }
      }
    } else if (action === 'SetAttributeValue') {
      for (const fieldName of str(rule['fieldName']).split(',')) {
        const attr = str(rule['fieldAttribute']);
        if (!attr || attr === 'none') continue;
        const v = value();
        const attrs = (fieldAttributes[fieldName] ??= {});
        if (attrs[attr] !== v) {
          attrs[attr] = v;
          changed = true;
        }
      }
    } else if (action === 'RunAction') {
      const actionId = str(rule['actionId']);
      if (actionId) runAction(actionId);
    }
    if (str(rule['result']) === 'Stop') break;
  }
  return changed;
}
