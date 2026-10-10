"""Supplier interfaces a view or app class implements (labels, rules, header actions, peer navigation, notifications, global search, app shell / menu / routes in code)."""

from __future__ import annotations

from dataclasses import (
    dataclass,
    field as dataclass_field,
)
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .markers import Rule


class LookupLabelSupplier:
    """Resolves the display label of a reference field's PRE-EXISTING value: when a form loads
    with a ``Lookup()``/``Searchable()`` field already set, the framework asks the view (or the
    ``Searchable()`` selector) for the label so the raw id is never shown. The Python analogue of
    Java's ``LookupLabelSupplier``."""

    def label(self, field_name: str, id) -> str | None:
        raise NotImplementedError


@dataclass(frozen=True)
class InlineEditing:
    """On a grid (list-of-rows) field: cells edit in place (``ReadOnly()`` row fields stay
    display-only) and the committed rows accumulate in the form state, travelling with the next
    save. The field-level face of Java's ``@InlineEditing``."""


class RuleSupplier:
    """Implemented by a view to contribute programmatic client-side rules (the Python analogue of
    Java's ``RuleSupplier``); they complement the ``Hidden()``/``Disabled()`` marker-derived
    rules."""

    def rules(self) -> list[Rule]:
        raise NotImplementedError


@dataclass(frozen=True)
class AppHeaderAction:
    """An action button rendered on the app header, next to the ``@app_context`` selectors.
    ``action_id`` names the method of the app class to invoke (its camelCase wire id); ``icon``
    is an optional icon name. An action with ``children`` renders as a dropdown menu instead of a
    button: only the children dispatch. The Python analogue of Java's ``AppHeaderAction``."""

    action_id: str | None = None
    label: str = ""
    icon: str | None = None
    children: list["AppHeaderAction"] | None = None

    @staticmethod
    def menu(label: str, icon: str | None, children: list["AppHeaderAction"]) -> "AppHeaderAction":
        """A dropdown of actions under one header button."""
        return AppHeaderAction(action_id=None, label=label, icon=icon, children=children)


class AppActionsSupplier:
    """Implemented by an app shell to contribute action buttons to the app header, next to the
    ``@app_context`` selectors. Evaluated on every shell build, so actions can appear and
    disappear with server-side state. The Python analogue of Java's ``AppActionsSupplier``."""

    def app_actions(self) -> list[AppHeaderAction]:
        raise NotImplementedError


@dataclass
class PeerNav:
    """Lateral navigation across peer objects — the previous/next arrows in the page header (the
    Oracle Redwood "next/previous object" element). A ``None`` route on a side disables that arrow.
    The Python analogue of Java's ``PeerNav``."""

    prev_label: str | None = None
    prev_route: str | None = None
    next_label: str | None = None
    next_route: str | None = None


class PeerNavigationSupplier:
    """Implemented by a page to supply the previous/next peer-object arrows in the header. Return
    ``None`` to show no arrows. The Python analogue of Java's ``PeerNavigationSupplier``."""

    def peers(self) -> "PeerNav | None":
        raise NotImplementedError


@dataclass
class AppNotification:
    """One entry of the app shell's notification inbox (the header bell): a title, an optional
    detail text, an optional route the entry navigates to when clicked, the unread flag driving
    the bell's counter, and a human "when" caption. Serialized to the wire as
    ``{id, title, text, route, unread, when}``. The Python analogue of
    ``io.mateu.uidl.data.AppNotification``."""

    id: str
    title: str
    text: str | None = None
    route: str | None = None
    unread: bool = True
    when: str | None = None


class NotificationsSupplier:
    """Implemented by the ``@app`` class to give the shell a NOTIFICATION INBOX: a bell on the
    header with the unread count, opening a panel that lists :class:`AppNotification` s. The list
    is fetched per request (the ``_notifications-list`` app-level action), so it can be per-user
    — resolve the user from the request. Clicking an entry navigates to its route and marks it
    read; the panel's "mark all read" calls :meth:`mark_notifications_read` with all the unread
    ids. The Python analogue of Java's ``NotificationsSupplier``."""

    def notifications(self, request) -> list[AppNotification]:
        raise NotImplementedError

    def mark_notifications_read(self, ids: list[str], request) -> None:
        raise NotImplementedError


@dataclass
class GlobalSearchResult:
    """One hit of the app-wide entity search (the command palette's data results): a label, an
    optional secondary line, the route to navigate to, and an optional category caption used to
    group the palette's results ("Clientes", "Reservas"…). The Python analogue of
    ``io.mateu.uidl.data.GlobalSearchResult``."""

    label: str
    description: str | None = None
    route: str | None = None
    category: str | None = None


class GlobalSearchSupplier:
    """Implemented by the ``@app`` class to make the command palette (⌘K) search DATA, not just
    the menu: while the user types, the palette also asks the server for matching entities
    through the app-level ``_globalsearch`` action and shows the hits (grouped by category)
    alongside the navigation results; picking one navigates to its route. Keep it fast — search
    indexes or top-N per category. The Python analogue of Java's ``GlobalSearchSupplier``."""

    def global_search(self, search_text: str) -> list[GlobalSearchResult]:
        raise NotImplementedError


@dataclass
class AppShell:
    """A code-composed app shell: the chrome and the menu an :class:`AppSupplier` returns. The
    lightweight Python counterpart of Java's fluent ``AppShell`` — the fields the port's app
    metadata carries. A ``None`` field is not authored: the mapper falls back to the ``@app``
    decorator (or, for the variant, the auto heuristic) and to the first menu item for the home
    route. ``menu`` is a list of ``mateu_dtos.MenuItem`` composed in code (both leaf kinds: a route
    link with ``route`` set, a rule link with ``rules`` set, plus submenus)."""

    title: str | None = None
    menu: list = dataclass_field(default_factory=list)
    subtitle: str | None = None
    variant: str | None = None
    home_route: str | None = None


class MenuSupplier:
    """Implemented by the ``@app`` class to compose its navigation menu IN CODE at request time,
    instead of (or in addition to) the static ``@menu_item``/``@remote_menu`` decorators — for a
    menu that depends on the user, configuration, or a database. Returns the menu tree as
    ``mateu_dtos.MenuItem`` s. The Python analogue of Java's ``MenuSupplier``."""

    def menu(self) -> list:
        raise NotImplementedError


class AppSupplier:
    """Implemented by the ``@app`` class to compose the WHOLE app shell IN CODE — its chrome and its
    menu — instead of the ``@app``/``@menu_item`` decorators. Returns an :class:`AppShell`; fields
    it leaves ``None`` fall back to the decorator / the derived menu. The Python analogue of Java's
    ``AppSupplier``."""

    def get_app(self) -> AppShell:
        raise NotImplementedError
