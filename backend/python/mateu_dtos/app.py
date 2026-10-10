"""The app shell's metadata: menus, context selectors, header actions (Java's AppDto)."""

from __future__ import annotations

from typing import (
    Literal,
    TYPE_CHECKING,
)

from pydantic import Field

from .base import Wire

if TYPE_CHECKING:
    from .fields import ComponentEntryRecord, RestDataSource, RestSourceEntryRecord
    from .records import (
        Action,
        MenuItem,
        Option,
    )


# ── Component metadata (discriminated on "type") ───────────────────────────────
class AppMetadata(Wire):
    type: Literal["App"] = "App"
    title: str
    variant: str
    menu: list["MenuItem"] = Field(default_factory=list)
    layout: str = "SINGLE_SLOT"
    #: The app's own mount route (mirrors AppDto.route). A reflected (@Menu-field) app carries it;
    #: an AppSupplier shell that does not set one leaves it None.
    route: str | None = None
    home_route: str = ""
    home_consumed_route: str = ""
    #: The backend's public base URL — the shell loads its home content against it (mirrors
    #: AppDto.homeBaseUrl; without it the first auto-load fires page-relative).
    home_base_url: str = ""
    home_server_side_type: str = ""
    server_side_type: str = ""
    root_route: str = ""
    #: The number of menu options across the whole (flattened) menu tree (mirrors
    #: AppDto.totalMenuOptions).
    total_menu_options: int = 0
    subtitle: str | None = None
    login_url: str | None = None
    logout_url: str | None = None
    #: SSE chat endpoint (@ai); when set the renderer shows the floating AI chat.
    sse_url: str | None = None
    context_selectors: list["AppContextSelector"] = Field(default_factory=list)
    #: Header action buttons next to the context selectors (the app class implements
    #: AppActionsSupplier); an entry with children renders as a dropdown.
    context_actions: list["AppHeaderAction"] = Field(default_factory=list)
    #: True when the app class implements NotificationsSupplier: the shell shows the inbox bell,
    #: whose panel fetches through the _notifications-list / _notifications-read app-level
    #: actions (mirrors AppDto.notificationsEnabled).
    notifications_enabled: bool = False
    #: True when the app class implements GlobalSearchSupplier: the command palette also
    #: searches ENTITIES through the _globalsearch app-level action (mirrors
    #: AppDto.globalSearchEnabled).
    global_search_enabled: bool = False
    #: @app(command_center=True): the always-present command-center FAB + full-screen palette
    #: (the Ask-Oracle pattern). Implied by chromeless. Mirrors AppDto.commandCenterEnabled.
    command_center_enabled: bool = False
    #: @app(chromeless=True): drop the nav chrome; the command center is the only navigation
    #: (implies command_center_enabled). Mirrors AppDto.chromeless.
    chromeless: bool = False
    #: @app(access_keys=True): keyboard access-keys mode — holding Alt shows a key next to every
    #: visible button and tab and Alt+key activates it. Mirrors AppDto.accessKeys.
    access_keys: bool = False
    #: A route may seed APP-SCOPE data by referencing a named source (routes.yaml ``appData``):
    #: the shell fetches it once into the app-data store (mirrors AppDto.appDataSource). None when
    #: no route under the mount declares one.
    app_data_source: "RestDataSource | None" = None
    #: The capability tokens this app REQUIRES from its host renderer — the app-scoped features it
    #: declares (derived from this metadata) plus whatever ``@app(requires=[...])`` adds. The host
    #: compares them against what it PROVIDES and reports the difference: compatibility by
    #: capability, not by version. Sorted + deduped (mirrors AppDto.requiredCapabilities).
    required_capabilities: list[str] = Field(default_factory=list)
    #: The UI language, a BCP 47 tag (``Translator.locale()``); None = let the browser decide. The
    #: web client sets it on ``<html lang>`` and draws its chrome in it (mirrors AppDto.locale).
    locale: str | None = None
    #: The app's REST source catalogue (named endpoints surfaces reference by ``ref``), shipped
    #: once on the app metadata rather than on every response (mirrors AppDto.restSources).
    rest_sources: list["RestSourceEntryRecord"] = Field(default_factory=list)
    #: The business-component catalogue (name → resolved composition), so a ComponentRef can be
    #: resolved by a renderer / the client-side expander with no backend (mirrors
    #: AppDto.components).
    components: list["ComponentEntryRecord"] = Field(default_factory=list)
    #: The app's ACTION catalogue (actions.yaml + ActionCatalogSupplier): named client-runnable
    #: actions, each flow lowered to ``commands``. A client resolves an id its owner does not declare
    #: against this list before a server dispatch (mirrors AppDto.actionCatalogue).
    action_catalogue: list["Action"] = Field(default_factory=list)


class AppContextSelector(Wire):
    """An application-level context selector shown on the app header: fixes a value for every
    screen (the active hotel, the company…). The picked value lives in the app state under
    field_name and travels with every request."""

    field_name: str
    label: str
    options: list["Option"] = Field(default_factory=list)


class AppHeaderAction(Wire):
    """An action button on the app header, next to the app-context selectors. An entry with
    children renders as a dropdown menu: only the children dispatch."""

    action_id: str | None = None
    label: str = ""
    icon: str | None = None
    children: list["AppHeaderAction"] | None = None
