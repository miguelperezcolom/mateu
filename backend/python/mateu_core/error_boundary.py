"""What the user is told when an action fails — the Python twin of Java's ``ErrorBoundary``.

A :class:`~mateu_uidl.UserFacingException` (anywhere in the ``__cause__``/``__context__`` chain)
shows its title and message; a pydantic ``ValidationError`` shows its validation messages; anything
else is a bug — a generic message with a 12-character reference the exception is logged under at
ERROR. ``MATEU_ERRORS_DETAILED=true`` restores the raw exception in the toast, for development.
The texts are the same in the three backends.
"""

from __future__ import annotations

import logging
import os
import uuid

from pydantic import ValidationError

from mateu_uidl import UserFacingException

log = logging.getLogger("mateu.errors")

GENERIC_TITLE = "Something went wrong"
GENERIC_TEXT = "An unexpected error occurred. Reference: "
DETAILED_ENV = "MATEU_ERRORS_DETAILED"


def _chain(error: BaseException):
    seen: set[int] = set()
    e: BaseException | None = error
    while e is not None and id(e) not in seen:
        seen.add(id(e))
        yield e
        e = e.__cause__ or e.__context__


def _message(title: str, text: str) -> dict:
    return {"variant": "error", "position": "middle", "title": title, "text": text, "duration": 0}


def describe(
    error: BaseException,
    action_id: str | None = None,
    detailed: bool | None = None,
    reference: str | None = None,
) -> dict:
    """The error toast (wire ``Message`` dict) for ``error``, logging it when it is a bug."""
    for e in _chain(error):
        if isinstance(e, UserFacingException):
            return _message(e.title or "Error", e.message)
    for e in _chain(error):
        if isinstance(e, ValidationError):
            text = "\n".join(
                sorted(
                    (".".join(str(p) for p in err.get("loc", ())) + ": " if err.get("loc") else "")
                    + str(err.get("msg", ""))
                    for err in e.errors()
                )
            )
            return _message("Validation error", text)
    # the request's correlation id when the adapter has one (also in X-Mateu-Correlation-Id)
    reference = reference or uuid.uuid4().hex[:12]
    log.error("Error handling action %s [ref %s]", action_id, reference, exc_info=error)
    show = detailed if detailed is not None else os.environ.get(DETAILED_ENV, "").lower() == "true"
    if show:
        source = list(_chain(error))[-1]
        return _message(type(source).__name__, f"{source} (ref {reference})")
    return _message(GENERIC_TITLE, GENERIC_TEXT + reference)
