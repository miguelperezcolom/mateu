"""The expression subset a REST source template evaluates on the SERVER — the proxied leg.

The Python twin of Java's ``io.mateu.core.domain.ProxyExpression`` (and of the .NET
``Mateu.Core.ProxyExpression``), with the meaning the browser's sandboxed evaluator
(``libs/mateu infra/ui/expression.ts``) gives it, so flipping a source to ``proxy: true`` does not
turn a working ``${(state.page ?? 0) * 20}`` into an empty value. Pinned by the shared corpus
``conformance/client/source-templates.json``.

Supported: literals (numbers, ``'…'``/``"…"``, ``true false null undefined``), the roots ``state``
and ``secret`` (any other bare name reads the state), member access ``a.b``, ``a?.b``, ``a[i]``,
``a?.[i]``, unary ``! - +``, ``* / % + -``, comparisons, ``== != === !==``, ``&& || ??``, ``?:``,
parentheses and the calls ``encodeURIComponent``, ``String``, ``Number``, ``JSON.stringify``.
``data``, ``appState`` and ``appData`` exist only in the browser: here they are undefined.
Anything else raises :class:`Unsupported`. Never evaluates code.
"""

from __future__ import annotations

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
                if t == "?." and _absent(value):
                    value = UNDEFINED
                    continue
                value = self.member(value, name)
            elif t in ("[", "?.["):
                self.next()
                key = self.expression(0)
                self.expect("]")
                if t == "?.[" and _absent(value):
                    value = UNDEFINED
                    continue
                value = self.member(value, key)
            elif t == "(":
                raise Unsupported("only encodeURIComponent, String, Number and JSON.stringify can be called")
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
        if isinstance(obj, str) and name == "length":
            return float(len(obj))
        return UNDEFINED


def _apply(op: str, left: Any, right: Any) -> Any:
    if op == "??":
        return right if _absent(left) else left
    if op == "||":
        return left if truthy(left) else right
    if op == "&&":
        return right if truthy(left) else left
    if op in ("==", "==="):
        return _loose_equals(left, right)
    if op in ("!=", "!=="):
        return not _loose_equals(left, right)
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
