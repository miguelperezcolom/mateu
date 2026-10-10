"""The error boundary as an increment: an unhandled exception becomes an error toast, never a raw 500.

The decision of WHAT the user reads lives in :mod:`mateu_core.error_boundary` (texts identical to
Java and .NET): a ``UserFacingException`` anywhere in the cause chain is shown as written, a
validation error shows its messages, anything else is a bug — "Something went wrong" with a
reference (the request's correlation id) logged at ERROR with the traceback. ``dev=True`` /
``MATEU_DEV=true`` / ``MATEU_ERRORS_DETAILED=true`` show the raw exception instead.
"""

from __future__ import annotations

import os
import uuid

from mateu_dtos import Message, UIIncrement

from . import error_boundary


def new_correlation_id() -> str:
    """A 12-character reference, the same shape as the error boundary's."""
    return uuid.uuid4().hex[:12]


def dev_mode_from_env() -> bool:
    return any(
        os.environ.get(name, "").strip().lower() in ("1", "true", "yes", "on")
        for name in ("MATEU_DEV", error_boundary.DETAILED_ENV)
    )


def error_increment(
    error: BaseException, correlation_id: str, dev: bool = False, action_id: str | None = None
) -> UIIncrement:
    """The increment answering a failed request (a single error toast)."""
    m = error_boundary.describe(error, action_id, detailed=dev, reference=correlation_id)
    return UIIncrement.of(messages=[Message(**m)])


__all__ = ["dev_mode_from_env", "error_increment", "new_correlation_id"]
