import { i18nKeyOf } from './i18nKeys.ts';
import { interpolateUrlWith } from './urlTemplate.ts';

/**
 * Tiny expression evaluator for rule filters, validation conditions and `${...}` label
 * interpolation. Hermes (React Native's JS engine) forbids `eval`/`new Function`, so this is a
 * hand-rolled recursive-descent parser over the pragmatic subset rule expressions use:
 * literals, identifier paths (`state.total`, `state['a b']`, `data.rows.length`), optional
 * chaining (`?.`, `?.[]`), unary `!`/`-`, arithmetic, comparisons (`==`/`!=` are loose like the
 * web's evaluator), `&&`/`||`/`??`, the ternary and regex literals with `.test(…)` (the server's
 * @Pattern condition). Unknown syntax throws — callers decide the fallback. Held to the client
 * conformance corpus (conformance/client/expressions.json) with the web, Redwood and IntelliJ.
 */

type Ctx = Record<string, unknown>;

interface Token {
  type: 'num' | 'str' | 'id' | 'op' | 're';
  value: string;
  regex?: RegExp;
}

/** A `/` starts a regex literal where a VALUE is expected — at the start or after an operator
 *  other than a closing bracket; after a value it is a division. */
function regexAllowed(prev: Token | undefined): boolean {
  if (!prev) return true;
  if (prev.type !== 'op') return false;
  return prev.value !== ')' && prev.value !== ']';
}

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(src[i + 1] ?? ''))) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      tokens.push({ type: 'num', value: src.slice(i, j) });
      i = j;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      let j = i + 1;
      let out = '';
      while (j < src.length && src[j] !== ch) {
        if (src[j] === '\\') { out += src[j + 1]; j += 2; continue; }
        out += src[j];
        j++;
      }
      if (j >= src.length) throw new Error('unterminated string in expression');
      tokens.push({ type: 'str', value: out });
      i = j + 1;
      continue;
    }
    if (ch === '/' && regexAllowed(tokens[tokens.length - 1])) {
      let j = i + 1;
      let inClass = false;
      while (j < src.length && (inClass || src[j] !== '/')) {
        if (src[j] === '\\') j++;
        else if (src[j] === '[') inClass = true;
        else if (src[j] === ']') inClass = false;
        j++;
      }
      if (j >= src.length) throw new Error('unterminated regex in expression');
      let k = j + 1;
      while (k < src.length && /[a-z]/.test(src[k])) k++;
      const body = src.slice(i + 1, j);
      tokens.push({ type: 're', value: body, regex: new RegExp(body, src.slice(j + 1, k)) });
      i = k;
      continue;
    }
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++;
      tokens.push({ type: 'id', value: src.slice(i, j) });
      i = j;
      continue;
    }
    const three = src.slice(i, i + 3);
    if (three === '===' || three === '!==') { tokens.push({ type: 'op', value: three }); i += 3; continue; }
    const two = src.slice(i, i + 2);
    // `?.` is optional chaining unless a digit follows (`a?.5:1` is a ternary)
    if (two === '?.' && !/[0-9]/.test(src[i + 2] ?? '')) { tokens.push({ type: 'op', value: '?.' }); i += 2; continue; }
    if (['==', '!=', '>=', '<=', '&&', '||', '??'].includes(two)) { tokens.push({ type: 'op', value: two }); i += 2; continue; }
    if ('+-*/%<>!?:().[],'.includes(ch)) { tokens.push({ type: 'op', value: ch }); i++; continue; }
    throw new Error(`unexpected character '${ch}' in expression`);
  }
  return tokens;
}

/** Properties an expression may never read: the routes from a value back to `Function` (the same
 *  set as the web evaluator, libs/mateu infra/ui/expression.ts). */
const BLOCKED_PROPERTIES = new Set([
  'constructor', '__proto__', 'prototype', '__defineGetter__', '__defineSetter__',
  '__lookupGetter__', '__lookupSetter__',
]);

/** Reads `key` of `value`, refusing the blocked properties (throws, like the web evaluator). */
function member(value: unknown, key: string): unknown {
  if (BLOCKED_PROPERTIES.has(key)) throw new Error(`Access to '${key}' is not allowed in expressions`);
  return value == null ? undefined : (value as Ctx)[key];
}

class Parser {
  private pos = 0;
  private tokens: Token[];
  private ctx: Ctx;
  constructor(tokens: Token[], ctx: Ctx) {
    this.tokens = tokens;
    this.ctx = ctx;
  }

  parse(): unknown {
    const v = this.ternary();
    if (this.pos < this.tokens.length) throw new Error('trailing tokens in expression');
    return v;
  }

  private peek(): Token | undefined { return this.tokens[this.pos]; }
  private isOp(value: string): boolean { return this.peek()?.type === 'op' && this.peek()?.value === value; }
  private eat(value?: string): Token {
    const t = this.tokens[this.pos++];
    if (!t || (value !== undefined && t.value !== value)) throw new Error(`expected '${value}'`);
    return t;
  }

  private ternary(): unknown {
    const cond = this.or();
    if (this.isOp('?')) {
      this.eat('?');
      const a = this.ternary();
      this.eat(':');
      const b = this.ternary();
      return cond ? a : b;
    }
    return cond;
  }

  private or(): unknown {
    let left = this.and();
    while (this.isOp('||') || this.isOp('??')) {
      const op = this.eat().value;
      const right = this.and();
      left = op === '||' ? (left || right) : (left ?? right);
    }
    return left;
  }

  private and(): unknown {
    let left = this.equality();
    while (this.isOp('&&')) {
      this.eat('&&');
      const right = this.equality();
      left = left && right;
    }
    return left;
  }

  private equality(): unknown {
    let left = this.comparison();
    while (this.isOp('==') || this.isOp('!=') || this.isOp('===') || this.isOp('!==')) {
      const op = this.eat().value;
      const right = this.comparison();
      // eslint-disable-next-line eqeqeq
      if (op === '==') left = left == right;
      // eslint-disable-next-line eqeqeq
      else if (op === '!=') left = left != right;
      else if (op === '===') left = left === right;
      else left = left !== right;
    }
    return left;
  }

  private comparison(): unknown {
    let left = this.additive();
    while (this.isOp('>') || this.isOp('<') || this.isOp('>=') || this.isOp('<=')) {
      const op = this.eat().value;
      const right = this.additive();
      const l = left as number;
      const r = right as number;
      left = op === '>' ? l > r : op === '<' ? l < r : op === '>=' ? l >= r : l <= r;
    }
    return left;
  }

  private additive(): unknown {
    let left = this.multiplicative();
    while (this.isOp('+') || this.isOp('-')) {
      const op = this.eat().value;
      const right = this.multiplicative();
      left = op === '+' ? (left as number) + (right as number) : (left as number) - (right as number);
    }
    return left;
  }

  private multiplicative(): unknown {
    let left = this.unary();
    while (this.isOp('*') || this.isOp('/') || this.isOp('%')) {
      const op = this.eat().value;
      const right = this.unary();
      const l = left as number;
      const r = right as number;
      left = op === '*' ? l * r : op === '/' ? l / r : l % r;
    }
    return left;
  }

  private unary(): unknown {
    if (this.isOp('!')) { this.eat('!'); return !this.unary(); }
    if (this.isOp('-')) { this.eat('-'); return -(this.unary() as number); }
    return this.postfix();
  }

  private postfix(): unknown {
    let value = this.primary();
    // once a `?.` met null/undefined, the rest of the chain is parsed but not evaluated
    let short = false;
    for (;;) {
      const optional = this.isOp('?.');
      if (optional) {
        this.eat('?.');
        if (value == null) short = true;
      }
      if (this.isOp('.') || (optional && this.peek()?.type === 'id')) {
        if (!optional) this.eat('.');
        const prop = this.eat();
        if (prop.type !== 'id') throw new Error('expected a property name');
        if (this.isOp('(')) {
          // the one call an expression may make: a regex's `test` (the server's @Pattern condition)
          this.eat('(');
          const arg = this.ternary();
          this.eat(')');
          if (short) continue;
          if (!(value instanceof RegExp) || prop.value !== 'test') throw new Error(`'${prop.value}' is not callable in expressions`);
          value.lastIndex = 0;
          value = value.test(String(arg));
          continue;
        }
        value = short ? undefined : member(value, prop.value);
        continue;
      }
      if (this.isOp('[')) {
        this.eat('[');
        const key = this.ternary();
        this.eat(']');
        value = short ? undefined : member(value, String(key));
        continue;
      }
      if (optional) throw new Error('unexpected ?.');
      break;
    }
    return short ? undefined : value;
  }

  private primary(): unknown {
    const t = this.peek();
    if (!t) throw new Error('unexpected end of expression');
    if (t.type === 'num') { this.eat(); return parseFloat(t.value); }
    if (t.type === 'str') { this.eat(); return t.value; }
    if (t.type === 're') { this.eat(); return t.regex; }
    if (t.type === 'id') {
      this.eat();
      if (t.value === 'true') return true;
      if (t.value === 'false') return false;
      if (t.value === 'null' || t.value === 'undefined') return t.value === 'null' ? null : undefined;
      // only the context's OWN names: `constructor`, `toString`… must not reach Object.prototype
      return Object.prototype.hasOwnProperty.call(this.ctx, t.value) ? this.ctx[t.value] : undefined;
    }
    if (t.value === '(') {
      this.eat('(');
      const v = this.ternary();
      this.eat(')');
      return v;
    }
    throw new Error(`unexpected token '${t.value}'`);
  }
}

/** Evaluates an expression against named context objects (state, data, appState…). Throws on
 *  unsupported syntax. */
export function evaluateExpression(expr: string, ctx: Ctx): unknown {
  return new Parser(tokenize(expr), ctx).parse();
}

/** Replaces every `${expr}` in the template with its evaluated value ('' when it fails or is
 *  null). Returns the template untouched when it has no placeholders. */
export function interpolate(template: string, ctx: Ctx): string {
  if (!template || !template.includes('${')) return template;
  return template.replace(/\$\{([^}]+)\}/g, (_, expr: string) => {
    // `${i18n.key}` is resolved by the server before the wire leaves it; one that still arrives has
    // no catalogue behind it here — show the key, never a blank.
    const key = i18nKeyOf(expr);
    if (key !== undefined) return key;
    try {
      const v = evaluateExpression(expr.trim(), ctx);
      return v === null || v === undefined ? '' : String(v);
    } catch {
      return '';
    }
  });
}

/** A url template interpolated with its values percent-encoded by position (see urlTemplate.ts). */
export function interpolateUrl(template: string, ctx: Ctx): string {
  return interpolateUrlWith(template, (expr) => {
    try {
      return evaluateExpression(expr, ctx);
    } catch {
      return '';
    }
  });
}
