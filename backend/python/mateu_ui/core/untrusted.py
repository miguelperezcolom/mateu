"""What an UNTRUSTED definition may not do (Java's ``UntrustedDefinition``).

A screen an agent authored — the chat's ``render-screen``, a live push of kind ``render`` — is
written by an LLM, which can be steered by the data it reads (prompt injection). Pairing an agent
grants "drive my UI", never "run code in my signed-in tab". So a shell renders such a screen through
``__preview__`` with ``_untrusted: true`` and the increment that comes back has every
script-capable construct taken out:

- an ``Element`` keeps no ``on…`` attribute, no ``srcdoc``, no ``import`` and no unsafe url
  attribute (only relative / http(s) / mailto / tel); its content is TEXT (``html`` false); an
  element that loads or runs code (``script``, ``iframe``, ``object``, ``style``, ``base``,
  ``link``, ``meta``, …) or a framework element (``mateu-*``) becomes an empty ``div``;
- ``RunJS`` rules, an action's ``js`` and ``AddContentToHead``/``AddContentToBody`` commands go;
- a ``javascript:``/``vbscript:`` url anywhere is blanked;
- nothing runs without a click and nothing posts elsewhere: ``triggers`` are emptied and no
  ``restAction`` is kept;
- a ``MicroFrontend`` does not load from another server (its absolute ``baseUrl`` is dropped).

Same rules in Java, .NET and the web renderers; shared cases: ``conformance/untrusted/cases.json``.
"""

from __future__ import annotations

import re
from typing import Any

UNTRUSTED_KEY = "_untrusted"

_BLOCKED_ELEMENTS = frozenset(
    {"script", "style", "iframe", "frame", "frameset", "object", "embed", "applet", "base", "link",
     "meta", "template", "portal", "noscript"}
)
_URL_ATTRIBUTES = frozenset(
    {"href", "src", "xlink:href", "action", "formaction", "background", "poster", "data", "cite", "ping",
     "srcset", "manifest", "codebase", "longdesc", "usemap", "icon"}
)
_SAFE_SCHEMES = frozenset({"http", "https", "mailto", "tel"})
_CODE_COMMANDS = frozenset({"AddContentToHead", "AddContentToBody"})
_SCHEME = re.compile(r"^([a-zA-Z][a-zA-Z0-9+.-]*):")


def requested(parameters: Any) -> bool:
    """True when the ``__preview__`` parameters mark the definition as untrusted."""
    if not isinstance(parameters, dict):
        return False
    flag = parameters.get(UNTRUSTED_KEY)
    return flag is True or str(flag).lower() == "true"


def _cleaned(value: str) -> str:
    s = re.sub(r"[\t\n\r]", "", value)
    i = 0
    while i < len(s) and s[i] <= " ":
        i += 1
    return s[i:]


def _scheme_of(value: str) -> str | None:
    m = _SCHEME.match(_cleaned(value))
    return m.group(1).lower() if m else None


def is_script_url(value: str) -> bool:
    return _scheme_of(value) in ("javascript", "vbscript")


def _safe_url(value: str) -> bool:
    scheme = _scheme_of(value)
    return scheme is None or scheme in _SAFE_SCHEMES


def _absolute_url(value: str) -> bool:
    # another server's url: a scheme, or //host — a browser reads a backslash as "/", so
    # \\host, /\host and \/host are //host too
    return _scheme_of(value) is not None or _cleaned(value).replace("\\", "/").startswith("//")


def _is_code(item: Any) -> bool:
    return isinstance(item, dict) and (
        item.get("action") == "RunJS" or (isinstance(item.get("type"), str) and item["type"] in _CODE_COMMANDS)
    )


def _element(node: dict) -> dict:
    raw = node.get("name")
    name = raw.strip().lower() if isinstance(raw, str) else ""
    if name in _BLOCKED_ELEMENTS or name.startswith("mateu-"):
        return {**node, "name": "div", "attributes": {}, "on": {}, "content": None, "html": False}
    out = {**node, "html": False}
    if isinstance(node.get("attributes"), dict):
        attributes = {}
        for key, value in node["attributes"].items():
            k = str(key).lower()
            if k in ("import", "srcdoc") or k.startswith("on"):
                continue
            if isinstance(value, str) and (is_script_url(value) or (k in _URL_ATTRIBUTES and not _safe_url(value))):
                continue
            attributes[key] = value
        out["attributes"] = attributes
    return out


class TooLarge(Exception):
    """The alias-expanded definition is larger than any page: not checkable (refused)."""


_MAX_NODES = 100_000


def script_capable(value: Any) -> bool:
    """Whether a definition (authored YAML loaded as data, or wire JSON) carries anything
    :func:`neutralize` would take out (Java's ``UntrustedDefinition.scriptCapable``):
    ``mateu_save_spec`` refuses it (R6) — a saved spec is served through the ordinary, TRUSTED render
    path, so an agent could otherwise persist what the strip keeps out of a pushed screen. Raises
    :class:`TooLarge` when YAML aliases expand past any page's size."""
    budget = [_MAX_NODES]
    return _script_capable(value, budget, set())


def _script_capable(value: Any, budget: list[int], path: set[int]) -> bool:
    budget[0] -= 1
    if budget[0] < 0:
        raise TooLarge()
    if isinstance(value, str):
        return is_script_url(value)
    if isinstance(value, (list, dict)):
        if id(value) in path:  # an alias inside its own anchor
            return False
        path = path | {id(value)}
    if isinstance(value, list):
        return any(_is_code(item) or _script_capable(item, budget, path) for item in value)
    if not isinstance(value, dict):
        return False
    if value.get("type") == "Element" and _element_runs_code(value):
        return True
    base = value.get("baseUrl")
    if value.get("type") == "MicroFrontend" and isinstance(base, str) and _foreign_base(base):
        return True
    js = value.get("js")
    if isinstance(js, str) and js.strip():
        return True
    return any(_script_capable(v, budget, path) for v in value.values())


def _element_runs_code(node: dict) -> bool:
    raw = node.get("name")
    name = raw.strip().lower() if isinstance(raw, str) else ""
    if name in _BLOCKED_ELEMENTS or name.startswith("mateu-"):
        return True
    html = node.get("html")
    if html is True or (isinstance(html, str) and html.strip().lower() == "true"):
        return True
    attributes = node.get("attributes")
    if isinstance(attributes, dict):
        for key, value in attributes.items():
            k = str(key).lower()
            if k in ("import", "srcdoc") or k.startswith("on"):
                return True
            if isinstance(value, str) and (is_script_url(value) or (k in _URL_ATTRIBUTES and not _safe_url(value))):
                return True
    return False


def _foreign_base(value: str) -> bool:
    """An absolute or network-path url, a backslash spelling of one included (``\\\\host``)."""
    c = _cleaned(value)
    return _absolute_url(value) or c.startswith("\\") or c.startswith("/\\")


def neutralize(value: Any) -> Any:
    """A sanitised copy of any wire JSON (a fragment, a component, an increment as a dict)."""
    if isinstance(value, str):
        return "" if is_script_url(value) else value
    if isinstance(value, list):
        return [neutralize(v) for v in value if not _is_code(v)]
    if not isinstance(value, dict):
        return value
    node = value
    if node.get("type") == "Element":
        node = _element(node)
    if node.get("type") == "MicroFrontend" and isinstance(node.get("baseUrl"), str) and _absolute_url(node["baseUrl"]):
        node = {**node, "baseUrl": ""}
    out = {}
    for k, v in node.items():
        if (k == "js" and isinstance(v, str)) or k == "restAction":
            continue
        # nothing runs without a click: an OnLoad/OnValueChange/AutoSave trigger fires by itself
        out[k] = [] if k == "triggers" and isinstance(v, list) else neutralize(v)
    return out


def neutralize_increment(increment):
    """The increment (a ``UIIncrement``) with every script-capable construct taken out. Fails closed:
    what cannot be re-read after the walk raises rather than travel as it was."""
    from mateu_ui.dtos import UIIncrement

    clean = neutralize(increment.model_dump(by_alias=True, mode="json"))
    return UIIncrement.model_validate(clean)
