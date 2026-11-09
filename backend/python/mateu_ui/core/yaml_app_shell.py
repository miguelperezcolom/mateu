"""A ``type: AppShell`` DEFINITION — the data-authored counterpart of an ``@app`` class (Java's
``YamlAppLoader`` + the AppShell branch of ``AppMapper`` / ``AppMenuDtoBuilder``).

The shell is a view like any other: its definition is bound to a route of the mount (typically the
root ``""``) in ``routes.yaml``. The YAML builder reads it into a :class:`YamlAppShell` node (never
placed on a page) and :func:`app_component` maps it to the "App" wire metadata:

- ``menu:`` — ``RouteLink`` (goes where its ``route:`` says), ``Menu`` (a group; ``presentation:
  {display: cards}`` opens it as cards), ``RuleLink`` (runs client-side ``rules:`` instead of
  navigating), ``RemoteMenu`` (a federated section) and ``MenuSeparator``; entries carry
  ``description:`` / ``presentation: {icon, image}`` and may be hidden per caller by ``access:``
  (applied to the source tree per request by the spec loader, as on any definition);
- ``homeRoute:`` — else the mount's ``home:``, else the first navigable menu leaf;
- ``actions:`` with ``steps:`` — the shell's FLOWS, lowered to commands (a rule leaf running one
  runs it in the browser);
- ``widgets:`` (header components, slot ``widgets``), the switches ``themeToggle`` /
  ``commandCenter`` / ``chromeless`` / ``accessKeys`` / ``mobileQr`` / ``liveUpdates``,
  ``shortcuts:``, ``headerValues:``, the idle-session keys and ``ai: {sse, mcp, upload, followLabel,
  followingLabel}``;
- the header extras an ``@app`` class gets from its suppliers, as data: ``contextSelectors:``
  (static options or an ``optionsSource``), ``headerActions:`` (navigate with ``route`` or run an
  ``actionId``), ``notifications: {source, markRead}`` and ``globalSearch: {source}``;
- ``backLink: PARENT`` — ONE "← Parent" link instead of the breadcrumb trail (resolved by the sync
  handler, like an ``@app(back_link=PARENT)`` class's), and ``pageTitle:`` — the installed app's name
  when the shell has no ``title:`` (the UI manifest, :func:`manifest_source`); like in Java it is not
  part of the shell's wire.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from mateu_ui.dtos import (
    AppContextSelector,
    AppHeaderAction,
    AppMetadata,
    ClientSideComponent,
    MenuItem,
    Option,
)
from mateu_ui.uidl import AppShortcutEntry, AppVariant, HeaderValue
from mateu_ui.uidl import components as fluent

from .mapper.app import remote_route_prefix
from .naming import camelcasize, humanize, humanize_constant


@dataclass(frozen=True)
class YamlAppShell(fluent.Component):
    """A parsed ``type: AppShell`` definition: the authored tree (``node``) plus what the YAML
    builder already built from it — the header ``widgets`` and the lowered ``actions``. Internal:
    the YAML loader's carrier, mapped by :func:`app_component`."""

    node: dict = field(default_factory=dict)
    widgets: tuple = ()
    actions: tuple = ()
    id: str | None = None
    style: str | None = None
    css_classes: str | None = None


def parse(node: dict, build_component) -> YamlAppShell:
    """The shell of a ``type: AppShell`` node; ``build_component`` builds one YAML component node
    (the YAML builder's own, so partials and field types resolve as on a page)."""
    from .action_registry import _step, to_dto
    from mateu_ui.uidl.action_catalog import CatalogAction

    widgets = []
    for w in node.get("widgets") or []:
        built = build_component(w)
        if built is not None:
            widgets.append(built)
    actions = []
    for a in node.get("actions") or []:
        if not isinstance(a, dict) or not str(a.get("id") or "").strip():
            continue
        steps = tuple(s for s in (_step(n) for n in a.get("steps") or []) if s is not None)
        actions.append(to_dto(CatalogAction(id=str(a["id"]).strip(), steps=steps)))
    return YamlAppShell(
        node=dict(node),
        widgets=tuple(widgets),
        actions=tuple(actions),
        style=_text(node.get("style")),
        css_classes=_text(node.get("cssClasses")),
    )


def back_link_parent(node: dict) -> bool:
    """Whether the shell declares ``backLink: PARENT`` (Java's YamlAppLoader reads the BackLink enum
    by its exact name; anything else is the default, BREADCRUMBS)."""
    return str(node.get("backLink") or "").strip() == "PARENT"


def manifest_source(node: dict) -> type:
    """What presents a YAML mount to the mobile app and the installable app (Java's
    ``MobileManifest.sourceOf(AppShell)``), in the shape :mod:`mateu_ui.core.mobile_manifest` and
    :mod:`mateu_ui.core.pwa` read off an ``@app`` class: the shell's ``title:``, else its
    ``pageTitle:`` (else "Mateu"), its ``logo:`` else ``favicon:``, its ``accentColor:`` — each
    still below its ``MATEU_MOBILE_*`` setting, as Java's members are."""

    def blank(key: str) -> str | None:
        value = node.get(key)
        return str(value).strip() if value is not None and str(value).strip() else None

    declared = {
        "name": blank("title") or blank("pageTitle") or "Mateu",
        "icon": blank("logo") or blank("favicon"),
        "theme_color": blank("accentColor"),
    }
    return type("YamlAppShellSource", (), {"__mateu_mobile_app__": declared})


def mount_shell(handler, base_url: str | None = "") -> dict | None:
    """The ``type: AppShell`` definition bound to the root of the mount at ``base_url`` (else the
    root ``""``), or None — what presents a YAML mount (Java's YamlMounts.manifestJson)."""
    try:
        for route in dict.fromkeys(((base_url or "").strip("/"), "")):
            spec = handler.yaml_specs.load_spec(route)
            if spec is not None and isinstance(spec.layout, YamlAppShell):
                return spec.layout.node
    except Exception:  # noqa: BLE001 - a manifest is never refused over an unreadable definition
        return None
    return None


def app_component(
    mapper,
    shell: YamlAppShell,
    mount: str = "",
    mount_home: str | None = None,
    home_route: str | None = None,
) -> ClientSideComponent:
    """The shell as the "App" wire component (Java's AppMapper over a YAML AppShell); ``mount`` is
    the mount's base path ("" at the root), ``mount_home`` its descriptor's ``home:``;
    ``home_route`` aims the shell at a deep-linked route instead of its home."""
    from .mapper.components import _wire_source
    from .yaml_preview import _source

    n = shell.node
    mount = "" if mount in ("", "/") else "/" + mount.strip("/")
    items = _menu(mapper, n.get("menu"), mount, "")
    ai: dict = n["ai"] if isinstance(n.get("ai"), dict) else {}
    notifications = n.get("notifications") if isinstance(n.get("notifications"), dict) else None
    search = n.get("globalSearch") if isinstance(n.get("globalSearch"), dict) else None
    selectors = [_selector(mapper, s) for s in n.get("contextSelectors") or [] if isinstance(s, dict)]
    header_actions = [
        _header_action(mapper, a, mount) for a in n.get("headerActions") or [] if isinstance(a, dict)
    ]
    chromeless = bool(n.get("chromeless", False))
    command_center = bool(n.get("commandCenter", False)) or chromeless
    sse_url = _text(ai.get("sse"))
    home = (
        home_route
        or _text(n.get("homeRoute"))
        or (mount_home.strip() if mount_home and mount_home.strip() else None)
        or _first_route(n.get("menu"))
        or "_no_home_route"
    )

    class _Shell:  # what the class-keyed helpers read: the shell's own E2 values, no decorators
        pass

    data_shell = _ShellValues(n)
    meta = AppMetadata(
        title=mapper.T(_text(n.get("title")) or ""),
        subtitle=_opt(mapper, n.get("subtitle")),
        variant=_variant(mapper, n.get("variant"), items),
        layout=_text(n.get("layout")) or "SINGLE_SLOT",
        menu=items,
        route=_text(n.get("route")) or None,
        root_route=mount,
        total_menu_options=mapper._total_menu_options(items),
        home_route=home,
        home_consumed_route=mount,
        logo=_text(n.get("logo")),
        favicon=_text(n.get("favicon")),
        drawer_closed=bool(n.get("drawerClosed", False)),
        # backLink: PARENT — the "← Parent" link replaces the trail (the link: SyncHandler.with_back_link)
        no_breadcrumbs=back_link_parent(n),
        style=shell.style,
        css_classes=shell.css_classes,
        accent_color=_text(n.get("accentColor")),
        sse_url=sse_url,
        mcp_url=_text(ai.get("mcp")),
        upload_url=_text(ai.get("upload")),
        follow_label=_trimmed(ai.get("followLabel")),
        following_label=_trimmed(ai.get("followingLabel")),
        theme_toggle=bool(n.get("themeToggle", False)),
        command_center_enabled=command_center,
        chromeless=chromeless,
        access_keys=bool(n.get("accessKeys", False)),
        mobile_qr=bool(n.get("mobileQr", False)),
        context_selectors=selectors,
        context_actions=header_actions,
        notifications_enabled=notifications is not None,
        notifications_source=_wire_source(_source(notifications.get("source")))
        if notifications
        else None,
        notifications_read_source=_wire_source(_source(notifications.get("markRead")))
        if notifications
        else None,
        global_search_enabled=search is not None,
        global_search_source=_wire_source(_source(search.get("source"))) if search else None,
        actions=list(shell.actions),
        locale=mapper._locale(),
        rest_sources=mapper.rest_sources.wire() if mapper.rest_sources is not None else [],
        action_catalogue=mapper.action_catalog.wire(mapper.authorized)
        if mapper.action_catalog is not None
        else [],
        shortcuts=mapper._app_shortcuts(_Shell, data_shell, mount),
        header_values=mapper._header_values(_Shell, data_shell),
        live_updates=mapper._live_updates(_Shell, data_shell),
        idle_session=mapper._idle_session(_Shell, data_shell, mount),
        agent_push=mapper.agent_push_enabled,
        required_capabilities=mapper._required_capabilities(
            _Shell,
            sse_url=sse_url,
            command_center_enabled=command_center,
            global_search_enabled=search is not None,
            notifications_enabled=notifications is not None,
            context_selectors=selectors,
            context_actions=header_actions,
        ),
    )
    children = []
    for w in shell.widgets:
        child = mapper.map_component(w)
        child.slot = "widgets"
        children.append(child)
    return ClientSideComponent(
        metadata=meta, id="ux_main_app", children=children, style=shell.style,
        css_classes=shell.css_classes,
    )


def mount_of(routes, route: str | None) -> tuple[str, str | None]:
    """The base path and ``home:`` of the ``type: UI`` mount ``route`` belongs to (the longest base
    path it sits under); ``("", None)`` when no descriptor claims it."""
    path = (route or "").strip("/")
    best: tuple[str, str | None] = ("", None)
    best_len = -1
    scan = getattr(routes, "_scan_mount_descriptors", None)
    for d in scan() if scan is not None else []:
        base = (d.get("base_path") or "").strip("/")
        if (not base or path == base or path.startswith(base + "/")) and len(base) > best_len:
            best, best_len = (base, d.get("home")), len(base)
    return best


#: The roles a data-authored shell's sources fill (Java's AppShellSources).
NOTIFICATIONS = "notifications"
NOTIFICATIONS_READ = "notificationsRead"
GLOBAL_SEARCH = "globalSearch"
CONTEXT_OPTIONS = "contextOptions"


def declared_source(node: dict, role: str, field_name: str = ""):
    """The REST source the shell declares for ``role`` (a context picker's by its ``field``), or
    None: what the ``_appsource`` proxy may call is exactly this (Java's AppShellSources)."""
    from .yaml_preview import _source

    def part(key: str, sub: str):
        holder = node.get(key)
        return _source(holder.get(sub)) if isinstance(holder, dict) else None

    if role == NOTIFICATIONS:
        return part("notifications", "source")
    if role == NOTIFICATIONS_READ:
        return part("notifications", "markRead")
    if role == GLOBAL_SEARCH:
        return part("globalSearch", "source")
    if role == CONTEXT_OPTIONS:
        for s in node.get("contextSelectors") or []:
            if isinstance(s, dict) and str(s.get("fieldName") or "") == field_name:
                found = _source(s.get("optionsSource"))
                if found is not None:
                    return found
    return None


def app_source_response(handler, rq):
    """``_appsource``: a PROXIED source the mount's shell declares, by role (``_appSource``) and,
    for a picker, field (``_field``), resolved against the server's catalogue and never taken from
    the request, so it cannot be turned into an open proxy. A direct source is the browser's to
    fetch (403); a role the shell does not fill answers a 404 ``_restfetchError``. The answer rides
    on ``app_data._restfetch`` like ``__restfetch__``'s (Java's RestProxyCalls.appSourceCall)."""
    import copy

    from mateu_ui.dtos import UIIncrement

    from . import sample_sources
    from .action_guard import MateuForbiddenException
    from .rest_source_registry import source_dto
    from .sync_handler.proxy import ProxyError, _restfetch_error
    from .translations import locale_of

    params = rq.parameters or {}
    base, _ = mount_of(handler.routes, rq.route)
    spec = handler.yaml_specs.load_spec_for(base, handler.mapper.authorized, locale_of(handler.mapper))
    shell = spec.layout if spec is not None else None
    declared = (
        declared_source(shell.node, str(params.get("_appSource") or ""), str(params.get("_field") or ""))
        if isinstance(shell, YamlAppShell)
        else None
    )
    if declared is None:
        return _restfetch_error(404, "The app shell declares no such source")
    source = source_dto(declared)  # the samples kept: this is the server's own call
    if handler.rest_sources is not None:
        source = handler.rest_sources.resolve(source)
    if sample_sources.enabled() and source.sample is not None:
        method = (source.method or "GET").strip().upper()
        return UIIncrement(
            app_data={"_restfetch": copy.deepcopy(source.sample) if method in ("", "GET") else {}}
        )
    if not source.proxy and source.url:
        raise MateuForbiddenException(
            "_appsource: the shell's source is not a proxied source (proxy: true)"
        )
    state = {k: v for k, v in params.items() if not str(k).startswith("_")}
    try:
        return UIIncrement(app_data={"_restfetch": handler._fetch_proxy(source, state)})
    except ProxyError as e:
        return _restfetch_error(e.status, e.detail)


class _ShellValues:
    """The E2 values of the shell (shortcuts, header values, live updates, idle session) in the
    shape the class-app helpers read off a code-authored ``AppShell``."""

    def __init__(self, n: dict):
        self.shortcuts = [
            AppShortcutEntry(
                key=_text(s.get("key")),
                route=_text(s.get("route")),
                action_id=_text(s.get("actionId")),
                label=_text(s.get("label")),
                code=_text(s.get("code")),
            )
            for s in n.get("shortcuts") or []
            if isinstance(s, dict)
        ]
        self.header_values = [
            HeaderValue(id=str(v.get("id")), label=_text(v.get("label")), value=_text(v.get("value")))
            for v in n.get("headerValues") or []
            if isinstance(v, dict) and v.get("id")
        ]
        self.live_updates = n.get("liveUpdates")
        self.idle_timeout_minutes = n.get("idleTimeoutMinutes")
        self.idle_warning_seconds = n.get("idleWarningSeconds")
        self.idle_sign_out_url = _text(n.get("idleSignOutUrl"))


def _text(value: Any) -> str | None:
    return None if value is None else str(value)


def _trimmed(value: Any) -> str | None:
    return str(value).strip() or None if value is not None else None


def _opt(mapper, value: Any) -> str | None:
    return mapper.T(str(value)) if value is not None else None


def _variant(mapper, raw: Any, items: list[MenuItem]) -> str:
    """The declared variant (HAMBURGUER_MENU travels as HAMBURGER_MENU); none → MENU_ON_TOP for a
    shell federating remote sections, else TABS (Java's AppShell defaults); AUTO → the heuristic."""
    value = str(raw).strip().upper() if raw is not None else ""
    if not value:
        return "MENU_ON_TOP" if any(i.remote for i in items) else "TABS"
    if value == "AUTO":
        return mapper.variant_of(_NoDecorators, items)
    if value == "HAMBURGUER_MENU":
        return "HAMBURGER_MENU"
    return AppVariant.to_wire(value)


class _NoDecorators:
    pass


def _first_route(menu: Any) -> str | None:
    """The first navigable menu item's route as written (Java's YamlAppLoader.firstNavigableRoute):
    a RouteLink's ``route`` (or ``path``), else any entry's ``path``."""
    for item in menu or []:
        if not isinstance(item, dict):
            continue
        if item.get("type") == "RouteLink":
            route = _text(item.get("route")) or _text(item.get("path"))
            if route and route.strip():
                return route
        elif _text(item.get("path")):
            return str(item["path"])
    return None


def _prepend(prefix: str, path: str) -> str:
    head = prefix[:-1] if prefix.endswith("/") else prefix
    tail = path[1:] if path.startswith("/") else path
    return head + "/" + tail


def _within_mount(mount: str, path: str) -> str:
    if not mount or mount == "/" or not path.startswith(mount):
        return path
    if len(path) == len(mount):
        return "/"
    return path[len(mount):] if path[len(mount)] == "/" else path


def _relative(mount: str, prefix: str, path: str) -> str:
    own = _within_mount(mount, path)
    if not prefix or prefix == "/":
        return _prepend("", own)
    if own.startswith(prefix + "/"):
        return own
    return _prepend(prefix, own)


def _path_of(mount: str, prefix: str, item: dict) -> str:
    """Java's AppMenuDtoBuilder.getPath for the authored kinds."""
    kind = item.get("type")
    path = _text(item.get("path"))
    if path is None:
        route = _text(item.get("route"))
        if kind == "RouteLink" and route and route.strip():
            return _relative(mount, prefix, route)
        return _prepend(prefix, camelcasize(str(item.get("label") or "")) or "")
    if kind == "RemoteMenu":
        return path if path.startswith(prefix) else _prepend(prefix, path)
    return _relative(mount, prefix, path)


def _menu(mapper, raw: Any, mount: str, prefix: str) -> list[MenuItem]:
    from mateu_ui.dtos import RuleRecord

    out: list[MenuItem] = []
    for item in raw or []:
        if not isinstance(item, dict):
            continue
        kind = item.get("type")
        path = _path_of(mount, prefix, item)
        look: dict = item["presentation"] if isinstance(item.get("presentation"), dict) else {}
        remote = kind == "RemoteMenu"
        label = _text(item.get("label"))
        shell_label = remote and bool(label and label.strip())
        declared_path = (_text(item.get("path")) or "").strip() or None
        if remote and not shell_label:
            # the path's last segment, humanized (Java's AppMenuDtoBuilder.remoteLabel)
            source = declared_path or path
            segment = source[source.rfind("/") + 1:] if source else ""
            label = mapper.T(humanize_constant(segment)) if segment else None
        elif label is not None:
            label = mapper.T(label)
        submenus: list[MenuItem] = []
        if kind == "Menu":
            own = _text(item.get("path"))
            submenus = _menu(
                mapper, item.get("submenu"), mount, _relative(mount, prefix, own) if own else prefix
            )
        rules = [
            RuleRecord(
                filter=str(r.get("filter") or ""),
                action=str(r.get("action") or "RunAction"),
                field_name=_text(r.get("fieldName")),
                field_attribute=_text(r.get("fieldAttribute")),
                value=r.get("value"),
                expression=_text(r.get("expression")),
                result=str(r.get("result") or ""),
                action_id=_text(r.get("actionId")),
            )
            for r in (item.get("rules") or [] if kind == "RuleLink" else [])
            if isinstance(r, dict)
        ]
        description = _text(item.get("description"))
        out.append(
            MenuItem(
                label=label or "",
                path=path,
                route=_text(item.get("route")) or "" if remote else mount + path,
                consumed_route=(_text(item.get("consumedRoute")) or "") if remote else mount,
                server_side_type=(_text(item.get("serverSideType")) or "") if remote else "",
                uri_prefix=mount,
                visible=not bool(item.get("hidden", False)),
                separator=kind == "MenuSeparator",
                remote=remote,
                base_url=_text(item.get("baseUrl")) if remote else None,
                explode=bool(item.get("explode", False)) if remote else False,
                # a remote section: where its screens live (its OWN path, not its group's) and
                # whether the shell named it (Java's AppMenuDtoBuilder.remoteRoutePrefix / shellLabel)
                route_prefix=remote_route_prefix(declared_path or path) if remote else None,
                shell_label=shell_label,
                submenus=submenus,
                rules=rules,
                icon=_text(item.get("icon")) or _text(look.get("icon")),
                image=_text(look.get("image")),
                display="cards" if str(look.get("display") or "").lower() == "cards" else None,
                description=mapper.T(description) if description else None,
            )
        )
    return out


def _selector(mapper, s: dict) -> AppContextSelector:
    from .mapper.components import _wire_source
    from .yaml_preview import _source

    name = str(s.get("fieldName") or "")
    label = _text(s.get("label"))
    options = []
    for o in s.get("options") or []:
        if isinstance(o, dict):
            value = o.get("value")
            options.append(
                Option(value=str(value), label=mapper.T(str(o.get("label") if o.get("label") is not None else value)))
            )
    return AppContextSelector(
        field_name=name,
        label=mapper.T(label) if label else humanize(name),
        options=options,
        options_source=_wire_source(_source(s.get("optionsSource"))),
    )


def _header_action(mapper, a: dict, mount: str) -> AppHeaderAction:
    children = a.get("children")
    route = _text(a.get("route"))
    return AppHeaderAction(
        action_id=_text(a.get("actionId")),
        label=mapper.T(str(a.get("label") or "")),
        icon=_text(a.get("icon")),
        route=None if route is None else mount + _prepend("", _within_mount(mount, route)),
        children=[_header_action(mapper, c, mount) for c in children if isinstance(c, dict)]
        if isinstance(children, list)
        else None,
    )
