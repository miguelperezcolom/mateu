"""Flat helper records outside the polymorphic unions: options, grid columns, menu items, KPIs, actions, triggers."""

from __future__ import annotations

from typing import TYPE_CHECKING, Literal

from pydantic import Field

from .base import Wire
from .components import RuleRecord
from .fields import RestDataSource

if TYPE_CHECKING:
    from .envelope import UICommand


# ── Flat helper records (not part of the polymorphic unions) ────────────────────
class Button(Wire):
    label: str
    action_id: str
    type: str = "Button"
    disabled: bool = False
    button_style: str | None = None
    shortcut: str | None = None


class Option(Wire):
    value: str
    label: str
    # sub-options of a hierarchical option set (tree selects); empty on flat lists
    children: list["Option"] = Field(default_factory=list)


class GridColumnMeta(Wire):
    id: str
    label: str
    type: str = "GridColumn"
    #: The column's value type (string|integer|number|boolean|date|money) — drives the renderer's
    #: cell formatting. None on legacy crud columns.
    data_type: str | None = None
    stereotype: str | None = None
    #: Rich "primary" column (coherence-plan #6): the row field for the secondary caption line, and
    #: the one for the leading avatar/icon. Set only when stereotype == "primary".
    caption_path: str | None = None
    leading_path: str | None = None
    # Inline editing (class-level @inline_editing on the crud): the cell renders an in-place
    # editor (select|boolean|integer|number|date|datetime|text) and each commit dispatches the
    # crud's update-row action. editor_options carries a select editor's enum constants.
    editable: bool = False
    editor_type: str | None = None
    editor_options: list[Option] | None = None
    #: The Aggregate() function of the column — sum|avg|min|max|count — computed over the WHOLE
    #: filtered result set and shown in the listing's totals footer (and per group). None on
    #: non-aggregated columns (mirrors GridColumnDto.aggregate).
    aggregate: str | None = None
    #: Action dispatched when the cell is clicked — "view" on the first column of a
    #: Navigable/Editable listing makes its rows clickable (mirrors GridColumnDto.actionId).
    action_id: str | None = None
    #: The row field whose text the cell shows on hover (Tooltip("other_field") on the row field);
    #: None when the column declares none (mirrors GridColumnDto.tooltipPath).
    tooltip_path: str | None = None
    #: The column sizes to its content (header + widest cell) — true unless a width is fixed.
    auto_width: bool = False
    #: A fixed column width (e.g. "3rem"); None shares the remaining space.
    width: str | None = None
    #: flex-grow of the column ("0" for fixed/auto columns).
    flex_grow: str | None = None
    #: The text of a button-stereotype cell (e.g. a grid field's "Edit" column).
    text: str | None = None


class GridColumn(Wire):
    """A grid column travels as a client-side component whose metadata is the column (mirrors
    Java, where a column is a ClientSideComponentDto with GridColumnDto metadata)."""

    type: Literal["ClientSide"] = "ClientSide"
    metadata: GridColumnMeta
    id: str | None = None


class MenuItem(Wire):
    label: str
    route: str
    server_side_type: str
    consumed_route: str = ""
    #: The bare route relative to the mount (what the app declared, e.g. "/a"); ``route`` is the
    #: absolute route (mount + path). Mirrors MenuOptionDto.path.
    path: str = ""
    #: The mount base path this option lives under (mirrors MenuOptionDto.uriPrefix).
    uri_prefix: str = ""
    action_id: str | None = None
    separator: bool = False
    visible: bool = True
    submenus: list["MenuItem"] = Field(default_factory=list)
    #: Federated entry (@remote_menu): the frontend fetches the remote backend's menu from
    #: base_url and mounts its views under this option.
    remote: bool = False
    base_url: str | None = None
    #: Inline the remote entries at this level instead of nesting under label.
    explode: bool = False
    #: A rule leaf (mirrors MenuOptionDto.rules): a menu entry that RUNS client-side rules when
    #: clicked instead of navigating. Non-empty only for a Rule / list[Rule] menu entry; a route
    #: leaf leaves it empty.
    rules: list["RuleRecord"] = Field(default_factory=list)
    #: The entry's icon (e.g. "vaadin:calendar"), shown on its card (mirrors MenuOptionDto.icon).
    icon: str | None = None
    #: The entry's description — the text of a card (mirrors MenuOptionDto.description).
    description: str | None = None
    #: A GROUP that opens as a panel of cards ("cards") instead of the usual list (None). Its
    #: entries are the cards; each entry's own submenus are the card's actions (mirrors
    #: MenuOptionDto.display).
    display: str | None = None
    #: The image of an entry shown as a card (a URL or a data URI); None for none (mirrors
    #: MenuOptionDto.image).
    image: str | None = None


class Kpi(Wire):
    # The wire discriminator is "KPIDto" and the value member is "text" (mirrors Java's KPIDto).
    type: Literal["KPIDto"] = "KPIDto"
    title: str
    text: str
    icon: str | None = None
    color: str | None = None


class Fab(Wire):
    icon: str
    action_id: str
    label: str | None = None
    order: int = 0
    #: The button emphasis (Java's FabDto.buttonStyle, "primary" for a FAB).
    button_style: str = "primary"


class PeerNav(Wire):
    #: Lateral navigation across peer objects — the previous/next arrows in the page header (the
    #: Oracle Redwood "next/previous object" element). A None route on a side hides that arrow.
    prev_label: str | None = None
    prev_route: str | None = None
    next_label: str | None = None
    next_route: str | None = None


class Banner(Wire):
    theme: str
    title: str | None = None
    description: str | None = None
    has_icon: bool = True
    has_close_button: bool = False
    timeout_seconds: int = 0


class Badge(Wire):
    text: str
    color: str
    primary: bool = False
    small: bool = False
    pill: bool = True


class Action(Wire):
    id: str
    validation_required: bool = True
    # Field names mirror io.mateu.dtos.ActionDto: the frontend blocks a rows_selected_required
    # action while the grid selection is empty, and bubble lets the event reach the enclosing
    # crud component.
    confirmation_required: bool = False
    rows_selected_required: bool = False
    bubble: bool = False
    #: Comma-separated ids of the fields to validate before the action runs (a list field's
    #: row editor validates the row's constrained fields; mirrors ActionDto.fieldsToValidate).
    fields_to_validate: str | None = None
    # Client-side request ceiling in ms; 0 keeps the client default (60s). One global timeout
    # cannot serve both a type-ahead lookup and a report export.
    timeout_millis: int = 0
    # Declares that re-sending this action cannot apply the same change twice, so the client may
    # retry it by itself after a transient failure. Only for reads or naturally idempotent
    # writes: after a timeout the client cannot know whether the server processed the request.
    idempotent: bool = False
    #: Makes this action call an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE instead of
    #: dispatching to the Mateu server (@rest_action); None for normal actions (mirrors
    #: io.mateu.dtos.ActionDto.restAction).
    rest_action: "RestAction | None" = None
    #: A declared client-side flow lowered to the wire commands the client applies with no server
    #: round trip (an action-catalogue entry's steps); None for a normal server-dispatched action
    #: (mirrors io.mateu.dtos.ActionDto.commands).
    commands: "list[UICommand] | None" = None


class RestAction(Wire):
    """Descriptor for a button that calls an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE
    (mirrors ``io.mateu.dtos.RestActionDto``): the renderer fetches ``source`` directly, shows
    ``success_message`` as a toast on a 2xx response and — when ``result_path`` is set — merges the
    object at that path in the JSON response into the form state."""

    source: "RestDataSource"
    success_message: str | None = None
    result_path: str | None = None


class Trigger(Wire):
    type: str
    action_id: str


class CustomTrigger(Wire):
    event: str
    action_id: str
    type: str = "OnCustomEvent"
