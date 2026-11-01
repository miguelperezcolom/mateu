"""Validates a YAML definition against the generated ``specs-schema.json`` and reports EVERY problem
with where it is — the authoring half of the MCP plane (``mateu_validate_uidl``).

The Python twin of Java's ``UidlValidator``: the rules are NORMATIVE (``conformance/mcp/README.md``)
and the shared corpus ``conformance/mcp/authoring.json`` pins identical reports in the three
backends. The text is COMPOSED (``yaml.compose`` keeps a node tree with positions and the scalar
style, and constructs nothing), then walked next to the schema:

- scalars are typed by their raw text, never by a YAML resolver (resolvers differ between
  languages): a quoted scalar is a string; a plain one is null (``~``, ``null``, empty), a boolean,
  a number or a string;
- an unknown key is a WARNING (the loader ignores it), everything that makes the loader fail is an
  ERROR; semantic findings (undeclared actions, references that do not resolve) are warnings.

Pure: no I/O and no app state beyond the :class:`ValidationContext` it is handed.
"""

from __future__ import annotations

import re
from collections.abc import Callable, Iterable
from dataclasses import dataclass
from typing import Any

import yaml
from yaml.nodes import MappingNode, Node, ScalarNode, SequenceNode

from .. import proxy_expression

#: Largest definition accepted (UTF-8 bytes); the same limit in every implementation.
MAX_YAML_BYTES = 262_144

#: Most nodes walked (an alias-bomb guard: aliases share nodes, the walk would not).
MAX_NODES = 100_000

_INT = re.compile(r"[-+]?[0-9]+")
_FLOAT = re.compile(r"[-+]?(\.[0-9]+|[0-9]+(\.[0-9]*)?)([eE][-+]?[0-9]+)?")
_IDENTIFIER = re.compile(r"[A-Za-z_][A-Za-z0-9_]*")
_PLACEHOLDER = re.compile(r"\$\{([^}]+)}")
_CLIENT_ONLY_ROOT = re.compile(r"(?<![\w$.])(data|appState|appData)\s*(\.|\?\.|\[)")
_REF_PREFIX = "#/$defs/"

_TYPED_KINDS = {
    "UI": "mount",
    "Routes": "routes",
    "Sources": "sources",
    "Actions": "actions",
    "Translations": "translations",
    "Environment": "environment",
    "Types": "types",
    "Project": "project",
}

Predicate = Callable[[str], bool]


@dataclass(frozen=True)
class ValidationContext:
    """What the app around a definition knows: which names resolve. Each predicate may be None —
    "unknown here" — and its check is then skipped (an agent drafting a screen with no app behind it
    is not told every source is missing). A None ``action`` counts as an empty action catalogue."""

    source: Predicate | None = None
    partial: Predicate | None = None
    component: Predicate | None = None
    action: Predicate | None = None
    field_type: Predicate | None = None

    @staticmethod
    def none() -> "ValidationContext":
        return ValidationContext()

    @staticmethod
    def of(
        sources: Iterable[str] | None = None,
        partials: Iterable[str] | None = None,
        components: Iterable[str] | None = None,
        actions: Iterable[str] | None = None,
        field_types: Iterable[str] | None = None,
    ) -> "ValidationContext":
        """A context over fixed name sets (tests, the conformance corpus); None = unknown."""

        def contains(names: Iterable[str] | None) -> Predicate | None:
            if names is None:
                return None
            known = frozenset(names)
            return known.__contains__

        return ValidationContext(
            contains(sources), contains(partials), contains(components), contains(actions), contains(field_types)
        )


class UidlValidator:
    """The validator over one parsed ``specs-schema.json``."""

    def __init__(self, specs_schema: dict) -> None:
        self.specs = specs_schema
        self.defs: dict = specs_schema.get("$defs") or {}

    def validate(self, text: str | None, context: ValidationContext | None = None) -> dict:
        """The report ``{valid, kind, errors, warnings}`` of ``text``; never raises."""
        return _Run(self, context or ValidationContext.none()).validate(text)


class _Run:
    def __init__(self, validator: UidlValidator, context: ValidationContext) -> None:
        self.specs = validator.specs
        self.defs = validator.defs
        self.context = context
        self.errors: list[dict] = []
        self.warnings: list[dict] = []
        self.kind: str | None = None
        self.declared_actions: set[str] | None = None
        self.visited = 0
        self.aborted = False

    def validate(self, text: str | None) -> dict:
        if text is None or not text.strip():
            self.issue(self.errors, "empty", "The YAML is empty.", "$", None)
            return self.report()
        if len(text.encode("utf-8")) > MAX_YAML_BYTES:
            self.issue(
                self.errors, "too_large", f"The YAML is larger than the {MAX_YAML_BYTES}-byte limit.", "$", None
            )
            return self.report()
        try:
            root = yaml.compose(text, Loader=yaml.SafeLoader)
        except yaml.MarkedYAMLError as e:
            mark = e.problem_mark if e.problem_mark is not None else e.context_mark
            problem = e.problem if e.problem is not None else str(e)
            self.issue(self.errors, "yaml_syntax", _capitalize(problem.strip()) + ".", "$", mark)
            return self.report()
        except (yaml.YAMLError, RecursionError, ValueError) as e:
            self.issue(self.errors, "yaml_syntax", str(e), "$", None)
            return self.report()
        if root is None or _is_null(root):
            self.issue(self.errors, "empty", "The YAML is empty.", "$", None)
            return self.report()
        try:
            self.validate_root(root)
        except RecursionError:
            # deeper than the interpreter's stack: as useless to an author as too many nodes
            self.too_complex()
        return self.report()

    def report(self) -> dict:
        return {"valid": not self.errors, "kind": self.kind, "errors": self.errors, "warnings": self.warnings}

    # ── root classification ──────────────────────────────────────────────────────────────────

    def validate_root(self, root: Node) -> None:
        if isinstance(root, SequenceNode):
            self.kind = "routes"
            self.validate_node(root, self.branch(lambda b: b.get("type") == "array"), "$", None)
            return
        if not isinstance(root, MappingNode):
            self.unknown_kind(root)
            return
        type_node = _get(root, "type")
        type_ = _scalar_text(type_node)
        if type_ is not None and type_ in _TYPED_KINDS:
            self.kind = _TYPED_KINDS[type_]
            self.validate_object(root, self.branch(lambda b: _const_of(b) == type_), "$", None, {})
            return
        if type_ is not None or type_node is not None:
            # a component at the root: a page (or an app shell), with the page-level keys beside it
            self.kind = "component"
            page_branch = self.branch(lambda b: "allOf" in b)
            page_keys = (page_branch["allOf"][1].get("properties") or {})
            self.prepare_action_check(root, type_ != "AppShell")
            self.validate_discriminated(root, self.defs.get("Component") or {}, "Component", "$", page_keys)
            return
        if _has(root, "layout") or _has(root, "layoutDelta"):
            self.kind = "envelope"
            self.prepare_action_check(root, True)
            self.validate_object(root, self.branch(lambda b: "layout" in (b.get("properties") or {})), "$", None, {})
            return
        typeless: str | None = None
        which: Callable[[dict], bool] | None = None
        sources = _get(root, "sources")
        if _has(root, "content"):
            typeless, which = "partial", lambda b: b.get("required") == ["content"]
        elif _has(root, "components"):
            typeless, which = "components", lambda b: "components" in (b.get("properties") or {})
        elif _has(root, "routes"):
            typeless, which = "routes", lambda b: _const_of(b) == "Routes"
        elif _has(root, "actions"):
            typeless, which = "actions", lambda b: _const_of(b) == "Actions"
        elif _has(root, "types"):
            typeless, which = "types", lambda b: _const_of(b) == "Types"
        elif _has(root, "messages"):
            typeless, which = "translations", lambda b: _const_of(b) == "Translations"
        elif isinstance(sources, SequenceNode):
            typeless, which = "sources", lambda b: _const_of(b) == "Sources"
        elif isinstance(sources, MappingNode):
            typeless, which = "environment", lambda b: _const_of(b) == "Environment"
        if typeless is None or which is None:
            self.unknown_kind(root)
            return
        self.kind = typeless
        self.validate_object(root, self.branch(which), "$", None, {})

    def unknown_kind(self, root: Node) -> None:
        self.issue(
            self.errors,
            "unknown_kind",
            "Cannot tell what kind of definition this is: give it a `type:` (a component such as"
            " VerticalLayout, or a file kind such as UI, Routes or Sources), or a `layout:`,"
            " `content:` or `components:` key.",
            "$",
            root.start_mark,
        )

    def branch(self, predicate: Callable[[dict], bool]) -> dict:
        for branch in self.specs.get("oneOf") or []:
            if predicate(branch):
                return branch
        raise RuntimeError("specs-schema.json lacks an expected root branch")

    def prepare_action_check(self, root: MappingNode, applies: bool) -> None:
        """The page's own declared action ids, unless a view model is named (it owns the actions)."""
        if not applies or not _blank(_scalar_text(_get(root, "viewModel"))) or not _blank(
            _scalar_text(_get(root, "modelView"))
        ):
            return
        self.declared_actions = set()
        actions = _get(root, "actions")
        if isinstance(actions, SequenceNode):
            for item in actions.value:
                if isinstance(item, MappingNode):
                    action_id = _scalar_text(_get(item, "id"))
                    if action_id is not None:
                        self.declared_actions.add(action_id)

    # ── the walk ─────────────────────────────────────────────────────────────────────────────

    def validate_node(self, node: Node, schema: dict, path: str, key: str | None) -> None:
        if not self.count():
            return
        def_name: str | None = None
        while "$ref" in schema:
            def_name = str(schema["$ref"])[len(_REF_PREFIX):]
            schema = self.defs.get(def_name) or {}
        if _is_null(node):
            return
        if "oneOf" in schema:
            self.validate_discriminated(node, schema, def_name, path, None)
            return
        if "enum" in schema:
            if not isinstance(node, ScalarNode):
                self.wrong_type(node, "a string", path)
                return
            allowed = [_as_text(v) for v in schema["enum"]]
            if node.value not in allowed:
                self.issue(
                    self.errors,
                    "invalid_value",
                    f"{quote(node.value)} is not a valid {key if key is not None else 'value'}"
                    f" — use one of: {', '.join(allowed)}.",
                    path,
                    node.start_mark,
                )
            return
        types = _types_of(schema)
        if types and not _fits(node, types):
            self.wrong_type(node, _expected(types), path)
            return
        if isinstance(node, MappingNode) and ("properties" in schema or "additionalProperties" in schema):
            self.validate_object(node, schema, path, def_name, {})
        elif isinstance(node, SequenceNode) and "items" in schema:
            items = schema["items"]
            for i, item in enumerate(node.value):
                self.validate_node(item, items, f"{path}[{i}]", key)

    def validate_discriminated(
        self, node: Node, family: dict, family_name: str | None, path: str, extra_keys: dict | None
    ) -> None:
        if not isinstance(node, MappingNode):
            self.wrong_type(node, "a mapping", path)
            return
        type_node = _get(node, "type")
        if type_node is None or _is_null(type_node):
            self.issue(
                self.errors,
                "missing_type",
                f'Missing "type": a {family_name} must say which one it is.',
                path,
                node.start_mark,
            )
            return
        if not isinstance(type_node, ScalarNode):
            self.wrong_type(type_node, "a string", path + ".type")
            return
        type_ = type_node.value
        candidates: list[str] = []
        member: str | None = None
        for ref in family.get("oneOf") or []:
            name = str(ref.get("$ref", ""))[len(_REF_PREFIX):]
            const = ((self.defs.get(name) or {}).get("properties") or {}).get("type", {}).get("const")
            candidate = _as_text(const) if const is not None else name
            candidates.append(candidate)
            if candidate == type_:
                member = name
        if member is None:
            suggestion = suggest(type_, candidates)
            self.issue(
                self.errors,
                "unknown_type",
                f"Unknown {family_name} type {quote(type_)}."
                + (f" Did you mean {quote(suggestion)}?" if suggestion is not None else ""),
                path + ".type",
                type_node.start_mark,
            )
            return
        self.validate_object(node, self.defs.get(member) or {}, path, member, dict(extra_keys or {}))

    def validate_object(
        self, mapping: MappingNode, schema: dict, path: str, def_name: str | None, extra_keys: dict
    ) -> None:
        properties: dict = schema.get("properties") or {}
        for required in schema.get("required") or []:
            if _get(mapping, _as_text(required)) is None:
                self.issue(
                    self.errors,
                    "missing_required",
                    f"Missing required key {quote(_as_text(required))}.",
                    path,
                    mapping.start_mark,
                )
        additional = schema.get("additionalProperties")
        for key_node, value in mapping.value:
            if self.aborted:
                return
            if not isinstance(key_node, ScalarNode):
                continue
            key = key_node.value
            child_path = path + segment(key)
            property_schema = properties.get(key)
            if property_schema is None:
                property_schema = extra_keys.get(key)
            if property_schema is not None:
                self.semantic(def_name, key, value, child_path)
                self.validate_node(value, property_schema, child_path, key)
            elif isinstance(additional, dict):
                self.validate_node(value, additional, child_path, key)
            elif "properties" in schema:
                known = list(properties) + list(extra_keys)
                suggestion = suggest(key, known)
                self.issue(
                    self.warnings,
                    "unknown_property",
                    f"Unknown key {quote(key)} (ignored)."
                    + (
                        f" Did you mean {quote(suggestion)}?"
                        if suggestion is not None
                        else f" Known keys here: {', '.join(known)}."
                    ),
                    child_path,
                    key_node.start_mark,
                )

    # ── semantic checks ──────────────────────────────────────────────────────────────────────

    def semantic(self, def_name: str | None, key: str, value: Node, path: str) -> None:
        text = _scalar_text(value)
        if text is None or _blank(text):
            return
        ctx = self.context
        if key == "ref" and def_name == "RestDataSource":
            self.resolves(
                ctx.source, text, "unresolved_source",
                f"Source {quote(text)} is not in the source catalogue (sources.yaml).", path, value,
            )
        elif key == "ref" and def_name == "Partial":
            self.resolves(
                ctx.partial, text, "unresolved_partial",
                f"Partial {quote(text)} does not exist (specs/ui/partials/).", path, value,
            )
        elif key == "ref" and def_name == "ComponentRef":
            self.resolves(
                ctx.component, text, "unresolved_component",
                f"Component {quote(text)} is not in the business component catalogue (components.yaml).",
                path, value,
            )
        elif key in ("url", "body") and def_name == "RestDataSource":
            self.proxy_safe(text, path, value)
        elif key == "fieldType":
            self.resolves(
                ctx.field_type, text, "unresolved_field_type",
                f"Field type {quote(text)} is not in the field type catalogue (types.yaml).", path, value,
            )
        elif (
            self.declared_actions is not None
            and (key == "actionId" or key.endswith("ActionId"))
            and text not in self.declared_actions
            and (ctx.action is None or not ctx.action(text))
        ):
            self.issue(
                self.warnings,
                "undeclared_action",
                f"Action {quote(text)} is not declared in this page's actions: (or the action catalogue);"
                " it only runs if the view model bound to the page has an action of that name.",
                path,
                value.start_mark,
            )

    def proxy_safe(self, template: str, path: str, at: Node) -> None:
        """A source template the SERVER cannot evaluate the way the browser does: on a proxied source
        (proxy: true, or an environment overlay that flips it) such a placeholder renders empty.
        The server evaluates the subset of :mod:`mateu_ui.core.proxy_expression`; ``data``/
        ``appState``/``appData`` exist only in the browser. Java's UidlValidator.proxySafe."""
        for m in _PLACEHOLDER.finditer(template):
            expr = m.group(1).strip()
            why = None
            if _CLIENT_ONLY_ROOT.search(expr):
                why = "reads data/appState/appData, which only the browser has"
            elif not proxy_expression.is_supported(expr):
                why = "uses syntax outside what the server evaluates"
            if why is not None:
                self.issue(
                    self.warnings,
                    "proxy_unsafe_template",
                    "${" + expr + "} " + why
                    + ": if this source is proxied (proxy: true, or an environment flips it) it is sent empty.",
                    path,
                    at.start_mark,
                )

    def resolves(
        self, known: Predicate | None, name: str, code: str, message: str, path: str, at: Node
    ) -> None:
        if known is not None and not known(name):
            self.issue(self.warnings, code, message, path, at.start_mark)

    # ── helpers ──────────────────────────────────────────────────────────────────────────────

    def count(self) -> bool:
        if self.aborted:
            return False
        self.visited += 1
        if self.visited > MAX_NODES:
            self.too_complex()
            return False
        return True

    def too_complex(self) -> None:
        if self.aborted:
            return
        self.aborted = True
        self.issue(
            self.errors, "too_complex", f"The YAML is too complex to validate (more than {MAX_NODES} nodes).", "$", None
        )

    def wrong_type(self, node: Node, expected: str, path: str) -> None:
        self.issue(self.errors, "wrong_type", f"Expected {expected}, found {_found(node)}.", path, node.start_mark)

    @staticmethod
    def issue(into: list[dict], code: str, message: str, path: str, mark: Any) -> None:
        entry: dict[str, Any] = {"code": code, "message": message, "path": path}
        if mark is not None:
            entry["line"] = mark.line + 1
            entry["column"] = mark.column + 1
        into.append(entry)


# ── scalar typing (normative, see the module docstring) ─────────────────────────────────────────


def _is_plain(scalar: ScalarNode) -> bool:
    return scalar.style is None


def _is_null(node: Node) -> bool:
    if not isinstance(node, ScalarNode) or not _is_plain(node):
        return False
    v = node.value
    return v == "" or v == "~" or v.lower() == "null"


def _types_of(schema: dict) -> list[str]:
    type_ = schema.get("type")
    if type_ is None:
        return []
    if isinstance(type_, list):
        return [_as_text(t) for t in type_]
    return [_as_text(type_)]


def _fits(node: Node, types: list[str]) -> bool:
    for type_ in types:
        if type_ == "object":
            ok = isinstance(node, MappingNode)
        elif type_ == "array":
            ok = isinstance(node, SequenceNode)
        elif type_ == "string":
            ok = isinstance(node, ScalarNode)
        elif type_ == "boolean":
            ok = isinstance(node, ScalarNode) and node.value.lower() in ("true", "false")
        elif type_ == "integer":
            ok = isinstance(node, ScalarNode) and _INT.fullmatch(node.value.strip()) is not None
        elif type_ == "number":
            ok = isinstance(node, ScalarNode) and (
                _INT.fullmatch(node.value.strip()) is not None or _FLOAT.fullmatch(node.value.strip()) is not None
            )
        else:
            ok = True
        if ok:
            return True
    return False


_WORDS = {
    "string": "a string",
    "boolean": "a boolean",
    "integer": "an integer",
    "number": "a number",
    "object": "a mapping",
    "array": "a list",
}


def _expected(types: list[str]) -> str:
    words = [_WORDS.get(t, t) for t in types]
    if len(words) == 1:
        return words[0]
    return ", ".join(words[:-1]) + " or " + words[-1]


def _found(node: Node) -> str:
    if isinstance(node, MappingNode):
        return "a mapping"
    if isinstance(node, SequenceNode):
        return "a list"
    return quote(str(node.value))


def quote(value: str) -> str:
    """A value in a message: double-quoted, with ``\\`` and ``"`` escaped."""
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def segment(key: str) -> str:
    """A JSONPath segment for a mapping key."""
    if _IDENTIFIER.fullmatch(key):
        return "." + key
    return "['" + key.replace("\\", "\\\\").replace("'", "\\'") + "']"


def suggest(value: str, candidates: list[str]) -> str | None:
    """The closest candidate (case-insensitive; equal ignoring case first, else the smallest edit
    distance ≤ 2 that is also smaller than the value's length; ties go to the earlier one), or None."""
    lower = value.lower()
    for c in candidates:
        if c.lower() == lower:
            return c
    best: str | None = None
    best_distance = None
    for c in candidates:
        d = levenshtein(lower, c.lower())
        if best_distance is None or d < best_distance:
            best_distance = d
            best = c
    if best is not None and best_distance is not None and best_distance <= 2 and best_distance < len(value):
        return best
    return None


def levenshtein(a: str, b: str) -> int:
    previous = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        current = [i] + [0] * len(b)
        for j in range(1, len(b) + 1):
            cost = 0 if a[i - 1] == b[j - 1] else 1
            current[j] = min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost)
        previous = current
    return previous[len(b)]


def _get(mapping: MappingNode, key: str) -> Node | None:
    for k, v in mapping.value:
        if isinstance(k, ScalarNode) and k.value == key:
            return v
    return None


def _has(mapping: MappingNode, key: str) -> bool:
    return _get(mapping, key) is not None


def _scalar_text(node: Node | None) -> str | None:
    return node.value if isinstance(node, ScalarNode) and not _is_null(node) else None


def _const_of(branch: dict) -> str | None:
    c = ((branch.get("properties") or {}).get("type") or {}).get("const")
    return c if isinstance(c, str) else None


def _as_text(value: Any) -> str:
    """Jackson's ``asText`` of a schema value."""
    if isinstance(value, bool):
        return "true" if value else "false"
    if value is None:
        return "null"
    return str(value)


def _blank(s: str | None) -> bool:
    return s is None or not s.strip()


def _capitalize(s: str) -> str:
    return s[:1].upper() + s[1:]
