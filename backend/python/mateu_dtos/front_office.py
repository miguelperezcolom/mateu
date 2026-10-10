"""Front-office components: EntityHeader, Meter, StatusList, ActionPanel, MatrixGrid, Map, TaskQueue, OfferCard, Ledger, ..."""

from __future__ import annotations

from typing import (
    Any,
    Literal,
)

from pydantic import Field

from .base import Wire


class ChipRecord(Wire):
    """A small colored chip (mirrors ``ChipDto``); badge palette colors."""

    label: str | None = None
    color: str | None = None


class FactRecord(Wire):
    """A label-over-value pair (mirrors ``FactDto``)."""

    label: str | None = None
    value: str | None = None


class EntityHeaderMetadata(Wire):
    """Entity-header metadata: identity + facts + highlighted metric (mirrors ``EntityHeaderDto``)."""

    type: Literal["EntityHeader"] = "EntityHeader"
    title: str | None = None
    badges: list[ChipRecord] = Field(default_factory=list)
    subtitle: str | None = None
    facts: list[FactRecord] = Field(default_factory=list)
    metric_label: str | None = None
    metric_value: str | None = None
    metric_caption: str | None = None


class MeterMetadata(Wire):
    """Meter metadata: consumption vs limit with thresholds (mirrors ``MeterDto``)."""

    type: Literal["Meter"] = "Meter"
    label: str | None = None
    value: float | None = None
    max: float | None = None
    unit: str | None = None
    caption: str | None = None
    warn_at: float | None = None
    danger_at: float | None = None


class TaskProgressMetadata(Wire):
    """Task-progress metadata: done/total pills + CTA (mirrors ``TaskProgressDto``)."""

    type: Literal["TaskProgress"] = "TaskProgress"
    label: str | None = None
    total: int = 0
    done: int = 0
    action_label: str | None = None
    action_id: str | None = None


class StatusItemRecord(Wire):
    """One status-list row (mirrors ``StatusItemDto``)."""

    id: str | None = None
    icon: str | None = None
    avatar: str | None = None
    title: str | None = None
    description: str | None = None
    status: str | None = None
    status_color: str | None = None
    action_label: str | None = None
    action_id: str | None = None


class StatusListMetadata(Wire):
    """Status-list metadata: icon/text rows with status chip or action (mirrors ``StatusListDto``)."""

    type: Literal["StatusList"] = "StatusList"
    items: list[StatusItemRecord] = Field(default_factory=list)
    compact: bool = False
    frameless: bool = False
    row_action_id: str | None = None


class BulletedListMetadata(Wire):
    """Plain bulleted list (``<ul>``) of text items (mirrors ``BulletedListDto``)."""

    type: Literal["BulletedList"] = "BulletedList"
    items: list[str] = Field(default_factory=list)


class ActionPanelItemRecord(Wire):
    """One action of an action panel (mirrors ``ActionPanelItemDto``)."""

    label: str | None = None
    action_id: str | None = None
    parameters: dict[str, object] | None = None
    count: int | None = None
    populated: bool = False
    disabled: bool = False


class ActionPanelCategoryRecord(Wire):
    """A column of an action panel (mirrors ``ActionPanelCategoryDto``)."""

    title: str | None = None
    actions: list[ActionPanelItemRecord] = Field(default_factory=list)


class ActionPanelMetadata(Wire):
    """Categorised action panel ("I want to…") (mirrors ``ActionPanelDto``)."""

    type: Literal["ActionPanel"] = "ActionPanel"
    label: str = "I want to…"
    shortcut: str | None = None
    categories: list[ActionPanelCategoryRecord] = Field(default_factory=list)
    max_per_category: int = 10
    hide_unpopulated_toggle: bool = False


class MatrixColumnRecord(Wire):
    """A matrix-grid column (mirrors ``MatrixColumnDto``)."""

    id: str | None = None
    label: str | None = None
    group: str | None = None
    tone: str | None = None


class MatrixCellRecord(Wire):
    """A matrix-grid cell (mirrors ``MatrixCellDto``)."""

    value: str = ""
    tone: str | None = None
    link: bool = False


class MatrixRowRecord(Wire):
    """A matrix-grid row (mirrors ``MatrixRowDto``)."""

    id: str | None = None
    label: str | None = None
    cells: list[MatrixCellRecord] = Field(default_factory=list)
    editable: bool = False
    emphasis: bool = False


class MatrixSectionRecord(Wire):
    """A collapsible matrix-grid section (mirrors ``MatrixSectionDto``)."""

    id: str | None = None
    title: str | None = None
    collapsed: bool = False
    rows: list[MatrixRowRecord] = Field(default_factory=list)


class MatrixGridMetadata(Wire):
    """Matrix grid: rows × columns in collapsible sections (mirrors ``MatrixGridDto``)."""

    type: Literal["MatrixGrid"] = "MatrixGrid"
    row_header_label: str | None = None
    columns: list[MatrixColumnRecord] = Field(default_factory=list)
    sections: list[MatrixSectionRecord] = Field(default_factory=list)
    cell_action_id: str | None = None
    edit_action_id: str | None = None


class MapMarkerRecord(Wire):
    """One point on a map (mirrors ``MapMarkerDto``)."""

    id: str | None = None
    latitude: float = 0.0
    longitude: float = 0.0
    label: str | None = None
    description: str | None = None
    color: str | None = None


class MapMetadata(Wire):
    """Street map: centre (``"lat, lon"``), zoom, markers and the action a marker click runs with
    ``{"_markerId"}`` (mirrors ``MapDto``)."""

    type: Literal["Map"] = "Map"
    position: str | None = None
    zoom: str | None = None
    markers: list[MapMarkerRecord] = Field(default_factory=list)
    marker_action_id: str | None = None


class DropZoneMetadata(Wire):
    """A drop target for dragged listing rows; its content travels as the component's children
    (mirrors ``DropZoneDto``)."""

    type: Literal["DropZone"] = "DropZone"
    accept: str | None = None
    action_id: str | None = None
    parameters: dict[str, Any] = Field(default_factory=dict)
    title: str | None = None
    subtitle: str | None = None


class QueueItemRecord(Wire):
    """One task-queue card (mirrors ``QueueItemDto``)."""

    id: str | None = None
    title: str | None = None
    caption: str | None = None
    badges: list[ChipRecord] = Field(default_factory=list)
    selected: bool = False


class QueueGroupRecord(Wire):
    """A labeled task-queue group (mirrors ``QueueGroupDto``)."""

    label: str | None = None
    items: list[QueueItemRecord] = Field(default_factory=list)


class TaskQueueMetadata(Wire):
    """Task-queue metadata: grouped work-queue rail (mirrors ``TaskQueueDto``)."""

    type: Literal["TaskQueue"] = "TaskQueue"
    action_id: str | None = None
    groups: list[QueueGroupRecord] = Field(default_factory=list)


class ResourceItemRecord(Wire):
    """One resource-grid cell (mirrors ``ResourceItemDto``)."""

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


class ResourceGridMetadata(Wire):
    """Resource-grid metadata: availability/selection grid (mirrors ``ResourceGridDto``)."""

    type: Literal["ResourceGrid"] = "ResourceGrid"
    action_id: str | None = None
    columns: int = 0
    recommended_label: str | None = None
    items: list[ResourceItemRecord] = Field(default_factory=list)


class OfferCardMetadata(Wire):
    """Offer-card metadata: current vs upgrade offer (mirrors ``OfferCardDto``)."""

    type: Literal["OfferCard"] = "OfferCard"
    tag: str | None = None
    title: str | None = None
    subtitle: str | None = None
    image: str | None = None
    features: list[str] = Field(default_factory=list)
    price_label: str | None = None
    action_label: str | None = None
    action_id: str | None = None
    current: bool = False
    current_label: str | None = None
    added: bool = False
    added_label: str | None = None


class AddOnRecord(Wire):
    """One priced extra (mirrors ``AddOnDto``)."""

    id: str | None = None
    icon: str | None = None
    title: str | None = None
    description: str | None = None
    price: float | None = None
    unit: str | None = None
    included_label: str | None = None
    added: bool = False


class AddOnPickerMetadata(Wire):
    """Add-on-picker metadata: priced extras with running total (mirrors ``AddOnPickerDto``)."""

    type: Literal["AddOnPicker"] = "AddOnPicker"
    total_label: str | None = None
    currency: str | None = None
    action_id: str | None = None
    items: list[AddOnRecord] = Field(default_factory=list)


class LedgerLineRecord(Wire):
    """One folio line (mirrors ``LedgerLineDto``)."""

    concept: str | None = None
    amount: float | None = None
    included: bool = False
    included_label: str | None = None


class LedgerMetadata(Wire):
    """Ledger metadata: folio breakdown with total (mirrors ``LedgerDto``)."""

    type: Literal["Ledger"] = "Ledger"
    currency: str | None = None
    total_label: str | None = None
    lines: list[LedgerLineRecord] = Field(default_factory=list)
    total: float | None = None


class PaymentMethodRecord(Wire):
    """One payment method (mirrors ``PaymentMethodDto``)."""

    id: str | None = None
    label: str | None = None


class PaymentPickerMetadata(Wire):
    """Payment-picker metadata: method + context + confirm CTA (mirrors ``PaymentPickerDto``)."""

    type: Literal["PaymentPicker"] = "PaymentPicker"
    action_id: str | None = None
    method_action_id: str | None = None
    methods: list[PaymentMethodRecord] = Field(default_factory=list)
    selected: str | None = None
    context_label: str | None = None
    context_value: str | None = None
    confirm_label: str | None = None


class ProcessItemRecord(Wire):
    """One monitored process (mirrors ``ProcessItemDto``); ``status``: ok|warning|error."""

    id: str | None = None
    name: str | None = None
    systems: list[str] = Field(default_factory=list)
    ok: int = 0
    warnings: int = 0
    errors: int = 0
    status: str | None = None
    action_label: str | None = None
    action_id: str | None = None


class ProcessMonitorMetadata(Wire):
    """Process-monitor metadata: automation processes with health + fix action (mirrors
    ``ProcessMonitorDto``)."""

    type: Literal["ProcessMonitor"] = "ProcessMonitor"
    items: list[ProcessItemRecord] = Field(default_factory=list)
