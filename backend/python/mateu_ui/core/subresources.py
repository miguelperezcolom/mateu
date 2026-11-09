"""``Subresource()``: a record's sub-listings, placed in its tabs (several stacked in one tab), given
the parent as context, lazy by default and counted on the tab when eager — and the embedded
orchestrator island they render as (Java's ``Subresources`` + ``EmbeddedOrchestratorFieldBuilder``).
"""

from __future__ import annotations

import re
from enum import Enum
from typing import Any

from .naming import camel_case, humanize_constant

EMBEDDED_MARKER = "_embeddedMediator"
INLINE_MARKER = "_inline"
HIDE_TITLE_MARKER = "_hideTitle"
SCOPE_MARKER = "_scope"
LAZY_MARKER = "_lazy"


def is_orchestrator(t: Any) -> bool:
    """A listing or crud (any orchestrator) a field can embed as an island (Java's MultiView)."""
    if not isinstance(t, type):
        return False
    from mateu_ui.uidl import Crud, EditableView, Listing, MasterDetailView

    return issubclass(t, (Crud, Listing, EditableView, MasterDetailView))


def marker_of(f):
    from mateu_ui.uidl import Subresource

    return f.marker(Subresource)


def is_subresource(f) -> bool:
    return marker_of(f) is not None


def label(spec: str) -> str:
    """``gateways`` → "Gateways" (Java's Subresources.label)."""
    return humanize_constant(spec.replace("-", " "))


def kebab(spec: str) -> str:
    """Java's Humanizer.toKebabCase: ``internetGateways`` → ``internet-gateways``."""
    s = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", "-", spec.strip())
    return re.sub(r"[\s_]+", "-", s).lower()


def place(groups: list[dict], movable: list) -> None:
    """Moves every sub-resource field into the tab it names — an existing one matched by key or
    label, else a new one at the end — after that tab's own fields, in ``order``. A sub-resource
    whose ``show`` flag is off is left out (Java's Subresources.place). ``groups`` are the tab
    groups ``{name, open, key, show, fields}``, changed in place."""
    from . import routed_tabs

    moved = [f for f in movable if routed_tabs.shows(marker_of(f).show)]
    by_tab: dict[str, list] = {}
    for f in moved:
        spec = marker_of(f).tab or camel_case(f.name)
        by_tab.setdefault(spec, []).append(f)
    for spec, fields in by_tab.items():
        fields.sort(key=lambda f: marker_of(f).order)
        target = next(
            (
                g
                for g in groups
                if spec.lower() == (g["key"] or "").lower()
                or spec.lower() == g["name"].lower()
                or label(spec).lower() == g["name"].lower()
            ),
            None,
        )
        if target is None:
            target = {"name": label(spec), "open": False, "key": kebab(spec), "show": None, "fields": []}
            groups.append(target)
        target["fields"].extend(fields)


def _simple(value) -> Any:
    if isinstance(value, Enum):
        return value.name
    if isinstance(value, bool) or isinstance(value, (str, int, float)):
        return value
    return None


def _field_names(cls) -> dict[str, str]:
    """wire name → python name of every declared field of ``cls`` (its MRO)."""
    names: dict[str, str] = {}
    for klass in reversed(getattr(cls, "__mro__", ())):
        for name in getattr(klass, "__annotations__", {}) or {}:
            names[camel_case(name)] = name
    return names


def context(f, host, host_type=None) -> dict[str, Any]:
    """The parent, as the sub-listing's context (wire names): the request route's path parameters,
    the host's simple field values whose names the listing also has, and the explicit ``context``
    bindings (Java's Subresources.context)."""
    from . import routed_tabs

    listing_fields = _field_names(f.type)
    out: dict[str, Any] = {}
    for name, value in routed_tabs.chain_params().items():
        if name in listing_fields:
            out[name] = value
    if host is not None:
        host_fields = _field_names(type(host))
        for wire, py in host_fields.items():
            if py == f.name or wire not in listing_fields:
                continue
            value = _simple(getattr(host, py, None))
            if value is not None:
                out[wire] = value
        for binding in marker_of(f).context or ():
            target, _, source = binding.partition("=")
            target = target.strip()
            source = (source or target).strip()
            bound = host_fields.get(source) or (source if source in host_fields.values() else None)
            if bound is None:
                raise ValueError(
                    f"Subresource {f.name}: context '{binding}' names {source}, which "
                    f"{type(host).__name__} does not have"
                )
            value = _simple(getattr(host, bound, None))
            if value is not None:
                out[target] = value
    return out


def rows(f, host) -> int | None:
    """The rows an eager sub-listing has for this parent, or None when it cannot tell."""
    try:
        listing = f.type()
        names = _field_names(f.type)
        for wire, value in context(f, host).items():
            if wire in names:
                setattr(listing, names[wire], value)
        from mateu_ui.uidl import Crud

        if isinstance(listing, Crud):
            return len(list(listing.fetch("") or []))
        search = getattr(listing, "search", None)
        if callable(search):
            from mateu_ui.uidl import SearchRequest
            from mateu_ui.uidl.listing import Pageable

            data = search(SearchRequest(search_text="", pageable=Pageable(page=0, size=1)))
            total = getattr(data, "total_elements", None)
            return int(total) if total is not None else len(list(getattr(data, "rows", None) or data or []))
    except Exception:  # noqa: BLE001 - no count
        return None
    return None


def badge(fields: list, host) -> str | None:
    """The tab badge for its EAGER sub-resources: their rows summed, or None (Java's
    Subresources.badge)."""
    total, counted = 0, False
    for f in fields:
        marker = marker_of(f)
        if marker is None or str(marker.load).upper() != "EAGER":
            continue
        n = rows(f, host)
        if n is not None:
            total += n
            counted = True
    return str(total) if counted else None


def title(f) -> str:
    """The sub-listing's title: its type's title, else the field name humanized."""
    value = getattr(f.type, "__mateu_title__", None)
    if isinstance(value, str) and value.strip():
        return value
    return humanize_constant(camel_case(f.name))


def island_crud(registry, route: str | None, server_side_type: str | None):
    """The crud a sub-resource island addresses: ``/_subresource/<Host>/<field>`` names a
    registered host class holding a ``Subresource()`` field of that name whose type is the
    request's server-side type — nothing else is resolved by type here. ``(type, base route)``."""
    path = (route or "").split("?", 1)[0]
    parts = path.strip("/").split("/")
    if len(parts) != 3 or parts[0] != "_subresource" or not server_side_type:
        return None
    from .reflection import view_fields
    from .registry import type_name

    for host in getattr(registry, "classes", []) or []:
        if getattr(host, "__name__", None) != parts[1]:
            continue
        try:
            fields = view_fields(host)
        except Exception:  # noqa: BLE001
            continue
        for f in fields:
            if camel_case(f.name) == parts[2] and is_subresource(f) and type_name(f.type) == server_side_type:
                return f.type, "/" + "/".join(parts)
    return None


def own_fields(cls) -> dict[str, str]:
    """wire name → python name of the fields an APPLICATION class declares (its MRO, without
    Mateu's own base classes) — what the request state hydrates on an orchestrator."""
    names: dict[str, str] = {}
    for klass in reversed(getattr(cls, "__mro__", ())):
        if (getattr(klass, "__module__", "") or "").startswith("mateu_ui"):
            continue
        for name in getattr(klass, "__annotations__", {}) or {}:
            if not name.startswith("_"):
                names[camel_case(name)] = name
    return names


def route_scope_names(route: str | None) -> set[str]:
    """The scope names an island's route carries (``_scope=a,b``)."""
    if not route or SCOPE_MARKER + "=" not in route:
        return set()
    value = route[route.index(SCOPE_MARKER + "=") + len(SCOPE_MARKER) + 1:]
    value = re.split(r"[&?]", value)[0]
    return {n.strip() for n in value.split(",") if n.strip()}


def hides_title(route: str | None) -> bool:
    """Whether the request is an island whose listing must not draw its own title."""
    return route is not None and HIDE_TITLE_MARKER in route
