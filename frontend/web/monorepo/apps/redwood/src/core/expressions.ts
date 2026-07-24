/**
 * Tiny expression evaluator for rule filters, validation conditions and `${...}` label
 * interpolation. A hand-rolled recursive-descent parser over the pragmatic subset rule expressions
 * use: literals, identifier paths (`state.total`, `state['a b']`, `data.rows.length`), unary
 * `!`/`-`, arithmetic, comparisons (`==`/`!=` are loose like the web's evaluator), `&&`/`||` and the
 * ternary. Unknown syntax throws — callers decide the fallback.
 *
 * Ported verbatim from the React Native renderer (frontend/app/react-native/src/core/expressions.ts)
 * — a `new Function`-free evaluator, safe to reuse anywhere.
 */

type Ctx = Record<string, unknown>;

interface Token {
  type: 'num' | 'str' | 'id' | 'op';
  value: string;
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
      tokens.push({ type: 'str', value: out });
      i = j + 1;
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
    if (['==', '!=', '>=', '<=', '&&', '||', '??'].includes(two)) { tokens.push({ type: 'op', value: two }); i += 2; continue; }
    if ('+-*/%<>!?:().[],'.includes(ch)) { tokens.push({ type: 'op', value: ch }); i++; continue; }
    throw new Error(`unexpected character '${ch}' in expression`);
  }
  return tokens;
}

class Parser {
  private pos = 0;
  constructor(private tokens: Token[], private ctx: Ctx) {}

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
      if (op === '==') left = left == right;
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
    for (;;) {
      if (this.isOp('.')) {
        this.eat('.');
        const prop = this.eat().value;
        value = value == null ? undefined : (value as Ctx)[prop];
        continue;
      }
      if (this.isOp('[')) {
        this.eat('[');
        const key = this.ternary();
        this.eat(']');
        value = value == null ? undefined : (value as Ctx)[String(key)];
        continue;
      }
      break;
    }
    return value;
  }

  private primary(): unknown {
    const t = this.peek();
    if (!t) throw new Error('unexpected end of expression');
    if (t.type === 'num') { this.eat(); return parseFloat(t.value); }
    if (t.type === 'str') { this.eat(); return t.value; }
    if (t.type === 'id') {
      this.eat();
      if (t.value === 'true') return true;
      if (t.value === 'false') return false;
      if (t.value === 'null' || t.value === 'undefined') return t.value === 'null' ? null : undefined;
      return this.ctx[t.value];
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
    try {
      const v = evaluateExpression(expr.trim(), ctx);
      return v === null || v === undefined ? '' : String(v);
    } catch {
      return '';
    }
  });
}
