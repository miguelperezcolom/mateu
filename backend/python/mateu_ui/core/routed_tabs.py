"""Routed tabs — a record master whose registry ``children`` are its tabs, and in-page tabs that
are URLs (Java's ``RouteChains`` + ``RouteRegistry.chain/childrenOf/defaultChildOf``,
``AppMenuBuilder.childRouteTabs``, ``FormLayoutBuilder.routedTabKey`` and ``FeatureFlagGate``).

A child route (``customers/:customerId/orders``) is the content of its parent's slot: the parent —
an app with no menu of its own, typically ``@app(variant=AppVariant.TABS)`` — offers its children
as its tabs, opens its default one (``default_child``, else the first visible) when reached on its
own, and a tab's own page does not repeat the tab's label as its title (``dedupe_title``). A
child's ``show`` names a feature flag (:class:`~mateu_ui.uidl.FeatureFlags`): a tab whose flag is
off leaves the bar, but its route keeps answering. Every helper answers "nothing" rather than
raising, so an app with no authored routes behaves as before.
"""

from __future__ import annotations

from contextvars import ContextVar
from dataclasses import dataclass
from typing import Any

from .naming import humanize_constant

#: The request route of the request being handled (the URL the browser shows): what the tab key
#: and the title de-duplication are read against, deep in the mapping.
_route: ContextVar[str | None] = ContextVar("mateu_request_route", default=None)
#: The deployment's FeatureFlags instances, for this request.
_flags: ContextVar[tuple] = ContextVar("mateu_feature_flags", default=())
#: The handler's route table and type registry, for this request.
_tables: ContextVar[tuple] = ContextVar("mateu_route_tables", default=(None, None))


def begin(route: str | None, flags, routes=None, registry=None) -> tuple:
    """Remembers the request's route, the deployment's flags and its route table / type
    registry; returns the tokens to reset."""
    return _route.set(route), _flags.set(tuple(flags or ())), _tables.set((routes, registry))


def end(tokens: tuple) -> None:
    _route.reset(tokens[0])
    _flags.reset(tokens[1])
    _tables.reset(tokens[2])


def request_route() -> str | None:
    return _route.get()


def _normalize(path: str | None) -> str:
    return (path or "").split("?", 1)[0].strip("/")


def is_on(flag: str) -> bool:
    """A flag no FeatureFlags instance knows is ON (Java's FeatureFlagGate.isOn)."""
    for supplier in _flags.get():
        try:
            answer = supplier.is_enabled(flag)
        except Exception:  # noqa: BLE001 - a broken supplier has no say
            continue
        if answer is not None:
            return bool(answer)
    return True


def shows(condition: str | None) -> bool:
    """A ``show`` condition — a flag name, optionally negated with ``!``; blank means shown."""
    if condition is None or not condition.strip():
        return True
    trimmed = condition.strip()
    negated = trimmed.startswith("!")
    flag = trimmed[1:].strip() if negated else trimmed
    return negated != is_on(flag)


@dataclass(frozen=True)
class ChildRoute:
    """A child route as seen from a concrete parent path: ``relative`` with a leading slash
    (``/orders``), ``path`` the child's concrete absolute path (``/customers/7/orders``)."""

    entry: Any
    relative: str
    path: str


def children_of(routes, concrete_path: str | None) -> list[ChildRoute]:
    """The authored children of the route answering ``concrete_path``, in authored order."""
    if routes is None or concrete_path is None:
        return []
    try:
        normalized = _normalize(concrete_path)
        match = routes.match(normalized)
        if match is None:
            return []
        parent_route = _normalize(match.entry.route)
        out = []
        for entry in routes.authored().routes:
            if not entry.has_parent() or _normalize(entry.parent) != parent_route:
                continue
            child_route = _normalize(entry.route)
            suffix = child_route[min(len(parent_route), len(child_route)):]
            if not suffix.startswith("/"):
                suffix = "/" + suffix
            out.append(ChildRoute(entry, suffix, "/" + normalized + suffix))
        return out
    except Exception:  # noqa: BLE001 - no say
        return []


def visible_children_of(routes, concrete_path: str | None, authorized=None) -> list[ChildRoute]:
    """:func:`children_of` without the ones whose ``show`` flag is off, or whose ``access:`` the
    caller does not satisfy."""
    return [
        c
        for c in children_of(routes, concrete_path)
        if shows(getattr(c.entry, "show", None))
        and (
            authorized is None
            or not c.entry.restricts_access()
            or authorized(c.entry.access)
        )
    ]


def default_child_path(routes, concrete_path: str | None, authorized=None) -> str | None:
    """The default child of the route answering ``concrete_path`` among the VISIBLE ones: the one
    its ``default_child`` names when that one shows, else the first that does; None for none."""
    children = visible_children_of(routes, concrete_path, authorized)
    if not children:
        return None
    try:
        match = routes.match(_normalize(concrete_path))
        named = getattr(match.entry, "default_child", None) if match is not None else None
        if named and named.strip():
            wanted = "/" + _normalize(named)
            for child in children:
                if child.relative == wanted:
                    return child.path
    except Exception:  # noqa: BLE001 - the first one
        pass
    return children[0].path


def chain_links(routes, path: str | None) -> list[tuple[Any, str]]:
    """The chain answering ``path`` (outermost first), each entry with its CONCRETE path; past a
    CHILD route the path is that child's own (a crud's record): the leaf is the longest prefix the
    table answers (Java's RouteRegistry.chain)."""
    if routes is None or path is None:
        return []
    try:
        normalized = _normalize(path)
        segments = normalized.split("/") if normalized else []
        leaf_path: str | None = normalized
        if routes.match(normalized) is None:
            leaf_path = None
            for n in range(len(segments) - 1, 0, -1):
                prefix = "/".join(segments[:n])
                match = routes.match(prefix)
                if match is not None:
                    if not match.entry.has_parent():
                        return []
                    leaf_path = prefix
                    break
            if leaf_path is None:
                return []
        entries = routes.chain(leaf_path)
        out = []
        for entry in entries:
            depth = len(_normalize(entry.route).split("/")) if _normalize(entry.route) else 0
            out.append((entry, "/" + "/".join(segments[:depth])))
        return out
    except Exception:  # noqa: BLE001 - no say
        return []


def _static_title_of(registry, view_model: str | None) -> str | None:
    if not view_model or registry is None:
        return None
    try:
        cls = registry.authored_type(view_model)
    except Exception:  # noqa: BLE001
        return None
    value = getattr(cls, "__mateu_title__", None) if cls is not None else None
    return value if isinstance(value, str) and value.strip() else None


def tab_label(registry, entry, relative: str) -> str:
    """The label of a child route offered as a tab: its view model's title, else its segment."""
    title = _static_title_of(registry, getattr(entry, "view_model", None))
    if title is not None:
        return title
    trimmed = relative.strip("/")
    last = trimmed[trimmed.rfind("/") + 1:] if "/" in trimmed else trimmed
    return humanize_constant(last.replace("-", " "))


def dedupe_title(title: str | None, routes=None, registry=None, route: str | None = None) -> str | None:
    """``title`` unless the request is a routed tab's own page and ``title`` equals that tab's
    label or the enclosing master's title — then None: the label is drawn once, by the tab (Java's
    RouteChains.dedupeTitle)."""
    route = request_route() if route is None else route
    if routes is None and registry is None:
        routes, registry = _tables.get()
    if not title or not title.strip() or route is None:
        return title
    try:
        chain = chain_links(routes, route)
        if len(chain) < 2:
            return title
        leaf, leaf_path = chain[-1]
        if "/" + _normalize(route) != leaf_path:
            return title  # a record inside the tab: its own title
        parent, parent_path = chain[-2]
        relative = leaf_path[min(len(parent_path), len(leaf_path)):]
        if title.strip().lower() == tab_label(registry, leaf, relative).strip().lower():
            return None
        parent_title = _static_title_of(registry, parent.view_model)
        if parent_title is not None and title.strip().lower() == parent_title.strip().lower():
            return None
        return title
    except Exception:  # noqa: BLE001
        return title


def mount_of(routes, route: str | None, wanted: str | None) -> str | None:
    """Where ``type_`` is mounted inside ``route``: the SHORTEST prefix of it the authored table
    answers with that very view model (``wanted``, its type name; a crud also answers its own sub-routes, which are not its
    mount) — ``/customers/7`` for the master on ``/customers/7/orders``. None when no prefix does
    (Java's ActionInstanceCreator.mountOf)."""
    if routes is None or route is None or not wanted:
        return None
    segments = [s for s in _normalize(route).split("/") if s]
    for n in range(1, len(segments) + 1):
        prefix = "/".join(segments[:n])
        try:
            match = routes.match(prefix)
        except Exception:  # noqa: BLE001
            match = None
        if match is not None and match.entry.view_model == wanted:
            return "/" + prefix
    return None


def chain_params(routes=None, route: str | None = None) -> dict[str, Any]:
    """The path parameters of the request route's chain, outermost first (``customerId`` under
    ``/customers/7/orders/new``)."""
    if routes is None:
        routes = _tables.get()[0]
    route = request_route() if route is None else route
    out: dict[str, Any] = {}
    for _entry, path in chain_links(routes, route):
        try:
            match = routes.match(path)
        except Exception:  # noqa: BLE001
            match = None
        if match is not None:
            out.update(match.path_params)
    return out


def route_scope() -> set[str]:
    """The names a listing's filters cannot change because the route fixes them: the path
    parameters of the request route's chain (Java's CrudlMapper.routeScope)."""
    from .subresources import route_scope_names

    names = set(chain_params()) if len(chain_links(_tables.get()[0], request_route())) > 1 else set()
    # a sub-resource island's parent fixes its scope too (Java's EmbeddedOrchestratorFieldBuilder.scopeOf)
    return names | route_scope_names(request_route())


def hides_listing_title() -> bool:
    """Whether the request is a sub-resource island whose listing draws no title of its own (the
    host draws it above the island)."""
    from .subresources import hides_title

    return hides_title(request_route())


def scope_values_for(cls, routes=None, route: str | None = None) -> dict[str, Any]:
    """The chain's path parameters ``cls`` has a field for (by its wire name, ``customerId`` →
    ``customer_id``) — what a new child record created under a master starts with (Java's
    RouteChains.scopeValuesFor). Empty when the route has no chain."""
    if routes is None:
        routes = _tables.get()[0]
    route = request_route() if route is None else route
    if cls is None or len(chain_links(routes, route)) < 2:
        return {}
    from .naming import camel_case
    from .reflection import view_fields

    params = chain_params(routes, route)
    out: dict[str, Any] = {}
    for f in view_fields(cls):
        wire = camel_case(f.name)
        if wire in params:
            out[f.name] = params[wire]
    return out


def pending_app_ancestor(routes, registry, route: str | None, consumed: str | None):
    """The ancestor of ``route`` that has to render it: the outermost link of its chain beyond
    ``consumed`` when that link is an ANCESTOR (not the route itself) backed by an app class — an
    app has a slot to render the rest into. ``(app type, its concrete path)`` or None (Java's
    RouteChains.pendingAppAncestor)."""
    chain = chain_links(routes, route)
    if len(chain) < 2 or registry is None:
        return None
    done = "" if consumed in (None, "_empty") else _normalize(consumed)
    pending = next(
        (
            (entry, path)
            for entry, path in chain
            if len(_normalize(path)) > len(done) and (not done or _normalize(path).startswith(done))
        ),
        None,
    )
    if pending is None or pending == chain[-1] or not pending[0].view_model:
        return None
    cls = registry.authored_type(pending[0].view_model)
    if cls is None or "__mateu_app__" not in cls.__dict__:
        return None
    return cls, pending[1]


def routed_tab_key(keys: list[str | None]) -> str | None:
    """The tab key the request route ends with, or None: ``/vcn/7/gateways`` opens Gateways."""
    route = request_route()
    if not route or not route.strip():
        return None
    path = route.split("?", 1)[0].rstrip("/")
    last = path[path.rfind("/") + 1:]
    return next((k for k in keys if k and k.strip() and k == last), None)
