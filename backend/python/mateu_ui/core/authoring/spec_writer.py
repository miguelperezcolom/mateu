"""Writes an authored definition into the specs directory — the ``mateu_save_spec`` tool, only ever
offered in development mode (Java's ``SpecWriter``). The path rule is normative (the same in Java,
.NET and the sidecar): a relative ``.yaml``/``.yml`` path with no ``..``, ``.`` or empty segment, no
backslash, no drive letter, at most 255 characters, that stays inside the specs directory once
symbolic links are followed."""

from __future__ import annotations

import os
import re
from pathlib import Path

from mateu_ui.uidl import UserFacingException

from .validator import quote

_DRIVE = re.compile(r"^[A-Za-z]:")


def is_acceptable(path: str | None) -> bool:
    """Whether ``path`` is acceptable before touching the disk."""
    if path is None or not path.strip() or len(path) > 255:
        return False
    if "\0" in path or "\\" in path or path.startswith("/") or _DRIVE.search(path):
        return False
    if not (path.endswith(".yaml") or path.endswith(".yml")):
        return False
    return all(segment not in ("", ".", "..") for segment in path.split("/"))


def refusal(path: str | None) -> str:
    """The message of a refused path (shown as written)."""
    return (
        f"Invalid path {quote(path or '')}: give a relative .yaml or .yml path inside the specs"
        ' directory (no "..", no absolute path).'
    )


#: The kinds an agent may save: what a screen is made of, never what a request is made of.
_SAVABLE_KINDS = frozenset({"component", "envelope", "partial", "components"})
#: File names (any extension, any folder) the catalogues are read from by convention.
_CATALOGUE_NAMES = frozenset({"sources", "routes", "actions", "types", "project"})
#: Folders the catalogues are read from by convention.
_CATALOGUE_FOLDERS = frozenset({"environments", "translations"})
#: The request keys a surface naming a catalogue source by ``ref`` may not override.
_REQUEST_KEYS = ("url", "baseUrl", "method", "headers", "body", "proxy")

#: The message of a definition that would decide a request (shown as written).
REQUEST_REFUSAL = (
    "A definition saved by an agent may not reference a secret, proxy a request through the"
    " server or override the request of a catalogue source; declare those in sources.yaml"
    " by hand."
)


def is_catalogue_file(path: str | None) -> bool:
    """Whether ``path`` names a catalogue file (``sources.yaml``, ``environments/…``…): an agent
    never writes those (Java's ``SpecWriter.isCatalogueFile``)."""
    if path is None:
        return False
    segments = path.split("/")
    if len(segments) > 1 and segments[0] in _CATALOGUE_FOLDERS:
        return True
    name = segments[-1]
    stem = name[: name.rfind(".")] if "." in name else name
    return stem in _CATALOGUE_NAMES


def catalogue_refusal(path: str | None) -> str:
    """The message of a refused catalogue file (shown as written)."""
    return (
        f"Refused path {quote(path or '')}: catalogue files (sources, routes, actions, types,"
        " project, environments, translations) are written by hand."
    )


def agent_refusal(kind: str | None, text: str | None) -> str | None:
    """Why an agent may not save this definition, or None when it may (Java's
    ``SpecWriter.agentRefusal``): only pages, envelopes, partials and business-component
    catalogues, and none that references a secret, marks a request ``proxy: true`` or overrides the
    request of a source it names by ``ref`` — in dev mode an agent could otherwise re-point a
    proxied source at its own server and have Mateu send it the secret."""
    if kind is not None and kind not in _SAVABLE_KINDS:
        return (
            "Only a page, a partial or a business-component catalogue can be saved by an agent;"
            f" a {quote(kind)} definition is written by hand."
        )
    import yaml

    try:
        tree = yaml.safe_load(text or "")
    except Exception:  # noqa: BLE001 - not YAML: the validation report already says so
        return None
    if _carries_a_request(tree, set()):
        return REQUEST_REFUSAL
    # R6: a saved spec is served through the ordinary (trusted) render path, so it may not carry
    # what the untrusted strip keeps out of an agent's pushed screen
    from mateu_ui.core import untrusted

    try:
        return SCRIPT_REFUSAL if untrusted.script_capable(tree) else None
    except untrusted.TooLarge:
        return SCRIPT_REFUSAL


SCRIPT_REFUSAL = (
    "A definition saved by an agent may not run code in the browser: no event-handler, import or"
    " srcdoc attribute, no raw-HTML or script-capable element, no javascript: url, RunJS rule or"
    " action js, and no MicroFrontend loaded from another server."
)


def _carries_a_request(node, seen: set[int]) -> bool:
    if isinstance(node, str):
        return "${secret." in node
    if isinstance(node, (dict, list)):
        if id(node) in seen:  # an alias: already walked
            return False
        seen.add(id(node))
    if isinstance(node, dict):
        proxy = node.get("proxy")
        if proxy is True or (isinstance(proxy, str) and proxy.strip().lower() == "true"):
            return True
        ref = node.get("ref")
        if isinstance(ref, str) and ref.strip() and any(key in node for key in _REQUEST_KEYS):
            return True
        if any(isinstance(key, str) and "${secret." in key for key in node):
            return True
        return any(_carries_a_request(value, seen) for value in node.values())
    if isinstance(node, list):
        return any(_carries_a_request(item, seen) for item in node)
    return False


def _inside(path: Path, base: Path) -> bool:
    return path == base or base in path.parents


def write(root: Path, path: str, text: str) -> int:
    """Writes ``text`` at ``path`` under ``root``, creating the folders it needs; the number of
    bytes written. Raises :class:`UserFacingException` when the path is refused."""
    if not is_acceptable(path):
        raise UserFacingException(refusal(path))
    base = Path(os.path.normpath(os.path.abspath(root)))
    target = Path(os.path.normpath(base / path))
    if not _inside(target, base):
        raise UserFacingException(refusal(path))
    real_base = base.resolve(strict=True)
    existing = target.parent
    while not existing.exists() and existing.parent != existing:
        existing = existing.parent
    if not _inside(existing.resolve(), real_base):
        raise UserFacingException(refusal(path))
    if target.is_symlink() and not _inside(target.resolve(), real_base):
        raise UserFacingException(refusal(path))
    target.parent.mkdir(parents=True, exist_ok=True)
    data = text.encode("utf-8")
    target.write_bytes(data)
    return len(data)
