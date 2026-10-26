"""Serving a web renderer's page from this server — the Python twin of Java's ``IndexPage`` +
``SpaFallback`` + ``StaticAssetCaching`` (``io.mateu.core.infra``).

A Java app serves its UI itself: the ``mateu-vaadin`` / ``mateu-redwood`` jar on the classpath
brings the renderer's page (``static/_index.html``) and assets, and the generated controller
answers the mount and its deep links with that page aimed at the mount. This port answered the
sync API only, so a first-time user had nothing to open in a browser. Given a RENDERER — the
``static/`` folder of one of those jars, or the jar itself — this module serves the same page the
same way: the index at the mount and at every deep link under it (a GET that accepts HTML and
names no file), the assets at the origin root (where the renderer's page references them), and
nothing under ``/mateu`` (an API miss stays a 404, never the page).

The renderer is not packaged with ``mateu-ui``: point ``add_mateu(ui=…)`` / ``MATEU_UI`` at the
jar downloaded from Maven Central (``io.mateu:mateu-vaadin`` or ``mateu-redwood``, same version
as the wire you target) or at its extracted ``static/`` folder.
"""

from __future__ import annotations

import mimetypes
import os
import zipfile
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlsplit

from . import pwa

#: The renderer the server serves, when not passed to ``add_mateu(ui=…)``.
ENV_VAR = "MATEU_UI"

#: Where the renderer's page and assets sit inside a renderer jar.
JAR_PREFIX = "static/"

INDEX = "_index.html"

#: What the renderer's template says where the page title goes (Java: IndexPage).
TITLE_MARKER = "AQUIELTITULODELAPAGINA"
UI_FROM = "<!-- AQUIUI -->"
UI_TO = "<!-- HASTAAQUIUI -->"
FAVICON_MARKER = "<!-- AQUIFAVICON -->"

#: Java's IndexPage.DEFAULT_FAVICON, byte for byte: the favicon a renderer page carries (Mateu's
#: icon, served by the renderer next to its assets), never the build tool's ``/vite.svg``; the
#: app's own favicon arrives with the shell (``SetFavicon``).
DEFAULT_FAVICON = '<link rel="icon" type="image/svg+xml" href="/assets/mateu-icon.svg" />'

#: Java's IndexPage.MARKERS: the template markers none of which is left in a served page.
MARKERS = (
    "<!-- AQUIFAVICON -->",
    "<!-- AQUIKEYCLOAK -->",
    "<!-- AQUIJS -->",
    "<!-- HASTAAQUIJS -->",
    "<!-- AQUIUI -->",
    "<!-- HASTAAQUIUI -->",
)


def without_markers(html: str) -> str:
    """Java's ``IndexPage.withoutMarkers``: ``html`` without the template's marker comments (a
    served page showed them in view-source). Applied last."""
    for marker in MARKERS:
        html = html.replace(marker, "")
    return html

#: Java's IndexPage.DEFERRED_BOOT, byte for byte: boots a page that parks its scripts as
#: ``type="text/mateu-deferred"`` (the Redwood / Visual Builder page), in order, awaiting each,
#: and explains itself instead of staying blank when one cannot be loaded. A no-op on the
#: Vite-built Vaadin page, which has no deferred scripts.
DEFERRED_BOOT = (
    "<script>(function(){var all=document.getElementsByTagName('script'),d=[];"
    "for(var j=0;j<all.length;j++){if(all[j].type==='text/mateu-deferred')d.push(all[j]);}"
    "if(!d.length)return;"
    "function fail(u){console.log('mateu: deferred boot failed',u);"
    "if(document.getElementById('mateu-boot-failed'))return;"
    "var f=document.createElement('div');f.id='mateu-boot-failed';f.setAttribute('role','alert');"
    "f.setAttribute('style','font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;max-width:40rem;margin:15vh auto;padding:1.5rem;line-height:1.5;color:#1a1a1a;background:#fff;border:1px solid #ddd;border-radius:8px;');"
    "f.innerHTML='<h1 style=\"font-size:1.4rem;margin:0 0 .5rem\">The application could not start</h1>'"
    "+'<p>A script it needs could not be loaded:</p><p><code style=\"word-break:break-all\"></code></p>'"
    "+'<p>Check your network connection, or whether a proxy or a content security policy blocks it.</p>'"
    "+'<p><a href=\"\">Try again</a></p>';"
    "f.querySelector('code').textContent=u;"
    "f.querySelector('a').addEventListener('click',function(e){e.preventDefault();location.reload();});"
    "document.body.appendChild(f);}"
    "var i=0;(function n(){if(i>=d.length)return;var o=d[i++],s=document.createElement('script');"
    "for(var k=0;k<o.attributes.length;k++){var a=o.attributes[k];"
    "if(a.name==='type'||a.name==='data-src')continue;s.setAttribute(a.name,a.value);}"
    "var u=o.getAttribute('data-src');"
    "if(u){s.onload=n;s.onerror=function(){fail(u);};s.src=u;}else{s.text=o.textContent;}"
    "o.parentNode.replaceChild(s,o);if(!u)n();})();})();</script>"
)

#: Folders whose files the browser must revalidate on every load (their names carry no hash —
#: Java's StaticAssetCaching.REVALIDATE_FOLDERS); a ``/version_<ts>/`` path is immutable.
REVALIDATE_FOLDERS = ("assets", "js", "myassets", "_redwood")
IMMUTABLE_CACHE_CONTROL = "max-age=31536000, public, immutable"
REVALIDATE_CACHE_CONTROL = "no-cache"

_CONTENT_TYPES = {
    ".js": "text/javascript",
    ".mjs": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".html": "text/html; charset=utf-8",
    ".map": "application/json",
}


def _attr(value: str) -> str:
    return value.replace("&", "&amp;").replace('"', "&quot;")


def mount_ui(html: str, base_url: str, debug: bool = False) -> str:
    """Java's ``IndexPage.mountUi``: the ``<!-- AQUIUI -->…<!-- HASTAAQUIUI -->`` region becomes a
    ``<mateu-ui>`` root aimed at the mount, followed by the deferred-boot replayer. A page without
    the markers is returned unchanged."""
    start = html.find(UI_FROM)
    end = html.find(UI_TO)
    if start < 0 or end < start:
        return html
    root = (
        f'<mateu-ui baseUrl="{_attr(base_url)}" pathPrefix="{_attr(base_url)}"'
        + (' debug="true"' if debug else "")
        + ' style="width:100%;height:100vh;"></mateu-ui>'
    )
    return html[:start] + root + DEFERRED_BOOT + html[end:]


def render_index(
    template: str,
    base_url: str,
    title: str,
    debug: bool = False,
    oracle_cdn: str | None = None,
    app_type: type | None = None,
    build_id: str | None = None,
) -> str:
    """The renderer's page aimed at ``base_url`` (the mount, ``""`` for the root) and titled. Like
    Java's ``IndexPage.render``: the favicon marker becomes ``DEFAULT_FAVICON`` and no template
    marker is left in the page. With ``oracle_cdn`` (an already validated mirror, see
    ``resolve_oracle_cdn``) Oracle's CDN URLs are re-pointed at it AFTER the markers are filled.
    LAST, the Progressive Web App's head (``pwa.served``: the manifest of ``app_type``, the theme
    colour, the worker of ``build_id``), unless it is switched off."""
    html = template.replace(FAVICON_MARKER, DEFAULT_FAVICON).replace(TITLE_MARKER, title)
    html = rewrite_oracle_cdn(without_markers(mount_ui(html, base_url, debug)), oracle_cdn)
    return pwa.served(html, base_url, app_type, build_id) or html


#: The mirror of Oracle's CDN, when not passed to ``add_mateu(oracle_cdn_url=…)`` (Java:
#: ``mateu.oracle-cdn.url`` / ``MATEU_ORACLE_CDN_URL``).
ORACLE_CDN_ENV_VAR = "MATEU_ORACLE_CDN_URL"

#: What the Redwood page loads JET, Spectra (oj-sp), the Visual Builder runtime and the gallery
#: images from. Mateu never bundles Oracle's files: an organisation that must not depend on Oracle's
#: CDN at runtime hosts a mirror of this folder, and the page is re-pointed at it.
ORACLE_CDN = "https://static.oracle.com/cdn"

#: The preconnect hint the Redwood page carries for Oracle's CDN origin.
ORACLE_CDN_PRECONNECT = 'href="https://static.oracle.com"'

_UNSAFE_IN_URL = set("\"'<>`")


def resolve_oracle_cdn(configured: str | None) -> tuple[str | None, str | None]:
    """``(mirror, rejected)``: the mirror to serve Oracle's CDN content from — ``configured`` when not
    blank, else ``MATEU_ORACLE_CDN_URL`` — or None (off: the page is unchanged) when neither is set
    or the value is not usable, in which case ``rejected`` is a message to log. Usable = an absolute
    http(s) URL with no quote, ``<``, ``>`` or whitespace (it is written into HTML attributes and
    inline script); a trailing slash is dropped."""
    value = configured if configured is not None and configured.strip() else os.environ.get(ORACLE_CDN_ENV_VAR)
    if value is None or not value.strip():
        return None, None
    value = value.strip()
    parsed = urlsplit(value)
    if (
        any(c in _UNSAFE_IN_URL or c.isspace() or not c.isprintable() for c in value)
        or parsed.scheme not in ("http", "https")
        or not parsed.hostname
    ):
        shown = "".join(c if c.isprintable() else "?" for c in value[:256])
        return None, (
            f"Ignoring the Oracle CDN mirror (oracle_cdn_url / {ORACLE_CDN_ENV_VAR}) '{shown}': it must be "
            "an absolute http(s) URL with no quotes, '<', '>' or whitespace. The Redwood page keeps "
            f"loading from {ORACLE_CDN}."
        )
    return value.rstrip("/"), None


def rewrite_oracle_cdn(html: str, mirror: str | None) -> str:
    """Java's ``IndexPage.withOracleCdn``: every ``ORACLE_CDN`` in ``html`` becomes ``mirror``, and
    the preconnect to Oracle's origin becomes one to the mirror's origin. Nothing else changes; a
    None mirror leaves the page as is."""
    if not mirror:
        return html
    parts = urlsplit(mirror)
    origin = f"{parts.scheme}://{parts.netloc.rsplit('@', 1)[-1]}"
    return html.replace(ORACLE_CDN, mirror).replace(ORACLE_CDN_PRECONNECT, f'href="{origin}"')


def spa_candidate(path: str) -> bool:
    """Java's ``SpaFallback.candidate``: a deep link the page may answer — not the root itself, no
    file extension, never the API (``/mateu/…``) and never a PWA file of a nested mount
    (``/crm/mateu/v3/pwa/…``)."""
    return (
        bool(path)
        and path != "/"
        and "." not in path
        and not path.startswith("/mateu")
        and not pwa.is_endpoint(path)
    )


def accepts_html(accept: str | None) -> bool:
    """Java's ``SpaFallback.acceptsHtml``: a browser navigation (or no preference) — a data fetch
    asking for JSON is never answered with the page."""
    return accept is None or not accept.strip() or "text/html" in accept


def under_mount(path: str, base_url: str) -> bool:
    """Whether ``path`` is the mount or a deep link under it (``base_url`` ``""`` = the root)."""
    if not base_url:
        return True
    return path == base_url or path.startswith(base_url + "/")


def cache_control_for(path: str) -> str | None:
    """Java's ``StaticAssetCaching.cacheControlFor``."""
    if not path.startswith("/"):
        return None
    if path.startswith("/version_") and path.find("/", 1) > 0:
        return IMMUTABLE_CACHE_CONTROL
    for folder in REVALIDATE_FOLDERS:
        if path.startswith("/" + folder + "/"):
            return REVALIDATE_CACHE_CONTROL
    return None


def api_hint_page(base_url: str) -> str:
    """What a BROWSER gets at the mount of a server that serves no renderer: a short explanation
    instead of a bare JSON 404 — the first thing a newcomer does with a running starter is open its
    URL. Answered with status 404 (there is no page here), only to a request that explicitly
    accepts HTML; identical in the .NET port (``UiPage.ApiHintPage``)."""
    mount = base_url.rstrip("/")
    esc = mount.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return (
        '<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
        "<title>Mateu API</title></head>"
        '<body style="font-family:system-ui,sans-serif;max-width:42rem;margin:3rem auto;padding:0 1rem;line-height:1.5">'
        "<h1>This server answers the Mateu API</h1>"
        f"<p>It serves the sync API at <code>POST {esc}/mateu/v3/sync/{{route}}</code>, which every Mateu "
        "renderer (web, mobile, IDE) can render, but no web page.</p>"
        f"<p>To open the app in this browser, set <code>{ENV_VAR}</code> to the "
        "<code>io.mateu:mateu-vaadin</code> (or <code>mateu-redwood</code>) jar, or to its "
        "<code>static/</code> folder, and restart; or pass the same location as <code>ui</code> when "
        "registering Mateu.</p></body></html>"
    )


def content_type_of(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()
    if ext in _CONTENT_TYPES:
        return _CONTENT_TYPES[ext]
    guessed, _ = mimetypes.guess_type(path)
    return guessed or "application/octet-stream"


@dataclass(frozen=True)
class RendererFiles:
    """A web renderer's files: a directory holding ``_index.html`` and its assets (a jar's
    extracted ``static/`` folder, a renderer's ``dist/``), or the jar/zip itself, read in place."""

    location: Path

    @staticmethod
    def at(location: str | os.PathLike[str]) -> "RendererFiles":
        path = Path(location).expanduser()
        if not path.exists():
            raise FileNotFoundError(f"Mateu UI renderer not found at {path}")
        files = RendererFiles(path)
        if files.read(INDEX) is None:
            raise FileNotFoundError(
                f"{path} is not a Mateu web renderer: no {INDEX} (expected the static/ folder of "
                "io.mateu:mateu-vaadin or mateu-redwood, or the jar itself)"
            )
        return files

    @property
    def is_archive(self) -> bool:
        return self.location.is_file()

    def read(self, relative: str) -> bytes | None:
        """The bytes of ``relative`` (``assets/mateu-vaadin.js``), or None when it is not a file
        of this renderer. Never escapes the renderer's root."""
        relative = relative.lstrip("/")
        if not relative or ".." in relative.split("/"):
            return None
        if self.is_archive:
            # only the renderer's own files (the jar's static/ folder): never META-INF, never classes
            try:
                with zipfile.ZipFile(self.location) as jar:
                    try:
                        info = jar.getinfo(JAR_PREFIX + relative)
                    except KeyError:
                        return None
                    return None if info.is_dir() else jar.read(info)
            except zipfile.BadZipFile:
                return None
        file = self.location / relative
        try:
            file.resolve().relative_to(self.location.resolve())
        except ValueError:
            return None
        return file.read_bytes() if file.is_file() else None

    def index_template(self) -> str:
        data = self.read(INDEX)
        if data is None:
            raise FileNotFoundError(f"{self.location} has no {INDEX}")
        return data.decode("utf-8")


def configured_renderer(ui: str | os.PathLike[str] | None) -> RendererFiles | None:
    """The renderer to serve: ``ui`` when given, else ``MATEU_UI``, else none (API only)."""
    location = ui if ui is not None else os.environ.get(ENV_VAR)
    if location is None or (isinstance(location, str) and not location.strip()):
        return None
    return RendererFiles.at(location)
