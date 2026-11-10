"""Builds a fluent component tree from YAML page text — the visual-builder live preview
(mirrors Java's YamlUidlLoader.parseText and the .NET YamlComponentBuilder).

The YAML uses a ``type`` discriminator; :func:`build_from_yaml` dispatches on it and reads the
YAML keys into the fluent dataclasses, handling the name differences: a FormField's ``id`` →
``field_id``. Envelope-aware — a page with a ``layout:`` key renders that layout. The tree is
then mapped to the wire by the normal ``ReflectionMapper.map_component``.

A ``type: Partial`` node is resolved here, against a :class:`PartialRegistry`, and never reaches the
built tree — so nothing downstream, and no renderer, has to know partials exist.
"""

from __future__ import annotations

from contextvars import ContextVar
from typing import Any

import yaml

from mateu_ui.core.partial_registry import PartialRegistry
from mateu_ui.uidl import components as fluent

#: A partial chain longer than this is a bug, not a design.
_MAX_DEPTH = 20

_DEFAULT_PARTIALS = PartialRegistry()

#: The field type catalogue `fieldType:` references resolve against while a tree is being built
#: (a contextvar so the partials expanded mid-build are resolved too, without threading it through
#: every builder). Set by the entry points below.
_types: ContextVar[Any] = ContextVar("mateu_field_types", default=None)

#: Where a reporting build (:func:`parse_text_reporting`) collects the values a component refused —
#: the lenient builder otherwise drops such a component silently.
_problems: ContextVar[list[str] | None] = ContextVar("mateu_yaml_problems", default=None)


def _types_of(field_types):
    if field_types is not None:
        return field_types
    from .field_type_registry import default_registry

    return default_registry()


def _resolve_types(node: Any) -> Any:
    """``node`` with its ``fieldType`` references resolved (Java's FieldTypeResolver): the type
    supplies defaults, the node's own attributes win, the key never reaches the wire."""
    from .field_type_registry import mentions_a_field_type

    if not mentions_a_field_type(node):
        return node
    registry = _types.get() or _types_of(None)
    return registry.resolve(node)


def _with_types(field_types, fn, *args):
    token = _types.set(_types_of(field_types))
    try:
        return fn(*args)
    finally:
        _types.reset(token)


def build_from_yaml(
    text: str, partials: PartialRegistry | None = None, field_types=None
) -> fluent.Component | None:
    """Parse YAML page text and build a fluent component tree (or ``None`` on failure)."""
    try:
        data = yaml.safe_load(text)
    except yaml.YAMLError:
        return None
    if isinstance(data, dict) and "layout" in data:
        data = data["layout"]  # page envelope → render the layout
    return _with_types(field_types, _single, data, partials or _DEFAULT_PARTIALS, [])


#: What the live preview answers for a definition whose aliases expand past the node budget.
TOO_MANY_NODES = "the YAML expands to too many nodes to preview"


def expands_past(data: Any, budget: int) -> bool:
    """Whether walking ``data`` the way the builder does — once per reference, so an alias counts
    every time it is used — meets more than ``budget`` nodes. Children are counted before they are
    queued, so neither an alias bomb nor a cycle can grow the walk past the budget."""
    seen = 1
    pending = [data]
    while pending:
        node = pending.pop()
        children = list(node.values()) if isinstance(node, dict) else node if isinstance(node, list) else None
        if children is None:
            continue
        seen += len(children)
        if seen > budget:
            return True
        pending.extend(children)
    return False


def parse_text_reporting(
    text: str | None, partials: PartialRegistry | None = None, field_types=None
) -> tuple[fluent.Component | None, str | None]:
    """:func:`build_from_yaml`, keeping WHY a definition could not be read (Java's
    ``YamlUidlLoader.parseTextReporting``): ``(component, problem)``. The problem is None when there
    is a component, when the text is blank, and for a ``layoutDelta:`` envelope (which has no layout
    of its own on purpose). A value a component refuses — swallowed by the lenient builder, which
    renders the rest — is a problem here: what the preview and ``mateu_validate_uidl`` report."""
    if text is None or not text.strip():
        return None, None
    try:
        data = yaml.safe_load(text)
    except yaml.YAMLError as e:
        return None, _yaml_problem(e)
    from .authoring.validator import MAX_NODES

    # the text limit says nothing about what its aliases ask the builder to walk
    if expands_past(data, MAX_NODES):
        return None, TOO_MANY_NODES
    if isinstance(data, dict) and "layout" not in data and "layoutDelta" in data:
        return None, None
    if isinstance(data, dict) and "layout" in data:
        data = data["layout"]
    problems: list[str] = []
    token = _problems.set(problems)
    try:
        tree = _with_types(field_types, _single, data, partials or _DEFAULT_PARTIALS, [])
    except Exception as e:  # noqa: BLE001 — a builder failure is the definition's problem, reported
        return None, f"{type(e).__name__}: {e}"
    finally:
        _problems.reset(token)
    if problems:
        return None, problems[0]
    return tree, None


def default_partials() -> PartialRegistry:
    """The partial registry the YAML builder resolves ``type: Partial`` against."""
    return _DEFAULT_PARTIALS


def _yaml_problem(error: yaml.YAMLError) -> str:
    mark = getattr(error, "problem_mark", None) or getattr(error, "context_mark", None)
    problem = getattr(error, "problem", None) or str(error)
    where = f"line {mark.line + 1}, column {mark.column + 1}: " if mark is not None else ""
    return where + str(problem).strip()


def build_node(
    node: Any, partials: PartialRegistry | None = None, field_types=None
) -> fluent.Component | None:
    """One already-parsed YAML node (a dict) as a fluent component tree."""
    return _with_types(field_types, _single, node, partials or _DEFAULT_PARTIALS, [])


def parse_spec(
    text: str, partials: PartialRegistry | None = None, field_types=None
) -> tuple[str | None, fluent.Component | None]:
    """Parse a page spec (a file under specs/ui): the declared ModelView class name (or ``None``
    for a bare, unbound layout) plus the layout component. Envelope-aware — a ``layout:`` key holds
    the tree and a ``viewModel:`` key names the logic class the
    tooling binds it to. A ``layoutDelta:`` page has no layout of its own (see
    :func:`parse_spec_with_delta`)."""
    model_view, layout, _ = parse_spec_with_delta(text, partials, field_types)
    return model_view, layout


def parse_spec_with_delta(text: str, partials: PartialRegistry | None = None, field_types=None):
    """``(view model class name, layout, layout delta)``. A ``layoutDelta:`` is not a layout: it
    is a diff re-applied over the INFERRED layout of the view model, so such a page returns no
    layout and the parsed :class:`~mateu_ui.core.layout_delta.LayoutDelta`."""
    from .layout_delta import LayoutDelta

    try:
        data = yaml.safe_load(text)
    except yaml.YAMLError:
        return None, None, None
    return parse_spec_tree(data, partials, field_types)


def parse_spec_tree(data: Any, partials: PartialRegistry | None = None, field_types=None):
    """:func:`parse_spec_with_delta` over an already-parsed YAML tree — what a spec re-derived per
    request (access keys / ``${i18n.…}`` applied to its source tree) is built from."""
    from .layout_delta import LayoutDelta

    registry = partials or _DEFAULT_PARTIALS
    if not isinstance(data, dict):
        return None, _with_types(field_types, _single, data, registry, []), None
    model_view = data.get("viewModel")
    if "layout" not in data and "layoutDelta" in data:
        return model_view, None, LayoutDelta.parse(data.get("layoutDelta"))
    layout_node = data["layout"] if "layout" in data else data
    return model_view, _with_types(field_types, _single, layout_node, registry, []), None


def _single(node: Any, partials: PartialRegistry, chain: list[str]) -> fluent.Component | None:
    """What a node becomes in a slot that holds exactly one component."""
    node = _resolve_types(node)
    expanded = _in_list(node, partials, chain)
    if not expanded:
        return None
    if len(expanded) == 1:
        return expanded[0]
    # Nowhere to splice into: stacking beats dropping all but the first.
    return fluent.VerticalLayout(content=tuple(expanded))


def _in_list(node: Any, partials: PartialRegistry, chain: list[str]) -> list[fluent.Component]:
    """What a node becomes in a content list — where a partial may contribute several."""
    if isinstance(node, dict) and node.get("type") == "Partial":
        ref = node.get("ref") or ""
        key = partials.key(ref)
        if key in chain or len(chain) >= _MAX_DEPTH:
            return []
        chain.append(key)
        try:
            resolved: list[fluent.Component] = []
            for child in partials.resolve(ref):
                resolved.extend(_in_list(_resolve_types(child), partials, chain))
            return resolved
        finally:
            chain.pop()
    built = _build(node, partials, chain)
    return [] if built is None else [built]


def _build(node: Any, partials: PartialRegistry, chain: list[str]) -> fluent.Component | None:
    if not isinstance(node, dict):
        return None
    kind = node.get("type")
    if kind == "VerticalLayout":
        return fluent.VerticalLayout(
            content=_children(node, partials, chain),
            spacing=bool(node.get("spacing", False)),
            full_width=bool(node.get("fullWidth", False)),
            horizontal_alignment=_str(node.get("horizontalAlignment")),
            **_box(node),
        )
    if kind == "HorizontalLayout":
        return fluent.HorizontalLayout(
            content=_children(node, partials, chain),
            spacing=bool(node.get("spacing", True)),
            wrap=bool(node.get("wrap", False)),
            full_width=bool(node.get("fullWidth", False)),
            **_box(node),
        )
    if kind == "FormLayout":
        return fluent.FormLayout(
            content=_children(node, partials, chain),
            max_columns=_int(node.get("maxColumns")),
            auto_responsive=bool(node.get("autoResponsive", False)),
            labels_aside=bool(node.get("labelsAside", False)),
            column_width=_str(node.get("columnWidth")),
            expand_columns=bool(node.get("expandColumns", False)),
            **_box(node),
        )
    if kind == "FormField":
        return fluent.FormField(
            field_id=node.get("id", ""),  # YAML id → wire binding key field_id
            data_type=node.get("dataType") or "string",
            label=node.get("label"),
            stereotype=node.get("stereotype") or "regular",
            required=bool(node.get("required", False)),
            read_only=bool(node.get("readOnly", False)),
            options=_options(node.get("options")),
            placeholder=_str(node.get("placeholder")),
            property_row=bool(node.get("propertyRow", False)),
            style=node.get("style"),
            css_classes=node.get("cssClasses"),
            # Java's FormField record read from YAML: an absent number is 0 (the code builder's
            # defaults — 100, 1 — do not apply)
            slider_min=_int(node.get("sliderMin")),
            slider_max=_int(node.get("sliderMax")),
            options_columns=_int(node.get("optionsColumns")),
            options_source=_rest_source_of(node, "optionsSource"),
        )
    if kind == "Button":
        return _button(node)
    if kind == "Listing":
        # A listing authored as data: rows from a REST source, fetched client-side (the yaml
        # starter's products page). Before 2026-10-17 it rendered "Unsupported component".
        return _listing(node, partials, chain)
    if kind == "Text":
        return fluent.Text(
            text=str(node.get("text") or ""),
            size=_str(node.get("size")),
            no_margins=bool(node.get("noMargins", False)),
            container=_str(node.get("container")),
            **_box(node),
        )
    if kind == "ComponentRef":
        return fluent.ComponentRef(ref=str(node.get("ref") or ""))
    if kind == "Form":
        return _form(node, partials, chain)
    if kind == "AppShell":
        # a data-authored app shell (Java's YamlAppLoader): mapped to the App wire by the handler
        from . import yaml_app_shell

        return yaml_app_shell.parse(node, lambda w: _single(w, partials, chain))
    generic = _generic(kind, _record_defaults(kind, node), partials, chain)
    if generic is not None:
        return generic
    return fluent.Text(text=f"Unsupported component: {kind}")


# ── Every other component, read generically off its fluent dataclass ─────────────────────────────
# The YAML keys ARE the Java record's components (camelCase), the Python dataclass fields their
# snake_case (``from`` → ``from_``): so a node of any type the fluent API has is built field by
# field from the type hints — nested components, lists of them, nested value dataclasses, enums,
# dates. Before this every display component (Card, MetricCard, Notice, Calendar, Kanban…) authored
# in YAML rendered "Unsupported component" on the Python server.


def _component_classes() -> dict[str, type]:
    import dataclasses

    out: dict[str, type] = {}

    def walk(cls):
        for sub in cls.__subclasses__():
            if dataclasses.is_dataclass(sub):
                out.setdefault(sub.__name__, sub)
            walk(sub)

    walk(fluent.Component)
    return out


def _generic(kind: Any, node: dict, partials: PartialRegistry, chain: list[str]):
    cls = _component_classes().get(str(kind))
    if cls is None:
        return None
    try:
        return _dataclass_of(cls, node, partials, chain)
    except Exception as e:  # a value the dataclass refuses: say so, as for an unknown type
        problems = _problems.get()
        if problems is not None:
            problems.append(f"{kind}: {e}")
        return None


def _dataclass_of(cls: type, raw: Any, partials: PartialRegistry, chain: list[str]):
    import dataclasses
    import typing

    if not isinstance(raw, dict):
        return None
    hints = typing.get_type_hints(cls)
    kwargs = {}
    for f in dataclasses.fields(cls):
        if not f.init:
            continue
        name = f.name.rstrip("_")
        key = next((k for k in (camel_case_of(name), name, f.name) if k in raw), None)
        if key is None:
            continue
        kwargs[f.name] = _value_of(hints.get(f.name, Any), raw[key], partials, chain)
    return cls(**kwargs)


def camel_case_of(s: str) -> str:
    head, *rest = s.split("_")
    return head + "".join(p[:1].upper() + p[1:] for p in rest)


def _value_of(hint: Any, raw: Any, partials: PartialRegistry, chain: list[str]) -> Any:
    import dataclasses
    import types
    import typing
    from datetime import date, datetime
    from enum import Enum

    if raw is None:
        return None
    origin = typing.get_origin(hint)
    args = typing.get_args(hint)
    if origin in (typing.Union, types.UnionType):
        options = [a for a in args if a is not type(None)]
        return _value_of(options[0], raw, partials, chain) if options else raw
    if origin in (tuple, list) or hint in (tuple, list):
        elem = args[0] if args else Any
        items = raw if isinstance(raw, list) else [raw]
        if isinstance(elem, type) and issubclass(elem, fluent.Component):
            out: list = []
            for item in items:
                out.extend(_in_list(item, partials, chain))
            return tuple(out)
        if origin is tuple and len(args) == 2 and args[1] is not Ellipsis and isinstance(raw, dict):
            return raw  # a fixed pair: leave as authored
        # a `- null` (or a bare `-`) item is never meaningful in a definition: dropped here rather
        # than guarded against in every mapper (a crafted one logged an ERROR + stack per request)
        return tuple(_value_of(elem, item, partials, chain) for item in items if item is not None)
    if origin is dict or hint is dict:
        return raw if isinstance(raw, dict) else {}
    if not isinstance(hint, type):
        return raw
    if issubclass(hint, fluent.Component):
        return _single(raw, partials, chain)
    if issubclass(hint, Enum):
        for member in hint:
            if str(raw) in (member.name, str(member.value)):
                return member
        return raw
    if dataclasses.is_dataclass(hint):
        return _dataclass_of(hint, raw, partials, chain)
    if hint is datetime:
        return raw if isinstance(raw, datetime) else datetime.fromisoformat(str(raw))
    if hint is date:
        return raw if isinstance(raw, date) else date.fromisoformat(str(raw))
    if hint is bool:
        return bool(raw)
    if hint is int:
        return int(raw)
    if hint is float:
        return float(raw)
    if hint is str:
        return str(raw)
    return raw


def _str(value: Any) -> str | None:
    return None if value is None else str(value)


def _record_defaults(kind: Any, node: dict) -> dict:
    """What an ABSENT key means on the Java record the YAML is read into, where it differs from the
    Python dataclass' code-authoring default: a panel without ``open:`` is left to the renderer
    (``autoOpen``, Java's YamlUidlMapperFactory), a tile spans what the grid gives it (0, not 1) and
    a card has no variant unless it names one."""
    if kind == "FoldoutPanel" and "open" not in node and "autoOpen" not in node:
        return {**node, "open": False, "autoOpen": True}
    if kind == "DashboardPanel":
        return {"colSpan": 0, "rowSpan": 0, **node}
    if kind == "Card" and "variants" not in node:
        return {**node, "variants": []}
    return node


def _button(node: dict) -> fluent.Button:
    """A YAML ``type: Button`` (Java's Button record): its action id is the declared one, else the
    one derived from its label (``resolvedActionId``); an absent colour is ``normal``; an
    ``actionable: {type: RouteLink}`` makes it navigate."""
    from .naming import camelcasize

    label = str(node.get("label") or "")
    params = node.get("parameters")
    return fluent.Button(
        label=label,
        action_id=str(node.get("actionId") or camelcasize(label) or ""),
        button_style=_str(node.get("buttonStyle")),
        disabled=bool(node.get("disabled", False)),
        parameters=params if isinstance(params, dict) else None,
        route=_route_link_of(node),
        color=str(node.get("color") or "normal"),
        **_box(node),
    )


def _box(node: dict) -> dict:
    """The ``id``/``style``/``cssClasses`` every component carries."""
    return {
        "id": _str(node.get("id")),
        "style": _str(node.get("style")),
        "css_classes": _str(node.get("cssClasses")),
    }


def _template(raw: Any, partials: PartialRegistry, chain: list[str]):
    """A ``template:`` node (the page template a Form fills): its ``type`` names the template
    (Java's FormTemplate record), its other keys are the template's fields and slots. An unknown
    type leaves the page free — and is reported by a reporting build."""
    from mateu_ui.uidl.page_templates import TEMPLATES

    if not isinstance(raw, dict):
        return None
    cls = TEMPLATES.get(str(raw.get("type") or ""))
    if cls is None:
        problems = _problems.get()
        if problems is not None:
            problems.append(f"Unknown page template: {raw.get('type')}")
        return None
    template = _dataclass_of(cls, raw, partials, chain)
    # a docked panel's content is typed Any on the shared DockedPanel: build it here
    import dataclasses

    for name in ("end", "bottom"):
        panel = getattr(template, name, None)
        if panel is not None and isinstance(panel.content, dict):
            built = _single(panel.content, partials, chain)
            object.__setattr__(template, name, dataclasses.replace(panel, content=built))
    return template


def _maps(node: dict, key: str) -> list[dict]:
    raw = node.get(key)
    return [m for m in raw if isinstance(m, dict)] if isinstance(raw, list) else []


def _int(value: Any) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def _route_link_of(button: dict) -> str | None:
    """The route of a button whose ``actionable:`` is a ``RouteLink`` (Java's
    ButtonMapper.routeOf): the button navigates instead of running an action. None otherwise."""
    actionable = button.get("actionable")
    if isinstance(actionable, dict) and actionable.get("type") == "RouteLink":
        return _str(actionable.get("route"))
    return None


def _rest_source_of(node: dict, key: str):
    """A REST source node: a bare string is a catalogue reference, an object may name a ``ref``
    and/or carry an inline endpoint (mirrors RouteRegistry's ``_data_source_of``)."""
    from mateu_ui.uidl.rest_sources import RestDataSource

    raw = node.get(key)
    if isinstance(raw, str) and raw.strip():
        return RestDataSource(ref=raw.strip())
    if not isinstance(raw, dict):
        return None
    headers = raw.get("headers")
    return RestDataSource(
        ref=str(raw.get("ref") or "").strip(),
        url=str(raw.get("url") or ""),
        # what the node declares and nothing else, like Java's record read from YAML: an absent
        # method / mapping path travels as absent (the readers default it), and a ref keeps the
        # catalogue entry's own value instead of a default overriding it
        method=str(raw.get("method") or ""),
        # the server's copy keeps them (a proxied call injects ${secret.X} into them); a proxied
        # source's headers never reach the client (the wire serializer drops them)
        headers={str(k): str(v) for k, v in headers.items()} if isinstance(headers, dict) else {},
        body=str(raw.get("body") or ""),
        items_path=str(raw.get("itemsPath") or raw.get("items_path") or ""),
        value_path=str(raw.get("valuePath") or raw.get("value_path") or ""),
        label_path=str(raw.get("labelPath") or raw.get("label_path") or ""),
        proxy=bool(raw.get("proxy", False)),
    )


def _listing(node: dict, partials: PartialRegistry, chain: list[str]) -> fluent.ListingComponent:
    """A ``type: Listing`` node (Java's fluent Listing as YamlUidlLoader reads it): title, the
    smart search bar (``searchable``, ``filters``), the ``columns`` (``type: GridColumn`` nodes,
    field types already resolved) and the ``rowsSource`` the renderer fetches the rows from."""

    def column(c: dict) -> fluent.ListingColumn:
        c = _resolve_types(c)
        tones = c.get("tones")
        return fluent.ListingColumn(
            id=str(c.get("id") or ""),
            label=str(c.get("label") or c.get("id") or ""),
            data_type=_str(c.get("dataType")),
            stereotype=_str(c.get("stereotype")),
            sortable=bool(c.get("sortable", False)),
            identifier=bool(c.get("identifier", False)),
            width=_str(c.get("width")),
            align=_str(c.get("align")),
            tones={str(k): str(v) for k, v in tones.items()} if isinstance(tones, dict) else None,
        )

    def components(key: str) -> tuple:
        built = (_build(c, partials, chain) for c in _maps(node, key))
        return tuple(c for c in built if c is not None)

    filters = [_build(f, partials, chain) for f in _maps(node, "filters")]
    return fluent.ListingComponent(
        id=_str(node.get("id")),
        style=_str(node.get("style")),
        css_classes=_str(node.get("cssClasses")),
        title=_str(node.get("title")),
        subtitle=_str(node.get("subtitle")),
        searchable=bool(node.get("searchable", False)),
        page_size=_int(node.get("pageSize")),
        columns=tuple(column(c) for c in _maps(node, "columns")),
        filters=tuple(f for f in filters if isinstance(f, fluent.FormField)),
        rows_source=_rest_source_of(node, "rowsSource"),
        grid_layout=_str(node.get("gridLayout")),
        compact=bool(node.get("compact", False)),
        empty_state_message=_str(node.get("emptyStateMessage")),
        row_route=_str(node.get("rowRoute")),
        grid_style=_str(node.get("gridStyle")),
        row_stripes=bool(node.get("rowStripes", False)),
        column_borders=bool(node.get("columnBorders", False)),
        wrap_cell_content=bool(node.get("wrapCellContent", False)),
        no_border=bool(node.get("noBorder", False)),
        no_row_border=bool(node.get("noRowBorder", False)),
        all_rows_visible=bool(node.get("allRowsVisible", False)),
        column_reordering_allowed=bool(node.get("columnReorderingAllowed", False)),
        listing_type=_str(node.get("listingType")),
        size=_int(node.get("size")),
        initial_page=_int(node.get("initialPage")),
        header=components("header"),
        footer=components("footer"),
        pre_search=components("preSearch"),
        detail_path=_str(node.get("detailPath")),
        use_button_for_detail=bool(node.get("useButtonForDetail", False)),
        lazy_column_rendering=bool(node.get("lazyColumnRendering", False)),
        vaadin_grid_cell_background=_str(node.get("vaadinGridCellBackground")),
        vaadin_grid_cell_padding=_str(node.get("vaadinGridCellPadding")),
        infinite_scrolling=bool(node.get("infiniteScrolling", False)),
        lazy_loading=bool(node.get("lazyLoading", False)),
        multiple_row_selection_enabled=bool(node.get("multipleRowSelectionEnabled", False)),
        on_row_selection_changed_action_id=_str(node.get("onRowSelectionChangedActionId")),
        content_height=_str(node.get("contentHeight")),
        # Java's fluent Listing: both default on when the YAML says nothing
        search_on_enter=bool(node.get("searchOnEnter", True)),
        auto_focus_on_search_text=bool(node.get("autoFocusOnSearchText", True)),
        filters_layout=_str(node.get("filtersLayout")),
        group_by=_str(node.get("groupBy")),
        row_status_field=_str(node.get("rowStatusField")),
        drag_type=_str(node.get("dragType")),
        rows_selection_enabled=bool(node.get("rowsSelectionEnabled", False)),
    )


def _form(node: dict, partials: PartialRegistry, chain: list[str]) -> fluent.Form:
    """A ``type: Form`` node: a page with a declared header (title, subtitle, overline,
    titlePlaceholder, timestamp, badges, kpis, peerNav, recordSwitcher, banners, fabs) over its
    content (mirrors Java's fluent Form as YamlUidlLoader reads it). Every header key is optional;
    an absent one leaves its wire field None / empty."""
    from mateu_ui.uidl import BannerTheme, PageBanner, PeerNav, RecordSwitcher, SwitcherType

    button = _button

    def theme(raw: Any) -> BannerTheme:
        for t in BannerTheme:
            if str(raw or "").upper() in (t.name.upper(), str(t.value).upper()):
                return t
        return BannerTheme.INFO

    peer = node.get("peerNav")
    sw = node.get("recordSwitcher")
    switcher = None
    if isinstance(sw, dict):
        switcher = RecordSwitcher(
            options=_options(sw.get("options")),
            value=_str(sw.get("value")),
            type=SwitcherType.context
            if str(sw.get("type") or "").lower() == "context"
            else SwitcherType.object,
            label=_str(sw.get("label")),
            searchable=bool(sw.get("searchable", False)),
            disabled=bool(sw.get("disabled", False)),
            options_source=_source(sw.get("optionsSource")),
            route=_str(sw.get("route")),
            action_id=_str(sw.get("actionId")),
        )
    return fluent.Form(
        id=_str(node.get("id")),
        style=_str(node.get("style")),
        css_classes=_str(node.get("cssClasses")),
        title=_str(node.get("title")),
        subtitle=_str(node.get("subtitle")),
        no_header=bool(node.get("noHeader", False)),
        content=_children(node, partials, chain),
        toolbar=tuple(button(b) for b in _maps(node, "toolbar")),
        buttons=tuple(button(b) for b in _maps(node, "buttons")),
        overline=_str(node.get("overline")),
        title_placeholder=_str(node.get("titlePlaceholder")),
        timestamp=_str(node.get("timestamp")),
        badges=tuple(
            fluent.ChipItem(label=_str(b.get("label")), color=_str(b.get("color")))
            for b in _maps(node, "badges")
        ),
        kpis=tuple(
            fluent.Fact(label=_str(k.get("label")), value=_str(k.get("value")))
            for k in _maps(node, "kpis")
        ),
        peer_nav=PeerNav(
            prev_label=_str(peer.get("prevLabel")),
            prev_route=_str(peer.get("prevRoute")),
            next_label=_str(peer.get("nextLabel")),
            next_route=_str(peer.get("nextRoute")),
        )
        if isinstance(peer, dict)
        else None,
        record_switcher=switcher,
        template=_template(node.get("template"), partials, chain),
        banners=tuple(
            PageBanner(
                theme=theme(b.get("theme")),
                title=_str(b.get("title")),
                description=_str(b.get("description")),
                closeable=bool(b.get("closeable", False)),
                timeout_seconds=_int(b.get("timeoutSeconds")),
            )
            for b in _maps(node, "banners")
        ),
        fabs=tuple(
            fluent.PageFab(
                icon=_str(f.get("icon")),
                label=_str(f.get("label")),
                action_id=str(f.get("actionId") or ""),
                order=_int(f.get("order")),
                button_style=_str(f.get("buttonStyle")),
            )
            for f in _maps(node, "fabs")
        ),
    )


def _source(raw: Any):
    """A ``{ref, url, itemsPath, valuePath, labelPath, …}`` node (or a bare name, the ref
    shorthand) as a uidl ``RestDataSource``; blank members stay blank."""
    from mateu_ui.uidl.rest_sources import RestDataSource

    if isinstance(raw, str) and raw.strip():
        return RestDataSource(ref=raw.strip(), value_path="", label_path="", method="")
    if not isinstance(raw, dict):
        return None
    headers = raw.get("headers")
    return RestDataSource(
        ref=str(raw.get("ref") or "").strip(),
        url=str(raw.get("url") or ""),
        method=str(raw.get("method") or ""),
        # a proxied source's headers never reach the client (the wire serializer drops them)
        headers={str(k): str(v) for k, v in headers.items()} if isinstance(headers, dict) else {},
        body=str(raw.get("body") or ""),
        items_path=str(raw.get("itemsPath") or ""),
        value_path=str(raw.get("valuePath") or ""),
        label_path=str(raw.get("labelPath") or ""),
        proxy=bool(raw.get("proxy", False)),
        # answered instead of the endpoint ONLY in sample mode (never on the wire otherwise)
        sample=raw.get("sample"),
    )


def _options(raw: Any) -> tuple:
    """YAML ``options`` ({value, label} maps, or bare values) as the fluent (value, label) pairs."""
    if not isinstance(raw, list):
        return ()
    out = []
    for o in raw:
        if isinstance(o, dict):
            value = o.get("value")
            out.append((value, str(o.get("label") if o.get("label") is not None else value)))
        elif o is not None:
            out.append((o, str(o)))
    return tuple(out)


def _children(node: dict, partials: PartialRegistry, chain: list[str]) -> tuple:
    content = node.get("content")
    if not isinstance(content, list):
        return ()
    # Flattened, not one-to-one: a partial standing for several components splices into the parent's
    # content rather than nesting, or a form grid would put them all in one cell.
    children: list[fluent.Component] = []
    for item in content:
        children.extend(_in_list(item, partials, chain))
    return tuple(children)
