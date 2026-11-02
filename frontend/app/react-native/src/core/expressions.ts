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

/** The globals an expression may CALL — side-effect free, the subset of the web evaluator's GLOBALS a
 *  source template uses (`${String(state.year)}`, `${encodeURIComponent(state.q)}`). */
const GLOBAL_FUNCTIONS: Record<string, (...args: unknown[]) => unknown> = {
  String: (v) => String(v),
  Number: (v) => Number(v),
  Boolean: (v) => Boolean(v),
  parseInt: (v, radix) => parseInt(String(v), radix as number | undefined),
  parseFloat: (v) => parseFloat(String(v)),
  encodeURIComponent: (v) => encodeURIComponent(String(v)),
  decodeURIComponent: (v) => decodeURIComponent(String(v)),
};

/** `Math.x(…)`: read through {@link member}, so only these pure functions are reachable. */
const MATH: Ctx = Object.freeze({
  round: Math.round, floor: Math.floor, ceil: Math.ceil, abs: Math.abs, min: Math.min, max: Math.max,
});

/** Methods of a string or a list an expression may call — pure ones only. */
const STRING_METHODS = new Set([
  'toLowerCase', 'toUpperCase', 'trim', 'includes', 'startsWith', 'endsWith', 'slice', 'substring',
  'indexOf', 'replace', 'split', 'padStart', 'padEnd', 'toString', 'toFixed', 'join',
]);

/** `value.name(args)`: a regex's `test` (the server's @Pattern condition), a `Math` function or an
 *  allow-listed method of a string, number or list; anything else throws. */
function callMethod(value: unknown, name: string, args: unknown[]): unknown {
  if (value instanceof RegExp && name === 'test') {
    value.lastIndex = 0;
    return value.test(String(args[0]));
  }
  if (value === MATH && typeof MATH[name] === 'function') {
    return (MATH[name] as (...a: unknown[]) => unknown)(...args);
  }
  const callable = typeof value === 'string' || typeof value === 'number' || Array.isArray(value);
  if (callable && STRING_METHODS.has(name)) {
    const fn = (value as unknown as Record<string, unknown>)[name];
    if (typeof fn === 'function') return (fn as (...a: unknown[]) => unknown).apply(value, args);
  }
  throw new Error(`'${name}' is not callable in expressions`);
}

/** A MONEY value (`{value, currency}`), which lands in a template as its amount. */
export function isMoney(v: unknown): v is { value: unknown; currency: unknown } {
  return !!v && typeof v === 'object' && !Array.isArray(v) && 'value' in v && 'currency' in v;
}

/** A substituted value as text: nothing for null/undefined, a money value's amount, else String(). */
export function templateText(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (isMoney(v)) return templateText(v.value);
  return String(v);
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
          const args = this.callArguments();
          if (short) continue;
          value = callMethod(value, prop.value, args);
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

  /** `( a, b, … )` — the arguments of a call. */
  private callArguments(): unknown[] {
    this.eat('(');
    const args: unknown[] = [];
    if (!this.isOp(')')) {
      args.push(this.ternary());
      while (this.isOp(',')) {
        this.eat(',');
        args.push(this.ternary());
      }
    }
    this.eat(')');
    return args;
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
      // a call of an allow-listed, side-effect-free global (`String(x)`, `encodeURIComponent(x)`)
      if (this.isOp('(') && Object.prototype.hasOwnProperty.call(GLOBAL_FUNCTIONS, t.value)) {
        return GLOBAL_FUNCTIONS[t.value](...this.callArguments());
      }
      if (t.value === 'Math' && !Object.prototype.hasOwnProperty.call(this.ctx, 'Math')) return MATH;
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
      return templateText(evaluateExpression(expr.trim(), ctx));
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
