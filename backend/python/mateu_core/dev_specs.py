"""Development mode (live reload) — the Python twin of Java's ``io.mateu.core.infra.dev``.

OFF unless ``MATEU_DEV=true`` (or ``add_mateu(..., dev=True)``). When on, a polling watcher over the
specs directory drops every registered cache (:func:`register`) on a debounced change, and the change
is streamed to the browsers through ``GET /mateu/dev/events`` with the same JSON events as the Java
backend (``hello`` + boot id, ``specs-changed`` with scope ``page``/``app``, ``reload``, ``ping``);
``POST /mateu/dev/reload`` asks for a re-render. Combine with ``uvicorn --reload`` for Python changes:
the restarted worker has a new boot id, which makes the open browsers re-render.

**The hook for a new catalogue is one line**: call ``dev_specs.register(self)`` in ``__init__`` and
give the class an ``invalidate_specs()`` that drops what it loaded.

The watcher polls (300 ms) instead of depending on ``watchfiles``: a specs tree is a few dozen small
files, and polling behaves the same on every OS (and inside containers with bind mounts).
"""

from __future__ import annotations

import json
import logging
import os
import re
import threading
import time
import uuid
import weakref
from pathlib import Path
from typing import Callable

log = logging.getLogger("mateu.dev")

EVENTS_PATH = "/mateu/dev/events"
RELOAD_PATH = "/mateu/dev/reload"
SCOPE_PAGE = "page"
SCOPE_APP = "app"

#: Identifies this process: a client seeing it change knows the server restarted.
BOOT_ID = str(uuid.uuid4())

_caches: "weakref.WeakSet" = weakref.WeakSet()
_listeners: list[Callable[[str], None]] = []
_lock = threading.Lock()
_forced: bool | None = None
_dir: str | None = None
_watcher: "_Watcher | None" = None
_APP_LEVEL = re.compile(r"^type:\s*['\"]?(UI|Routes|AppShell|App)['\"]?\s*$", re.MULTILINE)


def enabled() -> bool:
    """Whether dev mode is on (``MATEU_DEV=true``, or forced by :func:`enable`)."""
    if _forced is not None:
        return _forced
    return os.environ.get("MATEU_DEV", "").lower() in ("true", "1")


def specs_dir() -> Path:
    """The directory dev mode watches — the one the registries read."""
    return Path(
        _dir
        or os.environ.get("MATEU_DEV_SPECS_DIR")
        or os.environ.get("MATEU_SPECS_DIR")
        or Path("specs") / "ui"
    )


def register(cache) -> None:
    """Registers a cache (anything with ``invalidate_specs()``) to be dropped on change (weakly)."""
    with _lock:
        _caches.add(cache)


def enable(on: bool = True, directory: str | None = None) -> None:
    """Turns dev mode on (or off) and starts (or stops) the watcher. Logs a loud warning."""
    global _forced, _dir, _watcher
    _forced = on
    if directory is not None:
        _dir = directory
    if _watcher is not None:
        _watcher.stop()
        _watcher = None
    if not on:
        return
    log.warning(
        "MATEU DEVELOPMENT MODE IS ON (MATEU_DEV=true): specs in %s are watched and %s / %s are served. "
        "NEVER enable this in production.",
        specs_dir().resolve(),
        EVENTS_PATH,
        RELOAD_PATH,
    )
    invalidate_all()
    if specs_dir().is_dir():
        _watcher = _Watcher(specs_dir())
        _watcher.start()


def invalidate_all() -> None:
    with _lock:
        caches = list(_caches)
    for cache in caches:
        try:
            cache.invalidate_specs()
        except Exception as e:  # noqa: BLE001 — one bad cache must not stop the others
            log.warning("could not invalidate %s: %s", type(cache).__name__, e)


def changed(files: list[Path]) -> None:
    """Spec files changed: drop every cache and tell the browsers."""
    invalidate_all()
    scope = SCOPE_APP if any(is_app_level(Path(f)) for f in files) else SCOPE_PAGE
    names = sorted({_relative_name(Path(f)) for f in files})
    _emit({"type": "specs-changed", "files": names, "scope": scope})


def reload(scope: str | None = None) -> None:
    """Re-render the screen of every open browser (the IDE's trigger after a code change)."""
    invalidate_all()
    _emit({"type": "reload", "scope": SCOPE_APP if scope == SCOPE_APP else SCOPE_PAGE})


def hello() -> str:
    return json.dumps({"type": "hello", "bootId": BOOT_ID})


def subscribe(listener: Callable[[str], None]) -> Callable[[], None]:
    """Listens to the events (JSON payloads); call the returned function to stop."""
    with _lock:
        _listeners.append(listener)

    def unsubscribe() -> None:
        with _lock:
            if listener in _listeners:
                _listeners.remove(listener)

    return unsubscribe


def _emit(event: dict) -> None:
    payload = json.dumps(event, separators=(",", ":"))
    with _lock:
        listeners = list(_listeners)
    for listener in listeners:
        try:
            listener(payload)
        except Exception:  # noqa: BLE001 — a listener that fails is a browser that went away
            pass


def is_app_level(file: Path) -> bool:
    if file.name in ("routes.yaml", "routes.yml", "sources.yaml"):
        return True
    if not file.is_file():
        return True  # deleted: whatever it was, it may have been a mount
    try:
        return bool(_APP_LEVEL.search(file.read_text(encoding="utf-8")))
    except OSError:
        return True


def _relative_name(file: Path) -> str:
    root = specs_dir().resolve()
    full = file.resolve()
    try:
        return "specs/ui/" + full.relative_to(root).as_posix()
    except ValueError:
        return str(full)


def snapshot(directory: Path) -> dict[Path, tuple[int, int]]:
    """path → (size, mtime_ns) of every file under ``directory``."""
    result: dict[Path, tuple[int, int]] = {}
    if not directory.is_dir():
        return result
    for path in directory.rglob("*"):
        try:
            if path.is_file():
                stat = path.stat()
                result[path] = (stat.st_size, stat.st_mtime_ns)
        except OSError:
            pass
    return result


def diff(before: dict, after: dict) -> list[Path]:
    changed_paths = {p for p, sig in after.items() if before.get(p) != sig}
    changed_paths |= {p for p in before if p not in after}
    return sorted(changed_paths)


class _Watcher(threading.Thread):
    POLL = 0.3
    DEBOUNCE = 0.15

    def __init__(self, directory: Path) -> None:
        super().__init__(name="mateu-dev-specs-watcher", daemon=True)
        self._directory = directory
        self._stopped = threading.Event()

    def stop(self) -> None:
        self._stopped.set()

    def run(self) -> None:
        before = snapshot(self._directory)
        while not self._stopped.wait(self.POLL):
            after = snapshot(self._directory)
            if after == before:
                continue
            # debounce: wait until the tree stops moving (an editor's save is a burst)
            time.sleep(self.DEBOUNCE)
            settled = snapshot(self._directory)
            while settled != after:
                after = settled
                time.sleep(self.DEBOUNCE)
                settled = snapshot(self._directory)
            files = diff(before, after)
            before = after
            if files and not self._stopped.is_set():
                try:
                    changed(files)
                except Exception as e:  # noqa: BLE001
                    log.warning("live reload failed to process %s: %s", files, e)
