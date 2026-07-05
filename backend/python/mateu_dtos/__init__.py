"""The Mateu wire model in Pydantic — a 1:1 mirror of ``io.mateu.dtos`` (and of the C# ``Mateu.Dtos``).

Serialized to the exact same JSON the renderers consume: camelCase property names, nulls kept,
polymorphic ``type`` discriminators on the component tree and the metadata tree.
"""

from __future__ import annotations

from typing import Annotated, Any, Literal, Union

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class Wire(BaseModel):
    """Base for every wire model: camelCase aliases, populate by field name too, keep nulls."""

    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)


# ── Component metadata (discriminated on "type") ───────────────────────────────
class AppMetadata(Wire):
    type: Literal["App"] = "App"
    title: str
    variant: str
    menu: list["MenuItem"] = Field(default_factory=list)
    layout: str = "SINGLE_SLOT"
    home_route: str = ""
    home_consumed_route: str = ""
    home_server_side_type: str = ""
    server_side_type: str = ""
    root_route: str = ""
    subtitle: str | None = None
    login_url: str | None = None
    logout_url: str | None = None


class PageMetadata(Wire):
    type: Literal["Page"] = "Page"
    title: str | None = None
    page_title: str | None = None
    subtitle: str | None = None
    toolbar: list["Button"] = Field(default_factory=list)
    buttons: list["Button"] = Field(default_factory=list)
    level: int = 0
    read_only: bool = False
    actions: Any | None = None
    badges: list["Badge"] = Field(default_factory=list)
    kpis: list["Kpi"] = Field(default_factory=list)
    banners: list["Banner"] = Field(default_factory=list)
    fabs: list["Fab"] = Field(default_factory=list)


class CardMetadata(Wire):
    type: Literal["Card"] = "Card"
    content: "Component"
    title: str | None = None
    variants: list[str] = Field(default_factory=lambda: ["outlined"])


class DivMetadata(Wire):
    type: Literal["Div"] = "Div"
    content: Any | None = None


class VerticalLayoutMetadata(Wire):
    type: Literal["VerticalLayout"] = "VerticalLayout"
    spacing: bool = False


class HorizontalLayoutMetadata(Wire):
    type: Literal["HorizontalLayout"] = "HorizontalLayout"
    spacing: bool = True


class FormLayoutMetadata(Wire):
    type: Literal["FormLayout"] = "FormLayout"
    max_columns: int = 2
    auto_responsive: bool = True


class FormRowMetadata(Wire):
    type: Literal["FormRow"] = "FormRow"


class FormSectionMetadata(Wire):
    type: Literal["FormSection"] = "FormSection"
    title: str


class FormFieldMetadata(Wire):
    type: Literal["FormField"] = "FormField"
    field_id: str
    data_type: str
    label: str
    stereotype: str = "regular"
    required: bool = False
    read_only: bool = False
    colspan: int = 1
    initial_value: Any | None = None
    options: list["Option"] = Field(default_factory=list)
    multiline: bool = False
    #: Navigation link rendered as an icon at the right side of this field; None = no link.
    link: "NavLinkRecord | None" = None


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


class ProgressBarMetadata(Wire):
    type: Literal["ProgressBar"] = "ProgressBar"
    value: float
    min: float = 0
    max: float = 1


class TextMetadata(Wire):
    type: Literal["Text"] = "Text"
    text: str


class ButtonMetadata(Wire):
    type: Literal["Button"] = "Button"
    label: str
    action_id: str
    disabled: bool = False
    button_style: str | None = None


class TabLayoutMetadata(Wire):
    type: Literal["TabLayout"] = "TabLayout"


class TabMetadata(Wire):
    type: Literal["Tab"] = "Tab"
    label: str
    active: bool = False
    shortcut: str | None = None


class MetricCardMetadata(Wire):
    """KPI tile metadata for dashboards (mirrors ``MetricCardDto``)."""

    type: Literal["MetricCard"] = "MetricCard"
    title: str | None = None
    value: str | None = None
    unit: str | None = None
    trend: str | None = None  # "up" | "down" | "neutral"
    trend_label: str | None = None
    icon: str | None = None
    description: str | None = None
    action_id: str | None = None


class ScoreboardMetadata(Wire):
    """Horizontal band of metric cards; the metric cards travel as component children."""

    type: Literal["Scoreboard"] = "Scoreboard"


class DashboardPanelMetadata(Wire):
    """Titled dashboard tile; the wrapped component travels as the component's single child."""

    type: Literal["DashboardPanel"] = "DashboardPanel"
    title: str | None = None
    subtitle: str | None = None
    col_span: int = 1
    row_span: int = 1


class DashboardLayoutMetadata(Wire):
    """Responsive dashboard grid; tiles travel as component children. 0 columns = auto-fit."""

    type: Literal["DashboardLayout"] = "DashboardLayout"
    columns: int = 0


class FoldoutPanelInfo(Wire):
    """Header info for one foldout panel (mirrors ``FoldoutPanelInfoDto``)."""

    title: str | None = None
    subtitle: str | None = None
    icon: str | None = None
    open: bool = True


class FoldoutLayoutMetadata(Wire):
    """Redwood-style foldout. Overview travels as the child slotted ``overview``; each panel's
    content as the child slotted ``panel-N`` matching the panels list order."""

    type: Literal["FoldoutLayout"] = "FoldoutLayout"
    panels: list[FoldoutPanelInfo] = Field(default_factory=list)


class HeroSectionMetadata(Wire):
    """Page hero header; slotted content travels as component children."""

    type: Literal["HeroSection"] = "HeroSection"
    title: str | None = None
    subtitle: str | None = None
    image: str | None = None
    height: str | None = None
    centered: bool = False


class EmptyStateMetadata(Wire):
    """Friendly empty-state placeholder (mirrors ``EmptyStateDto``)."""

    type: Literal["EmptyState"] = "EmptyState"
    icon: str | None = None
    title: str | None = None
    description: str | None = None
    action_id: str | None = None
    action_label: str | None = None


class SkeletonMetadata(Wire):
    """Shimmering loading placeholder (mirrors ``SkeletonDto``)."""

    type: Literal["Skeleton"] = "Skeleton"
    variant: str = "text"  # "text" | "card" | "grid" | "form"
    count: int = 0


class GanttTaskRecord(Wire):
    """One Gantt bar; start/end are ISO-8601 dates (mirrors ``GanttTaskDto``)."""

    id: str | None = None
    title: str | None = None
    start: str | None = None
    end: str | None = None
    progress: float = 0
    color: str | None = None


class GanttMetadata(Wire):
    """Gantt/timeline chart metadata (mirrors ``GanttDto``)."""

    type: Literal["Gantt"] = "Gantt"
    tasks: list[GanttTaskRecord] = Field(default_factory=list)


ComponentMetadata = Annotated[
    Union[
        AppMetadata,
        PageMetadata,
        CardMetadata,
        DivMetadata,
        VerticalLayoutMetadata,
        HorizontalLayoutMetadata,
        FormLayoutMetadata,
        FormRowMetadata,
        FormSectionMetadata,
        FormFieldMetadata,
        CrudMetadata,
        ProgressBarMetadata,
        TextMetadata,
        ButtonMetadata,
        TabLayoutMetadata,
        TabMetadata,
        MetricCardMetadata,
        ScoreboardMetadata,
        DashboardPanelMetadata,
        DashboardLayoutMetadata,
        FoldoutLayoutMetadata,
        HeroSectionMetadata,
        EmptyStateMetadata,
        SkeletonMetadata,
        GanttMetadata,
    ],
    Field(discriminator="type"),
]


# ── Component tree (discriminated on "type") ───────────────────────────────────
class ClientSideComponent(Wire):
    type: Literal["ClientSide"] = "ClientSide"
    metadata: ComponentMetadata
    id: str | None = None
    children: list["Component"] = Field(default_factory=list)
    style: str | None = None
    css_classes: str | None = None
    slot: str | None = None


class ServerSideComponent(Wire):
    type: Literal["ServerSide"] = "ServerSide"
    id: str
    server_side_type: str
    route: str
    children: list["Component"] = Field(default_factory=list)
    initial_data: Any = Field(default_factory=dict)
    actions: list["Action"] = Field(default_factory=list)
    triggers: list[Any] = Field(default_factory=list)
    style: str | None = None
    css_classes: str | None = None
    slot: str | None = None
    emits_name: str | None = None
    confirm_on_navigation_if_dirty: bool = False


Component = Annotated[
    Union[ClientSideComponent, ServerSideComponent], Field(discriminator="type")
]


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


class GridColumnMeta(Wire):
    id: str
    label: str
    type: str = "GridColumn"


class GridColumn(Wire):
    metadata: GridColumnMeta


class MenuItem(Wire):
    label: str
    route: str
    server_side_type: str
    consumed_route: str = ""
    action_id: str | None = None
    separator: bool = False
    visible: bool = True
    submenus: list["MenuItem"] = Field(default_factory=list)


class Kpi(Wire):
    title: str
    value: str
    icon: str | None = None
    color: str | None = None


class Fab(Wire):
    icon: str
    action_id: str
    label: str | None = None
    order: int = 0


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


class Trigger(Wire):
    type: str
    action_id: str


class CustomTrigger(Wire):
    event: str
    action_id: str
    type: str = "OnCustomEvent"


# ── Top-level envelope ─────────────────────────────────────────────────────────
class UICommand(Wire):
    target_component_id: str
    type: str
    data: Any | None = None


class Message(Wire):
    variant: str
    position: str
    title: str
    text: str
    duration: int


class UIFragment(Wire):
    target_component_id: str
    component: Component | None = None
    state: Any | None = None
    data: Any | None = None
    action: str
    container_id: str | None = None


class UIIncrement(Wire):
    commands: list[UICommand] = Field(default_factory=list)
    messages: list[Message] = Field(default_factory=list)
    fragments: list[UIFragment] = Field(default_factory=list)
    banners: list[Any] = Field(default_factory=list)
    append_banners: bool = False
    app_data: Any | None = None
    app_state: Any | None = None

    @staticmethod
    def of(commands=None, messages=None, fragments=None) -> "UIIncrement":
        return UIIncrement(
            commands=commands or [],
            messages=messages or [],
            fragments=fragments or [],
        )


# Resolve the forward references / recursive models.
for _m in (
    AppMetadata,
    PageMetadata,
    CardMetadata,
    ClientSideComponent,
    ServerSideComponent,
    UIFragment,
):
    _m.model_rebuild()
