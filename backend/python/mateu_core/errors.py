"""The error boundary: an unhandled exception becomes an error message increment, never a raw 500.

Mirrors Java's ``RunActionUseCase.onErrorResume``, which maps any failure of an action into a
``Message(variant=error)`` so the renderer shows a toast instead of a broken screen. What the user
READS differs on purpose: Java shows the exception's class and message, which leaks internals (SQL,
paths, hostnames) to whoever is using the screen. Here the default is a generic text carrying a
correlation id — the same id is logged with the full traceback — and the detail is shown only

- in development (``add_mateu(..., dev=True)`` / ``MATEU_DEV=true``), mirroring Java's text, or
- for a ``UserFacingError``, whose message is written FOR the user and is always shown.
"""

from __future__ import annotations

import os
import uuid

from mateu_dtos import Message, UIIncrement
from mateu_uidl import UserFacingError


def new_correlation_id() -> str:
    return uuid.uuid4().hex[:12]


def dev_mode_from_env() -> bool:
    return os.environ.get("MATEU_DEV", "").strip().lower() in ("1", "true", "yes", "on")


def _source(error: BaseException) -> BaseException:
    """The exception that explains the failure: the cause of a wrapper, like Java's
    ``getSourceException`` (InvocationTargetException → target, else the cause)."""
    return error.__cause__ or error


def error_increment(error: BaseException, correlation_id: str, dev: bool = False) -> UIIncrement:
    """The increment answering a failed request (a single error toast)."""
    source = _source(error)
    if isinstance(error, UserFacingError) or isinstance(source, UserFacingError):
        user_facing = error if isinstance(error, UserFacingError) else source
        title = getattr(user_facing, "title", None) or "Error"
        text = str(user_facing) or title
    elif dev:
        title = type(source).__name__
        text = (str(source) or type(source).__name__) + f" (ref {correlation_id})"
    else:
        title = "Error"
        text = f"Something went wrong. Reference: {correlation_id}"
    return UIIncrement.of(
        messages=[
            Message(variant="error", position="middle", title=title, text=text, duration=10000)
        ]
    )


__all__ = ["dev_mode_from_env", "error_increment", "new_correlation_id"]
