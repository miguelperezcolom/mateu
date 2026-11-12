"""Supplier interfaces a view or app class implements (labels, rules, header actions, peer navigation, notifications, global search, app shell / menu / routes in code)."""

from __future__ import annotations

from dataclasses import (
    dataclass,
    field as dataclass_field,
)
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .components import Breadcrumb
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


class BreadcrumbsSupplier:
    """Implemented by a page to supply the breadcrumb trail shown above its content (wins over
    ``@breadcrumbs``); ``None`` declares none. The Python analogue of Java's
    ``BreadcrumbsSupplier``."""

    def breadcrumbs(self) -> "list[Breadcrumb] | None":
        raise NotImplementedError


class OverlineSupplier:
    """Implemented by a page to supply its overline (the line above the title) per request; wins
    over ``@overline``. The Python analogue of Java's ``OverlineSupplier``."""

    def overline(self) -> str | None:
        raise NotImplementedError


class TitlePlaceholderSupplier:
    """Implemented by a page to supply its title placeholder per request; wins over
    ``@title_placeholder``. The Python analogue of Java's ``TitlePlaceholderSupplier``."""

    def title_placeholder(self) -> str | None:
        raise NotImplementedError


class VisibilitySupplier:
    """Implemented by a form to hide fields per request: ``is_hidden(field_name)`` (the Python
    attribute name) True leaves the field out of the form. Java's ``VisibilitySupplier``."""

    def is_hidden(self, field_name: str) -> bool:
        return False


class ReadOnlySupplier:
    """Implemented by a form to lock fields per request (``is_read_only(field_name)``); a locked
    field is drawn read-only. Java's ``ReadOnlySupplier``."""

    def is_read_only(self, field_name: str) -> bool:
        return False


class RequiredSupplier:
    """Implemented by a form to make fields required per request (``is_required(field_name)``).
    Java's ``RequiredSupplier``."""

    def is_required(self, field_name: str) -> bool:
        return False


class ColspanSupplier:
    """Implemented by a form to size fields per request: ``colspan(field_name)`` > 0 wins over a
    ``Colspan()`` marker. Java's ``ColspanSupplier``."""

    def colspan(self, field_name: str) -> int:
        return 0


class PostHydrationHandler:
    """Implemented by a view to run code once its state was bound from the request (derived
    fields, normalisation): ``on_hydrated()``. Java's ``PostHydrationHandler``."""

    def on_hydrated(self) -> None:
        return None


class HeaderSupplier:
    """Implemented by a page to supply its header blocks in code (wins over ``Header()`` fields);
    returns fluent components. The Python analogue of Java's ``HeaderSupplier``."""

    def header(self) -> list:
        raise NotImplementedError


class FooterSupplier:
    """Implemented by a page to supply its footer blocks in code (wins over ``Footer()`` fields).
    The Python analogue of Java's ``FooterSupplier``."""

    def footer(self) -> list:
        raise NotImplementedError


class AvatarSupplier:
    """Implemented by a page to supply its avatar block in code (wins over an ``Avatar()``
    field). The Python analogue of Java's ``AvatarSupplier``."""

    def avatar(self):
        raise NotImplementedError


@dataclass
class AppNotification:
    """One entry of the app shell's notification inbox (the header bell): a title, an optional
    detail text, an optional route the entry navigates to when clicked, the unread flag driving
    the bell's counter, and a human "when" caption. Serialized to the wire as
    ``{id, title, text, route, unread, when, category, variant, resolved, actions, hasDetail}``.

    An entry can also say what it is about and what can be done from it (EXPERIMENTAL): a
    ``category`` the inbox groups by, a ``variant`` (severity: success, info, warning, error,
    contrast), ``actions`` (``MessageAction`` s run by :meth:`NotificationsSupplier.on_notification_action`,
    which usually marks it ``resolved``) and ``has_detail`` when clicking it should ask
    :meth:`NotificationsSupplier.notification_detail` instead of navigating to ``route``. The ``id``
    deduplicates. The Python analogue of ``io.mateu.uidl.data.AppNotification``."""

    id: str
    title: str
    text: str | None = None
    route: str | None = None
    unread: bool = True
    when: str | None = None
    category: str | None = None
    variant: str | None = None
    resolved: bool = False
    actions: list = dataclass_field(default_factory=list)
    has_detail: bool = False

    def to_json(self) -> dict:
        """The entry on the wire (Java's AppNotification JSON shape)."""
        variant = getattr(self.variant, "value", self.variant)
        return {
            "id": self.id, "title": self.title, "text": self.text,
            "route": self.route, "unread": self.unread, "when": self.when,
            "category": self.category, "variant": variant, "resolved": self.resolved,
            "actions": [a.to_wire().model_dump(by_alias=True, mode="json") for a in self.actions],
            "hasDetail": self.has_detail,
        }

    def to_wire(self):
        """The entry as an ``AppNotificationDto`` (the NotificationsChanged push)."""
        from mateu_ui.dtos import AppNotificationDto

        return AppNotificationDto(
            id=self.id, title=self.title, text=self.text, route=self.route, unread=self.unread,
            when=self.when, category=self.category,
            variant=getattr(self.variant, "value", self.variant), resolved=self.resolved,
            actions=[a.to_wire() for a in self.actions], has_detail=self.has_detail,
        )


class NotificationsSupplier:
    """Implemented by the ``@app`` class to give the shell a NOTIFICATION INBOX: a bell on the
    header with the unread count, opening a panel that lists :class:`AppNotification` s. The list
    is fetched per request (the ``_notifications-list`` app-level action), so it can be per-user
    — resolve the user from the request. Clicking an entry navigates to its route (or opens its
    detail) and marks it read; the panel's "mark all read" calls :meth:`mark_notifications_read`
    with all the unread ids. The panel groups by ``category``, filters (unread / all / resolved),
    dismisses (:meth:`dismiss_notifications`) and runs entries' actions
    (:meth:`on_notification_action`); ``LiveNotifications.publish`` pushes changes to open
    sessions. Every id the panel sends back comes from the browser: check it belongs to the caller.
    The Python analogue of Java's ``NotificationsSupplier``."""

    def notifications(self, request) -> list[AppNotification]:
        raise NotImplementedError

    def mark_notifications_read(self, ids: list[str], request) -> None:
        raise NotImplementedError

    def on_notification_action(self, id: str, action_id: str, request):
        """Runs one of an entry's actions (``_notifications-act``) — approve, reject, assign… and
        mark it resolved. Its return is answered like any action's result; the refreshed list
        follows. Not overridden: refused (EXPERIMENTAL)."""
        from .messages import UserFacingException

        raise UserFacingException("This notification has no actions")

    def dismiss_notifications(self, ids: list[str], request) -> None:
        """Removes entries from the caller's inbox (``_notifications-dismiss``). Not overridden:
        nothing (EXPERIMENTAL)."""

    def notification_detail(self, id: str, request):
        """The detail of an entry with ``has_detail`` (``_notifications-open``): typically a
        Drawer or a Dialog. None: nothing opens (EXPERIMENTAL)."""
        return None


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
    route. ``menu`` is a list of ``mateu_ui.dtos.MenuItem`` composed in code (both leaf kinds: a route
    link with ``route`` set, a rule link with ``rules`` set, plus submenus)."""

    title: str | None = None
    menu: list = dataclass_field(default_factory=list)
    subtitle: str | None = None
    variant: str | None = None
    home_route: str | None = None
    #: App-wide shortcuts / quick-launch codes (twin of ``@app_shortcut``), added before the
    #: decorator's (EXPERIMENTAL).
    shortcuts: list["AppShortcutEntry"] = dataclass_field(default_factory=list)
    #: Live header values with their initial value (twin of ``HeaderValuesSupplier``).
    header_values: list["HeaderValue"] = dataclass_field(default_factory=list)
    #: The live event stream (twin of ``@app(live_updates)``); None = the decorator.
    live_updates: bool | None = None
    #: The idle-session warning (twins of ``@app(idle_*)``); None = the decorator.
    idle_timeout_minutes: int | None = None
    idle_warning_seconds: int | None = None
    idle_sign_out_url: str | None = None
    #: The way back up from this app (twin of ``@app(back_link)``: ``"PARENT"`` / ``BackLink.PARENT``
    #: draws one "← Parent" link instead of the breadcrumb trail); None = the decorator decides.
    back_link: str | None = None
    #: Record presence (twin of ``@app(presence)``); None = the decorator (EXPERIMENTAL).
    presence: bool | None = None


class MenuSupplier:
    """Implemented by the ``@app`` class to compose its navigation menu IN CODE at request time,
    instead of (or in addition to) the static ``@menu_item``/``@remote_menu`` decorators — for a
    menu that depends on the user, configuration, or a database. Returns the menu tree as
    ``mateu_ui.dtos.MenuItem`` s. The Python analogue of Java's ``MenuSupplier``."""

    def menu(self) -> list:
        raise NotImplementedError


class HomeRouteSupplier:
    """Implemented by the ``@app`` class to name the route the app opens on (its home page) — one
    of its menu routes, mount-relative, e.g. ``"home"``. Without it a ``@menu_item`` app declares no
    home and its root shows an empty content area until a menu entry is picked. An
    :class:`AppSupplier` shell's own ``home_route`` wins over it. The Python analogue of Java's
    ``HomeRouteSupplier``."""

    def home_route(self) -> str:
        raise NotImplementedError


class AppSupplier:
    """Implemented by the ``@app`` class to compose the WHOLE app shell IN CODE — its chrome and its
    menu — instead of the ``@app``/``@menu_item`` decorators. Returns an :class:`AppShell`; fields
    it leaves ``None`` fall back to the decorator / the derived menu. The Python analogue of Java's
    ``AppSupplier``."""

    def get_app(self) -> AppShell:
        raise NotImplementedError


class GroupActionVisibility:
    """Implemented by a listing / crud whose ``@group_action`` buttons are not always applicable:
    asked per group and per action, the group header row only shows the actions answering True
    (Java's ``GroupActionVisibility``)."""

    def group_action_visible(self, method_name: str, group_value: str) -> bool:
        raise NotImplementedError


@dataclass(frozen=True)
class AppShortcutEntry:
    """An app-wide keyboard shortcut / quick-launch code as DATA — the twin of ``@app_shortcut``
    for a code-authored shell (``AppShell.shortcuts``). A ``key`` and/or a ``code``; a ``route``
    or an ``action_id`` (EXPERIMENTAL; mirrors Java's ``AppShortcutEntry``)."""

    key: str | None = None
    route: str | None = None
    action_id: str | None = None
    label: str | None = None
    code: str | None = None


@dataclass(frozen=True)
class HeaderValue:
    """A LIVE value on the app header ("Business date: 12 Oct") the server can change while the app
    is open: ``UICommand.update_header_value`` from an action (every tab of that browser follows),
    or ``LiveHeaderValues.publish`` for every session when the app has ``@app(live_updates=True)``
    (EXPERIMENTAL; mirrors Java's ``HeaderValue``)."""

    id: str
    label: str | None = None
    value: str | None = None


class HeaderValuesSupplier:
    """Implemented by the ``@app`` class to put live values on the header; read when the shell is
    built (EXPERIMENTAL; mirrors Java's ``HeaderValuesSupplier``)."""

    def header_values(self) -> list[HeaderValue]:
        raise NotImplementedError


class KeepAliveHandler:
    """Implemented by the ``@app`` class to hook the idle warning's "Stay signed in": called on the
    ``_keep-alive`` app-level action (EXPERIMENTAL; mirrors Java's ``KeepAliveHandler``). Mateu does
    no authentication — what "signed in" means is the app's."""

    def keep_alive(self) -> None:
        raise NotImplementedError
