"""The expression subset a REST source template evaluates on the SERVER — the proxied leg.

The Python twin of Java's ``io.mateu.core.domain.ProxyExpression`` (and of the .NET
``Mateu.Core.ProxyExpression``), with the meaning the browser's sandboxed evaluator
(``libs/mateu infra/ui/expression.ts``) gives it, so flipping a source to ``proxy: true`` does not
turn a working ``${(state.page ?? 0) * 20}`` into an empty value. Pinned by the shared corpus
``conformance/client/source-templates.json``.

Supported: literals (numbers, ``'…'``/``"…"``, ``true false null undefined``), the roots ``state``
and ``secret`` (any other bare name reads the state), member access ``a.b``, ``a?.b``, ``a[i]``,
``a?.[i]``, unary ``! - +``, ``* / % + -``, comparisons, ``== !=`` (loose) and ``=== !==`` (strict),
``&& || ??``, ``?:``, parentheses, number literals with an exponent (``1e3``), a string's characters
(``s[0]``), the calls ``encodeURIComponent``, ``String``, ``Number``, ``JSON.stringify``,
``Math.round/floor/ceil/abs/min/max`` and the pure methods in :data:`METHODS` of a string, number or
list (``state.code.toLowerCase()``).
``data``, ``appState`` and ``appData`` exist only in the browser: here they are undefined.
Anything else raises :class:`Unsupported`. Never evaluates code.
"""

from __future__ import annotations

import decimal
import json
import math
import urllib.parse
from typing import Any, Callable


class Unsupported(Exception):
    """An expression outside the supported subset."""


class _Undefined:
    def __repr__(self) -> str:
        return "undefined"


#: what an absent name or member evaluates to (distinct from None = null)
UNDEFINED: Any = _Undefined()

#: the names that exist only in the browser's scope
CLIENT_ONLY_ROOTS = ("data", "appState", "appData")

_PUNCTUATORS = (
    "===", "!==", "?.[", "?.", "??", "==", "!=", "<=", ">=", "&&", "||", "(", ")", "[", "]",
    ".", ",", "?", ":", "!", "+", "-", "*", "/", "%", "<", ">",
)

_STRING = "\u0000"  # marks a string token


class _SecretScope:
    """The server's secrets, reachable only as ``secret.KEY`` / ``secret['KEY']``."""


def _tokenize(s: str) -> list[str]:
    out: list[str] = []
    i = 0
    while i < len(s):
        c = s[i]
        if c.isspace():
            i += 1
            continue
        if c in "'\"":
            buf = [_STRING]
            j = i + 1
            while j < len(s) and s[j] != c:
                ch = s[j]
                if ch == "\\" and j + 1 < len(s):
                    j += 1
                    buf.append({"n": "\n", "t": "\t", "r": "\r"}.get(s[j], s[j]))
                else:
                    buf.append(ch)
                j += 1
            if j >= len(s):
                raise Unsupported(f"unterminated string in ${{{s}}}")
            out.append("".join(buf))
            i = j + 1
            continue
        if c.isdigit() or (c == "." and i + 1 < len(s) and s[i + 1].isdigit()):
            j = i
            while j < len(s) and (s[j].isdigit() or s[j] == "."):
                j += 1
            # an exponent, as in JS: 1e3, 2.5E-2
            if j < len(s) and s[j] in "eE":
                k = j + 1
                if k < len(s) and s[k] in "+-":
                    k += 1
                if k < len(s) and s[k].isdigit():
                    while k < len(s) and s[k].isdigit():
                        k += 1
                    j = k
            out.append(s[i:j])
            i = j
            continue
        if c.isalpha() or c in "_$":
            j = i
            while j < len(s) and (s[j].isalnum() or s[j] in "_$"):
                j += 1
            out.append(s[i:j])
            i = j
            continue
        matched = None
        for p in _PUNCTUATORS:
            if s.startswith(p, i):
                # `a ?.5 : b` is a conditional, not optional chaining (JS's rule)
                if p == "?." and i + 2 < len(s) and s[i + 2].isdigit():
                    continue
                matched = p
                break
        if matched is None:
            raise Unsupported(f"'{c}' is not supported in ${{{s}}}")
        out.append(matched)
        i += len(matched)
    return out


def _precedence(op: str | None) -> int:
    return {
        "??": 1, "||": 2, "&&": 3, "==": 4, "!=": 4, "===": 4, "!==": 4,
        "<": 5, "<=": 5, ">": 5, ">=": 5, "+": 6, "-": 6, "*": 7, "/": 7, "%": 7,
    }.get(op or "", -1)


def _absent(v: Any) -> bool:
    return v is None or v is UNDEFINED


def truthy(v: Any) -> bool:
    if _absent(v):
        return False
    if isinstance(v, bool):
        return v
    if isinstance(v, (int, float)):
        return v != 0 and not (isinstance(v, float) and math.isnan(v))
    if isinstance(v, str):
        return v != ""
    return True


def _to_number(v: Any) -> float:
    if v is None:
        return 0.0
    if v is UNDEFINED:
        return math.nan
    if isinstance(v, bool):
        return 1.0 if v else 0.0
    if isinstance(v, (int, float)):
        return float(v)
    s = text(v).strip()
    if s == "":
        return 0.0
    try:
        return float(s)
    except ValueError:
        return math.nan


def _number(d: float) -> str:
    if math.isnan(d):
        return "NaN"
    if math.isinf(d):
        return "Infinity" if d > 0 else "-Infinity"
    if d == math.floor(d) and abs(d) < 1e21:
        return str(int(d))
    return repr(d)


def text(v: Any) -> str:
    """A value as JavaScript's ``String(v)``: null/undefined as nothing (Mateu's rule), a list as
    ``a,b``, a whole number with no ``.0``, an object as ``[object Object]``."""
    if _absent(v):
        return ""
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, float):
        return _number(v)
    if isinstance(v, (list, tuple)):
        return ",".join(text(x) for x in v)
    if isinstance(v, dict):
        return "[object Object]"
    return str(v)


def _is_stringy(v: Any) -> bool:
    return isinstance(v, (str, dict, list, tuple))


def _loose_equals(left: Any, right: Any) -> bool:
    ln, rn = _absent(left), _absent(right)
    if ln or rn:
        return ln and rn
    if isinstance(left, (int, float, bool)) or isinstance(right, (int, float, bool)):
        return _to_number(left) == _to_number(right)
    return text(left) == text(right)


def _is_number(v: Any) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def _strict_equals(left: Any, right: Any) -> bool:
    """``===``: the same JavaScript type and value (objects by identity; NaN never equal)."""
    if left is UNDEFINED or right is UNDEFINED:
        return left is right
    if left is None or right is None:
        return left is None and right is None
    if _is_number(left) and _is_number(right):
        return float(left) == float(right)
    if isinstance(left, str) and isinstance(right, str):
        return left == right
    if isinstance(left, bool) and isinstance(right, bool):
        return left == right
    if _is_number(left) or isinstance(left, (str, bool)):
        return False
    return left is right


def _compare(left: Any, right: Any) -> int:
    if isinstance(left, str) and isinstance(right, str):
        return (left > right) - (left < right)
    a, b = _to_number(left), _to_number(right)
    if math.isnan(a) or math.isnan(b):
        return 1 if (math.isnan(a) and not math.isnan(b)) else (-1 if math.isnan(b) and not math.isnan(a) else 0)
    return (a > b) - (a < b)


def encode_uri_component(s: str) -> str:
    """JavaScript's encodeURIComponent: everything but ``A-Z a-z 0-9 - _ . ! ~ * ' ( )``."""
    return urllib.parse.quote(s, safe="-_.!~*'()")


def _stringify(v: Any) -> str:
    try:
        return json.dumps(None if v is UNDEFINED else v, separators=(",", ":"), ensure_ascii=False)
    except (TypeError, ValueError):
        return ""


class _Parser:
    def __init__(self, src: str, state: dict, secrets: Callable[[str], Any] | None) -> None:
        self.src = src
        self.tokens = _tokenize(src)
        self.pos = 0
        self.state = state
        self.secrets = secrets
        self.skip = False

    def peek(self) -> str | None:
        return self.tokens[self.pos] if self.pos < len(self.tokens) else None

    def next(self) -> str:
        if self.pos >= len(self.tokens):
            raise Unsupported(f"unexpected end of ${{{self.src}}}")
        t = self.tokens[self.pos]
        self.pos += 1
        return t

    def expect(self, token: str) -> None:
        t = self.next()
        if t != token:
            raise Unsupported(f"expected '{token}' but found '{t}' in ${{{self.src}}}")

    def skipping(self, skip_this: bool, body: Callable[[], Any]) -> Any:
        before = self.skip
        self.skip = before or skip_this
        try:
            return body()
        finally:
            self.skip = before

    # expression: binary operators binding tighter than min_prec, then `?:`
    def expression(self, min_prec: int = 0) -> Any:
        left = self.binary(min_prec)
        if min_prec == 0 and self.peek() == "?":
            self.next()
            # both branches are PARSED; the one not taken is skipped (never evaluated), as in JS
            taken = truthy(left)
            when_true = self.skipping(not taken, lambda: self.expression(0))
            self.expect(":")
            when_false = self.skipping(taken, lambda: self.expression(0))
            return when_true if taken else when_false
        return left

    def binary(self, min_prec: int) -> Any:
        left = self.unary()
        while True:
            op = self.peek()
            prec = _precedence(op)
            if prec < 0 or prec < min_prec:
                return left
            self.next()
            if op == "??":
                decided = not _absent(left)
            elif op == "||":
                decided = truthy(left)
            elif op == "&&":
                decided = not truthy(left)
            else:
                decided = False
            next_prec = prec + 1
            right = self.skipping(decided, lambda: self.binary(next_prec))
            if decided:
                continue  # the left side decides and stays
            left = UNDEFINED if self.skip else _apply(op or "", left, right)

    def unary(self) -> Any:
        t = self.peek()
        if t == "!":
            self.next()
            return not truthy(self.unary())
        if t == "-":
            self.next()
            return -_to_number(self.unary())
        if t == "+":
            self.next()
            return _to_number(self.unary())
        return self.postfix(self.primary())

    def primary(self) -> Any:
        t = self.next()
        if t == "(":
            v = self.expression(0)
            self.expect(")")
            return v
        if t.startswith(_STRING):
            return t[1:]
        if t[0].isdigit() or t[0] == ".":
            try:
                return float(t)
            except ValueError as e:
                raise Unsupported(f"'{t}' is not a number in ${{{self.src}}}") from e
        if t == "true":
            return True
        if t == "false":
            return False
        if t == "null":
            return None
        if t == "undefined":
            return UNDEFINED
        if t in ("encodeURIComponent", "String", "Number"):
            return self.call(t)
        if t == "JSON":
            self.expect(".")
            member = self.next()
            if member != "stringify":
                raise Unsupported(f"JSON.{member} is not supported in ${{{self.src}}}")
            return self.call("JSON.stringify")
        if t == "Math":
            return _MATH
        if t == "state":
            return UNDEFINED if self.skip else self.state
        if t == "secret":
            return _SecretScope()
        if not (t[0].isalpha() or t[0] in "_$"):
            raise Unsupported(f"unexpected '{t}' in ${{{self.src}}}")
        if t in CLIENT_ONLY_ROOTS:
            return UNDEFINED
        # searchText, page, size… — top-level names the browser offers — live in the state here
        return self.state[t] if t in self.state else UNDEFINED

    def call(self, fn: str) -> Any:
        self.expect("(")
        arg = self.expression(0)
        self.expect(")")
        if self.skip:
            return UNDEFINED
        if fn == "encodeURIComponent":
            return encode_uri_component(text(arg))
        if fn == "String":
            return text(arg)
        if fn == "Number":
            return _to_number(arg)
        return _stringify(arg)

    def postfix(self, value: Any) -> Any:
        while True:
            t = self.peek()
            if t in (".", "?."):
                self.next()
                name = self.next()
                if name.startswith(_STRING) or not (name[0].isalpha() or name[0] in "_$"):
                    raise Unsupported(f"a member name was expected in ${{{self.src}}}")
                calls = self.peek() == "("
                if t == "?." and _absent(value):
                    if calls:
                        self.skipping(True, self.arguments)
                    value = UNDEFINED
                    continue
                value = self.call_method(value, name, self.arguments()) if calls else self.member(value, name)
            elif t in ("[", "?.["):
                self.next()
                key = self.expression(0)
                self.expect("]")
                if t == "?.[" and _absent(value):
                    value = UNDEFINED
                    continue
                value = self.member(value, key)
            elif t == "(":
                raise Unsupported(
                    "only encodeURIComponent, String, Number, JSON.stringify, Math functions and"
                    " allow-listed string/number/list methods can be called"
                )
            else:
                return value

    def member(self, obj: Any, key: Any) -> Any:
        """``obj[key]``: a dict entry, a list element, a string's length. Nothing else."""
        if self.skip:
            return UNDEFINED
        if _absent(obj):
            # a.b on null throws in the browser; the placeholder renders empty either way
            raise ValueError(f"cannot read '{text(key)}' of {text(obj)}")
        if isinstance(obj, _SecretScope):
            return self.secrets(text(key)) if self.secrets is not None else UNDEFINED
        name = str(int(key)) if isinstance(key, float) and key == math.floor(key) else text(key)
        if isinstance(obj, dict):
            return obj[name] if name in obj else UNDEFINED
        if isinstance(obj, (list, tuple)):
            if name == "length":
                return float(len(obj))
            try:
                i = int(name)
            except ValueError:
                return UNDEFINED
            return obj[i] if 0 <= i < len(obj) else UNDEFINED
        if isinstance(obj, str):
            if name == "length":
                return float(len(obj))
            try:
                i = int(name)
            except ValueError:
                return UNDEFINED
            return obj[i] if 0 <= i < len(obj) and name.isdigit() else UNDEFINED
        return UNDEFINED

    def arguments(self) -> list:
        """``(a, b, …)`` after a callee: the arguments, evaluated (skipped in an untaken branch)."""
        self.expect("(")
        args: list = []
        if self.peek() == ")":
            self.next()
            return args
        while True:
            args.append(self.expression(0))
            t = self.next()
            if t == ")":
                return args
            if t != ",":
                raise Unsupported(f"expected ',' or ')' but found '{t}' in ${{{self.src}}}")

    def call_method(self, value: Any, name: str, args: list) -> Any:
        """``value.name(args)``, with JavaScript's meaning, for the allow-listed methods only."""
        if value is _MATH:
            if name not in _MATH_FUNCTIONS:
                raise Unsupported(f"Math.{name} is not supported in ${{{self.src}}}")
            return UNDEFINED if self.skip else _math(name, args)
        if name not in METHODS:
            raise Unsupported(f"'{name}' cannot be called in ${{{self.src}}}")
        if self.skip:
            return UNDEFINED
        if _absent(value):
            raise ValueError(f"cannot call '{name}' of {text(value)}")
        a0 = args[0] if args else UNDEFINED
        a1 = args[1] if len(args) > 1 else UNDEFINED
        if isinstance(value, str):
            return _string_method(value, name, a0, a1)
        if isinstance(value, bool):
            if name == "toString":
                return text(value)
            raise ValueError(f"'{name}' is not callable on a boolean")
        if isinstance(value, (int, float)):
            return _number_method(float(value), name, a0)
        if isinstance(value, (list, tuple)):
            return _list_method(list(value), name, a0, a1)
        raise ValueError(f"'{name}' is not callable on {text(value)}")


class _MathScope:
    """``Math``: only its pure rounding / min / max functions are reachable."""


_MATH = _MathScope()
_MATH_FUNCTIONS = frozenset({"round", "floor", "ceil", "abs", "min", "max"})

#: the methods of a string, number or list an expression may call — pure ones only (Java's
#: ``ProxyExpression.METHODS``)
METHODS = frozenset({
    "toLowerCase", "toUpperCase", "trim", "includes", "startsWith", "endsWith", "slice", "substring",
    "indexOf", "padStart", "padEnd", "toString", "toFixed", "join",
})


def _to_integer(v: Any) -> int:
    """JavaScript's ToIntegerOrInfinity, clamped to the int32 range (NaN → 0)."""
    d = _to_number(v)
    if math.isnan(d):
        return 0
    return int(max(-2147483648.0, min(2147483647.0, d)))


def _slice_range(length: int, start: Any, end: Any) -> tuple[int, int]:
    """``slice(start, end)``'s range: a negative index counts from the end, then clamped."""
    s = 0 if start is UNDEFINED else _to_integer(start)
    e = length if end is UNDEFINED else _to_integer(end)
    lo = max(length + s, 0) if s < 0 else min(s, length)
    hi = max(length + e, 0) if e < 0 else min(e, length)
    return lo, hi


def _pad(s: str, length: Any, filler: Any, start: bool) -> str:
    target = _to_integer(length)
    fill = " " if filler is UNDEFINED else text(filler)
    if target <= len(s) or fill == "":
        return s
    if target > 10_000:
        raise ValueError("pad length")
    padding = (fill * (target // len(fill) + 1))[: target - len(s)]
    return padding + s if start else s + padding


def _string_method(s: str, name: str, a0: Any, a1: Any) -> Any:
    if name == "toLowerCase":
        return s.lower()
    if name == "toUpperCase":
        return s.upper()
    if name == "trim":
        return s.strip()
    if name == "includes":
        return text(a0) in s
    if name == "startsWith":
        return s.startswith(text(a0))
    if name == "endsWith":
        return s.endswith(text(a0))
    if name == "indexOf":
        return float(s.find(text(a0)))
    if name == "slice":
        lo, hi = _slice_range(len(s), a0, a1)
        return s[lo:hi] if lo < hi else ""
    if name == "substring":
        lo = max(0, min(_to_integer(a0), len(s)))
        hi = len(s) if a1 is UNDEFINED else max(0, min(_to_integer(a1), len(s)))
        return s[min(lo, hi):max(lo, hi)]
    if name in ("padStart", "padEnd"):
        return _pad(s, a0, a1, name == "padStart")
    if name == "toString":
        return s
    raise ValueError(f"'{name}' is not a string method")


def _number_method(d: float, name: str, a0: Any) -> Any:
    if name == "toString":
        return _number(d)
    if name == "toFixed":
        digits = 0 if a0 is UNDEFINED else _to_integer(a0)
        if digits < 0 or digits > 100:
            raise ValueError("toFixed digits")
        if math.isnan(d) or math.isinf(d):
            return _number(d)
        # the EXACT value the double holds, rounded half away from zero (JavaScript's rule)
        exact = decimal.Decimal(d).quantize(decimal.Decimal(1).scaleb(-digits), rounding=decimal.ROUND_HALF_UP)
        return format(exact, "f")
    raise ValueError(f"'{name}' is not a number method")


def _list_method(items: list, name: str, a0: Any, a1: Any) -> Any:
    if name == "join":
        return ("," if a0 is UNDEFINED else text(a0)).join(text(x) for x in items)
    if name == "includes":
        return any(_strict_equals(x, a0) for x in items)
    if name == "indexOf":
        return float(next((i for i, x in enumerate(items) if _strict_equals(x, a0)), -1))
    if name == "slice":
        lo, hi = _slice_range(len(items), a0, a1)
        return items[lo:hi] if lo < hi else []
    if name == "toString":
        return text(items)
    raise ValueError(f"'{name}' is not a list method")


def _math(name: str, args: list) -> float:
    a0 = args[0] if args else UNDEFINED
    if name == "round":
        d = _to_number(a0)
        return d if math.isnan(d) or math.isinf(d) else float(math.floor(d + 0.5))
    if name == "floor":
        d = _to_number(a0)
        return d if math.isnan(d) or math.isinf(d) else float(math.floor(d))
    if name == "ceil":
        d = _to_number(a0)
        return d if math.isnan(d) or math.isinf(d) else float(math.ceil(d))
    if name == "abs":
        return abs(_to_number(a0))
    acc = math.inf if name == "min" else -math.inf
    for a in args:
        d = _to_number(a)
        if math.isnan(d):
            return math.nan
        acc = min(acc, d) if name == "min" else max(acc, d)
    return acc


def _apply(op: str, left: Any, right: Any) -> Any:
    if op == "??":
        return right if _absent(left) else left
    if op == "||":
        return left if truthy(left) else right
    if op == "&&":
        return right if truthy(left) else left
    if op == "==":
        return _loose_equals(left, right)
    if op == "!=":
        return not _loose_equals(left, right)
    if op == "===":
        return _strict_equals(left, right)
    if op == "!==":
        return not _strict_equals(left, right)
    if op == "<":
        return _compare(left, right) < 0
    if op == "<=":
        return _compare(left, right) <= 0
    if op == ">":
        return _compare(left, right) > 0
    if op == ">=":
        return _compare(left, right) >= 0
    if op == "+":
        if _is_stringy(left) or _is_stringy(right):
            return text(left) + text(right)
        return _to_number(left) + _to_number(right)
    a, b = _to_number(left), _to_number(right)
    if op == "-":
        return a - b
    if op == "*":
        return a * b
    if op == "/":
        if b == 0:
            return math.nan if a == 0 or math.isnan(a) else math.copysign(math.inf, a) * math.copysign(1, b)
        return a / b
    if op == "%":
        return math.nan if b == 0 else math.fmod(a, b)
    raise Unsupported(f"operator {op}")


def evaluate(expression: str, state: dict | None, secrets: Callable[[str], Any] | None) -> Any:
    """The value ``expression`` names against the state (and the server's secrets): a Python value,
    None, or :data:`UNDEFINED`. Raises :class:`Unsupported` for syntax outside the subset."""
    p = _Parser(expression, state or {}, secrets)
    value = p.expression(0)
    if p.pos < len(p.tokens):
        raise Unsupported(f"unexpected '{p.tokens[p.pos]}' in ${{{expression}}}")
    return value


def is_supported(expression: str) -> bool:
    """Whether ``expression`` parses within the subset (evaluated against an empty state)."""
    try:
        evaluate(expression, {}, lambda _key: None)
        return True
    except Unsupported:
        return False
    except Exception:  # noqa: BLE001 — a runtime problem with THIS empty state, not the syntax
        return True
