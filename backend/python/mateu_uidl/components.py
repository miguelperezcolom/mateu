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
    """A simple text block."""

    text: str = ""
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


@dataclass(frozen=True)
class Button(Component):
    """A fluent button; ``action_id`` runs the matching action method."""

    label: str = ""
    action_id: str = ""
    disabled: bool = False
    button_style: str | None = None
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
    "KanbanCard",
    "KanbanColumn",
    "Kanban",
]
