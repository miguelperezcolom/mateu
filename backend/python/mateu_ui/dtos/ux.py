"""High-level UX components: Kanban, Timeline, Stat, Calendar, PricingTable, OrgChart, Heatmap, Funnel, ..."""

from __future__ import annotations

from typing import Literal

from pydantic import Field

from .base import Wire


class KanbanCardRecord(Wire):
    """One kanban card; ``action_id`` — when set — makes the card clickable."""

    id: str | None = None
    title: str | None = None
    description: str | None = None
    badge: str | None = None
    color: str | None = None
    action_id: str | None = None


class KanbanColumnRecord(Wire):
    """One kanban column with its cards (mirrors ``KanbanColumnDto``)."""

    id: str | None = None
    title: str | None = None
    color: str | None = None
    cards: list[KanbanCardRecord] = Field(default_factory=list)


class KanbanMetadata(Wire):
    """Kanban board metadata: columns of cards (mirrors ``KanbanDto``)."""

    type: Literal["Kanban"] = "Kanban"
    columns: list[KanbanColumnRecord] = Field(default_factory=list)


class TimelineItemRecord(Wire):
    """One timeline entry; ``action_id`` — when set — makes it clickable."""

    id: str | None = None
    title: str | None = None
    description: str | None = None
    timestamp: str | None = None
    icon: str | None = None
    color: str | None = None
    action_id: str | None = None


class TimelineMetadata(Wire):
    """Timeline / activity-feed metadata (mirrors ``TimelineDto``)."""

    type: Literal["Timeline"] = "Timeline"
    items: list[TimelineItemRecord] = Field(default_factory=list)


class StepRecord(Wire):
    """One progress step; ``status`` is done|current|upcoming (mirrors ``StepDto``)."""

    id: str | None = None
    title: str | None = None
    description: str | None = None
    status: str | None = None


class ProgressStepsMetadata(Wire):
    """Progress-indicator metadata (mirrors ``ProgressStepsDto``): a horizontal row by default,
    a stacked column when ``vertical`` (the wizard RAIL mode)."""

    type: Literal["ProgressSteps"] = "ProgressSteps"
    steps: list[StepRecord] = Field(default_factory=list)
    vertical: bool = False


class StatMetadata(Wire):
    """KPI stat metadata: value/unit, delta, trend and a sparkline (mirrors ``StatDto``)."""

    type: Literal["Stat"] = "Stat"
    label: str | None = None
    value: str | None = None
    unit: str | None = None
    delta: str | None = None
    trend: str | None = None
    spark: list[float] = Field(default_factory=list)
    action_id: str | None = None


class CalendarEventRecord(Wire):
    """One calendar event (mirrors ``CalendarEventDto``); ``date``/``end_date`` are ISO-8601,
    ``start_time``/``end_time`` "HH:mm"; ``action_id`` makes the chip clickable."""

    id: str | None = None
    title: str | None = None
    date: str | None = None
    end_date: str | None = None
    start_time: str | None = None
    end_time: str | None = None
    color: str | None = None
    action_id: str | None = None


class CalendarDayRecord(Wire):
    """One date's cell of a calendar (mirrors ``CalendarDayDto``): ISO date, label and tone."""

    date: str | None = None
    label: str | None = None
    tone: str | None = None


class CalendarMetadata(Wire):
    """Calendar metadata (mirrors ``CalendarDto``); dates are ISO-8601. ``view`` is
    month|week|day|list (default month), ``views`` the switchable ones, ``days`` the per-date
    cells and ``day_action_id`` makes those cells clickable."""

    type: Literal["Calendar"] = "Calendar"
    month: str | None = None
    events: list[CalendarEventRecord] = Field(default_factory=list)
    view: str = "month"
    views: list[str] = Field(default_factory=list)
    days: list[CalendarDayRecord] = Field(default_factory=list)
    day_action_id: str | None = None


class PricingPlanRecord(Wire):
    """One pricing plan; ``featured`` marks the recommended one (mirrors ``PricingPlanDto``)."""

    id: str | None = None
    name: str | None = None
    price: str | None = None
    period: str | None = None
    featured: bool = False
    features: list[str] = Field(default_factory=list)
    cta_label: str | None = None
    action_id: str | None = None


class PricingTableMetadata(Wire):
    """Pricing-table metadata: plan cards (mirrors ``PricingTableDto``)."""

    type: Literal["PricingTable"] = "PricingTable"
    plans: list[PricingPlanRecord] = Field(default_factory=list)


class OrgNodeRecord(Wire):
    """One org-chart node; ``children`` nest recursively (mirrors ``OrgNodeDto``)."""

    id: str | None = None
    title: str | None = None
    subtitle: str | None = None
    avatar: str | None = None
    color: str | None = None
    action_id: str | None = None
    children: list["OrgNodeRecord"] = Field(default_factory=list)


class OrgChartMetadata(Wire):
    """Org-chart metadata: a root node with recursive children (mirrors ``OrgChartDto``)."""

    type: Literal["OrgChart"] = "OrgChart"
    root: OrgNodeRecord | None = None


class HeatCellRecord(Wire):
    """One heatmap cell; ``date`` is ISO-8601; ``value`` drives color intensity."""

    date: str | None = None
    value: float = 0
    label: str | None = None


class HeatmapMetadata(Wire):
    """Calendar-heatmap metadata: one cell per day (mirrors ``HeatmapDto``)."""

    type: Literal["Heatmap"] = "Heatmap"
    cells: list[HeatCellRecord] = Field(default_factory=list)


class FunnelStageRecord(Wire):
    """One funnel stage (mirrors ``FunnelStageDto``)."""

    label: str | None = None
    value: float = 0
    color: str | None = None


class FunnelMetadata(Wire):
    """Conversion-funnel metadata: ordered stages (mirrors ``FunnelDto``)."""

    type: Literal["Funnel"] = "Funnel"
    stages: list[FunnelStageRecord] = Field(default_factory=list)


class TrendChartMetadata(Wire):
    """Lightweight line/area-chart metadata: a single series (mirrors ``TrendChartDto``)."""

    type: Literal["TrendChart"] = "TrendChart"
    title: str | None = None
    values: list[float] = Field(default_factory=list)
    labels: list[str] = Field(default_factory=list)
    color: str | None = None
    area: bool = False


class FeatureRecord(Wire):
    """One feature card (mirrors ``FeatureDto``)."""

    icon: str | None = None
    title: str | None = None
    description: str | None = None
    action_id: str | None = None


class FeatureGridMetadata(Wire):
    """Feature-grid metadata: cards of icon + title + description (mirrors ``FeatureGridDto``)."""

    type: Literal["FeatureGrid"] = "FeatureGrid"
    features: list[FeatureRecord] = Field(default_factory=list)
    columns: int = 0


class TestimonialRecord(Wire):
    """One testimonial card; ``rating`` is 0–5 stars (mirrors ``TestimonialDto``)."""

    quote: str | None = None
    author: str | None = None
    role: str | None = None
    avatar: str | None = None
    rating: int = 0


class TestimonialsMetadata(Wire):
    """Testimonials metadata: quote cards (mirrors ``TestimonialsDto``)."""

    type: Literal["Testimonials"] = "Testimonials"
    items: list[TestimonialRecord] = Field(default_factory=list)


class FaqItemRecord(Wire):
    """One FAQ row; ``open`` makes it start expanded (mirrors ``FaqItemDto``)."""

    question: str | None = None
    answer: str | None = None
    open: bool = False


class FaqMetadata(Wire):
    """FAQ metadata: collapsible question/answer rows (mirrors ``FaqDto``)."""

    type: Literal["Faq"] = "Faq"
    items: list[FaqItemRecord] = Field(default_factory=list)


class CalloutCardMetadata(Wire):
    """Callout-card metadata: a themed call-to-action block (mirrors ``CalloutCardDto``)."""

    type: Literal["CalloutCard"] = "CalloutCard"
    title: str | None = None
    description: str | None = None
    icon: str | None = None
    cta_label: str | None = None
    action_id: str | None = None
    theme: str | None = None


class CommentRecord(Wire):
    """One comment; ``replies`` nest recursively (mirrors ``CommentDto``)."""

    id: str | None = None
    author: str | None = None
    avatar: str | None = None
    text: str | None = None
    timestamp: str | None = None
    replies: list["CommentRecord"] = Field(default_factory=list)


class CommentThreadMetadata(Wire):
    """Comment-thread metadata: comments with recursive replies (mirrors ``CommentThreadDto``)."""

    type: Literal["CommentThread"] = "CommentThread"
    comments: list[CommentRecord] = Field(default_factory=list)


class FileItemRecord(Wire):
    """One file entry (mirrors ``FileItemDto``)."""

    name: str | None = None
    size: str | None = None
    type: str | None = None
    url: str | None = None
    action_id: str | None = None


class FileListMetadata(Wire):
    """File-list metadata: attached files (mirrors ``FileListDto``)."""

    type: Literal["FileList"] = "FileList"
    files: list[FileItemRecord] = Field(default_factory=list)


class ChecklistItemRecord(Wire):
    """One checklist item (mirrors ``ChecklistItemDto``)."""

    id: str | None = None
    label: str | None = None
    done: bool = False
    action_id: str | None = None


class ChecklistMetadata(Wire):
    """Checklist metadata with a progress bar (mirrors ``ChecklistDto``)."""

    type: Literal["Checklist"] = "Checklist"
    title: str | None = None
    items: list[ChecklistItemRecord] = Field(default_factory=list)


class ComparisonCardMetadata(Wire):
    """Two-value comparison metadata (mirrors ``ComparisonCardDto``)."""

    type: Literal["ComparisonCard"] = "ComparisonCard"
    title: str | None = None
    left_label: str | None = None
    left_value: str | None = None
    right_label: str | None = None
    right_value: str | None = None
    delta: str | None = None
    trend: str | None = None
