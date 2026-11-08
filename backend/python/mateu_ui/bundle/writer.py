"""Writes the static bundle to disk — the Python twin of the Maven plugin's ``BundleWriter`` and
``MobileManifestFile``: the same files at the same paths, so a bundle exported from this port is
served (and read by the renderers, the mobile app and the desktop hub) exactly like Java's.

- ``manifest.json`` — the pre-rendered increments and catalogues (:class:`~mateu_ui.bundle.BundleManifest`);
- the renderer's static app — everything a renderer ships under ``static/`` (Vaadin's ``assets/``,
  Redwood's ``_redwood/``), read from the renderer jar (``io.mateu:mateu-vaadin``) or its extracted
  ``static/`` folder, but the ``_index.html`` template;
- ``index.html`` — that template stamped to boot ``<mateu-ui bundleUrl="<base>/manifest.json">``;
- the installable app (``pwa/manifest.webmanifest``, ``pwa/register.js``, icons, ``mateu-sw.js``),
  or the worker that unregisters itself when off;
- ``mateu/v3/manifest`` — the UI manifest the Mateu mobile app reads, plus ``"bundle"``;
- ``_redirects`` — the SPA fallback for static hosts.
"""

from __future__ import annotations

import hashlib
import json
import shutil
import zipfile
from pathlib import Path

from mateu_ui.core import mobile_manifest, pwa, ui_page

from . import BundleManifest

#: The service worker, at the bundle's root so a static host needs no header for its scope.
WORKER = "mateu-sw.js"

#: The folder of the installable app's other files (manifest, registration script, icons).
PWA_DIR = "pwa/"

#: Where the mobile UI manifest goes, relative to the bundle (a server answers it at that path).
MOBILE_MANIFEST = mobile_manifest.PATH.lstrip("/")


def base_path_of(base_url: str | None) -> str:
    """The path the bundle is served under: ``""`` for a host's root, ``/app`` for ``/app`` or
    ``https://cdn.example.com/app/`` (Java's ``BundleWriter.basePathOf``)."""
    if not base_url or not base_url.strip():
        return ""
    path = base_url.strip()
    if not path.startswith("/"):
        from urllib.parse import urlsplit

        try:
            path = urlsplit(path).path or ""
        except ValueError:
            return ""
    path = path.rstrip("/")
    return path if (path.startswith("/") or path == "") else "/" + path


def stamp_index(html: str, base_url: str | None, page_title: str | None) -> str:
    """The renderer's ``_index.html`` aimed at the bundle (Java's ``BundleWriter.stampIndex``)."""
    html = html.replace(ui_page.TITLE_MARKER, page_title or "Mateu")
    base = base_url or ""
    root = (
        f'<mateu-ui baseUrl="{base}" bundleUrl="{base}/manifest.json"'
        ' style="width:100%;height:100vh;"></mateu-ui>'
    )
    html = html.replace(ui_page.FAVICON_MARKER, ui_page.DEFAULT_FAVICON)
    start, end = html.find(ui_page.UI_FROM), html.find(ui_page.UI_TO)
    if start >= 0 and end >= start:
        html = html[:start] + root + ui_page.DEFERRED_BOOT + html[end:]
    mirror, _ = ui_page.resolve_oracle_cdn(None)
    return ui_page.rewrite_oracle_cdn(ui_page.without_markers(html), mirror)


def copy_static_app(renderer: ui_page.RendererFiles, out: Path) -> None:
    """Everything the renderer ships but its ``_index.html`` template."""
    if renderer.is_archive:
        with zipfile.ZipFile(renderer.location) as jar:
            root = out.resolve()
            for info in jar.infolist():
                name = info.filename
                if not name.startswith(ui_page.JAR_PREFIX) or info.is_dir():
                    continue
                relative = name[len(ui_page.JAR_PREFIX):]
                if relative == ui_page.INDEX:
                    continue
                target = (out / relative).resolve()
                if root not in target.parents:
                    continue  # a zip-slip entry is nobody's static file
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(jar.read(info))
        return
    source = renderer.location
    for child in source.iterdir():
        if child.name == ui_page.INDEX:
            continue
        target = out / child.name
        if child.is_dir():
            shutil.copytree(child, target, dirs_exist_ok=True)
        else:
            shutil.copy2(child, target)


def write_pwa(out: Path, index: str, base_url: str | None, manifest_json: str, enabled: bool, app_type) -> str:
    """The installable app's files; returns ``index`` with its head. Off: only the worker that
    unregisters itself, and the page as it was."""
    if not enabled:
        (out / WORKER).write_bytes(pwa.resource(pwa.WORKER_OFF))
        return index
    base = base_path_of(base_url)
    scope = base + "/"
    folder = out / PWA_DIR
    folder.mkdir(parents=True, exist_ok=True)
    (folder / pwa.MANIFEST).write_text(pwa.manifest_json(app_type, scope, scope), encoding="utf-8")
    for name in (pwa.REGISTER, pwa.ICON_192, pwa.ICON_512, pwa.ICON_MASKABLE):
        (folder / name).write_bytes(pwa.resource(name))
    (out / WORKER).write_bytes(pwa.resource(pwa.WORKER))
    links = pwa.Links(
        manifest=base + "/" + PWA_DIR + pwa.MANIFEST,
        worker=base + "/" + WORKER,
        register=base + "/" + PWA_DIR + pwa.REGISTER,
        apple_touch_icon=base + "/" + PWA_DIR + pwa.ICON_192,
        scope=scope,
        precache=(base + "/manifest.json",),
    )
    version = hashlib.sha256(manifest_json.encode("utf-8")).hexdigest()[:16]
    return pwa.with_head(index, links, app_type, version) or index


def mobile_manifest_json(app_type, page_title: str | None) -> str:
    """The UI manifest of the bundled app (what a server answers at ``/mateu/v3/manifest``), plus
    ``"bundle": "manifest.json"`` — the bundle the mobile app runs from."""
    out = mobile_manifest.manifest(app_type)
    if app_type is None and page_title:
        out["name"] = page_title
        out["shortName"] = page_title
    out["bundle"] = "manifest.json"
    return json.dumps(out, separators=(",", ":"), ensure_ascii=False)


def write(
    out_dir: str | Path,
    manifest: BundleManifest,
    renderer: ui_page.RendererFiles | str | Path,
    base_url: str = "",
    page_title: str | None = None,
    pwa_enabled: bool = True,
    app_type=None,
) -> Path:
    """Writes the bundle into ``out_dir`` (created) — a self-contained static site."""
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    manifest_json = manifest.to_json()
    (out / "manifest.json").write_text(manifest_json, encoding="utf-8")
    files = renderer if isinstance(renderer, ui_page.RendererFiles) else ui_page.RendererFiles.at(renderer)
    copy_static_app(files, out)
    index = stamp_index(files.index_template(), base_url, page_title)
    index = write_pwa(out, index, base_url, manifest_json, pwa_enabled, app_type)
    (out / "index.html").write_text(index, encoding="utf-8")
    mobile = out / MOBILE_MANIFEST
    mobile.parent.mkdir(parents=True, exist_ok=True)
    mobile.write_text(mobile_manifest_json(app_type, page_title), encoding="utf-8")
    (out / "_redirects").write_text("/*    /index.html    200\n", encoding="utf-8")
    return out


__all__ = ["base_path_of", "stamp_index", "write", "WORKER", "PWA_DIR", "MOBILE_MANIFEST"]
