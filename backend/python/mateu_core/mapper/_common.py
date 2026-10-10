"""Shared imports and helpers of :mod:`mapper` (split from the former mapper.py).

Turns an annotated Python view instance into the Mateu component tree (App->Page->Card->...->FormField).
The Python port of C#'s ReflectionMapper.
"""

from __future__ import annotations

import logging
import dataclasses

import uuid
from contextvars import ContextVar
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Any, TypeVar, get_args, get_origin, get_type_hints

from mateu_dtos import (
    AccordionLayoutMetadata,
    AnchorMetadata,
    AppContextSelector,
    AccordionPanelMetadata,
    Action,
    AppHeaderAction,
    AppMetadata,
    Badge,
    Banner,
    Button,
    ButtonMetadata,
    CardMetadata,
    ClientSideComponent,
    CrudMetadata,
    ContentLayoutMetadata,
    CustomTrigger,
    DashboardLayoutMetadata,
    ResponsiveGridMetadata,
    DashboardPanelMetadata,
    DialogMetadata,
    DivMetadata,
    DrawerMetadata,
    PopoverMetadata,
    EmptyStateMetadata,
    Fab,
    FoldoutLayoutMetadata,
    FoldoutNavigation as FoldoutNavigationWire,
    FoldoutPanelInfo,
    FormFieldMetadata,
    FormLayoutMetadata,
    FormRowMetadata,
    FormSectionMetadata,
    GanttMetadata,
    GanttTaskRecord,
    PairRecord,
    PlanningBoardMetadata,
    PlanningBlockRecord,
    PlanningResourceRecord,
    KanbanMetadata,
    KanbanColumnRecord,
    KanbanCardRecord,
    TimelineMetadata,
    TimelineItemRecord,
    ProgressStepsMetadata,
    StepRecord,
    StatMetadata,
    CalendarMetadata,
    CalendarEventRecord,
    CalendarDayRecord,
    PricingTableMetadata,
    PricingPlanRecord,
    OrgChartMetadata,
    OrgNodeRecord,
    HeatmapMetadata,
    HeatCellRecord,
    FunnelMetadata,
    FunnelStageRecord,
    TrendChartMetadata,
    FeatureGridMetadata,
    FeatureRecord,
    TestimonialsMetadata,
    TestimonialRecord,
    FaqMetadata,
    FaqItemRecord,
    CalloutCardMetadata,
    CommentThreadMetadata,
    CommentRecord,
    FileListMetadata,
    FileItemRecord,
    ChecklistMetadata,
    ChecklistItemRecord,
    ComparisonCardMetadata,
    ChipRecord,
    FactRecord,
    EntityHeaderMetadata,
    MeterMetadata,
    TaskProgressMetadata,
    StatusItemRecord,
    StatusListMetadata,
    BulletedListMetadata,
    ActionPanelMetadata,
    ActionPanelCategoryRecord,
    ActionPanelItemRecord,
    MatrixGridMetadata,
    MapMetadata,
    MapMarkerRecord,
    DropZoneMetadata,
    MatrixColumnRecord,
    MatrixSectionRecord,
    MatrixRowRecord,
    MatrixCellRecord,
    SeparatorMetadata,
    CustomComponentMetadata,
    NoticeMetadata,
    QueueItemRecord,
    QueueGroupRecord,
    TaskQueueMetadata,
    ResourceItemRecord,
    ResourceGridMetadata,
    OfferCardMetadata,
    AddOnRecord,
    AddOnPickerMetadata,
    LedgerLineRecord,
    LedgerMetadata,
    PaymentMethodRecord,
    PaymentPickerMetadata,
    ProcessItemRecord,
    ProcessMonitorMetadata,
    GridColumn,
    GridColumnMeta,
    HeroSectionMetadata,
    HorizontalLayoutMetadata,
    Kpi,
    PeerNav,
    MenuItem,
    MetricCardMetadata,
    MicroFrontendMetadata,
    NavLinkRecord,
    Option,
    PageMetadata,
    ProgressBarMetadata,
    ProgressStepsMetadata,
    StepRecord,
    RemoteCoordinates,
    RestAction,
    RestDataSource,
    RuleRecord,
    ScoreboardMetadata,
    ServerSideComponent,
    SkeletonMetadata,
    TabLayoutMetadata,
    TabMetadata,
    TextMetadata,
    Trigger,
    VerticalLayoutMetadata,
)
from mateu_uidl import (
    Aggregate,
    PrimaryColumn,
    Tooltip,
    AppActionsSupplier,
    AppSupplier,
    Aside,
    kpi as KpiMarker,
    PeerNavigationSupplier,
    Timestamp,
    Audience,
    BulletedList,
    ComponentTreeSupplier,
    Creatable,
    Crud,
    Dashboard,
    DateRange,
    Deletable,
    Disabled,
    Editable,
    Filterable,
    Navigable,
    DisabledUnless,
    EyesOnly,
    FileUpload,
    Foldout,
    GlobalSearchSupplier,
    MenuSupplier,
    GroupBy,
    RowStatus,
    HeaderBadge,
    HeroSearch,
    Hidden,
    InlineEditing,
    ItemOverview,
    Label,
    LinkSupplier,
    LinkTo,
    Listing,
    Lookup,
    RestOptions,
    Money,
    Multiline,
    NotificationsSupplier,
    NumberRange,
    OnRowSelected,
    Panel,
    Password,
    PhotoCapture,
    PlainText,
    RangeFilter,
    ReadOnly,
    ReadOnlyUnless,
    Rule,
    RuleSupplier,
    Searchable,
    SeparatorBefore,
    Selector,
    Signature,
    SmartSearchPage,
    TreeSelect,
    Required,
    Section,
    Step,
    Stereotype,
    Tab,
    Translator,
    UseRadioButtons,
    Welcome,
)
from mateu_uidl import components as fluent

from .. import capabilities, labels_aside_inference, layout_inference
from ..action_guard import resolve_action
from ..naming import camel_case, humanize, humanize_constant
from ..page_type_inference import page_type_of
from .. import page_inference
from ..reflection import class_flag, methods_with, view_fields
from ..registry import normalize, type_name

_log = logging.getLogger("mateu.mapper")

# The audience projection active for the request being handled (the appState value under
# "audience", i.e. the @app_context selector named audience); None → no projection. A ContextVar
# because the mapper instance is shared by the SyncHandler across (possibly concurrent) requests.
_current_audience: ContextVar[str | None] = ContextVar("mateu_current_audience", default=None)


def set_current_audience(value) -> None:
    """Activates (or clears) the audience projection for the current request flow."""
    text = "" if value is None else str(value)
    _current_audience.set(text if text.strip() else None)


def with_action_options(action: Action, cls, action_id: str) -> Action:
    """Copies the method's ``@action_options`` onto the action heading to the client.

    The action id is the camel-cased method name, so the declaring method is found by matching
    that back. Without a declaration the safe defaults ride: the client's own timeout, and no
    self-retry (after a timeout the client cannot know whether the server applied the action).
    """
    for name, fn in methods_with(cls, "__mateu_action_options__"):
        if camel_case(name) != action_id:
            continue
        timeout_millis, idempotent = fn.__mateu_action_options__
        return action.model_copy(
            update={"timeout_millis": timeout_millis, "idempotent": idempotent}
        )
    return action


def for_current_audience(gate: Audience | None) -> bool:
    """``Audience(...)``: shown when no audience is set (full view) or when the declared values
    contain the current one. A UX projection, NOT security (that's ``EyesOnly()``)."""
    if gate is None:
        return True
    current = _current_audience.get()
    return current is None or current in gate.audiences


def _id() -> str:
    return str(uuid.uuid4())


def value_labels_of(t) -> dict[str, str] | None:
    """An enum column's cell labels (member name → enum_label), None for any other type — display
    only, rows keep the raw name (Java: GridColumnBuilder.getValueLabels)."""
    args = [a for a in get_args(t) if a is not type(None)]
    if not is_enum(t) and len(args) == 1:  # Optional[SomeEnum] / SomeEnum | None
        t = args[0]
    return {m.name: enum_label(m) for m in t} if is_enum(t) else None


def enum_label(member) -> str:
    """What an enum member is called on screen: its own ``__str__`` when the enum class defines one
    (a display name the developer already wrote), else its name humanized (``CHECK_OUT`` → "Check
    out"). Same rule as Java's ``FieldMetadataExtractor.enumLabel`` and .NET's ``EnumLabel``."""
    own = type(member).__dict__.get("__str__")
    if own is not None and getattr(own, "__qualname__", "").split(".")[0] == type(member).__name__:
        return str(member)
    return humanize_constant(member.name)


def is_enum(t) -> bool:
    return isinstance(t, type) and issubclass(t, Enum)


def _resolved_generic_args(cls, target) -> tuple | None:
    """The type arguments ``cls`` binds for the generic base ``target``, walking the
    inheritance chain and substituting type variables — the Python analogue of Java's
    ``GenericClassProvider.getGenericClass`` (so ``SmartSearchPage[F, R]`` resolves
    ``Listing[R]`` through the intermediate base)."""

    def walk(c, mapping):
        for base in getattr(c, "__orig_bases__", ()) or ():
            origin = get_origin(base)
            if not (isinstance(origin, type) and issubclass(origin, target)):
                continue
            args = tuple(
                mapping.get(a, a) if isinstance(a, TypeVar) else a for a in get_args(base)
            )
            if origin is target:
                return args
            found = walk(origin, dict(zip(getattr(origin, "__parameters__", ()), args)))
            if found is not None:
                return found
        for base in getattr(c, "__bases__", ()):
            if isinstance(base, type) and base is not target and issubclass(base, target):
                found = walk(base, {})
                if found is not None:
                    return found
        return None

    return walk(cls, {})


def _generic_class(cls, target, index: int = 0) -> type | None:
    """The resolved type argument at ``index`` of generic base ``target``, or None when the
    class left it unbound (a bare TypeVar)."""
    args = _resolved_generic_args(cls, target)
    if args and index < len(args) and isinstance(args[index], type):
        return args[index]
    return None


def capability_class(cls, capability, index: int = 0) -> type | None:
    """The Detail/Editor/Form/Id class a capability declares via its generic arguments, or
    None when the class does not declare the capability (or left the argument unbound) —
    mirrors Java's ``CapabilityCrud.capabilityClass``."""
    if not (isinstance(cls, type) and issubclass(cls, capability)):
        return None
    return _generic_class(cls, capability, index)


def listing_row_type(cls) -> type | None:
    """The ``Row`` type of a ``Listing[Row]`` subclass; None when unbound."""
    return _generic_class(cls, Listing, 0)


def filterable_filters_type(cls) -> type | None:
    """The ``Filters`` type a ``Filterable`` listing declares — the explicit ``filters_class``
    attribute wins over the ``Filterable[F]`` generic argument. None when not Filterable."""
    if not (isinstance(cls, type) and issubclass(cls, Filterable)):
        return None
    explicit = getattr(cls, "filters_class", None)
    if isinstance(explicit, type):
        return explicit
    return _generic_class(cls, Filterable, 0)


def listing_types(cls) -> tuple[type | None, type | None] | None:
    """If ``cls`` is a capability :class:`Listing`, return ``(Filters, Row)`` — ``Filters`` is
    None unless the listing is :class:`Filterable`; else None."""
    if not (isinstance(cls, type) and issubclass(cls, Listing)):
        return None
    return filterable_filters_type(cls), listing_row_type(cls)


def enum_set_element_type(t) -> type | None:
    """The enum element of a ``set[SomeEnum]`` annotation; None otherwise."""
    if get_origin(t) is not set:
        return None
    args = get_args(t)
    arg = args[0] if args else None
    return arg if isinstance(arg, type) and is_enum(arg) else None


def crud_element_type(cls) -> type | None:
    """If ``cls`` derives from ``Crud[T]``, return ``T``; else ``None``."""
    if not (isinstance(cls, type) and issubclass(cls, Crud)):
        return None
    if getattr(cls, "element_type", None):
        return cls.element_type
    for c in cls.__mro__:
        for base in getattr(c, "__orig_bases__", ()):
            origin = get_origin(base)
            # Any Crud[T] subscription counts — including subclasses like HeroSearch[T].
            if isinstance(origin, type) and issubclass(origin, Crud):
                args = get_args(base)
                if args and isinstance(args[0], type):
                    return args[0]
    return None


#: The compact-mode CSS custom-property overrides (mirrors Java's StyleConstants.COMPACT),
#: applied on the page container; the leading ";" and the "--mateu-compact:1" marker are part of it.
COMPACT_STYLE = (
    ";--vaadin-form-layout-row-spacing:0.2rem;--vaadin-form-layout-label-spacing:0.05rem;"
    "--vaadin-card-padding:0.2rem 0.7rem;--vaadin-card-gap:0.15rem;"
    "--lumo-size-xl:2.2rem;--lumo-size-l:1.8rem;--lumo-size-m:1.35rem;--lumo-size-s:1.2rem;"
    "--lumo-size-xs:1.05rem;--lumo-space-xl:0.9rem;--lumo-space-l:0.45rem;--lumo-space-m:0.3rem;"
    "--lumo-space-s:0.18rem;--lumo-space-xs:0.1rem;--lumo-line-height-m:1.15;"
    "--mateu-label-font-size:var(--lumo-font-size-xs);--mateu-label-padding-bottom:1px;"
    "--mateu-label-line-height:1.1;--mateu-compact:1;"
)


def format_value(value) -> Any:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, Enum):
        return value.name
    return str(value)


def _row_cell(value) -> Any:
    """A grid row cell for the wire: dates ISO, enums by name, scalars as-is (numbers and
    booleans keep their JSON type, unlike format_value's strings)."""
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, Enum):
        return value.name
    return value
