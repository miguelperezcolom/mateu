"""Version skew between a deployed UI and the renderers that call it — the transport-header contract
shared with Java and .NET. Nothing changes in the wire JSON.

- Every response of a Mateu endpoint (a path with a ``/mateu/`` segment) carries ``X-Mateu-Build``:
  an opaque fingerprint of the deployed UI, identical on every replica of one release, different when
  a screen changes. Override with ``add_mateu(build_id=...)`` or ``MATEU_BUILD_ID``.
- A renderer announces itself in ``X-Mateu-Renderer`` (``<name>/<version> wire/<major>.<minor>``);
  one that speaks another wire MAJOR is warned about ONCE per distinct value (bounded), never refused.
"""

from __future__ import annotations

import hashlib
import inspect
import logging
import os
import re
import sys
import threading
from collections.abc import Iterable
from pathlib import Path

from mateu_ui._version import __version__

log = logging.getLogger("mateu.version_skew")

BUILD_HEADER = "X-Mateu-Build"
RENDERER_HEADER = "X-Mateu-Renderer"
BUILD_ID_ENV = "MATEU_BUILD_ID"
#: How many distinct renderer values are remembered (and so warned about) at most.
MAX_REMEMBERED_RENDERERS = 100

_NOT_ALLOWED = re.compile(r"[^A-Za-z0-9._-]")
_WIRE = re.compile(r"(?:^|\s)wire/(\d+)((?:\.\d+)?)(?=\s|$)")


def sanitize(value: str | None) -> str | None:
    """An override reduced to ``[A-Za-z0-9._-]`` and 64 chars; None when nothing usable is left."""
    if value is None or not value.strip():
        return None
    clean = _NOT_ALLOWED.sub("", value.strip())[:64]
    return clean or None


def compute_build_id(classes: Iterable[type], specs_dir: str | os.PathLike[str] | None = None) -> str:
    """First 16 hex chars of SHA-256 over: the package version, the source of every module defining
    a registered UI class (sorted by module name), and every YAML file of the specs directory
    (sorted by relative path). Deterministic across replicas of one release."""
    sha = hashlib.sha256()
    sha.update(f"mateu-ui={__version__}\n".encode())
    modules: dict[str, bytes] = {}
    names: set[str] = set()
    for cls in classes:
        name = getattr(cls, "__module__", None) or ""
        names.add(f"{name}.{getattr(cls, '__qualname__', getattr(cls, '__name__', ''))}")
        if name in modules:
            continue
        modules[name] = _module_bytes(cls, name)
    for name in sorted(names):
        sha.update(f"type={name}\n".encode())
    for name in sorted(modules):
        sha.update(f"module={name}\n".encode())
        sha.update(modules[name])
        sha.update(b"\n")
    root = Path(specs_dir or os.environ.get("MATEU_SPECS_DIR") or Path("specs") / "ui")
    try:
        if root.is_dir():
            files = sorted(
                (p for p in root.rglob("*") if p.is_file() and p.suffix.lower() in (".yaml", ".yml")),
                key=lambda p: p.relative_to(root).as_posix(),
            )
            for path in files:
                sha.update(f"spec={path.relative_to(root).as_posix()}\n".encode())
                sha.update(path.read_bytes())
                sha.update(b"\n")
    except OSError:
        pass  # an unreadable specs directory leaves the id to the code half — never fails a request
    return sha.hexdigest()[:16]


def _module_bytes(cls: type, module_name: str) -> bytes:
    try:
        source = inspect.getsourcefile(cls)
        if source:
            return Path(source).read_bytes()
    except (OSError, TypeError):
        pass
    module = sys.modules.get(module_name)
    try:
        return inspect.getsource(module).encode() if module is not None else b""
    except (OSError, TypeError):
        return b""


def wire_of(header: str | None) -> tuple[int, str] | None:
    """(major, "major.minor") a renderer header announces; None when missing or garbled."""
    if not header or not header.strip():
        return None
    m = _WIRE.search(header)
    if m is None:
        return None
    return int(m.group(1)), m.group(1) + m.group(2)


def is_mateu_path(path: str | None) -> bool:
    """Whether ``path`` is one of Mateu's endpoints (a ``/mateu/`` segment)."""
    return bool(path) and ("/mateu/" in path or path.endswith("/mateu"))


def _log_safe(value: str) -> str:
    clipped = value if len(value) <= 256 else value[:256] + "…"
    return "".join("?" if (ord(c) < 32 or ord(c) == 127) else c for c in clipped)


class VersionSkew:
    """The build id of one ``add_mateu`` (computed once, lazily) and its renderer warnings."""

    def __init__(self, classes: Iterable[type], configured: str | None = None, specs_dir=None):
        self._classes = list(classes)
        self._configured = configured
        self._specs_dir = specs_dir
        self._build_id: str | None = None
        self._lock = threading.Lock()
        self._warned: set[str] = set()

    @property
    def build_id(self) -> str:
        if self._build_id is None:
            with self._lock:
                if self._build_id is None:
                    self._build_id = (
                        sanitize(self._configured)
                        or sanitize(os.environ.get(BUILD_ID_ENV))
                        or compute_build_id(self._classes, self._specs_dir)
                    )
        return self._build_id

    def warning_for(self, header: str | None, server_wire_version: str) -> str | None:
        """The warning the FIRST time this distinct value speaks another wire major; else None."""
        wire = wire_of(header)
        if wire is None:
            return None
        major, version = wire
        try:
            server_major = int(server_wire_version.split(".")[0])
        except ValueError:
            return None
        if major == server_major:
            return None
        value = _log_safe(header.strip())  # type: ignore[union-attr]
        with self._lock:
            if value in self._warned or len(self._warned) >= MAX_REMEMBERED_RENDERERS:
                return None
            self._warned.add(value)
        return (
            f"Renderer '{value}' speaks wire {version}; this server speaks {server_wire_version}. "
            "Upgrade the renderer or the server so their majors match."
        )


class VersionSkewMiddleware:
    """Pure ASGI middleware: stamps ``X-Mateu-Build`` on every response of a Mateu path (errors,
    403s and 404s included), adds it to ``Access-Control-Expose-Headers`` when CORS granted the
    origin, and warns once per distinct renderer of another wire major."""

    def __init__(self, app, skew: VersionSkew):
        self.app = app
        self.skew = skew

    async def __call__(self, scope, receive, send):
        if scope.get("type") != "http" or not is_mateu_path(scope.get("path")):
            await self.app(scope, receive, send)
            return
        from mateu_ui.dtos import WIRE_VERSION

        renderer = None
        for key, value in scope.get("headers") or ():
            if key.lower() == b"x-mateu-renderer":
                renderer = value.decode("latin-1")
                break
        warning = self.skew.warning_for(renderer, WIRE_VERSION)
        if warning is not None:
            log.warning("%s", warning)
        build = self.skew.build_id.encode("latin-1")

        async def send_with_build(message):
            if message.get("type") == "http.response.start":
                headers = [(k, v) for k, v in message.get("headers") or () if k.lower() != b"x-mateu-build"]
                headers.append((b"x-mateu-build", build))
                if any(k.lower() == b"access-control-allow-origin" for k, _ in headers):
                    headers = _exposed(headers)
                message = {**message, "headers": headers}
            await send(message)

        await self.app(scope, receive, send_with_build)


def _exposed(headers: list[tuple[bytes, bytes]]) -> list[tuple[bytes, bytes]]:
    name = b"access-control-expose-headers"
    current = [v for k, v in headers if k.lower() == name]
    names = [n.strip() for v in current for n in v.decode("latin-1").split(",") if n.strip()]
    if any(n.lower() == BUILD_HEADER.lower() for n in names):
        return headers
    names.append(BUILD_HEADER)
    return [(k, v) for k, v in headers if k.lower() != name] + [(name, ", ".join(names).encode("latin-1"))]
