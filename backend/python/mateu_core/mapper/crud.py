"""CRUD listings, capability listings, filters and the entity form (Java's ListRouteResolver / PageListingBuilder / CrudFormComponentBuilder)."""

from __future__ import annotations

from datetime import (
    date,
    datetime,
)
from decimal import Decimal

from mateu_dtos import (
    Action,
    Button,
    CrudMetadata,
    FormFieldMetadata,
    GridColumn,
    GridColumnMeta,
    HeroSectionMetadata,
    Option,
    PageMetadata,
    RuleRecord,
    ServerSideComponent,
    TextMetadata,
    Trigger,
)
from mateu_uidl import (
    Aggregate,
    Creatable,
    DateRange,
    Deletable,
    Disabled,
    DisabledUnless,
    Editable,
    GroupBy,
    HeroSearch,
    Hidden,
    Label,
    Lookup,
    Money,
    Navigable,
    NumberRange,
    PrimaryColumn,
    RangeFilter,
    ReadOnly,
    RowStatus,
    RuleSupplier,
    Searchable,
    Selector,
    SmartSearchPage,
    Tooltip,
)

from ..naming import (
    camel_case,
    humanize,
)
from ..page_type_inference import page_type_of
from ..reflection import (
    methods_with,
    view_fields,
)
from ..registry import type_name
from ..validation import client_validations
from ..export import FORMATS
from ._base import MixinBase
from ._common import (
    _id,
    _log,
    enum_label,
    enum_set_element_type,
    is_enum,
    listing_types,
)


class CrudMapperMixin(MixinBase):
    # ── CRUD ───────────────────────────────────────────────────────────────────
    @staticmethod
    def _exportable(cls, instance, action_id: str) -> bool:
        """Whether a crud answers ``action_id`` (export-csv|export-excel|export-pdf): its
        ``<format>_exportable()`` hook says yes AND the format's library is installed (Java shows
        the button only when an exporter bean exists)."""
        fmt = FORMATS.get(action_id)
        if fmt is None:
            return False
        hook_name, _, _, _, _, available = fmt
        hook = getattr(instance if instance is not None else cls, hook_name, None)
        if hook is None:
            return False
        try:
            wanted = bool(hook() if instance is not None else hook(cls()))
        except Exception as e:  # noqa: BLE001 - logged, not fatal
            _log.warning("A crud that cannot be built offers no %s (%s)", action_id, e)
            return False
        return wanted and available()

    @staticmethod
    def _csv_exportable(cls, instance=None) -> bool:
        """Whether a crud answers export-csv (its ``csv_exportable()`` hook, default False)."""
        return CrudMapperMixin._exportable(cls, instance, "export-csv")

    def group_action_buttons(self, cls) -> list[Button]:
        """The ``@group_action`` methods as group-header buttons (Java's PageListingBuilder)."""
        return [
            Button(label=self.T(getattr(fn, "__mateu_group_action__")), action_id=camel_case(name))
            for name, fn in methods_with(cls, "__mateu_group_action__")
        ]

    def export_action_ids(self, cls, instance=None) -> list[str]:
        """The export actions a crud offers, in Java's toolbar order (CSV, Excel, PDF)."""
        return [aid for aid in FORMATS if self._exportable(cls, instance, aid)]

    def map_crud(self, cls, element, route: str, instance=None) -> ServerSideComponent:
        title = getattr(cls, "__mateu_title__", humanize(cls.__name__))
        # HeroSearch: a centered hero header over the listing, results as cards, no auto-search.
        hero = instance if isinstance(instance, HeroSearch) else (
            cls() if isinstance(cls, type) and issubclass(cls, HeroSearch) else None
        )
        # Class-level @inline_editing: every data column (except ReadOnly() ones) is edited in
        # place; each committed cell dispatches the crud's update-row action (Java parity).
        inline = getattr(cls, "__mateu_inline_editing__", False)
        columns = []
        for f in view_fields(element):
            if not self.visible(f):
                continue
            editable = inline and not f.has(ReadOnly)
            columns.append(GridColumn(metadata=GridColumnMeta(
                id=camel_case(f.name),
                label=(f.marker(Label).value if f.has(Label) else humanize(f.name)),
                editable=editable,
                editor_type=self.editor_type_of(f) if editable else None,
                editor_options=(
                    [Option(value=m.name, label=enum_label(m)) for m in f.type]
                    if editable and is_enum(f.type) else None
                ),
                aggregate=self.aggregate_of(f),
                stereotype=self.column_stereotype_of(f),
                caption_path=self.caption_path_of(f),
                leading_path=self.leading_path_of(f),
                tooltip_path=self.tooltip_path_of(f),
            )))
        toolbar = [Button(label="New", action_id="new"), Button(label="Delete", action_id="delete")]
        # Export the listing (Crud.csv/excel/pdf_exportable): the whole filtered set as a file
        # download (mirrors Java's ListRouteResolver export buttons).
        exports = self.export_action_ids(cls, instance)
        for i, aid in enumerate(exports):
            toolbar.insert(i, Button(label=FORMATS[aid][1], action_id=aid))
        # @list_toolbar_button methods: BULK list actions — a listing toolbar button dispatching
        # action-on-row-<method> over the grid's selected rows; the action advertises the
        # confirmation/selection-required flags the frontend enforces (mirrors Java's
        # Crud.addButtonsToList + CrudActionsBuilder).
        bulk_actions = []
        for name, fn in methods_with(cls, "__mateu_list_toolbar_button__"):
            marker = getattr(fn, "__mateu_list_toolbar_button__")
            action_id = "action-on-row-" + camel_case(name)
            toolbar.append(Button(label=self.T(marker.label or humanize(name)), action_id=action_id))
            bulk_actions.append(Action(
                id=action_id,
                validation_required=False,
                confirmation_required=marker.confirmation_required,
                rows_selected_required=marker.rows_selected_required,
                bubble=True,
            ))
        crud = self.client(
            CrudMetadata(
                title=title,
                columns=columns,
                toolbar=toolbar,
                filters=self.crud_filters(element),
                crudl_type="cards" if hero is not None else "table",
                group_by=self.group_by_of(element),
                group_actions=self.group_action_buttons(cls),
                row_status_field=self.row_status_field_of(element),
                drag_type=self.drag_type_of(cls),
                # a full Crud has all the capabilities: delete needs row selection
                rows_selection_enabled=True,
            ),
            "crud",
            [],
        )
        # A listing fills the space its parent leaves and scrolls internally (coherence-plan #8).
        crud = crud.model_copy(update={"sizing": "fill"})
        page_children = []
        if hero is not None:
            page_children.append(self.client(
                HeroSectionMetadata(
                    title=hero.hero_title(), subtitle=hero.hero_subtitle(),
                    image=hero.hero_image(), centered=True,
                ),
                None, [],
            ))
        page_children.append(crud)
        page = self.client(PageMetadata(page_type=page_type_of(cls)), None, page_children)
        actions = [Action(id="search"), Action(id="new"), Action(id="delete")]
        for aid in exports:
            actions.append(Action(id=aid, validation_required=False))
        if inline:
            actions.append(Action(id="update-row"))
        actions.extend(bulk_actions)
        # A hero-search page starts EMPTY (the user searches); plain cruds preload their rows.
        triggers = [] if hero is not None else [Trigger(type="OnLoad", action_id="search")]
        return ServerSideComponent(
            id=_id(), server_side_type=type_name(cls), route=route, children=[page],
            initial_data={}, actions=actions, triggers=triggers,
            page_width=getattr(cls, "__mateu_page_width__", None),
            page_type=page_type_of(cls),
        )

    @staticmethod
    def aggregate_of(f) -> str | None:
        """The Aggregate() function of a listing column as its wire name (sum|avg|min|max|count);
        None on non-aggregated columns (mirrors Java's ListingColumnBuilder)."""
        marker = f.marker(Aggregate)
        return marker.function.name if marker is not None else None

    @staticmethod
    def column_stereotype_of(f) -> str | None:
        """"primary" when the column field carries PrimaryColumn() (coherence-plan #6); None
        otherwise (mirrors Java's ColumnTypeMapper.getStereotypeForColumn)."""
        return "primary" if f.marker(PrimaryColumn) is not None else None

    @staticmethod
    def caption_path_of(f) -> str | None:
        marker = f.marker(PrimaryColumn)
        return marker.caption if marker is not None and marker.caption else None

    @staticmethod
    def tooltip_path_of(f) -> str | None:
        """Tooltip("other_field"): hovering the cell shows another field of the row (mirrors
        Java's ListingColumnBuilder.tooltipPathOf; the ports have no fixed column widths, so
        there is no own-name fallback). Camel-cased like the column ids it points at."""
        marker = f.marker(Tooltip)
        return camel_case(marker.value) if marker is not None and marker.value.strip() else None

    @staticmethod
    def leading_path_of(f) -> str | None:
        marker = f.marker(PrimaryColumn)
        return marker.leading if marker is not None and marker.leading else None

    @staticmethod
    def drag_type_of(listing_cls) -> str | None:
        """The drag type of a listing whose rows can be dragged (@drag_rows on its class); None =
        none (mirrors Java's ListingSummarySpec.dragTypeOf)."""
        t = getattr(listing_cls, "__mateu_drag_rows__", None)
        return t if isinstance(t, str) and t.strip() else None

    @staticmethod
    def row_status_field_of(row_type) -> str | None:
        """The RowStatus() field of a row class (camelCase field id) — its value tones the row;
        first declared wins, None when none (mirrors Java's ListingSummarySpec.rowStatusFieldOf)."""
        for f in view_fields(row_type):
            if f.has(RowStatus):
                return camel_case(f.name)
        return None

    def export_columns(self, element) -> list[tuple[str, str]]:
        """The columns of a crud export: (field name, column label) for every visible entity field
        (mirrors Java's ExportActionRunner.buildExportColumns)."""
        return [
            (f.name, f.marker(Label).value if f.has(Label) else humanize(f.name))
            for f in view_fields(element)
            if self.visible(f)
        ]

    @staticmethod
    def group_by_of(row_type) -> str | None:
        """The GroupBy() column of a row class (camelCase field id); one per row class — first
        declared wins. None when the class declares none (mirrors Java's ListingSummarySpec)."""
        for f in view_fields(row_type):
            if f.has(GroupBy):
                return camel_case(f.name)
        return None

    @staticmethod
    def editor_type_of(f) -> str:
        """The in-place editor widget for an @inline_editing column (mirrors Java's
        GridColumnBuilder.getEditorType): enums edit as a select, Money() as a number, the rest
        by data type."""
        t = f.type
        if f.has(Lookup):
            return "lookup"
        if is_enum(t):
            return "select"
        if f.has(Money):
            return "number"
        if t is bool:
            return "boolean"
        if t is int:
            return "integer"
        if t in (float, Decimal):
            return "number"
        if t is date:
            return "date"
        if t is datetime:
            return "datetime"
        return "text"

    def map_listing(self, cls, route: str) -> ServerSideComponent:
        """A capability Listing view: columns from the Row type, and every further feature only
        because the class DECLARES the capability (mirrors Java's ``CapabilityCrud``) —
        Searchable the search box, Filterable the smart search bar built from the Filters type
        (typed DateRange/NumberRange/set fields render range and multi-select widgets),
        Navigable/Editable clickable rows (first column actionId "view"; the editor opens in a
        drawer when Editable without Navigable), Creatable the New button, Deletable row
        selection + the Delete button. A bare Listing is just the table."""
        filters_type, row_type = listing_types(cls) or (None, None)
        title = getattr(cls, "__mateu_title__", humanize(cls.__name__))
        searchable = issubclass(cls, Searchable)
        navigable = issubclass(cls, Navigable)
        editable = issubclass(cls, Editable)
        creatable = issubclass(cls, Creatable)
        deletable = issubclass(cls, Deletable)
        rows_clickable = navigable or editable
        # A self-referential children list makes rows hierarchical (grid_layout "tree"); it rides
        # inside the row dicts, never as a column.
        columns = []
        for f in view_fields(row_type) if row_type is not None else []:
            if self.grid_row_type(f) is not None or not self.visible(f):
                continue
            columns.append(GridColumn(metadata=GridColumnMeta(
                id=camel_case(f.name),
                label=(f.marker(Label).value if f.has(Label) else humanize(f.name)),
                data_type=self.infer_data_type(f.type, f),
                aggregate=self.aggregate_of(f),
                stereotype=self.column_stereotype_of(f),
                caption_path=self.caption_path_of(f),
                leading_path=self.leading_path_of(f),
                tooltip_path=self.tooltip_path_of(f),
                # the first column of a Navigable/Editable listing opens the record
                action_id="view" if rows_clickable and not columns else None,
            )))
        actions = [Action(id="search")]
        if rows_clickable:
            actions.append(Action(id="view", validation_required=False))
        if editable:
            actions.append(Action(id="edit", validation_required=False))
            actions.append(Action(id="save"))
            actions.append(Action(id="cancel-edit", validation_required=False))
        if creatable:
            actions.append(Action(id="new", validation_required=False))
            actions.append(Action(id="create"))
            actions.append(Action(id="cancel-new", validation_required=False))
        if deletable:
            actions.append(Action(id="delete", validation_required=False))
        toolbar = []
        if creatable:
            toolbar.append(Button(label="New", action_id="new"))
        if deletable:
            toolbar.append(Button(label="Delete", action_id="delete"))
        # @list_toolbar_button methods on the listing: BULK actions over the selected rows
        # (mirrors Java's behaviourSource — the bridged listing's methods become toolbar
        # buttons).
        for name, fn in methods_with(cls, "__mateu_list_toolbar_button__"):
            marker = getattr(fn, "__mateu_list_toolbar_button__")
            action_id = "action-on-row-" + camel_case(name)
            toolbar.append(Button(label=self.T(marker.label or humanize(name)), action_id=action_id))
            actions.append(Action(
                id=action_id,
                validation_required=False,
                confirmation_required=marker.confirmation_required,
                rows_selected_required=marker.rows_selected_required,
                bubble=True,
            ))
        if issubclass(cls, Selector):
            # The rows of a selector dialog show a Select button (the frontend keys on the
            # "select" action column) and clicking dispatches action-on-row-select.
            columns.append(GridColumn(metadata=GridColumnMeta(
                id="select", label="Select", data_type="action", stereotype="button",
            )))
            actions.append(Action(id="action-on-row-select", validation_required=False))
        crud = self.client(
            CrudMetadata(title=title, columns=columns, toolbar=toolbar,
                         searchable=searchable,
                         can_edit=editable,
                         rows_selection_enabled=deletable,
                         filters=self.listing_filters(filters_type) if filters_type is not None else [],
                         grid_layout=cls().grid_layout(),
                         group_by=self.group_by_of(row_type) if row_type is not None else None,
                         group_actions=self.group_action_buttons(cls),
                         row_status_field=(self.row_status_field_of(row_type)
                                           if row_type is not None else None),
                         # @rest_listing: rows fetched client-side from an arbitrary REST endpoint.
                         rows_source=self._rest_listing(cls),
                         drag_type=self.drag_type_of(cls)),
            "crud",
            [],
        )
        # A listing fills the space its parent leaves and scrolls internally (coherence-plan #8).
        crud = crud.model_copy(update={"sizing": "fill"})
        page_children = []
        smart_search = issubclass(cls, SmartSearchPage)
        if smart_search:
            # An optional intro line renders under the page title, above the smart search bar.
            subtitle = cls().page_subtitle()
            if subtitle is not None:
                page_children.append(
                    self.client(TextMetadata(text=subtitle), "page-subtitle", []))
        page_children.append(crud)
        page = self.client(PageMetadata(page_type=page_type_of(cls)), None, page_children)
        return ServerSideComponent(
            id=_id(), server_side_type=type_name(cls), route=route, children=[page],
            initial_data={}, actions=actions,
            # A smart search page starts EMPTY (the user searches); plain listings preload.
            triggers=[] if smart_search else [Trigger(type="OnLoad", action_id="search")],
            page_width=getattr(cls, "__mateu_page_width__", None),
            page_type=page_type_of(cls),
        )

    def listing_filters(self, filters_type) -> list[FormFieldMetadata]:
        out: list[FormFieldMetadata] = []
        for f in view_fields(filters_type):
            fid = camel_case(f.name)
            label = f.marker(Label).value if f.has(Label) else humanize(f.name)
            t = f.type
            if t is DateRange:
                out.append(FormFieldMetadata(field_id=fid, data_type="date", label=label, stereotype="dateRange"))
            elif t is NumberRange:
                out.append(FormFieldMetadata(field_id=fid, data_type="number", label=label, stereotype="numberRange"))
            elif enum_set_element_type(t) is not None:
                el = enum_set_element_type(t)
                out.append(FormFieldMetadata(
                    field_id=fid, data_type="string", label=label, stereotype="multiSelect",
                    options=[Option(value=m.name, label=enum_label(m)) for m in el],
                ))
            elif is_enum(t):
                out.append(FormFieldMetadata(
                    field_id=fid, data_type="string", label=label, stereotype="select",
                    options=[Option(value=m.name, label=enum_label(m)) for m in t],
                ))
            else:
                out.append(FormFieldMetadata(field_id=fid, data_type=self.infer_data_type(t, f), label=label))
        return out

    def crud_filters(self, element) -> list[FormFieldMetadata]:
        """The smart search bar's filters for a Crud entity (mirrors the Java AutoCrud
        semantics): every basic field and every enum becomes a filter — enums upgrade to
        multi-selects (IN) with their members as options, temporals to from-to date ranges,
        RangeFilter numerics to min-max ranges."""
        out: list[FormFieldMetadata] = []
        for f in view_fields(element):
            t = f.type
            if not (is_enum(t) or t in (str, bool, int, float, Decimal, date, datetime)):
                continue
            label = f.marker(Label).value if f.has(Label) else humanize(f.name)
            options: list[Option] = []
            if is_enum(t):
                stereotype = "multiSelect"
                options = [Option(value=m.name, label=enum_label(m)) for m in t]
            elif t in (date, datetime):
                stereotype = "dateRange"
            elif t in (int, float, Decimal) and f.has(RangeFilter):
                stereotype = "numberRange"
            else:
                stereotype = "regular"
            out.append(
                FormFieldMetadata(
                    field_id=camel_case(f.name),
                    data_type=self.infer_data_type(t, f),
                    label=label,
                    stereotype=stereotype,
                    options=options,
                )
            )
        return out

    def map_entity_form(
        self, crud_type, element, entity, mode: str, route: str,
        can_edit: bool = True, can_create: bool = True, save_action_id: str = "create",
    ) -> ServerSideComponent:
        """The detail/edit/create form of a crud or capability listing. ``can_edit`` /
        ``can_create`` trim the view-mode toolbar to the declared capabilities;
        ``save_action_id`` is the action Save dispatches ("create" on the crud path, "save" on
        a capability listing's editor)."""
        title = getattr(crud_type, "__mateu_title__", humanize(element.__name__))
        if mode == "view":
            toolbar = [Button(label="Back to list", action_id="cancel-view")]
            if can_edit:
                toolbar.append(Button(label="Edit", action_id="edit"))
            if can_create:
                toolbar.append(Button(label="Add another", action_id="new"))
        elif mode == "edit":
            toolbar = [
                Button(label="Cancel", action_id="cancel-edit"),
                Button(label="Save", action_id=save_action_id, button_style="primary"),
            ]
        else:  # new
            toolbar = [
                Button(label="Cancel", action_id="cancel-new"),
                Button(label="Save", action_id=save_action_id, button_style="primary"),
            ]
        page = self.client(
            PageMetadata(title=title, page_title=title, toolbar=toolbar,
                         page_type=page_type_of(crud_type)),
            None,
            self.form_cards(element, entity, read_only=mode == "view"),
        )
        return ServerSideComponent(
            id=_id(), server_side_type=type_name(crud_type), route=route, children=[page],
            # The entity's field values ride in initialData / fragment state (Java parity).
            initial_data=self.form_initial_data(element, entity), actions=[], triggers=[],
            # Hidden()/Disabled() on entity fields rule the detail form too.
            rules=self.map_rules(element, entity),
            page_width=getattr(crud_type, "__mateu_page_width__", None),
            page_type=page_type_of(crud_type),
            validations=client_validations(self, element, entity, read_only=mode == "view"),
        )

    def map_rules(self, cls, instance) -> list[RuleRecord]:
        """Client-side rules of a view (mirrors Java's RuleMapper.createRules): ``Disabled()``
        fields disable unconditionally, ``Hidden(expr)`` fields hide while the expression is
        truthy, and a :class:`RuleSupplier` contributes programmatic rules."""
        rules: list[RuleRecord] = []
        for f in view_fields(cls):
            field_id = camel_case(f.name)
            if f.has(Disabled) or not self.authorized(f.marker(DisabledUnless)):
                rules.append(RuleRecord(
                    filter="true", action="SetDataValue", field_name=field_id,
                    field_attribute="disabled", expression="true",
                ))
            hidden = f.marker(Hidden)
            if hidden is not None and hidden.value:
                rules.append(RuleRecord(
                    filter="true", action="SetDataValue", field_name=field_id,
                    field_attribute="hidden", expression=hidden.value,
                ))
        if isinstance(instance, RuleSupplier):
            rules.extend(
                RuleRecord(
                    filter=r.filter, action=r.action, field_name=r.field_name,
                    field_attribute=r.field_attribute, value=r.value, expression=r.expression,
                    result=r.result, action_id=r.action_id,
                )
                for r in instance.rules()
            )
        return rules
