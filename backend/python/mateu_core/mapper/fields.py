"""Fields: grid fields, data types, stereotypes, options, REST sources and nav links (Java's ReflectionFormFieldMapper / FieldTypeMapper / RestSourceResolver)."""

from __future__ import annotations

from datetime import (
    date,
    datetime,
)
from decimal import Decimal
from typing import (
    get_args,
    get_origin,
)

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
from ..naming import (
    camel_case,
    humanize,
)
from ..reflection import (
    class_flag,
    view_fields,
)
from ._base import MixinBase
from ._common import (
    _log,
    enum_label,
    is_enum,
)


class FieldMapperMixin(MixinBase):
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
        GridColumn per row field, rows identified by position). Mirrors Java's
        GridColumnBuilder.getFormFieldForArray."""
        field_id = camel_case(f.name)
        # InlineEditing() on the grid field: cells edit in place, commits accumulate in the form
        # state (the frontend's renderEditableCell form-grid path) and save with the form.
        inline = not read_only and f.has(InlineEditing)
        columns = []
        for c in view_fields(row_type):
            if not self.visible(c):
                continue
            editable = inline and not c.has(ReadOnly)
            # The form instance's options(field_name) method can feed an editable cell's select
            # options (Java parity: the grid inline-editor machinery consults the form's
            # OptionsSupplier — e.g. the import wizard's targetField cell).
            supplied = self._supplied_options(instance, camel_case(c.name)) if editable else []
            columns.append(GridColumn(metadata=GridColumnMeta(
                id=camel_case(c.name),
                label=(c.marker(Label).value if c.has(Label) else humanize(c.name)),
                data_type=self.infer_data_type(c.type, c),
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
                stereotype=self.column_stereotype_of(c),
                caption_path=self.caption_path_of(c),
                leading_path=self.leading_path_of(c),
            )))
        on_row = f.marker(OnRowSelected)
        meta = FormFieldMetadata(
            field_id=field_id,
            data_type="array",
            label=self.T(f.marker(Label).value if f.has(Label) else humanize(f.name)),
            stereotype="grid",
            read_only=read_only,
            columns=columns,
            item_id_path="_rowNumber",
            # Grid rows ride in the component initialData / fragment state, not as an initialValue.
            on_item_selection_action_id=camel_case(on_row.value) if on_row else None,
            row_selection_shortcut=on_row.shortcut if on_row and on_row.shortcut else None,
        )
        return self.client(meta, field_id, [])

    def map_field(self, f, instance, read_only: bool = False) -> ClientSideComponent:
        field_id = camel_case(f.name)
        row_type = self.grid_row_type(f)
        if row_type is not None:
            return self.map_grid_field(f, row_type, instance, read_only)
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
            colspan=2 if stereotype == "textarea" else 1,
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

    @staticmethod
    def _rest_options(f) -> "RestDataSource | None":
        """The client-side external options descriptor when the field carries ``RestOptions()``
        (headers parsed from "Name: Value" strings); None otherwise."""
        if not f.has(RestOptions):
            return None
        a = f.marker(RestOptions)
        headers: dict[str, str] = {}
        for h in a.headers:
            name, sep, value = h.partition(":")
            if sep:
                headers[name.strip()] = value.strip()
        return RestDataSource(
            url=a.url,
            method=a.method,
            headers=headers,
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
        url, method, header_strings, body, items_path, proxy = spec
        headers: dict[str, str] = {}
        for h in header_strings:
            name, sep, value = h.partition(":")
            if sep:
                headers[name.strip()] = value.strip()
        return RestDataSource(
            url=url, method=method, headers=headers, body=body, items_path=items_path, proxy=proxy
        )

    @staticmethod
    def _rest_action(fn) -> "RestAction | None":
        """The client-side REST descriptor when a button method carries ``@rest_action`` (headers
        parsed from "Name: Value" strings); None otherwise — the button then dispatches to the Mateu
        server as usual."""
        spec = getattr(fn, "__mateu_rest_action__", None)
        if spec is None:
            return None
        url, method, header_strings, body, success_message, result_path, proxy = spec
        headers: dict[str, str] = {}
        for h in header_strings:
            name, sep, value = h.partition(":")
            if sep:
                headers[name.strip()] = value.strip()
        return RestAction(
            source=RestDataSource(url=url, method=method, headers=headers, body=body, proxy=proxy),
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
        url, method, header_strings, body, result_path, proxy = spec
        headers: dict[str, str] = {}
        for h in header_strings:
            name, sep, value = h.partition(":")
            if sep:
                headers[name.strip()] = value.strip()
        return RestAction(
            source=RestDataSource(url=url, method=method, headers=headers, body=body, proxy=proxy),
            success_message=None,
            result_path=result_path,
        )

    @staticmethod
    def _has_proxy_source(cls) -> bool:
        """True when the view declares at least one proxy-mode REST source (proxy=True on a field
        ``RestOptions()``, a method ``@rest_action``, or the class ``@rest_listing``/``@rest_data``).
        Gates advertising the ``__restfetch__`` action so only proxy views carry it."""
        listing = getattr(cls, "__mateu_rest_listing__", None)
        if listing is not None and listing[5]:
            return True
        data = getattr(cls, "__mateu_rest_data__", None)
        if data is not None and data[5]:
            return True
        for f in view_fields(cls):
            if f.has(RestOptions) and f.marker(RestOptions).proxy:
                return True
        for klass in cls.__mro__:
            for m in vars(klass).values():
                spec = getattr(m, "__mateu_rest_action__", None)
                if spec is not None and spec[6]:
                    return True
        return False

    def resolve_rest_source(self, cls, kind, id) -> "RestDataSource | None":
        """Resolve the DECLARED source of a view for a proxy fetch — from the field
        (``RestOptions``), the class (``@rest_listing``/``@rest_data``) or the method
        (``@rest_action``), never from a client-supplied url (so the proxy can't be turned into an
        open relay). Used by the ``__restfetch__`` reserved action."""
        if kind == "options":
            for f in view_fields(cls):
                if camel_case(f.name) == id and f.has(RestOptions):
                    return self._rest_options(f)
            return None
        if kind == "rows":
            return self._rest_listing(cls)
        if kind == "action":
            for klass in cls.__mro__:
                for name, m in vars(klass).items():
                    if (name == id or camel_case(name) == id) and getattr(
                        m, "__mateu_rest_action__", None
                    ) is not None:
                        r = self._rest_action(m)
                        return r.source if r else None
            return None
        if kind == "data":
            r = self._rest_data(cls)
            return r.source if r is not None else None
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
