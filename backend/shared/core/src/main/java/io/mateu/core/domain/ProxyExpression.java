package io.mateu.core.domain;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

/**
 * The expression subset a REST source template evaluates on the SERVER — the proxied leg — with the
 * meaning the browser's sandboxed evaluator ({@code libs/mateu infra/ui/expression.ts}) gives it,
 * so flipping a source to {@code proxy: true} (an environment overlay does it) does not turn a
 * working {@code ${(state.page ?? 0) * 20}} into an empty value.
 *
 * <p>Supported: literals (numbers, {@code '…'}/{@code "…"}, {@code true false null undefined}), the
 * roots {@code state} and {@code secret} (any other bare name reads the state, so {@code
 * searchText}/{@code page}/{@code size} work as in the browser), member access {@code a.b}, {@code
 * a?.b}, {@code a[i]}, {@code a?.[i]}, unary {@code ! - +}, {@code * / % + -}, comparisons, {@code
 * == !=} (loose) and {@code === !==} (strict), {@code && || ??}, the conditional {@code ?:},
 * parentheses, number literals with an exponent ({@code 1e3}), a string's characters ({@code
 * s[0]}), the calls {@code encodeURIComponent(x)}, {@code String(x)}, {@code Number(x)}, {@code
 * JSON.stringify(x)}, {@code Math.round/floor/ceil/abs/min/max}, and the pure methods in {@link
 * #METHODS} of a string, number or list ({@code state.code.toLowerCase()}). {@code data}, {@code
 * appState} and {@code appData} exist only in the browser: on the server they are absent
 * (undefined), and the validator says so for a proxied source.
 *
 * <p>Anything else is {@link Unsupported}: the caller renders the placeholder empty (as before) and
 * logs it, rather than guessing. Never evaluates code: there is no assignment, no arbitrary call,
 * no property beyond plain map/list/string access.
 */
public final class ProxyExpression {

  /** An expression outside the supported subset. */
  public static final class Unsupported extends RuntimeException {
    Unsupported(String message) {
      super(message);
    }
  }

  /** {@code undefined}: what an absent name or member evaluates to (distinct from null). */
  public static final Object UNDEFINED =
      new Object() {
        @Override
        public String toString() {
          return "undefined";
        }
      };

  /** The names that exist only in the browser's scope. */
  public static final List<String> CLIENT_ONLY_ROOTS = List.of("data", "appState", "appData");

  private final String src;
  private final List<String> tokens;
  private int pos;
  private final Map<String, Object> state;
  private final Function<String, String> secrets;

  private ProxyExpression(String src, Map<String, Object> state, Function<String, String> secrets) {
    this.src = src;
    this.tokens = tokenize(src);
    this.state = state;
    this.secrets = secrets;
  }

  /**
   * The value {@code expression} names against the state (and the server's secrets): a Java value,
   * null, or {@link #UNDEFINED}.
   *
   * @throws Unsupported for syntax outside the subset
   */
  public static Object evaluate(
      String expression, Map<String, Object> state, Function<String, String> secrets) {
    var e = new ProxyExpression(expression, state == null ? Map.of() : state, secrets);
    var value = e.expression(0);
    if (e.pos < e.tokens.size()) {
      throw new Unsupported("unexpected '" + e.tokens.get(e.pos) + "' in ${" + expression + "}");
    }
    return value;
  }

  /**
   * Whether {@code expression} parses within the subset — evaluating it against an empty state. The
   * validator uses it to flag a proxied source's template the server cannot evaluate.
   */
  public static boolean isSupported(String expression) {
    try {
      evaluate(expression, Map.of(), key -> null);
      return true;
    } catch (Unsupported e) {
      return false;
    } catch (RuntimeException e) {
      return true; // a runtime problem with THIS empty state, not the syntax
    }
  }

  // ── tokens ──────────────────────────────────────────────────────────────────────────────────

  private static final List<String> PUNCTUATORS =
      List.of(
          "===", "!==", "?.[", "?.", "??", "==", "!=", "<=", ">=", "&&", "||", "(", ")", "[", "]",
          ".", ",", "?", ":", "!", "+", "-", "*", "/", "%", "<", ">");

  private static List<String> tokenize(String s) {
    var out = new ArrayList<String>();
    int i = 0;
    while (i < s.length()) {
      char c = s.charAt(i);
      if (Character.isWhitespace(c)) {
        i++;
        continue;
      }
      if (c == '\'' || c == '"') {
        var sb = new StringBuilder("\u0000"); // marks a string token
        int j = i + 1;
        while (j < s.length() && s.charAt(j) != c) {
          char ch = s.charAt(j);
          if (ch == '\\' && j + 1 < s.length()) {
            char n = s.charAt(++j);
            sb.append(
                switch (n) {
                  case 'n' -> '\n';
                  case 't' -> '\t';
                  case 'r' -> '\r';
                  default -> n;
                });
          } else {
            sb.append(ch);
          }
          j++;
        }
        if (j >= s.length()) {
          throw new Unsupported("unterminated string in ${" + s + "}");
        }
        out.add(sb.toString());
        i = j + 1;
        continue;
      }
      if (Character.isDigit(c)
          || (c == '.' && i + 1 < s.length() && Character.isDigit(s.charAt(i + 1)))) {
        int j = i;
        while (j < s.length() && (Character.isDigit(s.charAt(j)) || s.charAt(j) == '.')) j++;
        // an exponent, as in JS: 1e3, 2.5E-2
        if (j < s.length() && (s.charAt(j) == 'e' || s.charAt(j) == 'E')) {
          int k = j + 1;
          if (k < s.length() && (s.charAt(k) == '+' || s.charAt(k) == '-')) k++;
          if (k < s.length() && Character.isDigit(s.charAt(k))) {
            while (k < s.length() && Character.isDigit(s.charAt(k))) k++;
            j = k;
          }
        }
        out.add(s.substring(i, j));
        i = j;
        continue;
      }
      if (Character.isLetter(c) || c == '_' || c == '$') {
        int j = i;
        while (j < s.length()
            && (Character.isLetterOrDigit(s.charAt(j)) || s.charAt(j) == '_' || s.charAt(j) == '$'))
          j++;
        out.add(s.substring(i, j));
        i = j;
        continue;
      }
      String matched = null;
      for (var p : PUNCTUATORS) {
        if (s.startsWith(p, i)) {
          // `a ?.5 : b` is a conditional, not optional chaining (JS's rule)
          if (p.equals("?.") && i + 2 < s.length() && Character.isDigit(s.charAt(i + 2))) continue;
          matched = p;
          break;
        }
      }
      if (matched == null) {
        throw new Unsupported("'" + c + "' is not supported in ${" + s + "}");
      }
      out.add(matched);
      i += matched.length();
    }
    return out;
  }

  private String peek() {
    return pos < tokens.size() ? tokens.get(pos) : null;
  }

  private String next() {
    if (pos >= tokens.size()) {
      throw new Unsupported("unexpected end of ${" + src + "}");
    }
    return tokens.get(pos++);
  }

  private void expect(String token) {
    var t = next();
    if (!token.equals(t)) {
      throw new Unsupported("expected '" + token + "' but found '" + t + "' in ${" + src + "}");
    }
  }

  // ── grammar (precedence climbing; short-circuit forms evaluate lazily) ───────────────────────

  private static int precedence(String op) {
    if (op == null) return -1;
    return switch (op) {
      case "??" -> 1;
      case "||" -> 2;
      case "&&" -> 3;
      case "==", "!=", "===", "!==" -> 4;
      case "<", "<=", ">", ">=" -> 5;
      case "+", "-" -> 6;
      case "*", "/", "%" -> 7;
      default -> -1;
    };
  }

  /** An expression whose binary operators bind tighter than {@code minPrec}, then `?:`. */
  private Object expression(int minPrec) {
    var left = binary(minPrec);
    if (minPrec == 0 && "?".equals(peek())) {
      next();
      // both branches are PARSED; the one not taken is skipped (never evaluated), as in JS
      boolean taken = truthy(left);
      var whenTrue = skipping(!taken, () -> expression(0));
      expect(":");
      var whenFalse = skipping(taken, () -> expression(0));
      return taken ? whenTrue : whenFalse;
    }
    return left;
  }

  private Object binary(int minPrec) {
    var left = unary();
    while (true) {
      var op = peek();
      int prec = precedence(op);
      if (prec < 0 || prec < minPrec) {
        return left;
      }
      next();
      final var l = left;
      // the short-circuit operators skip their right side when the left one decides
      boolean decided =
          switch (op) {
            case "??" -> !(l == null || l == UNDEFINED);
            case "||" -> truthy(l);
            case "&&" -> !truthy(l);
            default -> false;
          };
      var right = skipping(decided, () -> binary(prec + 1));
      left = skip || decided ? (decided ? l : UNDEFINED) : apply(op, l, right);
    }
  }

  /** Whether the expression being parsed is in a branch that is not taken. */
  private boolean skip;

  private Object skipping(boolean skipThis, java.util.function.Supplier<Object> body) {
    boolean before = skip;
    skip = before || skipThis;
    try {
      return body.get();
    } finally {
      skip = before;
    }
  }

  private Object unary() {
    var t = peek();
    if ("!".equals(t)) {
      next();
      return !truthy(unary());
    }
    if ("-".equals(t)) {
      next();
      return -toNumber(unary());
    }
    if ("+".equals(t)) {
      next();
      return toNumber(unary());
    }
    return postfix(primary());
  }

  private Object primary() {
    var t = next();
    if ("(".equals(t)) {
      var v = expression(0);
      expect(")");
      return v;
    }
    if (t.startsWith("\u0000")) {
      return t.substring(1);
    }
    if (Character.isDigit(t.charAt(0)) || t.charAt(0) == '.') {
      try {
        return Double.parseDouble(t);
      } catch (NumberFormatException e) {
        throw new Unsupported("'" + t + "' is not a number in ${" + src + "}");
      }
    }
    return switch (t) {
      case "true" -> Boolean.TRUE;
      case "false" -> Boolean.FALSE;
      case "null" -> null;
      case "undefined" -> UNDEFINED;
      case "encodeURIComponent", "String", "Number" -> call(t);
      case "JSON" -> {
        expect(".");
        var member = next();
        if (!"stringify".equals(member)) {
          throw new Unsupported("JSON." + member + " is not supported in ${" + src + "}");
        }
        yield call("JSON.stringify");
      }
      case "Math" -> MATH;
      case "state" -> skip ? UNDEFINED : state;
      case "secret" -> new SecretScope();
      default -> {
        if (!Character.isLetter(t.charAt(0)) && t.charAt(0) != '_' && t.charAt(0) != '$') {
          throw new Unsupported("unexpected '" + t + "' in ${" + src + "}");
        }
        if (CLIENT_ONLY_ROOTS.contains(t)) {
          yield UNDEFINED;
        }
        // searchText, page, size… — top-level names the browser offers — live in the state here
        yield state.containsKey(t) ? state.get(t) : UNDEFINED;
      }
    };
  }

  private Object call(String fn) {
    expect("(");
    var arg = expression(0);
    expect(")");
    if (skip) {
      return UNDEFINED;
    }
    return switch (fn) {
      case "encodeURIComponent" -> encodeUriComponent(text(arg));
      case "String" -> text(arg);
      case "Number" -> toNumber(arg);
      default -> stringify(arg);
    };
  }

  private Object postfix(Object value) {
    while (true) {
      var t = peek();
      if (".".equals(t) || "?.".equals(t)) {
        next();
        var name = next();
        if (name.startsWith("\u0000") || !Character.isJavaIdentifierStart(name.charAt(0))) {
          throw new Unsupported("a member name was expected in ${" + src + "}");
        }
        boolean calls = "(".equals(peek());
        if ("?.".equals(t) && (value == null || value == UNDEFINED)) {
          if (calls) skipping(true, this::arguments);
          value = UNDEFINED;
          continue;
        }
        value = calls ? callMethod(value, name, arguments()) : member(value, name);
      } else if ("[".equals(t) || "?.[".equals(t)) {
        next();
        var key = expression(0);
        expect("]");
        if ("?.[".equals(t) && (value == null || value == UNDEFINED)) {
          value = UNDEFINED;
          continue;
        }
        value = member(value, key);
      } else if ("(".equals(t)) {
        throw new Unsupported(
            "only encodeURIComponent, String, Number, JSON.stringify, Math functions and"
                + " allow-listed string/number/list methods can be called");
      } else {
        return value;
      }
    }
  }

  /** {@code obj[key]}: a map entry, a list element, a string's length/char. Nothing else. */
  private Object member(Object obj, Object key) {
    if (skip) {
      return UNDEFINED;
    }
    if (obj == null || obj == UNDEFINED) {
      // a.b on null throws in the browser; the placeholder renders empty either way
      throw new IllegalStateException("cannot read '" + text(key) + "' of " + text(obj));
    }
    if (obj instanceof SecretScope) {
      return secrets != null ? secrets.apply(text(key)) : UNDEFINED;
    }
    var name =
        key instanceof Double d && d == Math.rint(d) ? String.valueOf(d.longValue()) : text(key);
    if (obj instanceof Map<?, ?> map) {
      return map.containsKey(name) ? map.get(name) : UNDEFINED;
    }
    if (obj instanceof List<?> list) {
      if ("length".equals(name)) return (double) list.size();
      try {
        int i = Integer.parseInt(name);
        return i >= 0 && i < list.size() ? list.get(i) : UNDEFINED;
      } catch (NumberFormatException e) {
        return UNDEFINED;
      }
    }
    if (obj instanceof String s) {
      if ("length".equals(name)) return (double) s.length();
      try {
        int i = Integer.parseInt(name);
        return i >= 0 && i < s.length() ? String.valueOf(s.charAt(i)) : UNDEFINED;
      } catch (NumberFormatException e) {
        return UNDEFINED;
      }
    }
    return UNDEFINED;
  }

  /** {@code (a, b, …)} after a callee: the arguments, evaluated (skipped in an untaken branch). */
  private List<Object> arguments() {
    expect("(");
    var args = new ArrayList<Object>();
    if (")".equals(peek())) {
      next();
      return args;
    }
    while (true) {
      args.add(expression(0));
      var t = next();
      if (")".equals(t)) return args;
      if (!",".equals(t)) {
        throw new Unsupported("expected ',' or ')' but found '" + t + "' in ${" + src + "}");
      }
    }
  }

  /** {@code Math}: only its pure rounding / min / max functions are reachable. */
  private static final Object MATH = new Object();

  private static final java.util.Set<String> MATH_FUNCTIONS =
      java.util.Set.of("round", "floor", "ceil", "abs", "min", "max");

  /** The methods of a string, number or list an expression may call — pure ones only. */
  public static final java.util.Set<String> METHODS =
      java.util.Set.of(
          "toLowerCase",
          "toUpperCase",
          "trim",
          "includes",
          "startsWith",
          "endsWith",
          "slice",
          "substring",
          "indexOf",
          "padStart",
          "padEnd",
          "toString",
          "toFixed",
          "join");

  /** {@code value.name(args)}, with JavaScript's meaning, for the allow-listed methods only. */
  private Object callMethod(Object value, String name, List<Object> args) {
    if (value == MATH) {
      if (!MATH_FUNCTIONS.contains(name)) {
        throw new Unsupported("Math." + name + " is not supported in ${" + src + "}");
      }
      return skip ? UNDEFINED : math(name, args);
    }
    if (!METHODS.contains(name)) {
      throw new Unsupported("'" + name + "' cannot be called in ${" + src + "}");
    }
    if (skip) return UNDEFINED;
    if (value == null || value == UNDEFINED) {
      throw new IllegalStateException("cannot call '" + name + "' of " + text(value));
    }
    Object a0 = args.isEmpty() ? UNDEFINED : args.get(0);
    Object a1 = args.size() < 2 ? UNDEFINED : args.get(1);
    if (value instanceof String s) return stringMethod(s, name, a0, a1);
    if (value instanceof Number n) return numberMethod(n, name, a0);
    if (value instanceof List<?> list) return listMethod(list, name, a0, a1);
    if (value instanceof Boolean b && "toString".equals(name)) return String.valueOf(b);
    throw new IllegalStateException("'" + name + "' is not callable on " + text(value));
  }

  private static Object stringMethod(String s, String name, Object a0, Object a1) {
    return switch (name) {
      case "toLowerCase" -> s.toLowerCase(java.util.Locale.ROOT);
      case "toUpperCase" -> s.toUpperCase(java.util.Locale.ROOT);
      case "trim" -> s.strip();
      case "includes" -> s.contains(text(a0));
      case "startsWith" -> s.startsWith(text(a0));
      case "endsWith" -> s.endsWith(text(a0));
      case "indexOf" -> (double) s.indexOf(text(a0));
      case "slice" -> {
        int[] r = sliceRange(s.length(), a0, a1);
        yield r[0] < r[1] ? s.substring(r[0], r[1]) : "";
      }
      case "substring" -> {
        int from = clamp(toInteger(a0), s.length());
        int to = a1 == UNDEFINED ? s.length() : clamp(toInteger(a1), s.length());
        yield s.substring(Math.min(from, to), Math.max(from, to));
      }
      case "padStart" -> pad(s, a0, a1, true);
      case "padEnd" -> pad(s, a0, a1, false);
      case "toString" -> s;
      default -> throw new IllegalStateException("'" + name + "' is not a string method");
    };
  }

  private static Object numberMethod(Number n, String name, Object a0) {
    return switch (name) {
      case "toString" -> text(n.doubleValue());
      case "toFixed" -> {
        long digits = a0 == UNDEFINED ? 0 : toInteger(a0);
        if (digits < 0 || digits > 100) throw new IllegalStateException("toFixed digits");
        yield new java.math.BigDecimal(n.doubleValue())
            .setScale((int) digits, java.math.RoundingMode.HALF_UP)
            .toPlainString();
      }
      default -> throw new IllegalStateException("'" + name + "' is not a number method");
    };
  }

  private static Object listMethod(List<?> list, String name, Object a0, Object a1) {
    return switch (name) {
      case "join" -> {
        var sep = a0 == UNDEFINED ? "," : text(a0);
        var parts = new ArrayList<String>();
        for (var item : list) parts.add(text(item));
        yield String.join(sep, parts);
      }
      case "includes" -> list.stream().anyMatch(item -> strictEquals(item, a0));
      case "indexOf" -> {
        double found = -1;
        for (int i = 0; i < list.size() && found < 0; i++) {
          if (strictEquals(list.get(i), a0)) found = i;
        }
        yield found;
      }
      case "slice" -> {
        int[] r = sliceRange(list.size(), a0, a1);
        yield r[0] < r[1] ? new ArrayList<Object>(list.subList(r[0], r[1])) : new ArrayList<>();
      }
      case "toString" -> text(list);
      default -> throw new IllegalStateException("'" + name + "' is not a list method");
    };
  }

  private static Object math(String name, List<Object> args) {
    Object a0 = args.isEmpty() ? UNDEFINED : args.get(0);
    return switch (name) {
      case "round" -> {
        double d = toNumber(a0);
        yield Double.isNaN(d) || Double.isInfinite(d) ? d : Math.floor(d + 0.5);
      }
      case "floor" -> Math.floor(toNumber(a0));
      case "ceil" -> Math.ceil(toNumber(a0));
      case "abs" -> Math.abs(toNumber(a0));
      default -> minMax("min".equals(name), args);
    };
  }

  private static double minMax(boolean min, List<Object> args) {
    double acc = min ? Double.POSITIVE_INFINITY : Double.NEGATIVE_INFINITY;
    for (var a : args) {
      double d = toNumber(a);
      if (Double.isNaN(d)) return Double.NaN;
      acc = min ? Math.min(acc, d) : Math.max(acc, d);
    }
    return acc;
  }

  /** JavaScript's ToIntegerOrInfinity, clamped to the int range (NaN → 0). */
  private static long toInteger(Object v) {
    double d = toNumber(v);
    if (Double.isNaN(d)) return 0;
    return (long) Math.max(Integer.MIN_VALUE, Math.min(Integer.MAX_VALUE, d));
  }

  private static int clamp(long i, int length) {
    return (int) Math.max(0, Math.min(i, length));
  }

  /** {@code slice(start, end)}'s range: a negative index counts from the end, then clamped. */
  private static int[] sliceRange(int length, Object start, Object end) {
    long s = start == UNDEFINED ? 0 : toInteger(start);
    long e = end == UNDEFINED ? length : toInteger(end);
    int from = (int) (s < 0 ? Math.max(length + s, 0) : Math.min(s, length));
    int to = (int) (e < 0 ? Math.max(length + e, 0) : Math.min(e, length));
    return new int[] {from, to};
  }

  private static String pad(String s, Object length, Object filler, boolean start) {
    long target = toInteger(length);
    var fill = filler == UNDEFINED ? " " : text(filler);
    if (target <= s.length() || fill.isEmpty()) return s;
    if (target > 10_000) throw new IllegalStateException("pad length");
    var padding = new StringBuilder();
    while (padding.length() < target - s.length()) padding.append(fill);
    padding.setLength((int) (target - s.length()));
    return start ? padding + s : s + padding;
  }

  /** The server's secrets, reachable only as {@code secret.KEY} / {@code secret['KEY']}. */
  private static final class SecretScope {}

  // ── JavaScript semantics ─────────────────────────────────────────────────────────────────────

  private Object apply(String op, Object l, Object r) {
    return switch (op) {
      case "??" -> (l == null || l == UNDEFINED) ? r : l;
      case "||" -> truthy(l) ? l : r;
      case "&&" -> truthy(l) ? r : l;
      case "==" -> looseEquals(l, r);
      case "!=" -> !looseEquals(l, r);
      case "===" -> strictEquals(l, r);
      case "!==" -> !strictEquals(l, r);
      case "<" -> compare(l, r) < 0;
      case "<=" -> compare(l, r) <= 0;
      case ">" -> compare(l, r) > 0;
      case ">=" -> compare(l, r) >= 0;
      case "+" -> (isStringy(l) || isStringy(r)) ? text(l) + text(r) : toNumber(l) + toNumber(r);
      case "-" -> toNumber(l) - toNumber(r);
      case "*" -> toNumber(l) * toNumber(r);
      case "/" -> toNumber(l) / toNumber(r);
      case "%" -> toNumber(l) % toNumber(r);
      default -> throw new Unsupported("operator " + op);
    };
  }

  private static boolean isStringy(Object v) {
    return v instanceof String || v instanceof Map<?, ?> || v instanceof Collection<?>;
  }

  public static boolean truthy(Object v) {
    if (v == null || v == UNDEFINED) return false;
    if (v instanceof Boolean b) return b;
    if (v instanceof Number n) {
      double d = n.doubleValue();
      return d != 0 && !Double.isNaN(d);
    }
    if (v instanceof String s) return !s.isEmpty();
    return true;
  }

  private static double toNumber(Object v) {
    if (v == null) return 0;
    if (v == UNDEFINED) return Double.NaN;
    if (v instanceof Number n) return n.doubleValue();
    if (v instanceof Boolean b) return b ? 1 : 0;
    var s = text(v).trim();
    if (s.isEmpty()) return 0;
    try {
      return Double.parseDouble(s);
    } catch (NumberFormatException e) {
      return Double.NaN;
    }
  }

  private static boolean looseEquals(Object l, Object r) {
    boolean ln = l == null || l == UNDEFINED;
    boolean rn = r == null || r == UNDEFINED;
    if (ln || rn) return ln && rn;
    if (l instanceof Number
        || r instanceof Number
        || l instanceof Boolean
        || r instanceof Boolean) {
      return toNumber(l) == toNumber(r);
    }
    return text(l).equals(text(r));
  }

  /** {@code ===}: the same JavaScript type and value (objects by identity; NaN never equal). */
  private static boolean strictEquals(Object l, Object r) {
    if (l == UNDEFINED || r == UNDEFINED) return l == r;
    if (l == null || r == null) return l == r;
    if (l instanceof Number a && r instanceof Number b) return a.doubleValue() == b.doubleValue();
    if (l instanceof String a && r instanceof String b) return a.equals(b);
    if (l instanceof Boolean a && r instanceof Boolean b) return a.equals(b);
    if (l instanceof Number || l instanceof String || l instanceof Boolean) return false;
    return l == r;
  }

  private static int compare(Object l, Object r) {
    if (l instanceof String a && r instanceof String b) return a.compareTo(b);
    return Double.compare(toNumber(l), toNumber(r));
  }

  /**
   * A value as JavaScript's {@code String(v)} — what a template literal puts in the text: null and
   * undefined as nothing (Mateu's rule, on every leg), a list as {@code a,b}, a number with no
   * {@code .0}, a money value as its amount (the caller handles money before), an object as {@code
   * [object Object]}.
   */
  public static String text(Object v) {
    if (v == null || v == UNDEFINED) return "";
    if (v instanceof Double d) return number(d);
    if (v instanceof Float f) return number(f.doubleValue());
    if (v instanceof Collection<?> items) {
      var parts = new ArrayList<String>();
      for (var item : items) parts.add(text(item));
      return String.join(",", parts);
    }
    if (v instanceof Map<?, ?>) return "[object Object]";
    return String.valueOf(v);
  }

  private static String number(double d) {
    if (Double.isNaN(d)) return "NaN";
    if (Double.isInfinite(d)) return d > 0 ? "Infinity" : "-Infinity";
    if (d == Math.rint(d) && Math.abs(d) < 1e21) {
      return new java.math.BigDecimal(d).toPlainString();
    }
    return Double.toString(d);
  }

  private static String stringify(Object v) {
    try {
      return new com.fasterxml.jackson.databind.ObjectMapper()
          .writeValueAsString(v == UNDEFINED ? null : v);
    } catch (Exception e) {
      return "";
    }
  }

  /** JavaScript's encodeURIComponent: everything but {@code A-Z a-z 0-9 - _ . ! ~ * ' ( )}. */
  static String encodeUriComponent(String s) {
    var out = new StringBuilder();
    for (byte b : s.getBytes(java.nio.charset.StandardCharsets.UTF_8)) {
      int c = b & 0xff;
      if ((c >= 'A' && c <= 'Z')
          || (c >= 'a' && c <= 'z')
          || (c >= '0' && c <= '9')
          || "-_.!~*'()".indexOf(c) >= 0) {
        out.append((char) c);
      } else {
        out.append('%').append(String.format("%02X", c));
      }
    }
    return out.toString();
  }
}
