"""Form fields, options sources, nav links and the crud listing (Java's FormFieldDto / RestDataSourceDto / CrudlDto)."""

from __future__ import annotations

from typing import (
    Any,
    Literal,
    TYPE_CHECKING,
)

from pydantic import Field

from .base import Wire

if TYPE_CHECKING:
    from .components import Component
    from .records import (
        Button,
        GridColumn,
        Option,
    )


class FormFieldMetadata(Wire):
    type: Literal["FormField"] = "FormField"
    field_id: str
    data_type: str
    label: str
    stereotype: str = "regular"
    tree_leaves_only: bool = False
    required: bool = False
    read_only: bool = False
    colspan: int = 1
    #: Number of columns the option list lays out in (Java's FormFieldDto.optionsColumns, always 1
    #: here); emitted so the normalised wire matches the reference.
    options_columns: int = 1
    #: Slider stereotype upper bound (Java's FormFieldDto.sliderMax, default 100).
    slider_max: int = 100
    #: Whether an integer field shows the +/- step buttons (Java's FormFieldDto.stepButtonsVisible).
    step_buttons_visible: bool = False
    #: A per-field initial value. Reflected forms do NOT set this (their values ride in the
    #: component initialData / fragment state, Java parity); only a fluent FormField may carry one.
    initial_value: Any | None = None
    options: list["Option"] = Field(default_factory=list)
    multiline: bool = False
    #: Property-list sections (Section(property_list=True)): render as a read-only row with the
    #: label aligned left and the plain-text value aligned right, divider between rows.
    property_row: bool = False
    #: Navigation link rendered as an icon at the right side of this field; None = no link.
    link: "NavLinkRecord | None" = None
    #: Where a lookup (remote combo) field searches its options: the renderer fires ``action``
    #: with {searchText, page, size} and expects a page of options back. None on other fields.
    remote_coordinates: "RemoteCoordinates | None" = None
    #: Options fetched CLIENT-SIDE from an arbitrary (non-Mateu) REST endpoint (``RestOptions()``):
    #: the renderer calls the URL directly and maps the JSON into the select's options. None on
    #: fields without an external source.
    options_source: "RestDataSource | None" = None
    #: Grid (list-of-rows) fields: one GridColumn per row-type field. None on non-grid fields.
    columns: "list[GridColumn] | None" = None
    #: Grid fields: the row-identity path ("_rowNumber" — rows are identified by position).
    item_id_path: str | None = None
    #: Grid fields: action dispatched when the user selects (clicks) a row, carrying the row as
    #: the _clickedRow parameter (OnRowSelected()).
    on_item_selection_action_id: str | None = None
    #: Grid fields: keyboard base combo for selecting a row by position.
    row_selection_shortcut: str | None = None
    #: Generic field attributes (mirrors ``FormFieldDto.attributes``, a list of key/value
    #: pairs) — e.g. the ``FileUpload`` accept filter travels as {"key": "accept", "value": ".csv"}.
    attributes: list["PairRecord"] = Field(default_factory=list)
    #: The field's own CSS (a grid field defaults to "min-width: 10rem; width: 100%;").
    style: str | None = None
    #: Grid fields: cells edit in place (InlineEditing()).
    inline_editing: bool = False
    #: Grid fields: where the row editor opens (right|left|top|bottom|modal…; mirrors
    #: FormFieldDto.formPosition), its CSS/theme and its column count.
    form_position: str | None = None
    form_style: str | None = None
    form_theme: str | None = None
    form_columns: int = 0
    #: Grid fields: the min height the grid keeps while the row editor is shown.
    min_height_when_detail_visible: str | None = None
    #: Grid fields: the row field shown as an expandable detail, and whether a button opens it.
    detail_path: str | None = None
    use_button_for_detail: bool = False


class PairRecord(Wire):
    """A generic key/value pair (mirrors ``io.mateu.dtos.PairDto``)."""

    key: str
    value: Any | None = None


class RemoteCoordinates(Wire):
    """Coordinates of a remote data source (mirrors ``io.mateu.dtos.RemoteCoordinatesDto``);
    only ``action`` is set for same-backend lookups."""

    action: str
    base_url: str | None = None
    route: str | None = None
    params: dict[str, Any] | None = None


class RestDataSource(Wire):
    """Descriptor for consuming an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE (mirrors
    ``io.mateu.dtos.RestDataSourceDto``): the renderer fetches ``url`` directly, navigates
    ``items_path`` to the response array and maps each item via ``value_path``/``label_path``.
    ``url``/``headers``/``body`` support ``${state.x}`` interpolation.

    A descriptor points at an endpoint in one of two ways, and they are alternatives: **by
    reference** — ``ref`` names an entry of ``sources.yaml`` (the ``data: countries`` shorthand),
    so the URL is declared once and re-pointable — or **inline** with ``url`` + mapping paths."""

    #: The name of a catalogue entry (sources.yaml) to take the endpoint from; blank means this
    #: descriptor is inline (mirrors RestDataSourceDto.ref). The paths declared HERE still win.
    ref: str | None = None
    url: str | None = None
    method: str | None = None
    headers: dict[str, str] | None = None
    body: str | None = None
    items_path: str | None = None
    value_path: str | None = None
    label_path: str | None = None
    #: fetch through the Mateu server (no CORS, ${secret.X} injected server-side); default False
    proxy: bool = False


class RestSourceEntryRecord(Wire):
    """One named entry of the REST source catalogue on the wire (mirrors
    ``io.mateu.dtos.RestSourceEntryDto``); ``provenance`` is the EFFECTIVE one (never "auto")."""

    name: str
    source: RestDataSource
    fields: dict[str, str] = Field(default_factory=dict)
    total_path: str | None = None
    provenance: str | None = None
    description: str | None = None


class NavLinkRecord(Wire):
    """Navigation link on a form field (mirrors ``io.mateu.dtos.NavLinkDto``; "Record" suffix to
    avoid clashing with ``mateu_uidl.NavLink``, like ``GanttTaskRecord``). ``href``/``title``
    travel as raw ``${...}`` templates — the renderer interpolates them against the live state."""

    href: str
    icon: str | None = None
    title: str | None = None
    target: str | None = None


class CrudMetadata(Wire):
    type: Literal["Crud"] = "Crud"
    title: str | None = None
    columns: list["GridColumn"] = Field(default_factory=list)
    toolbar: list["Button"] = Field(default_factory=list)
    subtitle: str | None = None
    searchable: bool = True
    can_edit: bool = False
    detail_path: str | None = None
    crudl_type: str = "table"
    #: The renderer's grid layout: auto (renderer decides) | table | list | cards | masterDetail
    #: | tree (hierarchical rows carrying a self-referential children list — never auto-selected).
    grid_layout: str = "auto"
    # the smart search bar's filters, one FormField per filterable entity field (enums as
    # multi-selects, temporals as date ranges, RangeFilter numerics as min-max)
    filters: list["FormFieldMetadata"] = Field(default_factory=list)
    #: The GroupBy() column of the row class (camelCase field id): the listing groups its rows
    #: by it — implicit primary sort + a group subtotal row whenever the value changes. None
    #: when the row class declares no GroupBy() column (mirrors CrudlDto.groupBy).
    group_by: str | None = None
    #: @group_action buttons rendered on every group header row; each dispatches
    #: action-on-row-<actionId> with the group value in _groupValue (mirrors CrudlDto.groupActions).
    group_actions: list["Button"] = Field(default_factory=list)
    #: Row selection checkboxes on (a Deletable listing / a full crud); mirrors
    #: CrudlDto.rowsSelectionEnabled.
    rows_selection_enabled: bool = False
    #: Rows fetched CLIENT-SIDE from an arbitrary (non-Mateu) REST endpoint (@rest_listing): the
    #: renderer maps each JSON item into a row keyed by column id instead of dispatching the server
    #: search. None on server-backed listings (mirrors CrudlDto.rowsSource).
    rows_source: "RestDataSource | None" = None
    #: Rows can be dragged onto a DropZone accepting this type (@drag_rows); None = not draggable
    #: (mirrors CrudlDto.dragType).
    drag_type: str | None = None
    #: The RowStatus() field of the row class (camelCase field id): its value (success | warning
    #: | danger | info | neutral) tones the whole row. None = no row tones (mirrors
    #: CrudlDto.rowStatusField).
    row_status_field: str | None = None
    #: Shown in place of the results until the first search has run (the Redwood
    #: smart-filter-search ``dashboard`` slot); None = none (mirrors CrudlDto.preSearch).
    pre_search: "list[Component] | None" = None


class ComponentEntryRecord(Wire):
    """One business component on the wire (mirrors ``io.mateu.dtos.ComponentEntryDto``): its name
    and its RESOLVED composition, so a reference resolves with no backend."""

    name: str
    component: "Component | None" = None
