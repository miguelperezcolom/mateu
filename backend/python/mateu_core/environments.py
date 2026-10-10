"""Deployment environments for the REST source catalogue — the Python mirror of Java's
``Environments``.

A ``type: Environment`` file (or ``environments/<name>.yaml`` under the specs directory) re-points
named sources — base url, url, headers, proxy flag — WITHOUT editing ``sources.yaml``; the ACTIVE
one (``MATEU_ENVIRONMENT``, or ``add_mateu(environment=...)``/``RestSourceRegistry(environment=...)``)
is overlaid on the merged catalogue, so the wire (``AppMetadata.rest_sources``) and the server-side
proxy both see it. Only the DEPLOYMENT of an endpoint is overridable; secrets never belong here —
a literal credential header is warned about (write ``${secret.X}``, resolved from
``MATEU_SECRET_X`` by the proxy).
"""

from __future__ import annotations

import logging
import os
import re
from dataclasses import replace
from pathlib import Path
from typing import Any

import yaml

from mateu_uidl import Environment, SourceOverride
from mateu_uidl.rest_sources import RestSourceEntry

log = logging.getLogger("mateu.environments")

ENV_VAR = "MATEU_ENVIRONMENT"
CONVENTIONAL_DIR = "environments"


def active_name(configured: str | None = None) -> str | None:
    name = (configured or os.environ.get(ENV_VAR) or "").strip()
    return name or None


def _warn_on_literal_secrets(where: str, source: str, headers: dict[str, str]) -> None:
    for header, value in headers.items():
        lower = header.lower()
        credential = (
            lower == "authorization"
            or "api-key" in lower
            or "apikey" in lower
            or "token" in lower
            or "secret" in lower
        )
        if credential and value is not None and "${" not in value:
            log.warning(
                "Environment %s gives source '%s' a literal '%s' header: never put a secret in an"
                " environment file — write ${secret.X} and set MATEU_SECRET_X on the server",
                where,
                source,
                header,
            )


def parse(root: Any, relative_path: str | None) -> Environment | None:
    """A parsed file as an environment, or None when it is not one."""
    if not isinstance(root, dict):
        return None
    kind = root.get("type") or ""
    conventional = relative_path is not None and relative_path.startswith(CONVENTIONAL_DIR + "/")
    if kind != "Environment" and not (conventional and not kind):
        return None
    name = str(root.get("name") or "").strip()
    if not name and relative_path:
        name = re.sub(r"\.ya?ml$", "", relative_path.rsplit("/", 1)[-1])
    sources: dict[str, SourceOverride] = {}
    node = root.get("sources")
    if isinstance(node, dict):
        for source_name, o in node.items():
            o = o if isinstance(o, dict) else {}
            raw_headers = o.get("headers")
            headers = (
                {str(k): str(v) for k, v in raw_headers.items()} if isinstance(raw_headers, dict) else {}
            )
            _warn_on_literal_secrets(relative_path or "?", str(source_name), headers)
            proxy = o.get("proxy")
            sources[str(source_name)] = SourceOverride(
                base_url=o.get("baseUrl") or o.get("base_url"),
                url=o.get("url"),
                headers=headers,
                proxy=None if proxy is None else bool(proxy),
            )
    return Environment(name=name, sources=sources)


def all_environments(directory: str | Path | None = None) -> dict[str, Environment]:
    root_dir = Path(directory or os.environ.get("MATEU_SPECS_DIR") or Path("specs") / "ui")
    by_name: dict[str, Environment] = {}
    if not root_dir.is_dir():
        return by_name
    for file in sorted(root_dir.rglob("*")):
        if file.suffix not in (".yaml", ".yml"):
            continue
        try:
            root = yaml.safe_load(file.read_text(encoding="utf-8"))
        except Exception as e:  # noqa: BLE001 - logged, not fatal
            log.warning("Failed to read environment %s: %s", file, e)
            continue
        env = parse(root, file.relative_to(root_dir).as_posix())
        if env is not None:
            by_name[env.name] = env
    return by_name


def active(directory: str | Path | None = None, configured: str | None = None) -> Environment | None:
    name = active_name(configured)
    if name is None:
        return None
    env = all_environments(directory).get(name)
    if env is None:
        log.warning(
            "Environment '%s' is active (%s) but no environment file declares it — the REST sources"
            " stay as authored",
            name,
            ENV_VAR,
        )
    return env


def rebase(url: str | None, base_url: str) -> str:
    """``url`` moved to ``base_url``: an absolute url keeps its path and query under the new origin
    (a base url with a path of its own prefixes it); a relative url gets the base prepended."""
    base = base_url[:-1] if base_url.endswith("/") else base_url
    if not url or not url.strip():
        return base
    scheme_end = url.find("://")
    if scheme_end > 0:
        path_start = url.find("/", scheme_end + 3)
        rest = "" if path_start < 0 else url[path_start:]
    else:
        rest = url if url.startswith("/") else "/" + url
    return base + rest


def overlay_entry(entry: RestSourceEntry, override: SourceOverride) -> RestSourceEntry:
    source = entry.source
    url = source.url
    if override.url and override.url.strip():
        url = override.url
    elif override.base_url and override.base_url.strip():
        url = rebase(url, override.base_url)
    headers = dict(source.headers or {})
    headers.update(override.headers)
    repointed = replace(
        source,
        url=url,
        headers=headers,
        proxy=override.proxy if override.proxy is not None else source.proxy,
    )
    return replace(entry, source=repointed)


def overlay(catalog: list[RestSourceEntry], env: Environment | None) -> list[RestSourceEntry]:
    if env is None or not env.sources:
        return catalog
    known = {e.name for e in catalog}
    out = [overlay_entry(e, env.sources[e.name]) if e.name in env.sources else e for e in catalog]
    for name in env.sources:
        if name not in known:
            log.warning(
                "Environment '%s' overrides source '%s', which the catalogue does not declare",
                env.name,
                name,
            )
    log.info(
        "REST sources: environment '%s' re-points %d source(s)",
        env.name,
        sum(1 for n in env.sources if n in known),
    )
    return out


__all__ = ["active", "active_name", "all_environments", "overlay", "overlay_entry", "parse", "rebase"]
