"""Dashboards, responsive grids, foldouts, hero/empty/skeleton, Gantt and the planning board."""

from __future__ import annotations

from typing import Literal

from pydantic import Field

from .base import Wire


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


class ResponsiveGridMetadata(Wire):
    """One responsive grid — THE general layout foundation (coherence-plan #9). Carries the resolved
    CSS grid-template-columns (from the tracks' hug/fixed/fill intent) and the gap; children travel
    as the component's children."""

    type: Literal["ResponsiveGrid"] = "ResponsiveGrid"
    grid_template_columns: str | None = None
    gap: str | None = None
    col_spans: list[int] | None = None
    stack_below: str | None = None
    grid_template_areas: str | None = None
    sticky_areas: list[str] | None = None
    reorderable: bool = False


class FoldoutPanelInfo(Wire):
    """Header info for one foldout panel (mirrors ``FoldoutPanelInfoDto``)."""

    title: str | None = None
    subtitle: str | None = None
    icon: str | None = None
    open: bool = True
    #: Optional CSS length for the expanded panel (e.g. "40rem"); None = renderer default.
    width: str | None = None


class FoldoutNavigation(Wire):
    """Navigation Header of a foldout: prev/next between objects of the same type + go-to-parent.
    A null/blank actionId hides the corresponding control."""

    title: str | None = None
    parent_label: str | None = None
    parent_action_id: str | None = None
    previous_action_id: str | None = None
    next_action_id: str | None = None


class FoldoutLayoutMetadata(Wire):
    """Redwood-style foldout. Overview travels as the child slotted ``overview``; each panel's
    content as the child slotted ``panel-N`` matching the panels list order."""

    type: Literal["FoldoutLayout"] = "FoldoutLayout"
    panels: list[FoldoutPanelInfo] = Field(default_factory=list)
    #: Big heading of the optional header band above the columns (RDS "overview title").
    header_title: str | None = None
    #: Label/Value chips under the header title (flattened to text on the wire).
    badges: list[str] = Field(default_factory=list)
    #: Overview orientation: "vertical" (left) or "horizontal" (top).
    orientation: str = "vertical"
    #: Navigation Header (prev/next + go-to-parent); None hides the bar.
    navigation: "FoldoutNavigation | None" = None
    #: ActionId dispatched by the overview's Edit affordance; None = no Edit button.
    overview_edit_action_id: str | None = None


class ContentLayoutMetadata(Wire):
    """Redwood-style content page layout. The regions travel as slotted children: the primary region
    as ``main-N``, the contextual secondary region as ``aside-N``, and the full-width footer as
    ``footer-N`` (each matching the source list order)."""

    type: Literal["ContentLayout"] = "ContentLayout"
    #: Which side the aside sits on: "start" or "end".
    aside_position: str = "end"
    aside_width: str | None = None
    aside_sticky: bool = False


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
    #: When set, clicking a bar dispatches this action with the clicked task id as _clickedTaskId.
    on_task_selection_action_id: str | None = None


class PlanningResourceRecord(Wire):
    """One planning board row; ``group`` is an optional swimlane caption (mirrors
    ``PlanningResourceDto``)."""

    id: str | None = None
    label: str | None = None
    group: str | None = None
    attributes: list[str] = Field(default_factory=list)
    icon: str | None = None


class PlanningBlockRecord(Wire):
    """One planning board block; start/end are ISO-8601 dates, inclusive (mirrors
    ``PlanningBlockDto``)."""

    id: str | None = None
    resource_id: str | None = None
    start: str | None = None
    end: str | None = None
    label: str | None = None
    color: str | None = None
    status: str | None = None
    #: icon before the label and the hover text (lines separated by \n)
    icon: str | None = None
    summary: str | None = None


class PlanningBoardMetadata(Wire):
    """Planning board / tape chart metadata (mirrors ``PlanningBoardDto``); from/to are ISO-8601
    dates. ``from_`` serializes as ``from`` (reserved word)."""

    type: Literal["PlanningBoard"] = "PlanningBoard"
    resources: list[PlanningResourceRecord] = Field(default_factory=list)
    blocks: list[PlanningBlockRecord] = Field(default_factory=list)
    from_: str | None = Field(default=None, alias="from")
    to: str | None = None
    move_action_id: str | None = None
    select_action_id: str | None = None
    attribute_columns: list[str] = Field(default_factory=list)
    resize_action_id: str | None = None
    open_action_id: str | None = None
    range_select_action_id: str | None = None
