"""Who the reserved ``__validate__`` action is served to (mirrors Java's
``RunActionUseCase.validationServed`` and .NET's ``SyncHandler.ValidationServed``).

``__validate__`` hands its caller a validator over the app's own catalogues (sources, partials,
actions, routes), so it answers only an MCP tool call (this process's ``/mateu/mcp`` marks its runs),
or an app that chose to expose its authoring plane — the MCP endpoint enabled (the sidecar's
authoring tools call it over the sync endpoint) or dev mode. Anywhere else it is refused (403).
``__preview__`` stays open: it is the chat's / live push's render target and the visual editor's.
"""

from __future__ import annotations

import os
from collections.abc import Iterator
from contextlib import contextmanager
from contextvars import ContextVar

_IN_MCP_CALL: ContextVar[bool] = ContextVar("mateu_in_mcp_call", default=False)


@contextmanager
def mcp_call() -> Iterator[None]:
    """Marks the runs inside the block as an MCP tool call."""
    token = _IN_MCP_CALL.set(True)
    try:
        yield
    finally:
        _IN_MCP_CALL.reset(token)


def in_mcp_call() -> bool:
    return _IN_MCP_CALL.get()


def validation_served(authoring_open: bool) -> bool:
    """Whether ``__validate__`` answers this run."""
    from mateu_ui.core import dev_specs

    return (
        in_mcp_call()
        or authoring_open
        or dev_specs.enabled()
        or os.environ.get("MATEU_MCP_ENABLED", "").strip().lower() in ("1", "true", "yes", "on")
    )
