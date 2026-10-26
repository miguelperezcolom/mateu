"""Every Mateu UI as an installable Progressive Web App — the Python twin of Java's ``Pwa``
(``io.mateu.core.infra``) and .NET's ``Pwa``: the same files, the same manifest bytes, the same head.

Chrome and Edge offer "Install app" on the desktop (its own window and icon), phones add it to the
home screen, and the shell opens offline. Three parts, all under ``<base_url>/mateu/v3/pwa/``:

- ``manifest.webmanifest`` — the W3C web app manifest. Its members come from the SAME derivation as
  the Mateu mobile app's manifest (:func:`mateu_ui.core.mobile_manifest.manifest`: the
  ``MATEU_MOBILE_*`` settings > ``@mobile_app`` > the app), so a rename reaches both; icons fall
  back to Mateu's own (``icon-192.png``, ``icon-512.png``, ``icon-maskable-512.png``).
- ``sw.js`` — the service worker: network first, so it never hides a new deploy; it caches only the
  shell and static files, never the API or REST-source data. One cache per build. Served with
  ``Service-Worker-Allowed``, so it controls the whole UI although it lives under ``/mateu/``.
- ``register.js`` — the external script that registers it (the page has no inline script for it).

ON by default. ``MATEU_PWA_ENABLED=false`` turns it off; it is also off in development mode
(``MATEU_DEV``), where a cached shell would only get in the way of live reload. Off, the page
carries none of it and the worker's URL answers a worker that unregisters itself, so a browser
that installed it before lets it go.

The worker, the registration script and the icons are byte-identical copies of Java's resources
(``pwa_files/``).
"""

from __future__ import annotations

import hashlib
import json
import os
import re
from dataclasses import dataclass, field
from importlib import resources as _importlib_resources
from typing import Any
from urllib.parse import quote_plus

from mateu_ui._version import __version__

from . import dev_specs, mobile_manifest

#: The setting that turns it off (``false``) — Java's ``mateu.pwa.enabled``.
ENV_VAR = "MATEU_PWA_ENABLED"

#: Where the files live, under a UI's base URL.
DIR = "/mateu/v3/pwa/"

MANIFEST = "manifest.webmanifest"
WORKER = "sw.js"
REGISTER = "register.js"
ICON_192 = "icon-192.png"
ICON_512 = "icon-512.png"
ICON_MASKABLE = "icon-maskable-512.png"

#: The worker that removes itself, answered at the worker's URL when this is switched off.
WORKER_OFF = "sw-off.js"

#: The splash-screen background of an installed app.
BACKGROUND_COLOR = "#ffffff"

_PACKAGE = "mateu_ui.core"
_RESOURCES = "pwa_files"

_HEX_COLOR = re.compile(r"#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})")
_SCHEME = re.compile(r"[a-z][a-z0-9+.-]*:.*")


def enabled() -> bool:
    """Whether the UIs are served as PWAs: unless ``MATEU_PWA_ENABLED`` is false, and not in dev mode."""
    return (os.environ.get(ENV_VAR) or "").strip().lower() != "false" and not dev_specs.enabled()


def is_endpoint(path: str | None) -> bool:
    """Whether ``path`` is one of the files under ``DIR``."""
    return path is not None and DIR in path


def scope_of(base_url: str | None) -> str:
    """The scope of a UI at ``base_url``: ``/`` for the root UI, ``/crm`` otherwise (no trailing
    slash: the UI's own page is ``/crm``, and it must be inside)."""
    return "/" + (base_url or "").strip().strip("/")


def dir_of(base_url: str | None) -> str:
    """The folder of the files of a served UI: ``/mateu/v3/pwa/``, ``/crm/mateu/v3/pwa/``."""
    scope = scope_of(base_url)
    return ("" if scope == "/" else scope) + DIR


# ------------------------------------------------------------------------------------------------
# The web app manifest
# ------------------------------------------------------------------------------------------------
#
# ``app_type`` plays Java's ``MobileManifest.Source``: the ``@app`` class whose ``@mobile_app`` (and
# the MATEU_MOBILE_* settings) declare the name, icon and theme colour; None is an app that declares
# nothing (Java's ``MobileManifest.sourceOf((AppShell) null)``), for which the settings still apply.


def manifest(app_type: type | None, start_url: str, scope: str) -> dict[str, Any]:
    """The web app manifest's members, in order."""
    derived = mobile_manifest.manifest(app_type)
    out: dict[str, Any] = {
        "id": start_url,
        "name": derived.get("name"),
        "short_name": derived.get("shortName"),
        "start_url": start_url,
        "scope": scope,
        "display": "standalone",
        "background_color": BACKGROUND_COLOR,
    }
    theme = theme_color(app_type)
    if theme is not None:
        out["theme_color"] = theme
    out["icons"] = icons(app_type)
    return out


def manifest_json(app_type: type | None, start_url: str, scope: str) -> str:
    """:func:`manifest` as compact JSON (byte-identical to Java's and .NET's)."""
    return json.dumps(manifest(app_type, start_url, scope), separators=(",", ":"), ensure_ascii=False)


def theme_color(app_type: type | None) -> str | None:
    """The theme colour the UI declares (the mobile manifest's), when it is a hex colour."""
    value = mobile_manifest.manifest(app_type).get("themeColor")
    return value if isinstance(value, str) and _HEX_COLOR.fullmatch(value) else None


def declared_icon(app_type: type | None) -> str | None:
    """The icon the UI declares for itself (the mobile manifest's: ``MATEU_MOBILE_ICON`` or
    ``@mobile_app(icon=…)``), normalised to a URL a manifest may carry, or None. Accepted: an https
    URL, a path on the UI's origin (a relative one is taken from the origin's root), a raster or
    SVG ``data:image/…`` URI. Refused: plain http, other schemes, ``.ico``."""
    value = mobile_manifest.manifest(app_type).get("icon")
    if not isinstance(value, str) or not value.strip():
        return None
    icon = value.strip()
    lower = icon.lower()
    if lower.startswith("data:"):
        return icon if icon_type(icon) is not None else None
    if "<" in lower or '"' in lower or " " in lower:
        return None
    if _path_of(lower).endswith(".ico"):
        return None
    if lower.startswith("https://"):
        return icon
    if lower.startswith("//") or _SCHEME.fullmatch(lower):
        return None  # protocol-relative, http:, javascript:…
    return icon if icon.startswith("/") else "/" + icon


def _path_of(url: str) -> str:
    cut = len(url)
    for c in ("?", "#"):
        at = url.find(c)
        if 0 <= at < cut:
            cut = at
    return url[:cut]


def icon_type(icon: str) -> str | None:
    """The MIME type of an icon URL: a recognised image type, ``""`` for a path of unknown
    extension, None for a ``data:`` URI a browser would not show as an app icon."""
    lower = icon.lower()
    if lower.startswith("data:"):
        for kind in ("image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"):
            if lower.startswith("data:" + kind + ";") or lower.startswith("data:" + kind + ","):
                return kind
        return None
    path = _path_of(lower)
    if path.endswith(".png"):
        return "image/png"
    if path.endswith(".svg"):
        return "image/svg+xml"
    if path.endswith(".webp"):
        return "image/webp"
    if path.endswith(".jpg") or path.endswith(".jpeg"):
        return "image/jpeg"
    if path.endswith(".gif"):
        return "image/gif"
    return ""


def icons(app_type: type | None) -> list[dict[str, Any]]:
    """The manifest's icons: the declared one first (any size), then Mateu's defaults, which
    guarantee the 192 and 512 px icons installability asks for. Their ``src`` is relative to the
    manifest."""
    out: list[dict[str, Any]] = []
    declared = declared_icon(app_type)
    if declared is not None:
        icon: dict[str, Any] = {"src": declared, "sizes": "any"}
        kind = icon_type(declared)
        if kind:
            icon["type"] = kind
        icon["purpose"] = "any"
        out.append(icon)
    out.append(_icon(ICON_192, "192x192", "any"))
    out.append(_icon(ICON_512, "512x512", "any"))
    out.append(_icon(ICON_MASKABLE, "512x512", "maskable"))
    return out


def _icon(src: str, sizes: str, purpose: str) -> dict[str, Any]:
    return {"src": src, "sizes": sizes, "type": "image/png", "purpose": purpose}


# ------------------------------------------------------------------------------------------------
# The page's head
# ------------------------------------------------------------------------------------------------


@dataclass(frozen=True)
class Links:
    """Where a page finds the PWA's files: the manifest, the worker (without query), the
    registration script, the iOS home-screen icon, the worker's scope, and files the worker
    caches when installed besides the shell (may be empty)."""

    manifest: str
    worker: str
    register: str
    apple_touch_icon: str
    scope: str
    precache: tuple[str, ...] = field(default=())

    @staticmethod
    def served(base_url: str | None) -> "Links":
        """The links of a UI served at ``base_url``."""
        d = dir_of(base_url)
        return Links(d + MANIFEST, d + WORKER, d + REGISTER, d + ICON_192, scope_of(base_url))


def served(html: str | None, base_url: str | None, app_type: type | None = None, build_id: str | None = None) -> str | None:
    """A served page with the PWA's head: ``html`` unchanged when it is switched off
    (:func:`enabled`). ``build_id`` is the app's build (``X-Mateu-Build``), so a new build installs
    a new worker."""
    if not enabled() or html is None:
        return html
    return with_head(html, Links.served(base_url), app_type, build_id)


def _url_encode(value: str) -> str:
    """Java's ``URLEncoder.encode(value, UTF_8)``: space → ``+``, only ``A-Za-z0-9.-*_`` kept."""
    return quote_plus(value, safe="*").replace("~", "%7E")


def with_head(html: str | None, links: Links, app_type: type | None, build_id: str | None) -> str | None:
    """``html`` with the manifest link, the theme colour, the apple-touch-icon and the worker's
    registration added to its ``<head>``. The worker's URL carries its version — a hash of the page
    and of ``build_id`` — and the folders the page loads its own files from, which it may cache. A
    page that already has a manifest link is left as it is."""
    if html is None or "</head>" not in html or 'rel="manifest"' in html:
        return html
    query = "?v=" + version(html, build_id)
    for folder in static_folders(html):
        query += "&s=" + _url_encode(folder)
    for file in links.precache:
        query += "&p=" + _url_encode(file)
    head = f'<link rel="manifest" href="{_attr(links.manifest)}" crossorigin="use-credentials">'
    theme = theme_color(app_type)
    if theme is not None:
        head += f'<meta name="theme-color" content="{_attr(theme)}">'
    declared = declared_icon(app_type)
    touch_icon = (
        declared
        if declared is not None and not declared.startswith("data:") and icon_type(declared) != "image/svg+xml"
        else links.apple_touch_icon
    )
    head += f'<link rel="apple-touch-icon" href="{_attr(touch_icon)}">'
    head += (
        f'<script src="{_attr(links.register)}" data-sw="{_attr(links.worker + query)}"'
        f' data-scope="{_attr(links.scope)}" defer></script>'
    )
    at = html.index("</head>")
    return html[:at] + head + html[at:]


def version(html: str, build_id: str | None) -> str:
    """A short hash of the page and the build: the worker's version."""
    digest = hashlib.sha256(html.encode("utf-8"))
    digest.update(f"\n{'null' if build_id is None else build_id}\n{__version__}".encode("utf-8"))
    return digest.hexdigest()[:16]


_SCRIPT_SRC = re.compile(r"""<script\b[^>]*?\s(?:data-)?src\s*=\s*["']([^"']+)["']""", re.IGNORECASE)
_LINK = re.compile(r"<link\b[^>]*>", re.IGNORECASE)
_LINK_REL = re.compile(r"""\srel\s*=\s*["'][^"']*\b(stylesheet|modulepreload|preload)\b""", re.IGNORECASE)
_LINK_HREF = re.compile(r"""\shref\s*=\s*["']([^"']+)["']""", re.IGNORECASE)


def static_folders(html: str) -> list[str]:
    """The folders a page loads its scripts and stylesheets from — ``/assets/``, ``/_redwood/``,
    ``https://static.oracle.com/cdn/`` — which the worker may cache whatever their request. Never a
    ``/mateu/`` folder, and only what scripts and stylesheets name, so no data endpoint can slip in."""
    urls = [m.group(1) for m in _SCRIPT_SRC.finditer(html)]
    for m in _LINK.finditer(html):
        tag = m.group()
        if _LINK_REL.search(tag):
            href = _LINK_HREF.search(tag)
            if href:
                urls.append(href.group(1))
    folders: dict[str, None] = {}
    for url in urls:
        folder = _folder_of(url.strip())
        if folder is not None:
            folders[folder] = None
        if len(folders) >= 8:
            break
    return list(folders)


def _folder_of(url: str) -> str | None:
    lower = url.lower()
    origin = ""
    if lower.startswith(("https://", "http://", "//")):
        start = 2 if lower.startswith("//") else url.find("//") + 2
        slash = url.find("/", start)
        if slash < 0:
            return None
        origin = ("https:" if lower.startswith("//") else "") + url[:slash]
        path = url[slash:]
    elif _SCHEME.fullmatch(lower) or lower.startswith("#"):
        return None  # data:, blob:, javascript:…
    else:
        path = url if url.startswith("/") else "/" + (url[2:] if url.startswith("./") else url)
    path = _path_of(path)
    second = path.find("/", 1)
    if second < 0:
        return None  # a file at the root is no folder
    segment = path[1:second]
    if segment in ("", "mateu", "..", "."):
        return None
    return origin + "/" + segment + "/"


# ------------------------------------------------------------------------------------------------
# The files
# ------------------------------------------------------------------------------------------------


@dataclass(frozen=True)
class Asset:
    """A file of the PWA, ready to be written to the response."""

    content_type: str
    headers: dict[str, str]
    body: bytes


def asset(file: str | None, base_url: str | None, app_type: type | None = None) -> Asset | None:
    """A PWA file of the UI at ``base_url``, or None when ``file`` is not one of them (a 404).
    Switched off (:func:`enabled`), the manifest and the registration script are None too, and the
    worker is the one that unregisters itself."""
    if file is None:
        return None
    on = enabled()
    scope = scope_of(base_url)
    if file == MANIFEST:
        if not on:
            return None
        return Asset(
            "application/manifest+json",
            _headers("application/manifest+json", "public, max-age=300", None),
            manifest_json(app_type, scope, scope).encode("utf-8"),
        )
    if file == WORKER:
        return Asset(
            "text/javascript; charset=utf-8",
            _headers("text/javascript; charset=utf-8", "no-cache", scope),
            resource(WORKER if on else WORKER_OFF),
        )
    if file == REGISTER:
        if not on:
            return None
        return Asset(
            "text/javascript; charset=utf-8",
            _headers("text/javascript; charset=utf-8", "no-cache", None),
            resource(REGISTER),
        )
    if file in (ICON_192, ICON_512, ICON_MASKABLE):
        return Asset("image/png", _headers("image/png", "public, max-age=86400", None), resource(file))
    return None


def _headers(content_type: str, cache_control: str, worker_scope: str | None) -> dict[str, str]:
    headers = {
        "Content-Type": content_type,
        "Cache-Control": cache_control,
        "X-Content-Type-Options": "nosniff",
    }
    if worker_scope is not None:
        # the worker lives under /mateu/v3/pwa/ but controls the whole UI
        headers["Service-Worker-Allowed"] = worker_scope
    return headers


def resource(name: str) -> bytes:
    """The bytes of one of the files shipped in this package (``sw.js``, the icons…)."""
    if name not in (WORKER, WORKER_OFF, REGISTER, ICON_192, ICON_512, ICON_MASKABLE):
        raise ValueError(f"missing PWA resource {name}")
    return (_importlib_resources.files(_PACKAGE) / _RESOURCES / name).read_bytes()


def _attr(value: str | None) -> str:
    return "" if value is None else value.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;")
