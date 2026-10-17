"""The app shell: metadata, menus, context selectors and header actions (Java's AppMapper / AppMenuBuilder / MenuEntryMapper)."""

from __future__ import annotations

from enum import Enum
from typing import (
    get_args,
    get_origin,
    get_type_hints,
)

from mateu_dtos import ComponentEntryRecord
from mateu_dtos import (
    AppContextSelector,
    AppHeaderAction,
    AppShortcut as AppShortcutDto,
    HeaderValue as HeaderValueDto,
    IdleSession,
    AppMetadata,
    ClientSideComponent,
    MenuItem,
    Option,
    RuleRecord,
)
from mateu_uidl import (
    AppActionsSupplier,
    HeaderValuesSupplier,
    LiveHeaderValues,
    AppVariant,
    AppSupplier,
    GlobalSearchSupplier,
    HomeRouteSupplier,
    MenuSupplier,
    NotificationsSupplier,
    Rule,
)

from .. import capabilities, sample_sources
from ..naming import humanize
from ..reflection import methods_with
from ..registry import (
    normalize,
    type_name,
)
from ._base import MixinBase
from ._common import (
    _log,
    enum_label,
    for_current_audience,
)


class AppMapperMixin(MixinBase):
    # ── App shell ──────────────────────────────────────────────────────────────
    def map_app(self, cls, request_base_url: str | None = None) -> ClientSideComponent:
        app_title = getattr(cls, "__mateu_app__")
        # An app can compose its shell + menu IN CODE — a menu (or whole shell) computed at request
        # time, overriding the static decorators: AppSupplier returns the shell (chrome + menu),
        # MenuSupplier just the menu (mirrors Java's AppSupplier/MenuSupplier). Whatever the shell
        # leaves None falls back to the @app decorator / the derived menu below.
        shell = cls().get_app() if issubclass(cls, AppSupplier) else None
        if shell is not None:
            items = list(shell.menu or [])
        elif issubclass(cls, MenuSupplier):
            items = list(cls().menu() or [])
        else:
            # menu_item(group=...) entries sharing a group nest as that folder's submenu (the
            # folder appears where its first entry was declared); ungrouped entries stay leaves. A
            # "/" in the group nests folders ("Bookings/Reservations" = the Reservations folder
            # inside Bookings) — how a card of a @menu_group(display="cards") gets its actions.
            items = []
            folders: dict[str, MenuItem] = {}
            looks = getattr(cls, "__mateu_menu_groups__", {})

            def folder_of(path: str) -> MenuItem:
                if path in folders:
                    return folders[path]
                parent, _, name = path.rpartition("/")
                folder = self._presented(
                    MenuItem(label=self.T(name), route="", server_side_type=""), looks.get(path)
                )
                folders[path] = folder
                (folder_of(parent).submenus if parent else items).append(folder)
                return folder

            for n, f in methods_with(cls, "__mateu_menu_item__"):
                if not for_current_audience(getattr(f, "__mateu_audience__", None)):
                    continue
                # @eyes_only on the entry, or on the view it leads to: hidden from the caller
                # who cannot open it (Java's AppMenuBuilder EyesOnly filter).
                if not self.authorized(getattr(f, "__mateu_eyes_only__", None)):
                    continue
                if not self._target_visible(f):
                    continue
                entry = self._presented(
                    self.map_menu_item(n, f), getattr(f, "__mateu_menu_look__", None)
                )
                group = getattr(f, "__mateu_menu_group__", "").strip("/")
                if not group:
                    items.append(entry)
                else:
                    folder_of(group).submenus.append(entry)
            # @remote_menu entries: federated options — the frontend fetches the remote backend's
            # menu itself and mounts its views (no server-side proxying).
            for label, base_url, route, explode in getattr(cls, "__mateu_remote_menus__", []):
                items.append(MenuItem(
                    label=self.T(label), route=route, server_side_type="",
                    consumed_route="_empty", remote=True, base_url=base_url, explode=explode,
                ))
        variant = (
            AppVariant.to_wire(shell.variant)
            if (shell and shell.variant)
            else self.variant_of(cls, items)
        )
        # Routes are RELATIVE to the mount: prefix every menu route with the app's mount base path,
        # and stamp each option with its bare path, its consumedRoute and its uriPrefix (all the
        # mount). Mirrors Java's AppMenuDtoBuilder.buildMenu — a submenu nests under its parent's
        # path, and an entry spelled with the mount ("/x/home") or already under its parent ("/g/x"
        # under "/g") resolves ONCE (it used to become "/x/x/home" and "/g/g/x").
        mount_raw = normalize(getattr(cls, "__mateu_ui__", ""))
        # The mount base path (Java's appRoute): "" for a root-mounted app, "/x/y" otherwise. A
        # root app must NOT become "/" or every route below it would gain a leading double slash.
        mount = "/" + mount_raw if mount_raw else ""
        app_ssn = type_name(cls)
        items = self._apply_mount_routing(items, mount, app_ssn)
        home = items[0] if items else None
        sse_url = getattr(cls, "__mateu_ai_sse__", None)
        context_selectors = self.map_context_selectors(cls)
        context_actions = self.map_context_actions(cls)
        notifications_enabled = issubclass(cls, NotificationsSupplier)
        global_search_enabled = issubclass(cls, GlobalSearchSupplier)
        command_center_enabled = bool(
            getattr(cls, "__mateu_app_command_center__", False)
            or getattr(cls, "__mateu_app_chromeless__", False)
        )
        # The home route: an AppSupplier shell that sets one wins (app-in-code → "/a"); a reflected
        # @Menu-field app declares no explicit home, so it lands on its first navigable menu item
        # (Java parity); "_no_home_route" only when it has none.
        # A @menu_item app names its landing route with HomeRouteSupplier (Java's
        # HomeRouteSupplier); the sync handler then types the home with that screen's class.
        supplied_home = (
            (cls().home_route() or "").strip("/")
            if shell is None and issubclass(cls, HomeRouteSupplier)
            else ""
        )
        home_route = (
            shell.home_route
            if (shell and shell.home_route)
            else supplied_home or _first_navigable_route(items) or "_no_home_route"
        )
        # A reflected (@menu_item-method) app carries its own mount as the wire's `route`; an
        # AppSupplier shell leaves it None (AppShell has no route). Mirrors AppDto.route.
        app_route = mount if shell is None else None
        meta = AppMetadata(
            title=self.T(shell.title if (shell and shell.title) else app_title),
            subtitle=shell.subtitle if shell else None,
            variant=variant,
            menu=items,
            route=app_route,
            root_route=mount,
            total_menu_options=self._total_menu_options(items),
            home_route=home_route,
            # The home always lives under the mount and is served by the app class itself.
            home_consumed_route=mount,
            home_base_url=request_base_url or "",
            home_server_side_type=app_ssn,
            server_side_type=type_name(cls),
            sse_url=sse_url,
            context_selectors=context_selectors,
            context_actions=context_actions,
            # Notification inbox: the app class implements NotificationsSupplier → the shell
            # shows the header bell (mirrors AppMapper's notificationsEnabled).
            notifications_enabled=notifications_enabled,
            # Command palette entity search: the app class implements GlobalSearchSupplier →
            # the palette also asks _globalsearch (mirrors AppMapper's globalSearchEnabled).
            global_search_enabled=global_search_enabled,
            # Command center (Ask-Oracle): the FAB + full-screen palette; chromeless implies it.
            command_center_enabled=command_center_enabled,
            chromeless=bool(getattr(cls, "__mateu_app_chromeless__", False)),
            # Keyboard access keys (hold Alt to see them): opt-in, mirrors AppDto.accessKeys.
            access_keys=bool(getattr(cls, "__mateu_app_access_keys__", False)),
            # The header's light/dark switch: opt-in, mirrors AppDto.themeToggle.
            theme_toggle=bool(getattr(cls, "__mateu_app_theme_toggle__", False)),
            # "Open on mobile" (experimental): opt-in, mirrors AppDto.mobileQr.
            mobile_qr=bool(getattr(cls, "__mateu_app_mobile_qr__", False)),
            # The UI language: what the translator says, else the request's Accept-Language — the
            # chrome follows the browser, as on Java (DefaultTranslator.locale; mirrors AppDto.locale).
            locale=self._locale() or _accept_language(),
            # The capability tokens this app requires from its host renderer: derived from the
            # app-scoped features it declares plus whatever @app(requires=[...]) adds. app-data /
            # rest-sources are not carried by this port at build time (app_data_source is applied
            # post-hoc by the sync handler; there is no rest-source catalogue here), matching the
            # 🟡 matrix. Sorted + deduped so the wire is stable (mirrors AppMapper).
            # the catalogue rides the app metadata once (surfaces carry only the names)
            rest_sources=self.rest_sources.wire() if self.rest_sources is not None else [],
            components=self._component_catalogue(),
            action_catalogue=self.action_catalog.wire(self.authorized) if self.action_catalog is not None else [],
            # Sample mode (MATEU_SOURCES_MOCK=true): tell the client so its direct leg answers
            # sampled sources with their samples too. True or absent (mirrors AppDto.mockSources).
            mock_sources=True if sample_sources.enabled() else None,
            # E2 patterns (mirror Java's AppShellExtrasMapper)
            shortcuts=self._app_shortcuts(cls, shell, mount),
            header_values=self._header_values(cls, shell),
            live_updates=self._live_updates(cls, shell),
            idle_session=self._idle_session(cls, shell, mount),
            required_capabilities=self._required_capabilities(
                cls,
                sse_url=sse_url,
                command_center_enabled=command_center_enabled,
                global_search_enabled=global_search_enabled,
                notifications_enabled=notifications_enabled,
                context_selectors=context_selectors,
                context_actions=context_actions,
            ),
        )
        return ClientSideComponent(metadata=meta, id="ux_main_app", children=[])

    # ── E2 patterns: app shortcuts, live header values, idle-session warning ─────
    def _app_shortcuts(self, cls, shell, mount: str) -> list[AppShortcutDto]:
        """The shell's shortcuts, then the ``@app_shortcut`` ones; an entry with no key nor code,
        or nowhere to go, is dropped; routes absolute like the menu's (mirrors Java's
        AppShellExtrasMapper.shortcuts)."""
        from ..naming import humanize_constant

        raw = []
        for e in (getattr(shell, "shortcuts", None) or []) if shell is not None else []:
            raw.append((e.key, e.route, e.action_id, e.label, e.code))
        raw.extend(getattr(cls, "__mateu_app_shortcuts__", []))

        def blank(v):
            return v.strip() if isinstance(v, str) and v.strip() else None

        out: list[AppShortcutDto] = []
        for key, route, action_id, label, code in raw:
            key, route, action_id, label, code = (blank(key), blank(route), blank(action_id), blank(label), blank(code))
            if (key is None and code is None) or (route is None and action_id is None):
                continue
            absolute = None
            if route is not None:
                if mount and (route == mount or route.startswith(mount + "/")):
                    absolute = route
                else:
                    absolute = self._prepend(mount, route)
            if label is None:
                if route is not None:
                    path = route.rstrip("/")
                    segment = path[path.rfind("/") + 1:]
                    label = humanize_constant(segment.replace("-", " ")) if segment else "Home"
                else:
                    label = humanize_constant(action_id or "")
            out.append(AppShortcutDto(
                key=key.lower() if key else None, label=label, route=absolute,
                action_id=action_id, code=code,
            ))
        return out

    def _live_updates(self, cls, shell) -> bool:
        if shell is not None and getattr(shell, "live_updates", None) is not None:
            return bool(shell.live_updates)
        return bool(getattr(cls, "__mateu_app_live_updates__", False))

    def _header_values(self, cls, shell) -> list[HeaderValueDto]:
        """The shell's values, then the supplier's (same id replaces), and for a live app the last
        PUBLISHED value of each declared id (mirrors AppShellExtrasMapper.headerValues)."""
        by_id: dict[str, tuple[str | None, str | None]] = {}
        for v in (getattr(shell, "header_values", None) or []) if shell is not None else []:
            if v is not None and v.id:
                by_id[v.id] = (v.label, v.value)
        if issubclass(cls, HeaderValuesSupplier):
            for v in cls().header_values() or []:
                if v is not None and v.id:
                    by_id[v.id] = (v.label, v.value)
        if self._live_updates(cls, shell):
            for vid, published in LiveHeaderValues.current().items():
                if vid in by_id:
                    by_id[vid] = (by_id[vid][0], published)
        return [
            HeaderValueDto(id=vid, label=label if label and label.strip() else None, value=value)
            for vid, (label, value) in by_id.items()
        ]

    def _idle_session(self, cls, shell, mount: str) -> IdleSession | None:
        minutes, warning, sign_out = getattr(cls, "__mateu_app_idle__", (0, 60, ""))
        if shell is not None:
            if getattr(shell, "idle_timeout_minutes", None) is not None:
                minutes = shell.idle_timeout_minutes
            if getattr(shell, "idle_warning_seconds", None) is not None:
                warning = shell.idle_warning_seconds
            if getattr(shell, "idle_sign_out_url", None):
                sign_out = shell.idle_sign_out_url
        if not minutes or minutes <= 0:
            return None
        timeout = minutes * 60
        warning = max(5, min(warning, timeout))
        url = sign_out.strip() if sign_out and sign_out.strip() else (mount or "/")
        return IdleSession(
            timeout_seconds=timeout, warning_seconds=warning, sign_out_url=url,
            keep_alive_action_id="_keep-alive",
        )

    @staticmethod
    def _prepend(app_route: str, path: str) -> str:
        """Join a mount/parent prefix with a relative path, mirroring Java's
        AppMenuDtoBuilder.prepend (strip a trailing slash on the prefix, a leading slash on the path)."""
        prefix = app_route[:-1] if app_route.endswith("/") else app_route
        suffix = path[1:] if path.startswith("/") else path
        return prefix + "/" + suffix

    @classmethod
    def _relative(cls, mount: str, prefix: str, path: str) -> str:
        """An entry's path below its group and relative to the mount (Java's
        AppMenuDtoBuilder.relative): the mount in front is dropped, and a path already under the
        group is kept as it is."""
        own = path
        if mount and mount != "/" and own.startswith(mount):
            if len(own) == len(mount):
                own = "/"
            elif own[len(mount)] == "/":
                own = own[len(mount):]
        if not prefix or prefix == "/":
            return cls._prepend("", own)
        if own == prefix or own.startswith(prefix + "/"):
            return own
        return cls._prepend(prefix, own)

    def _apply_mount_routing(self, items, mount: str, app_ssn: str, prefix: str = ""):
        """Re-stamp menu options relative to the mount (mirrors Java's AppMenuDtoBuilder.buildMenu).
        Each option gets its bare ``path`` (prefix + its declared route), its absolute ``route``
        (mount + path), its ``consumed_route`` and ``uri_prefix`` (the mount) and the app's
        server-side type. A remote (@remote_menu) option keeps its own route/base_url verbatim.
        Submenus nest under their parent's path."""
        out = []
        for item in items:
            if getattr(item, "remote", False):
                # Federated entry: the frontend owns its routing; leave it verbatim.
                out.append(item)
                continue
            if item.rules:
                # A rule leaf does not navigate: keep its (empty) route verbatim, do not mount it.
                out.append(item)
                continue
            if not (item.route or ""):
                # A folder with no route of its own (a pure grouping node): it does not navigate, so
                # keep its route empty and just nest its children under the mount.
                out.append(
                    item.model_copy(
                        update={
                            "submenus": self._apply_mount_routing(
                                item.submenus, mount, app_ssn, prefix
                            )
                        }
                    )
                )
                continue
            path = self._relative(mount, prefix, item.route)
            out.append(
                item.model_copy(
                    update={
                        "path": path,
                        "route": mount + path,
                        "consumed_route": mount,
                        "uri_prefix": mount,
                        "server_side_type": app_ssn,
                        "submenus": self._apply_mount_routing(
                            item.submenus, mount, app_ssn, path
                        ),
                    }
                )
            )
        return out

    def _total_menu_options(self, items) -> int:
        """The number of options across the whole (flattened) menu tree — a folder counts as one
        option plus its children (mirrors Java's AppMappingUtils.totalMenuOptions)."""
        return sum(1 + self._total_menu_options(i.submenus) for i in items)

    def _required_capabilities(
        self,
        cls,
        *,
        sse_url,
        command_center_enabled: bool,
        global_search_enabled: bool,
        notifications_enabled: bool,
        context_selectors: list,
        context_actions: list,
    ) -> list[str]:
        """The sorted, deduped capability tokens the app REQUIRES from its host — derived from the
        same flags the metadata carries, plus the explicit @app(requires=[...]) tokens (trimmed,
        non-blank). Mirrors Java's AppMapper.getRequiredCapabilities."""
        caps: set[str] = set()
        if sse_url and str(sse_url).strip():
            caps.add(capabilities.SSE)
        if command_center_enabled:
            caps.add(capabilities.COMMAND_CENTER)
        if global_search_enabled:
            caps.add(capabilities.GLOBAL_SEARCH)
        if notifications_enabled:
            caps.add(capabilities.NOTIFICATIONS)
        if self.rest_sources is not None and self.rest_sources.catalog():
            caps.add(capabilities.REST_SOURCES)
        if context_selectors:
            caps.add(capabilities.CONTEXT_SELECTORS)
        if context_actions:
            caps.add(capabilities.HEADER_ACTIONS)
        for token in getattr(cls, "__mateu_app_requires__", []) or []:
            if token and token.strip():
                caps.add(token.strip())
        return sorted(caps)

    def map_context_actions(self, cls) -> list[AppHeaderAction]:
        """Header action buttons next to the context selectors: the app class implements
        :class:`AppActionsSupplier` and decides on every shell build which actions exist
        (visibility follows server-side state). Each action_id dispatches against the app class:
        the method with that name runs."""
        if not issubclass(cls, AppActionsSupplier):
            return []
        actions = cls().app_actions() or []
        return [self._map_header_action(a) for a in actions]

    def _map_header_action(self, action) -> AppHeaderAction:
        return AppHeaderAction(
            action_id=action.action_id,
            label=action.label,
            icon=action.icon,
            children=[self._map_header_action(child) for child in action.children]
            if action.children is not None
            else None,
        )

    def map_context_selectors(self, cls) -> list[AppContextSelector]:
        """@app_context methods of the app class become header context selectors: the method's
        return annotation may be an Enum (its members are the options), or the method is called
        (zero args, on a fresh instance) and must return Option-likes or (value, label) pairs."""
        selectors: list[AppContextSelector] = []
        for name, fn in methods_with(cls, "__mateu_app_context__"):
            marker = getattr(fn, "__mateu_app_context__")
            label = self.T(marker) if marker else humanize(name)
            options: list[Option] = []
            try:
                return_type = get_type_hints(fn).get("return")
            except Exception as e:  # noqa: BLE001 - logged, not fatal
                _log.warning("map_context_selectors failed, falling back (%s)", e)
                return_type = None
            if isinstance(return_type, type) and issubclass(return_type, Enum):
                options = [
                    Option(value=member.name, label=enum_label(member))
                    for member in return_type
                ]
            else:
                try:
                    for item in fn(cls()) or []:
                        if isinstance(item, Option):
                            options.append(item)
                        elif isinstance(item, (tuple, list)) and len(item) == 2:
                            options.append(Option(value=str(item[0]), label=str(item[1])))
                        elif hasattr(item, "value") and hasattr(item, "label"):
                            options.append(Option(value=str(item.value), label=str(item.label)))
                except Exception as e:  # noqa: BLE001 - logged, not fatal
                    _log.warning("map_context_selectors failed, falling back (%s)", e)
                    options = []
            selectors.append(
                AppContextSelector(field_name=name, label=label, options=options)
            )
        return selectors

    def _component_catalogue(self) -> list[ComponentEntryRecord]:
        """The business-component catalogue on the app metadata, each composition resolved."""
        if self.components is None:
            return []
        out = []
        for entry in self.components.catalog():
            try:
                out.append(ComponentEntryRecord(name=entry.name, component=self.map_component(entry.component)))
            except Exception as e:  # noqa: BLE001 - one broken entry must not take the shell down
                _log.warning("Business component '%s' could not be mapped (%s)", entry.name, e)
        return out

    def _target_visible(self, fn) -> bool:
        """Whether the caller may open the view a menu method leads to (its return annotation)."""
        try:
            target = get_type_hints(fn).get("return")
        except Exception:  # noqa: BLE001 - an unresolvable annotation hides nothing
            return True
        if not isinstance(target, type):
            return True
        from ..action_guard import class_access_granted

        return class_access_granted(self, target)

    @staticmethod
    def variant_of(cls, items) -> str:
        """The navigation chrome (mirrors Java's AppMetadataExtractor.getVariant): an explicit
        @app(variant=...) always wins; a menu with folders → TILES when a folder nests another
        folder, HAMBURGER_MENU past 7 top-level entries, else MENU_ON_TOP; a flat menu of leaf
        entries → TABS. The result is the WIRE value (``AppVariant.to_wire``)."""
        explicit = getattr(cls, "__mateu_app_variant__", "")
        if explicit:
            return AppVariant.to_wire(explicit)
        if any(i.submenus for i in items):
            if any(s.submenus for i in items for s in i.submenus):
                return "TILES"
            return AppVariant.to_wire(
                AppVariant.HAMBURGER_MENU if len(items) > 7 else AppVariant.MENU_ON_TOP
            )
        return "TABS"

    def _presented(self, entry: MenuItem, look) -> MenuItem:
        """The card look of a menu entry: display "cards" on a group, description/icon/image on an
        entry. Blank values stay None, so a plain menu travels exactly as before (mirrors Java's
        MenuEntryMapper.presented + AppMenuDtoBuilder)."""
        if look is None:
            return entry
        entry.display = "cards" if (look.display or "").lower() == "cards" else None
        entry.description = self.T(look.description) if look.description else None
        entry.icon = look.icon or None
        entry.image = look.image or None
        return entry

    def map_menu_item(self, name: str, fn) -> MenuItem:
        try:
            view_type = get_type_hints(fn).get("return")
        except Exception as e:  # noqa: BLE001 - logged, not fatal
            _log.warning("map_menu_item failed, falling back (%s)", e)
            view_type = fn.__annotations__.get("return")
        marker = getattr(fn, "__mateu_menu_item__")
        # A menu leaf is one of two primitives: a route or a rule. A @menu_item returning a Rule
        # (or list[Rule]) becomes the rule leaf — clicking it runs client-side rules instead of
        # navigating — and carries them in MenuItem.rules; every other return shape is a route leaf
        # (mirrors Java's MenuEntryMapper: a @Menu field typed Rule/List<Rule>).
        rules = self._menu_rule_leaf(fn, view_type)
        if rules is not None:
            label = marker if isinstance(marker, str) else humanize(name)
            return MenuItem(
                label=self.T(label), route="", server_side_type="", rules=rules
            )
        # A @menu_item bound to a view uses that view's mount as its route; a @menu_item with no
        # return type is a bare leaf whose route is derived from the METHOD NAME (mirrors Java's
        # @Menu field, whose path is "/" + fieldName — the field VALUE is not the path).
        route = (
            "/" + normalize(getattr(view_type, "__mateu_ui__", ""))
            if view_type
            else "/" + name
        )
        label = (
            marker
            if isinstance(marker, str)
            else (getattr(view_type, "__mateu_title__", None) or humanize(name))
        )
        ssn = type_name(view_type) if view_type else ""
        return MenuItem(label=self.T(label), route=route, server_side_type=ssn, consumed_route=route)

    def _menu_rule_leaf(self, fn, return_type) -> "list[RuleRecord] | None":
        """The rules of a rule-leaf @menu_item, or None when the entry is a route leaf. A method
        annotated to return a Rule (or list[Rule]) is a rule leaf — clicking it runs client-side
        rules instead of navigating; every other return shape is a route (mirrors MenuEntryMapper's
        Rule / List<Rule> branch). Detection is by the declared return type, so mapping a menu never
        speculatively calls a view-factory method."""
        is_rule_return = return_type is Rule or (
            get_origin(return_type) is list
            and (get_args(return_type) or (None,))[0] is Rule
        )
        if not is_rule_return:
            return None
        try:
            result = fn(self._owner_of(fn)())
        except Exception as e:  # noqa: BLE001 - logged, not fatal
            _log.warning("_menu_rule_leaf failed, falling back (%s)", e)
            result = None
        if isinstance(result, Rule):
            result = [result]
        if isinstance(result, list) and all(isinstance(r, Rule) for r in result):
            return [self._map_rule(r) for r in result]
        return []

    @staticmethod
    def _owner_of(fn):
        """The class that declares an unbound @menu_item function (so it can be instantiated to
        call the rule-leaf method). Falls back to a no-arg lambda when it cannot be found."""
        qual = getattr(fn, "__qualname__", "")
        if "." in qual:
            import sys

            owner_name = qual.rsplit(".", 1)[0]
            module = sys.modules.get(getattr(fn, "__module__", ""))
            owner = getattr(module, owner_name, None)
            if isinstance(owner, type):
                return owner
        return lambda: None

    @staticmethod
    def _map_rule(r) -> RuleRecord:
        return RuleRecord(
            filter=r.filter, action=r.action, field_name=r.field_name,
            field_attribute=r.field_attribute, value=r.value, expression=r.expression,
            result=r.result, action_id=r.action_id,
        )


def _first_navigable_route(items) -> str | None:
    """The route of the first menu leaf a click would NAVIGATE to — an app that names no home lands
    there (Java's AppMapper.withFirstMenuItemAsHome). Rule leaves, remote menus, separators and
    hidden entries are skipped; None when there is no such leaf (the app draws itself)."""
    for item in items or []:
        if item.separator or not item.visible:
            continue
        if item.submenus:
            nested = _first_navigable_route(item.submenus)
            if nested:
                return nested
            continue
        if item.remote or item.rules or not item.route:
            continue
        return item.route
    return None


def _accept_language() -> str | None:
    from ..translations import accept_language

    return accept_language()
