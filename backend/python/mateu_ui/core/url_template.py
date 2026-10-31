"""URL templates with their values percent-encoded by POSITION.

The Python twin of the Java ``TemplateInterpolator.interpolateUrl`` (and of libs/mateu
``interpolateUrl`` on the browser leg): a value is DATA and must never change the shape of the
request. Without encoding, an id of ``1/../../admin?x=`` turned ``/people/${state.id}`` into a request
for ``/admin`` — and on the proxied leg that is the SERVER fetching whatever the client asked for.

* in the ORIGIN (scheme + authority, or a template that starts with ``${...}`` — a configured base)
  the value is substituted raw, but a ``${state.x}`` there is refused;
* in the PATH it is encoded as a segment (``/`` → ``%2F``) and a dot segment (``.``/``..``) is
  refused, because URL parsers resolve those even percent-encoded;
* after a literal ``?`` or ``#`` it is encoded as a query component.

The encoding is RFC 3986 strict (everything but ``A-Z a-z 0-9 - . _ ~``), byte for byte what the
other backends and renderers produce.
"""

from __future__ import annotations

import re
import urllib.parse
from typing import Any, Callable

_PLACEHOLDER = re.compile(r"\$\{([^}]+)\}")
_ANY_PLACEHOLDER = re.compile(r"\$\{[^}]*\}")


#: the only environment variables a ``${secret.X}`` may fall back to
SECRET_ENV_PREFIX = "MATEU_SECRET_"


def secret_env_name(key: str) -> str:
    """The environment variable a ``${secret.KEY}`` falls back to: ``MATEU_SECRET_KEY`` (a key that
    already carries the prefix is used as is). Mirrors the Java/.NET backends."""
    return key if key.startswith(SECRET_ENV_PREFIX) else SECRET_ENV_PREFIX + key


def url_encode(value: str) -> str:
    """Percent-encode everything but the RFC 3986 unreserved characters (UTF-8, upper-case hex)."""
    return urllib.parse.quote(value or "", safe="")


# ── the expressions a source template may use beside a plain path ───────────────────────────────

_ENCODE_CALL = "encodeURIComponent"
_NUMBER = re.compile(r"-?\d+(\.\d+)?")


def encode_call_argument(expr: str) -> str | None:
    """The argument of an expression that is exactly ONE ``encodeURIComponent(...)`` call, else None
    (``encodeURIComponent(a) + encodeURIComponent(b)`` is not one). Twin of Java's
    ``TemplateInterpolator.encodeCallArgument`` and libs/mateu's ``encodeCallArgument``."""
    e = expr.strip()
    if not e.startswith(_ENCODE_CALL):
        return None
    rest = e[len(_ENCODE_CALL):].strip()
    if not rest.startswith("(") or not rest.endswith(")"):
        return None
    depth = 0
    quote = ""
    i = 0
    while i < len(rest):
        c = rest[i]
        if quote:
            if c == "\\":
                i += 1
            elif c == quote:
                quote = ""
        elif c in "'\"`":
            quote = c
        elif c == "(":
            depth += 1
        elif c == ")":
            depth -= 1
            if depth == 0 and i != len(rest) - 1:
                return None  # the call closes before the end: something follows it
        i += 1
    return rest[1:-1] if depth == 0 else None


def _top_level_index(expr: str, token: str) -> int:
    """The index of ``token`` outside quotes, parentheses and brackets, or -1."""
    depth = 0
    quote = ""
    i = 0
    while i < len(expr):
        c = expr[i]
        if quote:
            if c == "\\":
                i += 1
            elif c == quote:
                quote = ""
        elif c in "'\"`":
            quote = c
        elif c in "([":
            depth += 1
        elif c in ")]":
            depth -= 1
        elif depth == 0 and expr.startswith(token, i):
            return i
        i += 1
    return -1


def is_money(v: Any) -> bool:
    """A money value: what a ``dataType: money`` field holds (``{value, currency, locale}``)."""
    return isinstance(v, dict) and "value" in v and "currency" in v


def template_text(v: Any) -> str:
    """A resolved value as the text that lands in a template: a MONEY value as its amount (its
    currency is ``${state.price.currency}``) — it used to land as a dict's repr and the endpoint
    answered 400."""
    if v is None:
        return ""
    if isinstance(v, bool):
        return "true" if v else "false"
    if is_money(v):
        amount = v.get("value")
        if isinstance(amount, float) and amount.is_integer():
            return str(int(amount))
        return template_text(amount)
    return str(v)


def js_text(v: Any) -> str:
    """A value as JavaScript's ``String(v)`` converts it — what ``encodeURIComponent(v)`` encodes in
    the browser: a list as ``a,b`` (a multi-select's values), a money value as its amount."""
    if isinstance(v, (list, tuple)):
        return ",".join(js_text(x) for x in v)
    return template_text(v)


def resolve_expression(expr: str, state: dict | None, secret: Callable[[str], str | None]) -> Any:
    """The value a ``${...}`` expression names, or None: ``state.a`` / ``state.a.b``, ``secret.KEY``,
    a literal (``'x'``, ``"x"``, a number, ``true``/``false``/``null``), ``a ?? b`` (b when a is
    absent) or ``encodeURIComponent(x)``. Not a JavaScript evaluator: the forms a source template
    uses, so a proxied call means what the browser's would (Java's TemplateInterpolator)."""
    expr = expr.strip()
    i = _top_level_index(expr, "??")
    if i >= 0:
        left = resolve_expression(expr[:i], state, secret)
        return left if left is not None else resolve_expression(expr[i + 2:], state, secret)
    inner = encode_call_argument(expr)
    if inner is not None:
        return url_encode(js_text(resolve_expression(inner, state, secret)))
    if len(expr) >= 2 and expr[0] in "'\"" and expr[-1] == expr[0]:
        return expr[1:-1]
    if _NUMBER.fullmatch(expr) or expr in ("true", "false"):
        return expr
    if expr.startswith("state."):
        return _state_path(state or {}, expr[6:])
    if expr.startswith("secret."):
        return secret(expr[7:])
    return None


def _state_path(state: dict, path: str) -> Any:
    """``a.b.c`` in the state: a flat key first (as always), else a walk through nested dicts."""
    if path in state:
        return state[path]
    current: Any = state
    for part in path.split("."):
        if not isinstance(current, dict):
            return None
        current = current.get(part.strip())
    return current


def _origin_end(t: str) -> int:
    scheme = t.find("://")
    first_placeholder = t.find("${")
    if scheme >= 0 and (first_placeholder < 0 or scheme < first_placeholder):
        i = scheme + 3
        while i < len(t):
            if t.startswith("${", i):
                close = t.find("}", i)
                i = len(t) if close < 0 else close + 1
                continue
            if t[i] in "/?#":
                return i
            i += 1
        return len(t)
    if t.startswith("${"):
        close = t.find("}")
        return len(t) if close < 0 else close + 1
    return 0


def interpolate_url(template: str | None, value_of: Callable[[str], str]) -> str:
    """Interpolate ``template`` resolving each ``${expr}`` with ``value_of(expr)`` (already a string;
    unknown → ""), encoding by position. Raises ``ValueError`` when a value is refused."""
    if not template or "${" not in template:
        return template or ""
    origin = _origin_end(template)

    def repl(m: re.Match) -> str:
        expr = m.group(1).strip()
        # ``${encodeURIComponent(x)}`` — how a value had to be written before Mateu encoded it —
        # is encoded ONCE: ``value_of`` answers it already encoded, so it is not encoded again
        # (that sent ``a%252Cb`` for ``a,b``).
        inner = encode_call_argument(expr)
        value = value_of(expr) or ""
        if m.start() < origin:
            if (inner if inner is not None else expr).strip().startswith("state."):
                raise ValueError(f"A client state value cannot choose the origin of a URL: {template}")
            return value
        before = _ANY_PLACEHOLDER.sub("", template[: m.start()])
        if "?" not in before and "#" not in before and value in (".", ".."):
            raise ValueError(f"A dot segment is not a valid path value: {value}")
        return value if inner is not None else url_encode(value)

    return _PLACEHOLDER.sub(repl, template)
