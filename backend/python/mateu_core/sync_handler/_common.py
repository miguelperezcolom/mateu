"""Shared imports and helpers of :mod:`sync_handler` (split from the former sync_handler.py).

Handles a single POST /mateu/v3/sync/{route} call -> a UIIncrement. Port of C#'s SyncHandler.
"""

from __future__ import annotations

import base64
import logging
from contextvars import ContextVar
import hashlib
import inspect
import json
import os
import re
import urllib.error
import urllib.request
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Any, get_args, get_origin

from mateu_dtos import (
    Action,
    Banner as BannerDto,
    ButtonMetadata,
    ClientSideComponent,
    CustomEventRecord,
    FormFieldMetadata,
    DialogMetadata,
    DrawerMetadata,
    HorizontalLayoutMetadata,
    Message as MessageDto,
    RestAction,
    RestDataSource,
    ServerSideComponent,
    TextMetadata,
    Trigger,
    UICommand,
    UIFragment,
    UIIncrement,
    VerticalLayoutMetadata,
)
from mateu_uidl import (
    AppSupplier,
    DataManagement,
    GanttPage,
    Aggregate,
    ComponentTreeSupplier,
    AggregateFunction,
    CalendarPage,
    Creatable,
    DateRange,
    Deletable,
    Editable,
    Filterable,
    GlobalSearchSupplier,
    GroupBy,
    Label,
    ListingData,
    LookupLabelSupplier,
    Lookup,
    Message,
    Navigable,
    NotificationsSupplier,
    NumberRange,
    PageBanner,
    Pageable,
    Required,
    Searchable,
    SearchRequest,
    Selector,
    SortSpec,
    Step,
    FlowStep,
    TodoList,
    Version,
    Wizard,
)
from mateu_uidl import components as fluent
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from .. import action_guard
from ..action_guard import MateuForbiddenException  # noqa: F401 - re-exported for adapters
from ..mapper import (
    ReflectionMapper,
    capability_class,
    crud_element_type,
    enum_set_element_type,
    is_enum,
    listing_types,
    set_current_audience,
)
from .. import capabilities
from ..naming import camel_case, humanize
from ..reflection import view_fields
from ..registry import MateuRegistry, normalize, type_name
from ..route_registry import RouteRegistry
from ..yaml_spec_loader import YamlSpecLoader


def _sort_key(value):
    """None-safe, type-stable sort key: (is_none, coerced) so None sorts first and mixed
    numeric/string columns never raise a TypeError."""
    if value is None:
        return (0, 0.0, "")
    if isinstance(value, bool):
        return (1, float(value), "")
    if isinstance(value, (int, float)):
        return (1, float(value), "")
    return (1, 0.0, str(value).lower())


def version_field(entity_class):
    """The entity's ``Version()`` field (walks base classes via ``view_fields``); None when the
    entity declares none — every optimistic-locking step is then a no-op (mirrors Java's
    ``OptimisticLock.versionField``)."""
    return next((f for f in view_fields(entity_class) if f.has(Version)), None)


class RunActionRq(BaseModel):
    """Inbound request (mirrors io.mateu.dtos.RunActionRqDto / the C# RunActionRqDto)."""

    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel, extra="ignore")

    component_state: dict[str, Any] = Field(default_factory=dict)
    app_state: dict[str, Any] = Field(default_factory=dict)
    parameters: dict[str, Any] = Field(default_factory=dict)
    initiator_component_id: str | None = None
    consumed_route: str | None = None
    action_id: str | None = None
    route: str | None = None
    server_side_type: str | None = None
    server_side_component_route: str | None = None
    #: The structure hash (ETag) the client already holds for this route (phase b of the client
    #: structure cache). When it matches the hash of the structure the server would send, the
    #: server omits the component and replies with only state/data. None = full structure
    #: (mirrors io.mateu.dtos.RunActionRqDto.knownStructureHash).
    known_structure_hash: str | None = None


# The event the edit_in_drawer drawer emits on save: the listing refreshes by re-running its
# search (mirrors Java's Crud.SAVED_IN_DRAWER_EVENT).
SAVED_IN_DRAWER_EVENT = "mateu-crud:saved-in-drawer"

log = logging.getLogger("mateu.sync")

#: The routes.yaml entry matched for the request in flight. Per REQUEST, so it lives in a
#: ContextVar rather than on the (shared, singleton) handler: two concurrent requests must never
#: read each other's route seed.
_route_seed: ContextVar[Any] = ContextVar("mateu_route_seed", default=None)
