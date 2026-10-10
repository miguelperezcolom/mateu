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
from typing import Callable

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
        value = value_of(expr) or ""
        if m.start() < origin:
            if expr.startswith("state."):
                raise ValueError(f"A client state value cannot choose the origin of a URL: {template}")
            return value
        before = _ANY_PLACEHOLDER.sub("", template[: m.start()])
        if "?" not in before and "#" not in before and value in (".", ".."):
            raise ValueError(f"A dot segment is not a valid path value: {value}")
        return url_encode(value)

    return _PLACEHOLDER.sub(repl, template)
