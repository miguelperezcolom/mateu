"""Class-level decorators (the analogue of Java's class annotations: @UI, @Title, @App, @Zones, ...)."""

from __future__ import annotations

import warnings
from dataclasses import dataclass
from enum import Enum
from typing import Callable

from ._enums import check_choice, coerce_enum
from .messages import BannerTheme


# ── Method-level feature descriptors (set by decorators) ───────────────────────
@dataclass(frozen=True)
class _Banner:
    theme: BannerTheme
    title: str | None


@dataclass(frozen=True)
class PageBanner:
    """An action-returned page banner (shown below the header). Return one, or a list, from an
    @action/@toolbar method."""
    theme: BannerTheme = BannerTheme.INFO
    title: str | None = None
    description: str | None = None
    closeable: bool = False
    timeout_seconds: int = 0


@dataclass(frozen=True)
class PageBanners:
    """Action-returned page banners with an explicit mode (Java's ``PageBanners``):
    ``PageBanners.replace(...)`` swaps the banners earlier actions showed (what a bare
    ``PageBanner`` / list does), ``PageBanners.append(...)`` adds to them."""
    banners: tuple = ()
    appending: bool = False

    @staticmethod
    def replace(*banners: "PageBanner") -> "PageBanners":
        return PageBanners(tuple(banners), False)

    @staticmethod
    def append(*banners: "PageBanner") -> "PageBanners":
        return PageBanners(tuple(banners), True)


@dataclass(frozen=True)
class _Fab:
    icon: str
    label: str | None
    order: int


@dataclass(frozen=True)
class _ListToolbarButton:
    label: str | None
    confirmation_required: bool
    rows_selected_required: bool


# ── Class-level decorators ─────────────────────────────────────────────────────
def ui(route: str = "") -> Callable[[type], type]:
    def deco(cls: type) -> type:
        setattr(cls, "__mateu_ui__", route)
        return cls

    return deco


def title(value: str) -> Callable[[type], type]:
    def deco(cls: type) -> type:
        setattr(cls, "__mateu_title__", value)
        return cls

    return deco


def wizard_progress(style: str) -> Callable[[type], type]:
    """Chooses how a Wizard visualizes its progress: "bar" (default), "steps" — connected
    step bullets (the ProgressSteps component) — or "rail" — a sticky right-hand rail with a
    ``current | total`` counter over the vertical step list. (Python analogue of Java's
    @WizardProgress.)"""

    style = check_choice(
        str(style).lower(), ("bar", "steps", "rail"), "@wizard_progress(style)"
    )

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_wizard_progress__", style)
        return cls

    return deco


class PageWidth(Enum):
    """How a page's content column is sized within the viewport (the first parameter of the
    Oracle Redwood page templates): FIXED caps the column (1392px in Redwood) and centers it,
    FULL_WIDTH keeps side margins (24px, growing to 96px on wide screens) but never caps, EDGE_TO_EDGE touches the viewport edges
    (full-bleed canvases such as gantt charts or planning boards). The member values are the
    wire names. The Python analogue of Java's PageWidthStyle."""

    FIXED = "fixed"
    FULL_WIDTH = "fullWidth"
    EDGE_TO_EDGE = "edgeToEdge"


class SizeMode(Enum):
    """How a component is sized within the space its parent gives it (coherence-plan #8):
    HUG sizes to content, FILL grows to fill the space and scrolls internally, FIXED takes a
    concrete size. The Python analogue of Java's SizeMode."""

    HUG = "hug"
    FILL = "fill"
    FIXED = "fixed"


def size(mode: SizeMode, length: str = "") -> Callable[[type], type]:
    """Class-level: the explicit sizing intent (coherence-plan #8) — the override for the inferred
    default (a listing infers fill). On a view it sizes the whole surface, e.g. a full-canvas
    screen that fills the viewport and scrolls internally. The Python analogue of Java's @Size."""

    mode = coerce_enum(mode, SizeMode, "@size(mode)")
    wire = "fixed:" + length if mode == SizeMode.FIXED else mode.value

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_size__", wire)
        return cls

    return deco


def page_width(width: PageWidth) -> Callable[[type], type]:
    """Class-level: explicitly sets how the page's content column is sized within the viewport
    (the first parameter of the Oracle Redwood page templates). When absent the renderer infers
    the width from the page content (full-bleed canvases → edge-to-edge, dense inline-editing
    datagrids → full width, anything else → fixed). The Python analogue of Java's @PageWidth."""

    value = coerce_enum(width, PageWidth, "@page_width(width)").value

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_page_width__", value)
        return cls

    return deco


class PageType(Enum):
    """The coarse page type — which family of Oracle Redwood page templates the view belongs
    to: LANDING (welcome / hero-search pages), COLLECTION (cruds, listings, smart searches, todo
    lists, calendars, collection details), DETAIL (foldouts, item/general overviews), FORM (a
    plain reflected form), PROCESS (guided wizards) or DASHBOARD. The member values are the
    wire names. The Python analogue of Java's PageType."""

    LANDING = "landing"
    COLLECTION = "collection"
    DETAIL = "detail"
    FORM = "form"
    PROCESS = "process"
    DASHBOARD = "dashboard"


def page_template(page_type: PageType) -> Callable[[type], type]:
    """Class-level: explicitly sets the view's coarse page type (the family of Oracle Redwood
    page templates the renderer picks from). When absent the backend infers the type from the
    view's shape (archetype base class, a MetricCard field, plain form). The explicit template
    always wins over the inference. The Python analogue of Java's @PageTemplate."""

    value = coerce_enum(page_type, PageType, "@page_template(page_type)").value

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_page_type__", value)
        return cls

    return deco


def rest_listing(
    url: str = "",
    method: str = "GET",
    headers: tuple[str, ...] = (),
    body: str = "",
    items_path: str = "",
    proxy: bool = False,
    source: str = "",
) -> Callable[[type], type]:
    """Class-level: fills a listing's ROWS from an arbitrary (non-Mateu) REST endpoint, fetched
    CLIENT-SIDE. The renderer calls ``url`` directly, navigates ``items_path`` to the array in the
    JSON response and maps each item into a row by reading each COLUMN by its field name. Put it on
    a class implementing ``Listing[Row]``; its columns come from the Row type as usual and its
    ``search`` is never called. ``url``/``headers``/``body`` support ``${state.x}`` interpolation
    (including ``${searchText}``/``${page}``/``${size}``). ``source`` names a catalogue entry instead
    of an inline url (the values declared here still win). Python analogue of Java's @RestListing."""

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_rest_listing__", (url, method, headers, body, items_path, proxy, source))
        return cls

    return deco


def rest_action(
    url: str = "",
    method: str = "POST",
    headers: tuple[str, ...] = (),
    body: str = "",
    success_message: str = "",
    result_path: str = "",
    proxy: bool = False,
    source: str = "",
) -> Callable[[Callable], Callable]:
    """Method-level: makes a button call an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE instead
    of dispatching to the Mateu server. On click the renderer calls ``url`` directly with the
    interpolated ``body``, then applies the response — shows ``success_message`` as a toast and,
    when ``result_path`` is set, merges the object at that path in the JSON response into the form
    state (so bound fields refresh). Put it on a method that is ALSO a ``@button``/``@toolbar``;
    ``url``/``headers``/``body`` support ``${state.x}`` interpolation. Python analogue of Java's
    @RestAction."""

    def deco(fn: Callable) -> Callable:
        setattr(
            fn,
            "__mateu_rest_action__",
            (url, method, headers, body, success_message, result_path, proxy, source),
        )
        return fn

    return deco


def rest_data(
    url: str = "",
    method: str = "GET",
    headers: tuple[str, ...] = (),
    body: str = "",
    result_path: str = "",
    proxy: bool = False,
    source: str = "",
) -> Callable[[type], type]:
    """Class-level: loads a screen's initial data from an arbitrary (non-Mateu) REST endpoint,
    fetched CLIENT-SIDE on entry. When the view mounts the renderer calls ``url`` directly and
    merges the object at ``result_path`` in the JSON response into the form state, so the fields
    arrive populated. Reuses the @rest_action machinery (a synthetic ``__restdata__`` action + an
    OnLoad trigger). ``url``/``headers``/``body`` support ``${state.x}`` interpolation. Python
    analogue of Java's @RestData."""

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_rest_data__", (url, method, headers, body, result_path, proxy, source))
        return cls

    return deco


def welcome_banner(
    title: str = "", subtitle: str = "", image: str = "", tone=None, overline: str = ""
) -> Callable[[type], type]:
    """Class-level: prepends the Redwood "Welcome Banner" element to the page content — a
    centered HeroSection (id "welcome-banner") with the given title (empty → the page title),
    subtitle and background image. ``tone`` (a ``HeroTone`` or its name; None/auto = the default
    look) paints a dark tinted band; ``overline`` is a short line above the title (empty for
    none). The Python analogue of Java's ``@WelcomeBanner``."""

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_welcome_banner__", (title, subtitle, image))
        setattr(cls, "__mateu_welcome_banner_tone__", tone)
        setattr(cls, "__mateu_welcome_banner_overline__", overline)
        return cls

    return deco


def subtitle(value: str) -> Callable[[type], type]:
    def deco(cls: type) -> type:
        setattr(cls, "__mateu_subtitle__", value)
        return cls

    return deco


def overline(value: str) -> Callable[[type], type]:
    """The small line of text shown ABOVE the page title (the Oracle Redwood ``overlineText``
    header element) — a category, a parent context or a step marker. Mirrors Java's ``@Overline``.
    """

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_overline__", value)
        return cls

    return deco


def title_placeholder(value: str) -> Callable[[type], type]:
    """What the header shows while the title is still empty (the Oracle Redwood
    ``pageTitlePlaceholder`` header element) — the create-mode affordance, e.g. "New booking…".
    A placeholder, not a default: it never overrides a title. Mirrors Java's ``@TitlePlaceholder``.
    """

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_title_placeholder__", value)
        return cls

    return deco


class AppVariant(str, Enum):
    """The navigation chrome of an ``@app`` — the Python mirror of Java's ``AppVariant`` enum. A
    ``str`` enum, so a plain string still works wherever a variant is expected. ``AUTO`` ("") lets
    Mateu pick from the menu shape."""

    AUTO = ""
    HAMBURGER_MENU = "HAMBURGER_MENU"
    HAMBURGER_SECTIONS = "HAMBURGER_SECTIONS"
    MENU_ON_LEFT = "MENU_ON_LEFT"
    MENU_ON_TOP = "MENU_ON_TOP"
    TABS = "TABS"
    TILES = "TILES"
    RAIL = "RAIL"

    @staticmethod
    def to_wire(variant: str) -> str:
        """The value a variant travels under on the wire. Since 3.0-alpha.412 both
        ``HAMBURGER_MENU`` and the old misspelling ``HAMBURGUER_MENU`` travel as
        ``HAMBURGER_MENU`` (the renderers accept both), as Java's AppMapper does; anything else
        travels unchanged."""
        value = variant.value if isinstance(variant, AppVariant) else variant
        return AppVariant.HAMBURGER_MENU.value if value == "HAMBURGUER_MENU" else value


#: The misspelled variant still accepted by ``@app(variant=...)`` (with a DeprecationWarning).
_DEPRECATED_VARIANTS = {"HAMBURGUER_MENU": AppVariant.HAMBURGER_MENU}


def app(
    title_: str,
    variant: str | AppVariant = "",
    command_center: bool = False,
    chromeless: bool = False,
    access_keys: bool = False,
    requires: list[str] | None = None,
    theme_toggle: bool = False,
    route: str = "",
    live_updates: bool = False,
    idle_timeout_minutes: int = 0,
    idle_warning_seconds: int = 60,
    idle_sign_out_url: str = "",
    mobile_qr: bool = False,
) -> Callable[[type], type]:
    """Application shell. ``variant`` = "" for auto (Java's @App(AUTO) decision table: grouped
    menu → MENU_ON_TOP, more than 7 top-level entries → HAMBURGER_MENU, flat leaf menu → TABS),
    or an explicit :class:`AppVariant` (TABS | MENU_ON_TOP | MENU_ON_LEFT | HAMBURGER_MENU |
    HAMBURGER_SECTIONS | TILES | RAIL), which always wins. The old misspelling
    ``"HAMBURGUER_MENU"`` still works but is deprecated (it warns).

    ``command_center=True`` shows the always-present command-center FAB (the Ask-Oracle pattern):
    a floating button opening a full-screen palette that unifies navigation, global entity search
    (when the app implements ``GlobalSearchSupplier``), recent screens and the AI assistant.
    ``chromeless=True`` additionally drops the nav chrome — the command center becomes the only
    navigation, so it implies ``command_center``.

    ``access_keys=True`` turns on the keyboard access-keys mode: holding Alt shows a key next to
    every visible button and tab (the declared shortcut, else a letter of its label assigned
    automatically) and Alt+that letter activates it. Mirrors Java's ``@App(accessKeys = true)``.

    ``theme_toggle=True`` draws a light/dark switch on the app header (the choice is remembered in
    the browser). Mirrors Java's ``@App(themeToggle = true)``.

    ``mobile_qr=True`` (EXPERIMENTAL, mobile app) adds the "Open on mobile" header action: a dialog
    with the QR that adds this UI to the Mateu mobile app (``https://mateu.io/add?u=…``), or an
    "Open in the Mateu app" link on a phone. Mirrors Java's ``@App(mobileQr = true)``.

    ``requires`` DECLARES extra capability tokens the app needs from its host renderer, for
    anything the derivation cannot see (most tokens are derived from the app's own metadata). They
    ride, sorted+deduped with the derived ones, on ``AppMetadata.requiredCapabilities`` — the
    Python mirror of Java's ``@App(requires = {...})``.

    ``live_updates=True`` keeps one app event stream per browser through which the server pushes
    header-value changes to every session (``LiveHeaderValues.publish``). ``idle_timeout_minutes``
    (> 0) turns on the idle-session warning: after that idleness (any tab) a modal counts down
    ``idle_warning_seconds``; "Stay signed in" runs ``_keep-alive`` (``KeepAliveHandler``), "Sign
    out" goes to ``idle_sign_out_url`` (blank = the app's route). EXPERIMENTAL; mirror Java's
    ``@App(liveUpdates, idleTimeoutMinutes, idleWarningSeconds, idleSignOutUrl)``."""

    raw = variant.value if isinstance(variant, AppVariant) else variant
    if raw in _DEPRECATED_VARIANTS:
        warnings.warn(
            f'@app(variant="{raw}") is deprecated: use AppVariant.{_DEPRECATED_VARIANTS[raw].name} '
            "instead (the old misspelling still renders the same).",
            DeprecationWarning,
            stacklevel=2,
        )
        raw = _DEPRECATED_VARIANTS[raw].value
    raw = coerce_enum(raw, AppVariant, "@app(variant)").value

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_app__", title_)
        setattr(cls, "__mateu_app_variant__", raw)
        setattr(cls, "__mateu_app_command_center__", command_center)
        setattr(cls, "__mateu_app_chromeless__", chromeless)
        setattr(cls, "__mateu_app_access_keys__", access_keys)
        setattr(cls, "__mateu_app_theme_toggle__", theme_toggle)
        setattr(cls, "__mateu_app_mobile_qr__", mobile_qr)
        setattr(cls, "__mateu_app_requires__", list(requires) if requires else [])
        setattr(cls, "__mateu_app_live_updates__", live_updates)
        setattr(cls, "__mateu_app_idle__", (idle_timeout_minutes, idle_warning_seconds, idle_sign_out_url))
        # coherence-plan #5: @app(route="/x") declares BOTH that the class is an app AND its route —
        # the single decorator, equivalent to @ui("/x") @app(...). Blank = the route comes from a
        # separate @ui on the same class; when both are set, @app(route) wins (see MateuRegistry).
        if route:
            setattr(cls, "__mateu_app_route__", route)
        return cls

    return deco


def app_shortcut(
    key: str = "",
    route: str = "",
    action_id: str = "",
    label: str = "",
    code: str = "",
) -> Callable[[type], type]:
    """An APP-WIDE keyboard shortcut on the ``@app`` class: active on every screen, listed in the
    "Keyboard shortcuts" overlay (``?``) and the command palette. It goes to ``route`` (relative to
    the app) or runs the app-level ``action_id`` (a method of the app class); ``code`` is a
    QUICK-LAUNCH code typed in the palette ("RES" + Enter). A screen's own shortcut on the same key
    wins. Stackable, in declaration order (EXPERIMENTAL; mirrors Java's ``@AppShortcut``)."""

    def deco(cls: type) -> type:
        entries = list(getattr(cls, "__mateu_app_shortcuts__", []))
        # decorators apply bottom-up: prepend so the list keeps the order they are written in
        entries.insert(0, (key, route, action_id, label, code))
        setattr(cls, "__mateu_app_shortcuts__", entries)
        return cls

    return deco


def remote_menu(label: str, base_url: str, route: str = "", explode: bool = False) -> Callable[[type], type]:
    """A FEDERATED menu entry on the ``@app`` class: the option points at another Mateu backend
    by base URL — the frontend fetches the remote app's menu itself and mounts its views, so
    several services compose into one shell at runtime. With ``explode=True`` the remote menu's
    entries are inlined at this level instead of nesting under ``label``. Repeatable. The Python
    analogue of Java's ``RemoteMenu``."""

    def deco(cls: type) -> type:
        entries = list(getattr(cls, "__mateu_remote_menus__", []))
        entries.append((label, base_url, route, explode))
        setattr(cls, "__mateu_remote_menus__", entries)
        return cls

    return deco


def ai(sse: str) -> Callable[[type], type]:
    """AI chat on the app: a floating button opens a chat panel that streams its answers from the
    given Server-Sent-Events endpoint. The endpoint is yours to implement — the panel POSTs
    ``{message, sessionId, menuContext?}`` with ``Accept: text/event-stream`` and renders the
    ``data:`` chunks as the streamed reply. The Python analogue of Java's ``@AI``."""

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_ai_sse__", sse)
        return cls

    return deco


def app_context(label: str = "") -> Callable:
    """Application-level context selector on the app header (the active hotel, the company…).

    Put it on a zero-arg method of the app class returning the options (a list of
    ``Option(value=…, label=…)`` objects or ``(value, label)`` tuples), or annotate the method's
    return type as an Enum (its members become the options). The picked value is sent in the app
    state of every request under the method's name."""

    def deco(fn):
        setattr(fn, "__mateu_app_context__", label)
        return fn

    return deco


def compact(cls: type) -> type:
    setattr(cls, "__mateu_compact__", True)
    return cls


def static_view(cls: type) -> type:
    """Class-level: the view's FULL response — structure and data — never varies per request, user
    or time. The client caches the whole response for the session and skips the server round-trip
    on return visits (the last step of the client structure cache). A developer promise, like
    ``@action_options(idempotent=…)``; do NOT use it where content depends on data, the user,
    permissions, time or live-state interpolation. Mirrors io.mateu's ``@StaticView``."""
    setattr(cls, "__mateu_static_view__", True)
    return cls


def auto_layout(arg=True):
    """Class-level: let Mateu infer the UX patterns (folded optionals, tabs, radio enums…) from
    the amount and structure of the declared information. Explicit layout markers always win —
    inference only fills the gaps the developer left open. ``@auto_layout(False)`` opts out.
    The Python analogue of Java's ``@AutoLayout``."""
    if isinstance(arg, type):  # used bare: @auto_layout
        setattr(arg, "__mateu_auto_layout__", True)
        return arg

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_auto_layout__", bool(arg))
        return cls

    return deco


def auto_page(arg=True):
    """Class-level: let Mateu infer the page ARCHETYPE from the declared information — the
    page-altitude sibling of ``@auto_layout`` (the Python analogue of Java's ``@AutoPage``).
    A plain class declaring MetricCard fields composes the Dashboard archetype; a class
    declaring only Button fields and panel components composes the Welcome landing. Explicit
    always wins (archetype subclasses are never rewritten); ``@auto_page(False)`` opts out."""
    if isinstance(arg, type):  # used bare: @auto_page
        setattr(arg, "__mateu_auto_page__", True)
        return arg

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_auto_page__", bool(arg))
        return cls

    return deco


def read_only(cls: type) -> type:
    """Class-level: render every field of the view as read-only (the analogue of Java's
    ``@ReadOnly``). Also enables the read-only-only layout inference (sections as tabs)."""
    setattr(cls, "__mateu_read_only__", True)
    return cls


def confirm_on_navigation_if_dirty(cls: type) -> type:
    setattr(cls, "__mateu_confirm_dirty__", True)
    return cls


def edit_in_drawer(cls: type) -> type:
    """Class-level, on a Crud view: New and row clicks open the create/edit form in a Drawer
    sliding over the listing (the Redwood "Create and Edit - Drawer" template) instead of
    navigating to the /new — /{id}/edit routes; saving persists, closes the drawer and re-runs
    the listing's search in place. The analogue of Java's ``Crud.editInDrawer()``."""
    setattr(cls, "__mateu_edit_in_drawer__", True)
    return cls


def inline_editing(cls: type) -> type:
    """Class-level, on a Crud view: every data column of the table listing becomes an in-place
    editor (``ReadOnly()`` fields stay display-only); each committed cell persists its row
    immediately through the crud's update-row action. The analogue of Java's ``@InlineEditing``."""
    setattr(cls, "__mateu_inline_editing__", True)
    return cls


def zones(*zone_list: tuple[str, str] | str):
    """Class-level multi-column form layout: declare the columns (order matters) and assign each
    ``Section(caption, zone=...)`` to one — the sections lay out side by side, each zone a
    vertical column of its section cards. Each zone is ``(name, width)`` (width like ``"64%"``
    fixes the column) or just ``name`` (shares the remaining space). The Python analogue of
    Java's ``@Zones``/``@Zone``."""

    normalized = [(z, "") if isinstance(z, str) else (z[0], z[1]) for z in zone_list]

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_zones__", normalized)
        return cls

    return deco


def folded_layout(cls: type) -> type:
    """Class-level: lays the form's section cards out side by side in one horizontal row (equal
    shares) instead of stacking them. ``@zones`` columns take precedence when both are declared.
    The Python analogue of Java's ``@FoldedLayout``."""
    setattr(cls, "__mateu_folded_layout__", True)
    return cls


class LabelsAsideMode(Enum):
    """Where a form's field labels sit: ``AUTO`` lets Mateu infer it from the form's shape
    (labels aside only for dense single-column forms of short-labelled, single-line widgets),
    ``ASIDE``/``TOP`` force it. The Python analogue of Java's ``LabelsAsideMode``."""

    AUTO = "auto"
    ASIDE = "aside"
    TOP = "top"


def form_layout(columns: int = 0, labels_aside: LabelsAsideMode = LabelsAsideMode.AUTO):
    """Class-level form layout declaration: fixes the form's column count and where the field
    labels sit. ``columns=0`` (the default) leaves the count to Mateu — ONE column up to 6
    visible fields, TWO from 7 on; any explicit value ≥ 1 wins (``columns=2`` keeps the
    two-column look of a small form). The explicit ``labels_aside=ASIDE|TOP`` always wins over the inference; with the
    default ``AUTO`` Mateu infers it from the form's shape. The Python analogue of Java's
    ``@FormLayout``."""

    mode = coerce_enum(labels_aside, LabelsAsideMode, "@form_layout(labels_aside)")

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_form_layout_columns__", columns)
        setattr(cls, "__mateu_labels_aside__", mode)
        return cls

    return deco


def toc(arg=True):
    """Sticky right-hand index (table of contents) on long docs-style pages: lists every section
    title, click scroll-jumps, the active entry highlights on scroll. Tri-state like Java's
    ``@Toc``: absent → the renderer decides (auto), ``@toc`` / ``@toc(True)`` → force on,
    ``@toc(False)`` → suppress."""
    if isinstance(arg, type):  # bare @toc
        setattr(arg, "__mateu_toc__", True)
        return arg

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_toc__", bool(arg))
        return cls

    return deco


def plain_text(cls: type) -> type:
    """Class-level: render every field as read-only plain text."""
    setattr(cls, "__mateu_plain_text__", True)
    return cls


def emits(name: str) -> Callable[[type], type]:
    def deco(cls: type) -> type:
        setattr(cls, "__mateu_emits__", name)
        return cls

    return deco


class SubscriptionSource(Enum):
    """Where a :func:`subscribe_to` listens: ``DOCUMENT`` = the global bus (reaches sibling and
    unrelated components), ``COMPONENT`` = the bus filtered by the emitter's :func:`emits` name
    (``from_``), ``SELF`` = only events bubbling up from the component's own descendants. Mirrors
    ``io.mateu.uidl.annotations.SubscriptionSource``."""

    DOCUMENT = "DOCUMENT"
    COMPONENT = "COMPONENT"
    SELF = "SELF"


def subscribe_to(
    event: str,
    action: str,
    *,
    source: SubscriptionSource | str = SubscriptionSource.DOCUMENT,
    from_: str = "",
    condition: str = "",
) -> Callable[[type], type]:
    """Runs ``action`` (a method of the view) when the named custom event fires — on the global
    bus by default; ``source``/``from_``/``condition`` as Java's ``@SubscribeTo``."""
    src = source.value if isinstance(source, SubscriptionSource) else SubscriptionSource(str(source).upper()).value

    def deco(cls: type) -> type:
        subs = list(getattr(cls, "__mateu_subscriptions__", ()))
        subs.append((event, action))
        setattr(cls, "__mateu_subscriptions__", subs)
        # kept apart from the (event, action) pairs, which other code unpacks as pairs
        options = dict(getattr(cls, "__mateu_subscription_options__", {}))
        options[(event, action)] = (src, from_, condition)
        setattr(cls, "__mateu_subscription_options__", options)
        return cls

    return deco


class TriggerType(Enum):
    """When a :func:`trigger` fires (mirrors ``io.mateu.uidl.annotations.TriggerType``)."""

    on_load = "OnLoad"
    on_success = "OnSuccess"
    on_error = "OnError"
    on_value_change = "OnValueChange"
    on_custom_event = "OnCustomEvent"


@dataclass(frozen=True)
class TriggerSpec:
    """One :func:`trigger` declaration as stored on the class."""

    type: TriggerType
    action: str
    called_action: str = ""
    property_name: str = ""
    event_name: str = ""
    condition: str = ""
    timeout_millis: int = 0
    times: int = 1
    background: bool = False


def trigger(
    when: TriggerType | str,
    action: str,
    *,
    called_action: str = "",
    property_name: str = "",
    event_name: str = "",
    condition: str = "",
    timeout_millis: int = 0,
    times: int = 1,
    background: bool = False,
) -> Callable[[type], type]:
    """Runs ``action`` (a method of the view) when ``when`` happens — the Python analogue of Java's
    ``@Trigger``: ``on_load`` (with ``timeout_millis`` and ``times`` — 0 = unbounded — a periodic
    refresh), ``on_success`` / ``on_error`` of ``called_action`` (chained actions, polls),
    ``on_value_change`` of ``property_name`` (any field when blank), ``on_custom_event`` of
    ``event_name`` (listening on the component itself; :func:`subscribe_to` is the bus form).
    Method names become camelCase action ids, as everywhere."""
    kind = when if isinstance(when, TriggerType) else TriggerType(when)
    spec = TriggerSpec(
        kind, action, called_action, property_name, event_name, condition, timeout_millis, times, background
    )

    def deco(cls: type) -> type:
        # decorators apply bottom-up: prepend, so the declared order is the wire order
        setattr(cls, "__mateu_triggers__", [spec, *getattr(cls, "__mateu_triggers__", ())])
        return cls

    return deco


def secured(permission: str) -> Callable[[type], type]:
    """Restricts a view to callers holding ``permission``. Before 3.0-alpha.412 nothing read it, so
    a view carrying it was open to everyone; it is now ENFORCED with exactly the semantics of
    ``@eyes_only(permissions=[permission])`` — the view and its actions are refused (403) to a
    caller without the permission or with no principal, and the menu entries leading to it are
    hidden. Deprecated: use ``@eyes_only``, which also takes roles, groups and scopes."""
    warnings.warn(
        "@secured is enforced as @eyes_only(permissions=[...]): use "
        "@eyes_only(permissions=[...]) on the class instead.",
        DeprecationWarning,
        stacklevel=2,
    )
    from .security import EyesOnly

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_secured__", permission)
        # the gate the access checks read (mateu_ui.core.action_guard.class_gates)
        setattr(cls, "__mateu_secured_gate__", EyesOnly(permissions=(permission,)))
        return cls

    return deco


def mobile_app(
    name: str = "",
    short_name: str = "",
    icon: str = "",
    theme_color: str = "",
    min_app_version: str = "",
    oidc_issuer: str = "",
    oidc_client_id: str = "",
    scopes: list[str] | None = None,
) -> Callable[[type], type]:
    """EXPERIMENTAL (mobile app, 3.0 beta): what the UI manifest (``GET <base>/mateu/v3/manifest``)
    tells the generic Mateu mobile app about this app. Mirrors Java's ``@MobileApp``.

    Every value is optional; a blank one falls back (name → the ``@app`` title, short_name → name,
    min_app_version → "1.0.0", scopes → openid + profile). The ``MATEU_MOBILE_*`` environment
    variables (``MATEU_MOBILE_OIDC_ISSUER``, ``MATEU_MOBILE_OIDC_CLIENT_ID`` …) WIN over these, so
    the identity provider can vary per environment. ``auth`` is advertised only when both the
    issuer and the client id are set. Mateu never validates tokens: the manifest only tells the
    client which identity provider the host app trusts."""

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_mobile_app__", {
            "name": name,
            "short_name": short_name,
            "icon": icon,
            "theme_color": theme_color,
            "min_app_version": min_app_version,
            "oidc_issuer": oidc_issuer,
            "oidc_client_id": oidc_client_id,
            "scopes": list(scopes) if scopes else [],
        })
        return cls

    return deco
