"""Fields: grid fields, data types, stereotypes, options, REST sources and nav links (Java's ReflectionFormFieldMapper / FieldTypeMapper / RestSourceResolver)."""

from __future__ import annotations

from datetime import (
    date,
    datetime,
)
from decimal import Decimal
from typing import (
    Any,
    get_args,
    get_origin,
)

from mateu_dtos import Action, AppMetadata, CustomFieldMetadata, ServerSideComponent, TextMetadata
from mateu_dtos import (
    Button,
    ClientSideComponent,
    FormFieldMetadata,
    GridColumn,
    GridColumnMeta,
    NavLinkRecord,
    Option,
    PairRecord,
    RemoteCoordinates,
    RestAction,
    RestDataSource,
)
from mateu_uidl import components as fluent
from mateu_uidl import Colspan, DetailForm, Hidden, Inline, Max, Min, Pattern, Size
from mateu_uidl.rest_sources import RestSourceSupplier
from mateu_uidl import Text as TextMarker
from mateu_uidl import (
    BulletedList,
    FileUpload,
    InlineEditing,
    Label,
    LinkSupplier,
    LinkTo,
    Lookup,
    Money,
    Multiline,
    OnRowSelected,
    Password,
    PhotoCapture,
    PlainText,
    ReadOnly,
    ReadOnlyUnless,
    Required,
    RestOptions,
    Searchable,
    Signature,
    Stereotype,
    TreeSelect,
    UseRadioButtons,
)

from .. import layout_inference
from ..rest_source_registry import source_dto
from ..naming import (
    camel_case,
    humanize,
)
from ..reflection import (
    class_flag,
    view_fields,
)
from ._base import MixinBase
from ..islands import EMBEDDED_MARKER, INLINE_MARKER, is_routed_view, seed_state
from ..registry import normalize, type_name
from ._common import (
    _id,
    _log,
    enum_label,
    is_enum,
)


#: The row-editing actions a list field answers (Java's FieldActionCollector / the crud-field
#: handlers): the detail editor's create / save / navigation, and the list's own add / remove /
#: reorder. create, create-and-stay and save validate the row before they run.
LIST_FIELD_ACTION_SUFFIXES = (
    "_create",
    "_create-and-stay",
    "_add",
    "_select",
    "_selected",
    "_prev",
    "_next",
    "_save",
    "_remove",
    "_move-up",
    "_move-down",
    "_cancel",
)
_VALIDATING_SUFFIXES = ("_create", "_create-and-stay", "_save")


def is_list_field(f) -> bool:
    """A field holding a list (``list[...]``): it answers the row-editing actions."""
    return f.type is list or get_origin(f.type) is list


class FieldMapperMixin(MixinBase):
    def field_actions(self, cls, only=None) -> list[Action]:
        """The actions a view's FIELDS declare, in Java's ``FieldActionCollector`` order: the
        row-editing actions of every list field, the ``OnRowSelected()`` row-click actions, the
        per-column lookup search of inline-editing grids, ``Lookup()`` searches and ``Searchable()``
        code / selector lookups."""
        fields = [f for f in (only if only is not None else view_fields(cls)) if self.visible(f)]
        out: list[Action] = []

        def add(action: Action) -> None:
            if all(a.id != action.id for a in out):
                out.append(action)

        for f in fields:
            if is_list_field(f):
                fid = camel_case(f.name)
                row_type = self.grid_row_type(f)
                constrained = (
                    ",".join(
                        camel_case(c.name)
                        for c in view_fields(row_type)
                        if any(c.has(m) for m in (Required, Min, Max, Size, Pattern))
                    )
                    if row_type is not None
                    else ""
                )
                for suffix in LIST_FIELD_ACTION_SUFFIXES:
                    validating = suffix in _VALIDATING_SUFFIXES
                    add(
                        Action(
                            id=fid + suffix,
                            validation_required=validating,
                            fields_to_validate=(constrained or None) if validating else None,
                        )
                    )
        for f in fields:
            on_row = f.marker(OnRowSelected)
            if on_row is not None:
                add(Action(id=camel_case(on_row.value), validation_required=False))
        for f in fields:
            if is_list_field(f) and f.has(InlineEditing):
                add(Action(id=f"search-{camel_case(f.name)}-*", validation_required=False))
        for f in fields:
            if f.has(Lookup):
                add(Action(id=f"search-{camel_case(f.name)}", validation_required=False))
        for f in fields:
            if f.has(Searchable):
                add(Action(id=f"code-{camel_case(f.name)}", validation_required=False))
        for f in fields:
            if f.has(Searchable):
                add(Action(id=f"codesearch-{camel_case(f.name)}", validation_required=False))
        return out

    @staticmethod
    def grid_row_type(f) -> type | None:
        """The row type of a grid (list-of-complex-rows) field; None when the field is not a
        grid (scalars, strings, enums…)."""
        if get_origin(f.type) is not list:
            return None
        args = get_args(f.type)
        arg = args[0] if args else None
        return arg if isinstance(arg, type) and arg is not str and not is_enum(arg) else None

    def map_grid_field(self, f, row_type, instance, read_only: bool) -> ClientSideComponent:
        """A list-of-rows field → a grid FormField (dataType "array", stereotype "grid", one
        GridColumn per row field, rows identified by ``_rowNumber``) plus, when editable, the
        row editor's wiring: a trailing "Edit" column (``<field>_select``), the editor's position,
        column count and the grid's min height while it shows. Mirrors Java's
        GridColumnBuilder.createCrudForField."""
        field_id = camel_case(f.name)
        # InlineEditing() on the grid field: cells edit in place, commits accumulate in the form
        # state (the frontend's renderEditableCell form-grid path) and save with the form; it
        # replaces the row editor.
        inline = not read_only and f.has(InlineEditing)
        columns = []
        for c in view_fields(row_type):
            if not self.visible(c):
                continue
            hidden = c.marker(Hidden)
            if hidden is not None and not hidden.value:
                continue  # an unconditional Hidden() column is not a column at all
            if is_list_field(c):
                continue  # a nested list is not a cell
            editable = inline and not c.has(ReadOnly)
            # The form instance's options(field_name) method can feed an editable cell's select
            # options (Java parity: the grid inline-editor machinery consults the form's
            # OptionsSupplier — e.g. the import wizard's targetField cell).
            supplied = self._supplied_options(instance, camel_case(c.name)) if editable else []
            columns.append(GridColumn(id=camel_case(c.name), metadata=GridColumnMeta(
                id=camel_case(c.name),
                label=(c.marker(Label).value if c.has(Label) else humanize(c.name)),
                # A form grid's column type is coarse (Java's ColumnTypeMapper): booleans show
                # as such, everything else as text — the cell editor carries the real type.
                data_type="bool" if c.type is bool else "string",
                editable=editable,
                editor_type=(
                    ("select" if supplied and not is_enum(c.type) else self.editor_type_of(c))
                    if editable else None
                ),
                editor_options=(
                    (supplied or ([Option(value=m.name, label=enum_label(m)) for m in c.type]
                                  if is_enum(c.type) else None))
                    if editable else None
                ),
                stereotype=self.column_stereotype_of(c) or "regular",
                caption_path=self.caption_path_of(c),
                leading_path=self.leading_path_of(c),
                # no fixed width → the column sizes to its content (Java's GridColumnMapper)
                auto_width=True,
            )))
        # The per-row "Edit" button opens the row editor; inline editing replaces it.
        if not read_only and not inline:
            columns.append(GridColumn(id="_select", metadata=GridColumnMeta(
                id="_select",
                label="",
                data_type="string",
                stereotype="button",
                text="Edit",
                action_id=f"{field_id}_select",
                width="3rem",
            )))
        on_row = f.marker(OnRowSelected)
        detail = f.marker(DetailForm) or DetailForm()
        style = "min-width: 10rem; width: 100%;"
        meta = FormFieldMetadata(
            field_id=field_id,
            data_type="array",
            label=self.T(f.marker(Label).value if f.has(Label) else humanize(f.name)),
            stereotype="grid",
            read_only=read_only,
            columns=columns,
            item_id_path="_rowNumber",
            inline_editing=inline,
            colspan=f.marker(Colspan).value if f.has(Colspan) else 1,
            style=style,
            slider_max=0,
            # Grid rows ride in the component initialData / fragment state, not as an initialValue.
            # OnRowSelected() binds the click to a method; an editable grid without it selects the
            # row for its editor (<field>_selected), a read-only one dispatches nothing.
            on_item_selection_action_id=(
                camel_case(on_row.value) if on_row else (None if read_only else f"{field_id}_selected")
            ),
            row_selection_shortcut=on_row.shortcut if on_row and on_row.shortcut else None,
            form_position=detail.position,
            form_style=detail.style,
            form_theme=detail.theme,
            form_columns=detail.columns or class_flag(row_type, "__mateu_form_layout_columns__", 2),
            min_height_when_detail_visible=detail.min_height_when_detail_visible,
        )
        return ClientSideComponent(metadata=meta, id=field_id, children=[], style=style)

    def map_field(self, f, instance, read_only: bool = False) -> ClientSideComponent:
        field_id = camel_case(f.name)
        row_type = self.grid_row_type(f)
        if row_type is not None:
            return self.map_grid_field(f, row_type, instance, read_only)
        holder = self.map_holder_field(f, instance)
        if holder is not None:
            return holder
        if f.has(TextMarker):
            # Text(): the VALUE rendered as a sized text, interpolated from the state client-side
            # (mirrors Java's ReflectionFormFieldMapper @Text branch).
            marker = f.marker(TextMarker)
            return self.client(
                TextMetadata(
                    text=f"${{state.{field_id}}}",
                    container=marker.container,
                    size=marker.size,
                    no_margins=marker.no_margins,
                ),
                field_id,
                [],
            )
        label = self.T(f.marker(Label).value if f.has(Label) else humanize(f.name))
        required = f.has(Required)
        t = f.type
        # the view's options(field_name) method wins (its options may carry children → tree
        # selects); enums keep contributing their constants
        options = self._supplied_options(instance, field_id)
        if not options:
            # Enum options: value = the member name, label = enum_label (Java's enumLabel rule).
            options = (
                [Option(value=m.name, label=enum_label(m)) for m in t] if is_enum(t) else []
            )
        value = getattr(instance, f.name, None)

        # ReadOnlyUnless(): read-only unless the caller is authorized.
        read_only = read_only or not self.authorized(f.marker(ReadOnlyUnless))
        plain = f.has(PlainText) or bool(class_flag(instance.__class__, "__mateu_plain_text__", False))
        multiline = f.has(Multiline)
        stereotype = self.stereotype_of(f, plain, multiline, instance.__class__)

        meta = FormFieldMetadata(
            field_id=field_id,
            data_type=self.infer_data_type(t, f, plain),
            label=label,
            stereotype=stereotype,
            required=required,
            # A plain-text field is read-only by RENDERING (the "plainText" stereotype), so Java
            # does not also set the readOnly flag — only an explicit read-only context/marker does.
            read_only=read_only,
            multiline=multiline,
            options=options,
            tree_leaves_only=bool(getattr(f.marker(TreeSelect), "leaves_only", False)) if f.has(TreeSelect) else False,
            # An integer field shows the +/- step buttons; a textarea spans both columns (Java
            # parity). initialValue is NOT emitted per field — the values ride in initialData/state.
            step_buttons_visible=(t is int),
            # an explicit Colspan() wins; intrinsically wide fields are widened to the full row
            # when the rows are laid out (LayoutMapperMixin.form_rows)
            colspan=f.marker(Colspan).value if f.has(Colspan) else 1,
            link=self.link_of(f, instance),
            # Lookup(): the combo box loads its options remotely through the field's
            # search-<fieldId> action (answered from the view's options(field_name) method).
            remote_coordinates=(
                RemoteCoordinates(action=f"search-{field_id}") if f.has(Lookup) else None
            ),
            # RestOptions(): options fetched client-side from an arbitrary REST endpoint.
            options_source=self._rest_options(f),
            # FileUpload(accept=".csv"): the file input's accept filter travels in the field's
            # generic attributes list — no dedicated wire field (Java parity).
            attributes=(
                [PairRecord(key="accept", value=f.marker(FileUpload).accept)]
                if f.has(FileUpload) and f.marker(FileUpload).accept
                else []
            ),
        )
        return self.client(meta, field_id, [])

    def map_holder_field(self, f, instance) -> ClientSideComponent | None:
        """A field holding a COMPONENT rather than data renders that component in its form slot
        (Java's ReflectionFormFieldMapper Component branch → CustomField): a fluent component or
        a ``ComponentRef`` (resolved against the business-component catalogue). None when the
        field is a plain data field."""
        value = getattr(instance, f.name, None)
        adapter = self.adapter_of(value)
        if adapter is not None:
            # an adapted object held by a field: an independent island — its own server-side type,
            # state and actions round-trip through the adapter (Java's AdaptedComponentTree in a
            # CustomField)
            label = self.T(f.marker(Label).value if f.has(Label) else humanize(f.name))
            return ClientSideComponent(
                metadata=CustomFieldMetadata(
                    label=label,
                    content=self.map_adapted(value, adapter, ""),
                    colspan=f.marker(Colspan).value if f.has(Colspan) else 1,
                ),
                id="fieldId",
                children=[],
                style="width: 100%;",
            )
        if is_routed_view(value) and not isinstance(value, type(instance)):
            return self.map_island(f, value)
        holds_component = isinstance(value, fluent.Component) or (
            isinstance(f.type, type) and issubclass(f.type, fluent.Component)
        )
        if not holds_component:
            return None
        if value is None:
            return None
        label = self.T(f.marker(Label).value if f.has(Label) else humanize(f.name))
        content = self.map_component(value)
        return ClientSideComponent(
            metadata=CustomFieldMetadata(
                label=label, content=content, colspan=f.marker(Colspan).value if f.has(Colspan) else 1
            ),
            id="fieldId",
            children=[],
            style=getattr(value, "style", None),
        )

    def map_island(self, f, value) -> ClientSideComponent:
        """A field holding a routed VIEW: an embedded island — a MEDIATOR app shell bound to the
        view's own route and type, wrapped in a ServerSide component carrying the view's actions
        and its seeded state, in a full-row CustomField (Java's EmbeddedOrchestratorFieldBuilder)."""
        cls = type(value)
        route = "/" + normalize(getattr(cls, "__mateu_ui__", "") or "")
        inline = f.has(Inline)
        marked = f"{route}?{EMBEDDED_MARKER}=1" + (f"&{INLINE_MARKER}=1" if inline else "")
        island_type = type_name(cls)
        component_id = f"_{camel_case(f.name)}"
        app = ClientSideComponent(
            metadata=AppMetadata(
                title="",
                variant="MEDIATOR",
                route=route,
                home_route=marked,
                home_consumed_route=route,
                home_server_side_type=island_type,
                server_side_type=island_type,
            ),
            id=component_id + "_app",
            children=[],
            style="width: 100%;",
        )
        initial: dict[str, Any] = {EMBEDDED_MARKER: True}
        if inline:
            initial[INLINE_MARKER] = True
        initial.update(seed_state(value))
        try:
            actions = list(self.map_view(cls, value, route).actions or [])
        except Exception as e:  # noqa: BLE001 - an island that cannot map its actions still mounts
            _log.warning("Island %s: its actions could not be mapped (%s)", island_type, e)
            actions = []
        wrapper = ServerSideComponent(
            id=component_id,
            server_side_type=island_type,
            route=marked,
            children=[app],
            initial_data=initial,
            actions=actions,
            style="width: 100%;",
        )
        return ClientSideComponent(
            # spans the whole row of the host form (widened in form_rows, Java: maxColumns)
            metadata=CustomFieldMetadata(label="", content=wrapper, colspan=1),
            id="fieldId",
            children=[],
            style="width: 100%;",
        )

    def adapter_of(self, value):
        """The ComponentAdapter for ``value``'s type, or None."""
        if value is None or not self.adapters:
            return None
        for klass in type(value).__mro__:
            if klass in self.adapters:
                return self.adapters[klass]
        return None

    def map_adapted(self, model, adapter, route: str) -> ServerSideComponent:
        """A model rendered through its adapter: its components, state (initialData) and action
        ids, advertised under the MODEL's type name so the state routes back to the adapter."""
        view = adapter.adapt(model)
        components = list(view.components or [])
        if not components:
            tree: Any = fluent.VerticalLayout()
        elif len(components) == 1:
            tree = components[0]
        else:
            tree = fluent.VerticalLayout(content=tuple(components), style="width: 100%;")
        return ServerSideComponent(
            id=_id(),
            server_side_type=type_name(type(model)),
            route=route,
            children=[self.map_component(tree)],
            initial_data=dict(view.state or {}),
            actions=[Action(id=a, validation_required=False) for a in (view.actions or [])],
            style="width: 100%;",
        )

    @staticmethod
    def _headers_of(header_strings) -> dict[str, str]:
        headers: dict[str, str] = {}
        for h in header_strings or ():
            name, sep, value = h.partition(":")
            if sep:
                headers[name.strip()] = value.strip()
        return headers

    @staticmethod
    def _rest_options(f) -> "RestDataSource | None":
        """The client-side external options descriptor when the field carries ``RestOptions()``
        (headers parsed from "Name: Value" strings); None otherwise. ``source=`` travels as the
        ``ref`` the renderer resolves against the catalogue."""
        if not f.has(RestOptions):
            return None
        a = f.marker(RestOptions)
        return RestDataSource(
            ref=a.source or None,
            url=a.url,
            method=a.method,
            headers=FieldMapperMixin._headers_of(a.headers),
            body=a.body,
            items_path=a.items_path,
            value_path=a.value_path,
            label_path=a.label_path,
            proxy=a.proxy,
        )

    @staticmethod
    def _rest_listing(cls) -> "RestDataSource | None":
        """The client-side external rows descriptor when the listing class carries
        ``@rest_listing`` (columns come from the Row type; each item is keyed by column id); None
        otherwise."""
        spec = getattr(cls, "__mateu_rest_listing__", None)
        if spec is None:
            return None
        url, method, header_strings, body, items_path, proxy, *rest = spec
        return RestDataSource(
            ref=(rest[0] if rest else "") or None,
            url=url or None,
            method=method,
            headers=FieldMapperMixin._headers_of(header_strings),
            body=body,
            items_path=items_path,
            proxy=proxy,
        )

    @staticmethod
    def _rest_action(fn) -> "RestAction | None":
        """The client-side REST descriptor when a button method carries ``@rest_action`` (headers
        parsed from "Name: Value" strings); None otherwise — the button then dispatches to the Mateu
        server as usual."""
        spec = getattr(fn, "__mateu_rest_action__", None)
        if spec is None:
            return None
        url, method, header_strings, body, success_message, result_path, proxy, *rest = spec
        return RestAction(
            source=RestDataSource(
                ref=(rest[0] if rest else "") or None,
                url=url or None,
                method=method,
                headers=FieldMapperMixin._headers_of(header_strings),
                body=body,
                proxy=proxy,
            ),
            success_message=success_message or None,
            result_path=result_path or None,
        )

    @staticmethod
    def _rest_data(cls) -> "RestAction | None":
        """The client-side REST descriptor for a ``@rest_data`` screen (silent load; blank
        result_path merges the whole response — getByPath with an empty path is identity on the
        frontend); None when the class carries no ``@rest_data``."""
        spec = getattr(cls, "__mateu_rest_data__", None)
        if spec is None:
            return None
        url, method, header_strings, body, result_path, proxy, *rest = spec
        return RestAction(
            source=RestDataSource(
                ref=(rest[0] if rest else "") or None,
                url=url or None,
                method=method,
                headers=FieldMapperMixin._headers_of(header_strings),
                body=body,
                proxy=proxy,
            ),
            success_message=None,
            result_path=result_path,
        )

    def _declared_sources(self, cls, instance=None) -> list[tuple[str, str, "RestDataSource"]]:
        """``(kind, id, descriptor)`` for every REST source the view declares: what a
        ``RestSourceSupplier`` instance says first, then the annotations."""
        out: list[tuple[str, str, RestDataSource]] = []
        if isinstance(instance, RestSourceSupplier):
            for d in instance.declared_rest_sources() or []:
                if d is not None and d.source is not None:
                    out.append((d.kind.value, d.id or "", source_dto(d.source)))
        listing = self._rest_listing(cls)
        if listing is not None:
            out.append(("rows", "", listing))
        data = self._rest_data(cls)
        if data is not None:
            out.append(("data", "", data.source))
        for f in view_fields(cls):
            options = self._rest_options(f)
            if options is not None:
                out.append(("options", camel_case(f.name), options))
        for klass in cls.__mro__:
            for name, m in vars(klass).items():
                action = self._rest_action(m) if callable(m) else None
                if action is not None:
                    out.append(("action", name, action.source))
        return out

    def _resolved(self, source: "RestDataSource | None") -> "RestDataSource | None":
        """A by-reference descriptor filled in from the catalogue (the surface's values win)."""
        if source is None or self.rest_sources is None:
            return source
        return self.rest_sources.resolve(source)

    def _has_proxy_source(self, cls, instance=None) -> bool:
        """True when the view declares at least one proxy-mode REST source — read off the RESOLVED
        source, so a surface naming a proxied catalogue entry by ``ref`` counts too (Java's
        ``RestDataSupport.hasProxySource``). Gates advertising the ``__restfetch__`` action."""
        return any(
            (resolved := self._resolved(src)) is not None and resolved.proxy
            for _, _, src in self._declared_sources(cls, instance)
        )

    def resolve_rest_source(self, cls, kind, id, instance=None) -> "RestDataSource | None":
        """Resolve the DECLARED source of a view for a proxy fetch — what a ``RestSourceSupplier``
        view declares, else the field (``RestOptions``), the class (``@rest_listing``/
        ``@rest_data``) or the method (``@rest_action``) — with a catalogue reference resolved on
        the SERVER, never from a client-supplied url (so the proxy can't be turned into an open
        relay). Used by the ``__restfetch__`` reserved action."""
        for k, i, src in self._declared_sources(cls, instance):
            if k != kind:
                continue
            if kind in ("rows", "data") or i == id or camel_case(i) == id:
                return self._resolved(src)
        return None

    def link_of(self, f, instance) -> NavLinkRecord | None:
        """The field's nav link: a :class:`LinkSupplier` on the view wins; when it returns ``None``
        the ``LinkTo`` marker applies; no link -> ``None``. href/title travel verbatim — ``${...}``
        templates are interpolated client-side, never on the server."""
        if isinstance(instance, LinkSupplier):
            supplied = instance.link(f.name)
            if supplied is not None:
                return NavLinkRecord(
                    href=supplied.href, icon=supplied.icon, title=supplied.title, target=supplied.target
                )
        link_to = f.marker(LinkTo)
        if link_to is None:
            return None
        return NavLinkRecord(
            href=link_to.href, icon=link_to.icon, title=link_to.title, target=link_to.target
        )

    def _supplied_options(self, instance, field_id: str) -> list:
        """Options from the view's ``options(field_name)`` method, mapped recursively (children
        survive) — Option objects or (value, label) pairs; anything else is ignored."""
        supplier = getattr(instance, "options", None)
        if not callable(supplier):
            return []
        try:
            raw = supplier(field_id) or []
        except Exception as e:  # noqa: BLE001 - logged, not fatal
            _log.warning("_supplied_options failed, falling back (%s)", e)
            return []
        return [o for o in (self._as_option(item) for item in raw) if o is not None]

    def _as_option(self, item):
        if isinstance(item, Option):
            return item
        if isinstance(item, (tuple, list)) and len(item) == 2:
            return Option(value=str(item[0]), label=str(item[1]))
        if hasattr(item, "value") and hasattr(item, "label"):
            children = [
                o for o in (self._as_option(c) for c in getattr(item, "children", []) or []) if o
            ]
            return Option(value=str(item.value), label=str(item.label), children=children)
        return None

    def stereotype_of(self, f, plain: bool, multiline: bool, owner=None) -> str:
        s = f.marker(Stereotype)
        if s is not None:
            return s.value
        if f.has(BulletedList):
            return "bulletedList"
        if f.has(Signature):
            return "signature"
        if f.has(PhotoCapture):
            return "camera"
        if f.has(FileUpload):
            return "fileUpload"
        if f.has(TreeSelect):
            return "treeSelect"
        if f.has(Password):
            return "password"
        if f.has(Money):
            return "plainText" if plain else "money"
        # RestOptions(): options fetched client-side from an arbitrary REST endpoint → a select.
        if f.has(RestOptions):
            return "select"
        if f.has(Lookup):
            return "combobox"
        if f.has(Searchable):
            return "searchable"
        if plain:
            return "plainText"
        if is_enum(f.type):
            # Small-enum rule (Java FieldTypeMapper's enum branch): UseRadioButtons forces radio
            # always; under @auto_layout enums with <= RADIO_MAX_OPTIONS members are radio.
            # Otherwise "select" — Java parity, matching what Mateu.NET emits since its port.
            if f.has(UseRadioButtons) or layout_inference.prefer_radio(owner, f.type):
                return "radio"
            return "select"
        if multiline:
            return "textarea"
        return "regular"

    def infer_data_type(self, t, f=None, plain: bool = False) -> str:
        # A list-of-values field (e.g. BulletedList) is an array on the wire (Java parity).
        if get_origin(t) is list:
            return "array"
        if is_enum(t):
            return "string"
        if t is bool:
            return "bool"
        if t is int:
            return "integer"
        if t in (float, Decimal):
            # A money field in a plain-text context upgrades its dataType to "money" so the
            # renderer formats it as currency (Java's FieldTypeMapper money branch).
            if f is not None and f.has(Money) and plain:
                return "money"
            return "number"
        if t in (date, datetime):
            return "date"
        return "string"

    def map_button(self, name: str, fn) -> Button:
        marker = getattr(fn, "__mateu_button__")
        label = marker if isinstance(marker, str) else humanize(name)
        return Button(
            label=self.T(label),
            action_id=camel_case(name),
            shortcut=getattr(fn, "__mateu_shortcut__", None),
            disabled=not self.authorized(getattr(fn, "__mateu_disabled_unless__", None)),
        )

    @staticmethod
    def client(meta, id, children) -> ClientSideComponent:
        return ClientSideComponent(metadata=meta, id=id, children=children)
