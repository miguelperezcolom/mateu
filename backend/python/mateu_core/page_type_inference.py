"""Coarse page type resolution — the Python port of Java's ``PageTypeResolver``.

Which family of Oracle Redwood page templates a view belongs to (the ``pageType`` wire field):
Dashboards and views carrying a MetricCard field → dashboard, Welcome / HeroSearch pages →
landing, the collection-style archetypes (SmartSearchPage, TodoList, CalendarPage,
CollectionDetail, Crud, Listing) → collection, Wizards (and the ImportWizard, which is one) →
process, the detail-style archetypes (Foldout, ItemOverview, GeneralOverview) → detail, and any
plain reflected form → form. The explicit ``@page_template(PageType.X)`` always wins over this
inference, and the result is never None (the default is "form").
"""

from __future__ import annotations

from mateu_uidl import (
    CalendarPage,
    CollectionDetail,
    Crud,
    Dashboard,
    DataManagement,
    Foldout,
    GanttPage,
    GeneralOverview,
    HeroSearch,
    ItemOverview,
    Listing,
    PageType,
    SmartSearchPage,
    TodoList,
    Welcome,
    Wizard,
)
from mateu_uidl.components import MetricCard

from . import page_inference
from .reflection import view_fields

#: Archetype base classes per family. Check order matters where archetypes nest: HeroSearch IS
#: a Crud but resolves to landing, so the landing check runs before the collection one.
_LANDING = (Welcome, HeroSearch)
_COLLECTION = (SmartSearchPage, TodoList, CalendarPage, CollectionDetail, DataManagement, Crud, Listing)
#: ImportWizard (mateu_core.importwizard) subclasses Wizard, so it resolves to process too.
_PROCESS = (Wizard,)
_DETAIL = (Foldout, GanttPage, ItemOverview, GeneralOverview)


def page_type_of(cls) -> str:
    """The view's coarse page type as its wire name; never None (defaults to "form"). The
    explicit ``@page_template(PageType.X)`` on the class wins; otherwise the type is inferred
    from the view's shape. The Python analogue of Java's ``PageTypeResolver.resolve``."""
    explicit = getattr(cls, "__mateu_page_type__", None)
    if explicit is not None:
        return explicit
    if not isinstance(cls, type):
        return PageType.FORM.value
    if issubclass(cls, Dashboard):
        return PageType.DASHBOARD.value
    if issubclass(cls, _LANDING):
        return PageType.LANDING.value
    if issubclass(cls, _COLLECTION):
        return PageType.COLLECTION.value
    if issubclass(cls, _PROCESS):
        return PageType.PROCESS.value
    if issubclass(cls, _DETAIL):
        return PageType.DETAIL.value
    if any(
        isinstance(f.type, type) and issubclass(f.type, MetricCard) for f in view_fields(cls)
    ):
        return PageType.DASHBOARD.value
    if page_inference.composes_welcome(cls):
        # Page-level inference renders this class as the Welcome landing (@auto_page).
        return PageType.LANDING.value
    return PageType.FORM.value
