"""Fluent UIDL components — the Python mirror of the ``io.mateu.uidl.data`` records.

Build them directly (e.g. from a ``ComponentTreeSupplier.component()``) or let the declarative
archetypes (``Dashboard``, ``Foldout``, ``ItemOverview``, ``Welcome``) compose them from your
component-holding fields. The reflection mapper serializes them to the exact same wire JSON the
Java backend emits.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from enum import Enum


class Component:
    """Marker base for every fluent component."""


class MetricTrend(Enum):
    up = "up"
    down = "down"
    neutral = "neutral"


class SkeletonVariant(Enum):
    text = "text"
    card = "card"
    grid = "grid"
    form = "form"


@dataclass(frozen=True)
class Text(Component):
    """A simple text block. ``size``: "xl" | "l" | "m" | "s" | "xs" — m (or None) applies
    nothing, the rest enlarge/reduce the font. ``no_margins`` drops the container's block
    margins, independent of ``size``."""

    text: str = ""
    size: str | None = None
    no_margins: bool = False
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class Separator(Component):
    """A horizontal divider line (``<hr>``) separating contents inside a section, form or
    layout. Declaratively, mark a field with ``SeparatorBefore()`` to paint one above it."""

    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class Anchor(Component):
    """A hyperlink. ``target`` "_blank" opens in a new tab (the renderer adds rel=noopener).
    The Python analogue of Java's ``Anchor``."""

    text: str = ""
    url: str = ""
    target: str | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class Button(Component):
    """A fluent button; ``action_id`` runs the matching action method. ``parameters`` are extra
    entries merged into the dispatched action request (e.g. the optimistic-lock conflict
    dialog's ``_forceOverwrite``)."""

    label: str = ""
    action_id: str = ""
    disabled: bool = False
    button_style: str | None = None
    parameters: dict | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class MetricCard(Component):
    """A KPI tile: title, prominent value, optional trend and drill-in action.

    Use inside a :class:`Scoreboard` or a :class:`DashboardLayout`."""

    title: str | None = None
    value: str | None = None
    unit: str | None = None
    trend: MetricTrend | None = None
    trend_label: str | None = None
    icon: str | None = None
    description: str | None = None
    action_id: str | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class Scoreboard(Component):
    """A horizontal band of :class:`MetricCard` s, typically at the top of a dashboard."""

    metrics: tuple[MetricCard, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "metrics", tuple(self.metrics))


@dataclass(frozen=True)
class DashboardPanel(Component):
    """A titled tile inside a :class:`DashboardLayout`; wraps any component and can span
    several grid columns/rows."""

    title: str | None = None
    subtitle: str | None = None
    content: Component | None = None
    col_span: int = 1
    row_span: int = 1
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class DashboardLayout(Component):
    """A responsive grid of dashboard tiles. ``columns=0`` lets the renderer auto-fit."""

    items: tuple[Component, ...] = ()
    columns: int = 0
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "items", tuple(self.items))


@dataclass(frozen=True)
class FoldoutPanel(Component):
    """One lateral panel of a :class:`FoldoutLayout`; ``open`` controls the initial state."""

    title: str | None = None
    subtitle: str | None = None
    icon: str | None = None
    open: bool = True
    content: Component | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class FoldoutLayout(Component):
    """Redwood-style foldout: a fixed overview panel plus lateral fold-out panels."""

    overview: Component | None = None
    panels: tuple[FoldoutPanel, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "panels", tuple(self.panels))


@dataclass(frozen=True)
class HeroSection(Component):
    """A prominent page hero: big title/subtitle, optional background image, slotted content."""

    title: str | None = None
    subtitle: str | None = None
    image: str | None = None
    height: str | None = None
    centered: bool = False
    content: tuple[Component, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "content", tuple(self.content))


@dataclass(frozen=True)
class EmptyState(Component):
    """A friendly "nothing here yet" placeholder with an optional call-to-action."""

    icon: str | None = None
    title: str | None = None
    description: str | None = None
    action_id: str | None = None
    action_label: str | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class Skeleton(Component):
    """A shimmering loading placeholder; ``count`` repeats the shape."""

    variant: SkeletonVariant = SkeletonVariant.text
    count: int = 0
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class GanttTask:
    """One bar of a :class:`Gantt`: a task with a date span, optional progress and color."""

    id: str | None = None
    title: str | None = None
    start: date | None = None
    end: date | None = None
    progress: float = 0
    color: str | None = None


@dataclass(frozen=True)
class Gantt(Component):
    """A Gantt/timeline chart: one row per :class:`GanttTask`. Read-only by design."""

    tasks: tuple[GanttTask, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "tasks", tuple(self.tasks))


@dataclass(frozen=True)
class PlanningResource:
    """One row of a :class:`PlanningBoard`: a bookable/assignable resource (room, vehicle,
    employee). ``group`` is an optional swimlane caption — consecutive resources sharing the
    same group render under one caption."""

    id: str | None = None
    label: str | None = None
    group: str | None = None


@dataclass(frozen=True)
class PlanningBlock:
    """One block of a :class:`PlanningBoard`: a booking/assignment spanning ``start`` to ``end``
    (inclusive) on the resource identified by ``resource_id``, with an optional color and status
    caption (shown in the tooltip)."""

    id: str | None = None
    resource_id: str | None = None
    start: date | None = None
    end: date | None = None
    label: str | None = None
    color: str | None = None
    status: str | None = None


@dataclass(frozen=True)
class PlanningBoard(Component):
    """A planning board / tape chart: one row per :class:`PlanningResource`, one column per day
    between ``from_`` and ``to``, and colored :class:`PlanningBlock` s spanning their date ranges
    on their resource's row — the rooms × days grid every hotel/rental/staffing back-office
    needs. ``select_action_id`` runs on block click (``parameters._blockId``);
    ``move_action_id`` runs on drag-drop (``_blockId``, ``_resourceId``, ``_start``, ``_end``)."""

    resources: tuple[PlanningResource, ...] = ()
    blocks: tuple[PlanningBlock, ...] = ()
    from_: date | None = None
    to: date | None = None
    move_action_id: str | None = None
    select_action_id: str | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "resources", tuple(self.resources))
        object.__setattr__(self, "blocks", tuple(self.blocks))


@dataclass(frozen=True)
class KanbanCard:
    """One card on a :class:`KanbanColumn`. An ``action_id`` makes the card clickable."""

    id: str | None = None
    title: str | None = None
    description: str | None = None
    badge: str | None = None
    color: str | None = None
    action_id: str | None = None


@dataclass(frozen=True)
class KanbanColumn:
    """One column of a :class:`Kanban` board: a title, an accent color and its cards."""

    id: str | None = None
    title: str | None = None
    color: str | None = None
    cards: tuple[KanbanCard, ...] = ()

    def __post_init__(self):
        object.__setattr__(self, "cards", tuple(self.cards))


@dataclass(frozen=True)
class Kanban(Component):
    """A read-only kanban board: columns of cards. Cards may carry an ``action_id``."""

    columns: tuple[KanbanColumn, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "columns", tuple(self.columns))


@dataclass(frozen=True)
class TimelineItem:
    """One entry on a :class:`Timeline`. ``timestamp`` is a free-form label; ``action_id`` makes
    the entry clickable."""

    id: str | None = None
    title: str | None = None
    description: str | None = None
    timestamp: str | None = None
    icon: str | None = None
    color: str | None = None
    action_id: str | None = None


@dataclass(frozen=True)
class Timeline(Component):
    """A read-only vertical timeline / activity feed: a chronological list of entries."""

    items: tuple[TimelineItem, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "items", tuple(self.items))


@dataclass(frozen=True)
class Step:
    """One step of a :class:`ProgressSteps`. ``status`` is done|current|upcoming."""

    id: str | None = None
    title: str | None = None
    description: str | None = None
    status: str | None = None


@dataclass(frozen=True)
class ProgressSteps(Component):
    """A read-only progress indicator: numbered steps joined by a connector — a horizontal row
    by default, a stacked column when ``vertical`` (the wizard RAIL mode)."""

    steps: tuple[Step, ...] = ()
    vertical: bool = False
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "steps", tuple(self.steps))


@dataclass(frozen=True)
class Stat(Component):
    """A compact KPI stat: value + unit, a delta with a trend (up|down|flat) and an inline
    sparkline drawn from ``spark``. An ``action_id`` makes the tile clickable."""

    label: str | None = None
    value: str | None = None
    unit: str | None = None
    delta: str | None = None
    trend: str | None = None
    spark: tuple[float, ...] = ()
    action_id: str | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "spark", tuple(self.spark))


@dataclass(frozen=True)
class CalendarEvent:
    """One event on a :class:`Calendar`: a title on a ``date``, optional color and ``action_id``."""

    id: str | None = None
    title: str | None = None
    date: date | None = None
    color: str | None = None
    action_id: str | None = None


@dataclass(frozen=True)
class Calendar(Component):
    """A read-only month-grid calendar with events. ``month`` is any day in the month to show."""

    month: date | None = None
    events: tuple[CalendarEvent, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "events", tuple(self.events))


@dataclass(frozen=True)
class PricingPlan:
    """One plan of a :class:`PricingTable`: name, price + period, features and a CTA. ``featured``
    marks the recommended plan."""

    id: str | None = None
    name: str | None = None
    price: str | None = None
    period: str | None = None
    featured: bool = False
    features: tuple[str, ...] = ()
    cta_label: str | None = None
    action_id: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "features", tuple(self.features))


@dataclass(frozen=True)
class PricingTable(Component):
    """A pricing / plan-comparison table: plan cards side by side, one optionally featured."""

    plans: tuple[PricingPlan, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "plans", tuple(self.plans))


@dataclass(frozen=True)
class OrgNode:
    """One node of an :class:`OrgChart`: a title, subtitle, avatar and its children."""

    id: str | None = None
    title: str | None = None
    subtitle: str | None = None
    avatar: str | None = None
    color: str | None = None
    action_id: str | None = None
    children: tuple["OrgNode", ...] = ()

    def __post_init__(self):
        object.__setattr__(self, "children", tuple(self.children))


@dataclass(frozen=True)
class OrgChart(Component):
    """A read-only top-down hierarchy chart: a root node whose children fan out below it."""

    root: OrgNode | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class HeatCell:
    """One cell of a :class:`Heatmap`: a ``date`` and its ``value`` (drives color intensity)."""

    date: date | None = None
    value: float = 0
    label: str | None = None


@dataclass(frozen=True)
class Heatmap(Component):
    """A read-only calendar heatmap (GitHub-contributions style): one square per day."""

    cells: tuple[HeatCell, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "cells", tuple(self.cells))


@dataclass(frozen=True)
class FunnelStage:
    """One stage of a :class:`Funnel`: a label, value and optional bar color."""

    label: str | None = None
    value: float = 0
    color: str | None = None


@dataclass(frozen=True)
class Funnel(Component):
    """A read-only conversion funnel: stacked bars, each narrower than the last."""

    stages: tuple[FunnelStage, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "stages", tuple(self.stages))


@dataclass(frozen=True)
class TrendChart(Component):
    """A read-only lightweight line/area chart: a single series drawn as an SVG line."""

    title: str | None = None
    values: tuple[float, ...] = ()
    labels: tuple[str, ...] = ()
    color: str | None = None
    area: bool = False
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "values", tuple(self.values))
        object.__setattr__(self, "labels", tuple(self.labels))


@dataclass(frozen=True)
class Feature:
    """One cell of a :class:`FeatureGrid`: an icon, title, description and optional action."""

    icon: str | None = None
    title: str | None = None
    description: str | None = None
    action_id: str | None = None


@dataclass(frozen=True)
class FeatureGrid(Component):
    """A responsive grid of feature cards. ``columns`` fixes the count (0 = auto-fit)."""

    features: tuple[Feature, ...] = ()
    columns: int = 0
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "features", tuple(self.features))


@dataclass(frozen=True)
class Testimonial:
    """One card of a :class:`Testimonials` block: a quote, an author and a 0–5 rating."""

    quote: str | None = None
    author: str | None = None
    role: str | None = None
    avatar: str | None = None
    rating: int = 0


@dataclass(frozen=True)
class Testimonials(Component):
    """A responsive grid of testimonial / quote cards."""

    items: tuple[Testimonial, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "items", tuple(self.items))


@dataclass(frozen=True)
class FaqItem:
    """One question/answer of a :class:`Faq`; ``open`` makes it start expanded."""

    question: str | None = None
    answer: str | None = None
    open: bool = False


@dataclass(frozen=True)
class Faq(Component):
    """A read-only FAQ list: collapsible question/answer rows."""

    items: tuple[FaqItem, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "items", tuple(self.items))


@dataclass(frozen=True)
class CalloutCard(Component):
    """A highlighted call-to-action block. ``theme`` is info|success|warning|danger."""

    title: str | None = None
    description: str | None = None
    icon: str | None = None
    cta_label: str | None = None
    action_id: str | None = None
    theme: str | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class Comment:
    """One entry of a :class:`CommentThread`; ``replies`` nest recursively."""

    id: str | None = None
    author: str | None = None
    avatar: str | None = None
    text: str | None = None
    timestamp: str | None = None
    replies: tuple["Comment", ...] = ()

    def __post_init__(self):
        object.__setattr__(self, "replies", tuple(self.replies))


@dataclass(frozen=True)
class CommentThread(Component):
    """A read-only discussion thread with nested replies."""

    comments: tuple[Comment, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "comments", tuple(self.comments))


@dataclass(frozen=True)
class FileItem:
    """One entry of a :class:`FileList`: name, size, type (icon), url and/or action."""

    name: str | None = None
    size: str | None = None
    type: str | None = None
    url: str | None = None
    action_id: str | None = None


@dataclass(frozen=True)
class FileList(Component):
    """A read-only list of attached files with type icons."""

    files: tuple[FileItem, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "files", tuple(self.files))


@dataclass(frozen=True)
class ChecklistItem:
    """One item of a :class:`Checklist`; ``done``, plus an optional toggle action."""

    id: str | None = None
    label: str | None = None
    done: bool = False
    action_id: str | None = None


@dataclass(frozen=True)
class Checklist(Component):
    """A checklist with a progress bar."""

    title: str | None = None
    items: tuple[ChecklistItem, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "items", tuple(self.items))


@dataclass(frozen=True)
class ComparisonCard(Component):
    """A two-value comparison: a left and right label+value with a delta chip between them,
    colored by ``trend`` (up|down|flat)."""

    title: str | None = None
    left_label: str | None = None
    left_value: str | None = None
    right_label: str | None = None
    right_value: str | None = None
    delta: str | None = None
    trend: str | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class ChipItem:
    """A small colored chip (badge palette: normal|success|warning|error|contrast)."""

    label: str | None = None
    color: str | None = None


@dataclass(frozen=True)
class Fact:
    """A label-over-value pair of an :class:`EntityHeader`."""

    label: str | None = None
    value: str | None = None


@dataclass(frozen=True)
class EntityHeader(Component):
    """Persistent context banner: identity + key facts + one highlighted metric of the entity
    a flow operates on (the guest card of a check-in wizard)."""

    title: str | None = None
    badges: tuple[ChipItem, ...] = ()
    subtitle: str | None = None
    facts: tuple[Fact, ...] = ()
    metric_label: str | None = None
    metric_value: str | None = None
    metric_caption: str | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "badges", tuple(self.badges))
        object.__setattr__(self, "facts", tuple(self.facts))


@dataclass(frozen=True)
class Meter(Component):
    """Consumption vs limit (balance vs preauthorization): a labeled value with a progress
    track colored by the optional warn/danger thresholds."""

    label: str | None = None
    value: float | None = None
    max: float | None = None
    unit: str | None = None
    caption: str | None = None
    warn_at: float | None = None
    danger_at: float | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class TaskProgress(Component):
    """Subtask completion banner: ``done``/``total`` pills plus an optional CTA dispatching
    ``action_id``."""

    label: str | None = None
    total: int = 0
    done: int = 0
    action_label: str | None = None
    action_id: str | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class StatusItem:
    """One row of a :class:`StatusList`: icon (or ``avatar`` — short text like a person's
    initials rendered in a circular avatar, taking precedence over the icon), text, status chip
    and/or action."""

    id: str | None = None
    icon: str | None = None
    avatar: str | None = None
    title: str | None = None
    description: str | None = None
    status: str | None = None
    status_color: str | None = None
    action_label: str | None = None
    action_id: str | None = None


@dataclass(frozen=True)
class StatusList(Component):
    """Rows with an icon, text, status chip and/or action (incidents, side-effects checklist).
    ``compact`` tightens the row padding for dense screens; ``frameless`` keeps the row dividers
    but drops the outer border (the host provides the framing)."""

    items: tuple[StatusItem, ...] = ()
    compact: bool = False
    frameless: bool = False
    #: Makes every row clickable: clicking one dispatches this action with ``{"_item": id}``.
    row_action_id: str | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "items", tuple(self.items))


@dataclass(frozen=True)
class Notice(Component):
    """A compact inline banner: a theme-tinted strip with a severity icon and one line of text
    (e.g. "2 quejas pendientes"), plus an optional right-aligned action. ``theme``: "info" |
    "success" | "warning" | "danger" (default info)."""

    text: str = ""
    theme: str | None = None
    icon: str | None = None
    #: Suppresses the severity icon entirely.
    no_icon: bool = False
    action_label: str | None = None
    action_id: str | None = None
    #: Right-aligned state text rendered where the action button goes.
    status: str | None = None
    #: Tight variant: no block margins and reduced padding.
    slim: bool = False
    #: Spans the full form width (all columns).
    full_width: bool = False
    #: Content renders on the SAME line as the text instead of below it.
    inline_content: bool = False
    #: Arbitrary components rendered inside the tinted strip, below the text (slotted children).
    content: tuple[Component, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "content", tuple(self.content))


@dataclass(frozen=True)
class BulletedList(Component):
    """A plain bulleted list (``<ul>``) of text items — the lightweight counterpart of
    :class:`StatusList` for read-only enumerations (preferences, highlights, notes)."""

    items: tuple[str, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "items", tuple(self.items))


@dataclass(frozen=True)
class QueueItem:
    """One card of a :class:`TaskQueue` group."""

    id: str | None = None
    title: str | None = None
    caption: str | None = None
    badges: tuple[ChipItem, ...] = ()
    selected: bool = False

    def __post_init__(self):
        object.__setattr__(self, "badges", tuple(self.badges))


@dataclass(frozen=True)
class QueueGroup:
    """A labeled group of :class:`QueueItem` cards."""

    label: str | None = None
    items: tuple[QueueItem, ...] = ()

    def __post_init__(self):
        object.__setattr__(self, "items", tuple(self.items))


@dataclass(frozen=True)
class TaskQueue(Component):
    """Grouped work queue rail (arrivals/departures): clicking a card dispatches the
    component-level ``action_id`` with the item id."""

    action_id: str | None = None
    groups: tuple[QueueGroup, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "groups", tuple(self.groups))


@dataclass(frozen=True)
class ResourceItem:
    """One cell of a :class:`ResourceGrid` (a room, a table, a slot…)."""

    id: str | None = None
    title: str | None = None
    subtitle: str | None = None
    status_label: str | None = None
    status_color: str | None = None
    note: str | None = None
    note_color: str | None = None
    disabled: bool = False
    recommended: bool = False
    selected: bool = False


@dataclass(frozen=True)
class ResourceGrid(Component):
    """Availability/selection grid (room picker): clicking an enabled item dispatches
    ``action_id`` with the item id."""

    action_id: str | None = None
    columns: int = 0
    recommended_label: str | None = None
    items: tuple[ResourceItem, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "items", tuple(self.items))


@dataclass(frozen=True)
class OfferCard(Component):
    """Current vs upgrade offer card: optional image, feature chips and a priced CTA
    (hidden when ``current``). For toggle offers set ``added`` from the server state:
    the CTA turns success green and shows ``added_label``; clicking dispatches the same
    ``action_id`` again so the action can toggle it back."""

    tag: str | None = None
    title: str | None = None
    subtitle: str | None = None
    image: str | None = None
    features: tuple[str, ...] = ()
    price_label: str | None = None
    action_label: str | None = None
    action_id: str | None = None
    current: bool = False
    current_label: str | None = None
    added: bool = False
    added_label: str | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "features", tuple(self.features))


@dataclass(frozen=True)
class AddOn:
    """One priced extra of an :class:`AddOnPicker`."""

    id: str | None = None
    icon: str | None = None
    title: str | None = None
    description: str | None = None
    price: float | None = None
    unit: str | None = None
    included_label: str | None = None
    added: bool = False


@dataclass(frozen=True)
class AddOnPicker(Component):
    """Priced extras with a running total; toggling an item dispatches ``action_id``."""

    total_label: str | None = None
    currency: str | None = None
    action_id: str | None = None
    items: tuple[AddOn, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "items", tuple(self.items))


@dataclass(frozen=True)
class LedgerLine:
    """One line of a :class:`Ledger`; ``included`` lines show ``included_label`` instead of
    an amount."""

    concept: str | None = None
    amount: float | None = None
    included: bool = False
    included_label: str | None = None


@dataclass(frozen=True)
class Ledger(Component):
    """Folio breakdown with total. ``total`` absent → the client computes the sum of the
    non-included amounts. No actions."""

    currency: str | None = None
    total_label: str | None = None
    lines: tuple[LedgerLine, ...] = ()
    total: float | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "lines", tuple(self.lines))


@dataclass(frozen=True)
class PaymentMethod:
    """One selectable method of a :class:`PaymentPicker`."""

    id: str | None = None
    label: str | None = None


@dataclass(frozen=True)
class PaymentPicker(Component):
    """Payment method segmented buttons + optional context chip + confirm CTA dispatching
    ``action_id`` with the selected method."""

    action_id: str | None = None
    #: Dispatched with ``{"_method": id}`` every time the user picks a method.
    method_action_id: str | None = None
    methods: tuple[PaymentMethod, ...] = ()
    selected: str | None = None
    context_label: str | None = None
    context_value: str | None = None
    confirm_label: str | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "methods", tuple(self.methods))


@dataclass(frozen=True)
class ProcessItem:
    """One monitored process of a :class:`ProcessMonitor`; ``status``: ok|warning|error."""

    id: str | None = None
    name: str | None = None
    systems: tuple[str, ...] = ()
    ok: int = 0
    warnings: int = 0
    errors: int = 0
    status: str | None = None
    action_label: str | None = None
    action_id: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "systems", tuple(self.systems))


@dataclass(frozen=True)
class ProcessMonitor(Component):
    """Monitored automation processes with health counters and an optional fix action."""

    items: tuple[ProcessItem, ...] = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "items", tuple(self.items))


@dataclass(frozen=True)
class MicroFrontend(Component):
    """A remote Mateu UI embedded as an island inside this page: the renderer mounts the remote
    backend's view at ``base_url``/``route`` and it runs its own sync loop — compose UIs owned by
    other services without proxying them. The Python analogue of
    ``io.mateu.uidl.data.MicroFrontend``."""

    base_url: str = ""
    route: str = ""
    #: Extra app state seeded into the island's requests.
    app_state: object | None = None
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


class DrawerPosition(Enum):
    start = "start"
    end = "end"


@dataclass(frozen=True)
class Drawer(Component):
    """A panel sliding in from a viewport edge, returned from any action to open its ``content``
    on top of the current page — the side-panel counterpart of :class:`Dialog`. Close it from a
    later action with ``UICommand.close_modal(...)``; ✕/Esc/backdrop dismiss without a result.
    The Python analogue of ``io.mateu.uidl.data.Drawer``."""

    header_title: str | None = None
    header: Component | None = None
    content: Component | None = None
    footer: Component | None = None
    position: DrawerPosition = DrawerPosition.end
    width: str | None = None
    no_padding: bool = False
    #: No backdrop — the page behind stays interactive.
    modeless: bool = False
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class Dialog(Component):
    """A modal window, returned from any action to open its ``content`` on top of the current
    page. The Python analogue of ``io.mateu.uidl.data.Dialog``."""

    header_title: str | None = None
    header: Component | None = None
    content: Component | None = None
    footer: Component | None = None
    width: str | None = None
    height: str | None = None
    no_padding: bool = False
    modeless: bool = False
    close_button_on_header: bool = True
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


__all__ = [
    "Component",
    "MetricTrend",
    "SkeletonVariant",
    "DrawerPosition",
    "Drawer",
    "Dialog",
    "MicroFrontend",
    "Text",
    "Button",
    "MetricCard",
    "Scoreboard",
    "DashboardPanel",
    "DashboardLayout",
    "FoldoutPanel",
    "FoldoutLayout",
    "HeroSection",
    "EmptyState",
    "Skeleton",
    "GanttTask",
    "Gantt",
    "PlanningResource",
    "PlanningBlock",
    "PlanningBoard",
    "KanbanCard",
    "KanbanColumn",
    "Kanban",
    "TimelineItem",
    "Timeline",
    "Step",
    "ProgressSteps",
    "Stat",
    "CalendarEvent",
    "Calendar",
    "PricingPlan",
    "PricingTable",
    "OrgNode",
    "OrgChart",
    "HeatCell",
    "Heatmap",
    "FunnelStage",
    "Funnel",
    "TrendChart",
    "Feature",
    "FeatureGrid",
    "Testimonial",
    "Testimonials",
    "FaqItem",
    "Faq",
    "CalloutCard",
    "Comment",
    "CommentThread",
    "FileItem",
    "FileList",
    "ChecklistItem",
    "Checklist",
    "ComparisonCard",
    "ChipItem",
    "Fact",
    "EntityHeader",
    "Meter",
    "TaskProgress",
    "StatusItem",
    "StatusList",
    "QueueItem",
    "QueueGroup",
    "TaskQueue",
    "ResourceItem",
    "ResourceGrid",
    "OfferCard",
    "AddOn",
    "AddOnPicker",
    "LedgerLine",
    "Ledger",
    "PaymentMethod",
    "PaymentPicker",
    "ProcessItem",
    "ProcessMonitor",
]
