"""Fields: grid fields, data types, stereotypes, options, REST sources and nav links (Java's ReflectionFormFieldMapper / FieldTypeMapper / RestSourceResolver)."""

from __future__ import annotations

from mateu_ui.uidl.suppliers import ColspanSupplier, ReadOnlySupplier, RequiredSupplier
from mateu_ui.uidl.markers import DivStyle as DivStyleMarker, Notice as NoticeMarker, OptionsLayout as OptionsLayoutMarker, Style as StyleMarker

from datetime import (
    date,
    datetime,
    time,
)
from decimal import Decimal
from typing import (
    Any,
    get_args,
    get_origin,
)

from mateu_ui.dtos import Action, AppMetadata, CustomFieldMetadata, ServerSideComponent, TextMetadata
from mateu_ui.dtos import CardMetadata, DivMetadata, FormLayoutMetadata, PageMetadata, VerticalLayoutMetadata
from mateu_ui.dtos import (
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
from mateu_ui.uidl import components as fluent
from mateu_ui.uidl import Autocomplete, Colspan, DetailForm, Details, Help, Hidden, Inline, Max, Min, Pattern, Length, SliderMax, SliderMin
from mateu_ui.uidl.rest_sources import RestSourceSupplier
from mateu_ui.uidl import Text as TextMarker
from mateu_ui.uidl import ContentSlot as ContentSlotMarker
from mateu_ui.uidl import (
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
    Version,
)
from mateu_ui.uidl import Section as SectionMarker

from .. import form_columns_inference, layout_inference
from ..input_purpose import input_purpose
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
from .. import nested_forms
from ..reflection import methods_with
from ..registry import normalize, type_name
from ._common import (
    _id,
    _log,
    enum_label,
    value_labels_of,
    element_enum,
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


def is_component_list(f) -> bool:
    """A list of UI components (``list[Badge]``, ``list[Component]``): display, never rows to
    edit — it answers no row-editing actions (Java's FieldActionCollector.isComponentList)."""
    if get_origin(f.type) is not list:
        return False
    args = get_args(f.type)
    return bool(args) and isinstance(args[0], type) and issubclass(args[0], fluent.Component)


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
            if is_list_field(f) and not is_component_list(f):
                fid = camel_case(f.name)
                row_type = self.grid_row_type(f)
                constrained = (
                    ",".join(
                        camel_case(c.name)
                        for c in view_fields(row_type)
                        if any(c.has(m) for m in (Required, Min, Max, Length, Pattern))
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

    def nested_form_actions(self, cls, instance) -> list[Action]:
        """The actions of the view's nested data objects (Java's
        ActionMapper.addNestedFormsActions): for every nested-form field — inline or not, one
        level — the nested class's actions in Java's FieldActionCollector order (its ``@action``
        methods, its fields' actions, its ``@button``/``@toolbar`` methods, its FABs), each id
        prefixed ``nested-form-action-<field>-``."""
        from ._common import with_action_options

        out: list[Action] = []
        for f in view_fields(cls):
            if not nested_forms.is_nested_form_field(f):
                continue
            value = getattr(instance, f.name, None) if not isinstance(instance, type) else None
            nested_cls = type(value) if value is not None else f.type
            own: list[Action] = []

            def add(action: Action) -> None:
                if all(a.id != action.id for a in own):
                    own.append(action)

            for n, fn in methods_with(nested_cls, "__mateu_action__"):
                add(with_action_options(
                    Action(id=camel_case(n), validation_required=False,
                           shortcut=getattr(fn, "__mateu_shortcut__", None)),
                    nested_cls, camel_case(n)))
            for action in self.field_actions(nested_cls):
                add(action)
            for n, fn in methods_with(nested_cls, "__mateu_toolbar__") + methods_with(nested_cls, "__mateu_button__"):
                if not hasattr(fn, "__mateu_action__"):
                    add(with_action_options(
                        Action(id=camel_case(n), validation_required=True,
                               shortcut=getattr(fn, "__mateu_shortcut__", None)),
                        nested_cls, camel_case(n)))
            for n, fn in methods_with(nested_cls, "__mateu_fab__"):
                if not any(hasattr(fn, m) for m in ("__mateu_action__", "__mateu_button__", "__mateu_toolbar__")):
                    add(Action(id=camel_case(n), validation_required=False))
            prefix = nested_forms.NESTED_ACTION_PREFIX + camel_case(f.name) + "-"
            out.extend(a.model_copy(update={"id": prefix + a.id}) for a in own)
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
        field_id = nested_forms.field_prefix() + camel_case(f.name)
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
                value_labels=value_labels_of(c.type),
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
        # the row type's Details() field opens under the row, behind a button (Java's @Details)
        detail_path = next(
            (camel_case(c.name) for c in view_fields(row_type) if c.has(Details)), None
        )
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
            colspan=self._colspan_of(f, instance),
            style=style,
            slider_max=0,
            # Grid rows ride in the component initialData / fragment state, not as an initialValue.
            # OnRowSelected() binds the click to a method; an editable grid without it selects the
            # row for its editor (<field>_selected), a read-only one dispatches nothing.
            # inside a nested form the row click runs the NESTED object's method
            # (nested-form-action-<prefix><method> — Java's GridColumnBuilder)
            on_item_selection_action_id=(
                (
                    nested_forms.NESTED_ACTION_PREFIX + nested_forms.field_prefix() + camel_case(on_row.value)
                    if nested_forms.field_prefix()
                    else camel_case(on_row.value)
                )
                if on_row
                else (None if read_only else f"{field_id}_selected")
            ),
            row_selection_shortcut=on_row.shortcut if on_row and on_row.shortcut else None,
            form_position=detail.position,
            form_style=detail.style,
            form_theme=detail.theme,
            form_columns=detail.columns or form_columns_inference.form_columns(row_type),
            min_height_when_detail_visible=detail.min_height_when_detail_visible,
            detail_path=detail_path,
            use_button_for_detail=detail_path is not None,
        )
        return ClientSideComponent(metadata=meta, id=field_id, children=[], style=style)

    @staticmethod
    def _colspan_of(f, instance) -> int:
        """A ColspanSupplier's answer (> 0, Java's ColspanSupplier), else Colspan(), else 1."""
        supplied = instance.colspan(f.name) if isinstance(instance, ColspanSupplier) else 0
        if supplied and supplied > 0:
            return supplied
        return f.marker(Colspan).value if f.has(Colspan) else 1

    def map_field(self, f, instance, read_only: bool = False) -> ClientSideComponent:
        # inside a nested form every id carries the prefix of the fields holding it
        # (``supplier-name`` — Java's FieldMetadataExtractor.getFieldId)
        field_id = nested_forms.field_prefix() + camel_case(f.name)
        slot = f.marker(ContentSlotMarker)
        if slot is not None:
            # a hole for managed content: the field's value is irrelevant, the slot is resolved by
            # the server against the content remote (mateu_ui.core.microfrontends)
            from mateu_ui.uidl import components as _fluent

            return self.map_content_slot(_fluent.ContentSlot(
                key=slot.key,
                fallback=slot.fallback if slot.fallback and slot.fallback.strip() else None,
                timeout_ms=slot.timeout_ms if slot.timeout_ms and slot.timeout_ms > 0 else None,
                description=slot.description or None,
                degrade_to_client=slot.degrade_to_client,
                style="width: 100%;",
            ))
        row_type = self.grid_row_type(f)
        if row_type is not None:
            return self.map_grid_field(f, row_type, instance, read_only)
        holder = self.map_holder_field(f, instance)
        if holder is not None:
            return holder
        if nested_forms.is_nested_form_field(f):
            return self.map_nested_form(f, instance, read_only)
        if f.has(TextMarker):
            # Text(): the VALUE rendered as a sized text, interpolated from the state client-side
            # (mirrors Java's ReflectionFormFieldMapper @Text branch).
            marker = f.marker(TextMarker)
            return self.client(
                TextMetadata(
                    text=nested_forms.state_expression(field_id),
                    container=marker.container,
                    size=marker.size,
                    no_margins=marker.no_margins,
                ),
                field_id,
                [],
            )
        notice = f.marker(NoticeMarker)
        if notice is not None:
            # Notice(): the field's VALUE shown as an inline notice, interpolated from the state
            # client-side — a blank value hides it (Java's ReflectionFormFieldMapper @Notice)
            from mateu_ui.uidl import components as _fluent

            return self.map_component(_fluent.Notice(
                text=nested_forms.state_expression(field_id),
                theme=notice.theme or "info",
                icon=notice.icon or None,
                slim=notice.slim,
                full_width=notice.full_width,
                action_label=self.T(notice.action_label) if notice.action_label else None,
                action_id=notice.action_id or None,
            ))
        label = self.T(f.marker(Label).value if f.has(Label) else humanize(f.name))
        required = f.has(Required) or (
            isinstance(instance, RequiredSupplier) and bool(instance.is_required(f.name))
        )
        t = f.type
        # the view's options(field_name) method wins (its options may carry children → tree
        # selects); enums keep contributing their constants
        options = self._supplied_options(instance, camel_case(f.name))
        if not options:
            # Enum options: value = the member name, label = enum_label (Java's enumLabel rule).
            choices = t if is_enum(t) else element_enum(t)
            options = (
                [Option(value=m.name, label=enum_label(m)) for m in choices] if choices is not None else []
            )
        value = getattr(instance, f.name, None)

        # ReadOnlyUnless(): read-only unless the caller is authorized.
        # ...also when the VIEW CLASS carries it (read_only_unless(...) on the class, .NET's
        # class-level [ReadOnlyUnless])
        # A field-level ReadOnly() locks the field too (Java's field-level @ReadOnly → readOnly).
        from .crud_modes import current_mode, server_owned

        read_only = (
            read_only
            or f.has(ReadOnly)
            # GeneratedValue(): always; EditableOnlyWhenCreating(): but on a creation form
            or server_owned(f, current_mode() == "new")
            # locked for this request (Java's ReadOnlySupplier)
            or (isinstance(instance, ReadOnlySupplier) and bool(instance.is_read_only(f.name)))
            or not self.authorized(f.marker(ReadOnlyUnless))
            or not self.authorized(getattr(instance.__class__, "__mateu_read_only_unless__", None))
        )
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
            # when the rows are laid out (LayoutMapperMixin.form_rows); a ColspanSupplier's answer
            # (> 0) wins over both
            colspan=self._colspan_of(f, instance),
            # Help(): the field's help text (Java's @Help → FormFieldDto.description)
            description=self.T(f.marker(Help).value) if f.has(Help) else None,
            slider_min=f.marker(SliderMin).value if f.has(SliderMin) else 0,
            slider_max=f.marker(SliderMax).value if f.has(SliderMax) else 100,
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
            # DivStyle(): the style of the div around the field, then FileUpload(accept=".csv"):
            # the file input's accept filter — both in the field's generic attributes list, no
            # dedicated wire field (Java's FieldMetadataExtractor.getAttributes, same order)
            attributes=(
                ([PairRecord(key="divStyle", value=f.marker(DivStyleMarker).value)] if f.has(DivStyleMarker) else [])
                + (self._file_upload_attributes(f, field_id, read_only) if f.has(FileUpload) else [])
            ),
            # OptionsLayout(columns): how many columns the options spread over (Java's
            # @OptionsLayout → optionsColumns)
            options_columns=f.marker(OptionsLayoutMarker).columns if f.has(OptionsLayoutMarker) else 1,
            # Style(): the field's own CSS — on the field AND its component (Java's @Style)
            style=f.marker(StyleMarker).value if f.has(StyleMarker) else None,
            # Autocomplete(): the input's purpose (WCAG 1.3.5); an editable email field infers it
            autocomplete=input_purpose(
                f.marker(Autocomplete).value if f.has(Autocomplete) else None, stereotype, read_only
            ),
        )
        out = self.client(meta, field_id, [])
        if meta.style:
            out = out.model_copy(update={"style": meta.style})
        return out

    def _file_upload_attributes(self, f, field_id: str, read_only: bool) -> list:
        """A FileUpload() field's attributes: accept / maxBytes / multiple / storage as declared
        (multiple also inferred for a list field), then — when a matching FileStorage is registered
        and the field is editable — uploadUrl / uploadTicket (bound to the caller) / uploadDirect."""
        marker = f.marker(FileUpload)
        multiple = bool(marker.multiple) or is_list_field(f)
        uploads = getattr(self, "uploads", None)
        if uploads is None:
            from ..uploads import Uploads

            uploads = Uploads()
        identity = self.identity_provider() if self.identity_provider and uploads.storages else None
        return [
            PairRecord(key=k, value=v)
            for k, v in uploads.field_attributes(marker, field_id, multiple, read_only, identity)
        ]

    def map_nested_form(self, f, instance, read_only: bool) -> ClientSideComponent:
        """A field holding a nested data object (Java's NestedFormFieldBuilder). ``Inline()``: its
        fields, prefixed ``<field>-``, expand into the section as a full-row CustomField holding
        a form layout. Otherwise a sub-form: an outlined Card holding a level+1 Page titled after
        the field, with the nested object's own form, badges, toolbar and buttons (their actions
        dispatched as ``nested-form-action-<prefix><method>``)."""
        from .layout import _section_columns

        if nested_forms.is_being_mapped(f.type) or isinstance(instance, f.type):
            # a type nested in itself: not expanded again (it would recurse forever)
            return ClientSideComponent(metadata=DivMetadata(), id=camel_case(f.name), children=[])
        value = nested_forms.nested_value(instance, f)
        cls = type(value) if value is not None else f.type
        prefix = nested_forms.field_prefix() + camel_case(f.name) + "-"
        label = self.T(f.marker(Label).value if f.has(Label) else humanize(f.name))
        if f.has(Inline):
            inline_read_only = (
                read_only or f.has(ReadOnly) or bool(class_flag(cls, "__mateu_read_only__", False))
            )
            max_columns = _section_columns(
                section_of(type(instance), f), form_columns_inference.form_columns(type(instance))
            )
            fields = [
                x for x in view_fields(cls)
                if self.visible(x) and (inline_read_only or not x.has(Version))
            ]
            with nested_forms.nested(prefix, owner=cls):
                rows = self.form_rows(self.map_fields(fields, value, inline_read_only), max_columns)
            form_layout = self.client(FormLayoutMetadata(max_columns=max_columns), None, rows)
            body = ClientSideComponent(
                metadata=VerticalLayoutMetadata(), children=[form_layout], style="width: 100%;"
            )
            return ClientSideComponent(
                metadata=CustomFieldMetadata(label="", content=body, colspan=max_columns),
                id=camel_case(f.name),
                children=[],
                style="width: 100%;",
            )
        level = nested_forms.nesting_level() + 1
        action_prefix = nested_forms.NESTED_ACTION_PREFIX + prefix
        with nested_forms.nested(prefix, level, owner=cls):
            content = self.form_cards(cls, value) if value is not None else []
            toolbar = [
                b.model_copy(update={"action_id": action_prefix + b.action_id})
                for b in (self.map_toolbar_button(n, fn) for n, fn in methods_with(cls, "__mateu_toolbar__"))
            ]
            buttons = [
                b.model_copy(update={"action_id": action_prefix + b.action_id})
                for b in (
                    self.map_button(n, fn)
                    for n, fn in methods_with(cls, "__mateu_button__")
                    if not hasattr(fn, "__mateu_toolbar__")
                )
            ]
            badges = self.badges(cls, value) if value is not None else []
        page = ClientSideComponent(
            metadata=PageMetadata(
                title=label, level=level, badges=badges, toolbar=toolbar, buttons=buttons
            ),
            children=content,
        )
        return ClientSideComponent(
            metadata=CardMetadata(content=page, variants=["outlined"]),
            id=camel_case(f.name),
            children=[],
            style="width: 100%;",
        )

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
        from .. import subresources

        if subresources.is_subresource(f) or (
            subresources.is_orchestrator(f.type) and not isinstance(instance, f.type)
        ):
            # an orchestrator held by a field (a sub-listing): its own island
            return self.map_orchestrator_field(f, instance, 1)
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

    def map_orchestrator_field(self, f, instance, max_columns: int, current_tab=None) -> ClientSideComponent:
        """A field whose TYPE is an orchestrator (a listing, a crud): an independent island — a
        MEDIATOR app shell bound to the type, in a ServerSide wrapper seeded with the context —
        and, for a ``Subresource()``, its title and help line above it (Java's
        EmbeddedOrchestratorFieldBuilder.build). ``current_tab`` = (label, sub-resources in it,
        fields in it) when it sits in a tab."""
        from .. import routed_tabs, subresources

        cls = f.type
        marker = subresources.marker_of(f)
        route = "/" + normalize(getattr(cls, "__mateu_ui__", "") or "") if getattr(cls, "__mateu_ui__", None) is not None else ""
        if not route:
            routes, _registry = routed_tabs._tables.get()
            entry = next(
                (e for e in (routes.authored().routes if routes is not None else ())
                 if e.view_model == type_name(cls) and ":" not in e.route),
                None,
            )
            route = "/" + normalize(entry.route) if entry is not None else ""
        if not route:
            if marker is None:
                # The island would load route "" — the app's ROOT — and render the whole page inside
                # itself, which renders the island again: an endless reload with nothing on screen
                # to say why. Fail where the cause is.
                raise RuntimeError(
                    f"{type(instance).__name__}.{f.name} embeds {cls.__name__}, an orchestrator with no"
                    " route of its own, so its island would load the app's root route and render the"
                    f" page inside itself forever. Give {cls.__name__} a route (@ui(\"/…\") or a"
                    " routes.yaml entry), or declare the field Subresource()."
                )
            # a sub-resource needs no route of its own: its island is addressed by its type
            route = f"/_subresource/{type(instance).__name__}/{camel_case(f.name)}"
        inline = f.has(Inline)
        marked = f"{route}?{subresources.EMBEDDED_MARKER}=1"
        if inline:
            marked += f"&{subresources.INLINE_MARKER}=1"
        context = subresources.context(f, instance) if marker is not None else {}
        if marker is not None:
            marked += f"&{subresources.HIDE_TITLE_MARKER}=1"
            if context:
                # the names the parent fixes: the island's listing shows them as its scope
                marked += f"&{subresources.SCOPE_MARKER}=" + ",".join(context)
            if str(marker.load).upper() != "EAGER":
                marked += f"&{subresources.LAZY_MARKER}=1"
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
                root_route="_empty",
                style="width: 100%;",
            ),
            id=component_id + "_app",
            children=[],
            style="width: 100%;",
        )
        initial: dict[str, Any] = {subresources.EMBEDDED_MARKER: True}
        if inline:
            initial[subresources.INLINE_MARKER] = True
        if marker is not None:
            initial[subresources.HIDE_TITLE_MARKER] = True
            initial.update(context)
        value = getattr(instance, f.name, None)
        if value is not None:
            initial.update(seed_state(value))
        wrapper = ServerSideComponent(
            id=component_id,
            server_side_type=island_type,
            route=marked,
            children=[app],
            initial_data=initial,
            actions=[],
            style="width: 100%;",
        )
        content: ClientSideComponent | ServerSideComponent = wrapper
        if marker is not None:
            content = self._subresource_header(f, marker, instance, wrapper, current_tab)
        return ClientSideComponent(
            metadata=CustomFieldMetadata(label="", content=content, colspan=max_columns),
            id="fieldId",
            children=[],
            style="width: 100%;",
        )

    def _subresource_header(self, f, marker, instance, island, current_tab):
        """A sub-resource's title and help line above its island; the title is left out when it
        would only repeat the tab's label, the page's title, or a tab holding it alone."""
        from mateu_ui.dtos import TextMetadata, VerticalLayoutMetadata

        from .. import subresources

        title = subresources.title(f)
        page_title = getattr(type(instance), "__mateu_title__", None) or ""
        show_title = (
            marker.show_title
            and not (
                current_tab is not None
                and (title.lower() == current_tab[0].lower() or (current_tab[1] == 1 and current_tab[2] == 1))
            )
            and title.lower() != str(page_title).lower()
        )
        content: list = []
        if show_title:
            content.append(ClientSideComponent(
                metadata=TextMetadata(text=title, container="h3", no_margins=True),
                children=[],
                style="",
                css_classes="mateu-subresource-title",
            ))
        if marker.help:
            content.append(ClientSideComponent(
                metadata=TextMetadata(text=marker.help, container="p", no_margins=True),
                children=[],
                style="color: var(--lumo-secondary-text-color, #666); margin: 0 0 .5rem 0;",
                css_classes="mateu-subresource-help",
            ))
        if not content:
            return island
        return ClientSideComponent(
            metadata=VerticalLayoutMetadata(),
            children=[*content, island],
            style="width: 100%; gap: .25rem;",
            css_classes="mateu-subresource",
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
        # By ref, the request and the mapping paths come from the catalogue entry, and what the
        # surface declares WINS over the entry — so the marker's non-blank defaults ("GET",
        # "value", "label") must not travel, or they would override the entry's own (Java's
        # FieldMetadataExtractor.getOptionsSource, .NET's RestOptionsOf). An explicit value still
        # overrides, exactly as for an inline url.
        by_ref = bool(a.source)
        return RestDataSource(
            ref=a.source or None,
            url=a.url,
            method=_declared_method(a.source, a.method, "GET"),
            headers=FieldMapperMixin._headers_of(a.headers),
            body=a.body,
            items_path=a.items_path,
            value_path="" if by_ref and a.value_path == "value" else a.value_path,
            label_path="" if by_ref and a.label_path == "label" else a.label_path,
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
        ref = (rest[0] if rest else "") or None
        return RestDataSource(
            ref=ref,
            url=url or None,
            method=_declared_method(ref, method, "GET"),
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
        ref = (rest[0] if rest else "") or None
        return RestAction(
            source=RestDataSource(
                ref=ref,
                url=url or None,
                method=_declared_method(ref, method, "POST"),
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
        ref = (rest[0] if rest else "") or None
        return RestAction(
            source=RestDataSource(
                ref=ref,
                url=url or None,
                method=_declared_method(ref, method, "GET"),
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
        of_kind = [(i, src) for k, i, src in self._declared_sources(cls, instance) if k == kind]
        # the one NAMED first: a page can hold a listing AND a live kanban, both rows (mirrors Java
        # RestSourceResolver) — the first rows source answered for the board's rows too
        for i, src in of_kind:
            if id and (i == id or camel_case(i) == id):
                return self._resolved(src)
        if kind in ("rows", "data") and of_kind:
            return self._resolved(of_kind[0][1])
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
        if element_enum(f.type) is not None:
            # a list/set of enum constants with no stereotype: pick several (Java's
            # ChoiceCollections; owner, 2026-10-12)
            return "multiSelect"
        if f.has(SliderMin) or f.has(SliderMax):
            # slider bounds make it a slider (Java's FieldTypeMapper)
            return "slider"
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
        if t is date:
            return "date"
        # a datetime carries a time (Java's LocalDateTime): mapped as a date, the time was lost
        if t is datetime:
            return "dateTime"
        if t is time:
            return "time"
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

    def map_toolbar_button(self, name: str, fn) -> Button:
        """A @toolbar method as a header toolbar button (Java's @Toolbar)."""
        marker = getattr(fn, "__mateu_toolbar__")
        label = marker if isinstance(marker, str) else humanize(name)
        style = getattr(fn, "__mateu_toolbar_style__", None)
        look = getattr(fn, "__mateu_toolbar_look__", None)
        color = getattr(look, "button_color", None)
        size = getattr(look, "button_size", None)
        return Button(
            label=self.T(label),
            action_id=camel_case(name),
            button_style=style if style and style != "none" else None,
            color=color if color and color != "none" else None,
            size=size if size and size != "none" else None,
            separator_before=bool(getattr(look, "separator_before", False)),
            shortcut=getattr(fn, "__mateu_shortcut__", None),
            disabled=not self.authorized(getattr(fn, "__mateu_disabled_unless__", None)),
        )

    @staticmethod
    def client(meta, id, children) -> ClientSideComponent:
        return ClientSideComponent(metadata=meta, id=id, children=children)


def _declared_method(source, method: str, default: str) -> str:
    """The method a by-ref surface declares: blank when it is the decorator's default, so the
    catalogue entry's own method wins (a POST source referenced by a field defaulting to GET was
    called with GET). Inline (no ref), the method travels as declared."""
    if source and (method or "").upper() == default:
        return ""
    return method


def section_of(cls, target) -> SectionMarker | None:
    """The ``Section`` a field of ``cls`` falls in (the last one declared at or before it)."""
    current = None
    for f in view_fields(cls):
        marker = f.marker(SectionMarker)
        if marker is not None:
            current = marker
        if f.name == target.name:
            return current
    return current
