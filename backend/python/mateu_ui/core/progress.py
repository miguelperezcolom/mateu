"""The running tasks of this process (Java's ``ProgressTasks``): what lets a user CANCEL one
(``_progress-cancel``) and what makes every task end with a terminal ``Progress``.

A ``LongTaskRun`` an action returns is turned into a generator of increments by :func:`stream`:
it registers its task (owner = the caller, hashed — the identity name and every grant), forwards
each update, and always ends the task — ``done`` (the task's own end), ``failed`` (the error
boundary's text, never a raw exception) or ``cancelled`` (the user's Cancel, or the consumer
closing the generator because the browser went away; ``on_cancel`` runs). A cancel stops the work
BETWEEN two updates: a Python generator cannot be interrupted mid-step.

Bounded (``MAX_TASKS``, oldest first) and in-process: in a cluster a cancel must reach the node
running the task. :func:`cancel` stops a task of THE SAME CALLER only; anything else answers an
empty increment, indistinguishable from a finished task.
"""

from __future__ import annotations

import hashlib
import threading
from collections import OrderedDict
from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass, field
from typing import Any, Callable, Iterator

from mateu_ui.dtos import Message as MessageDto, UICommand, UIIncrement

CANCEL_ACTION = "_progress-cancel"
MAX_TASKS = 10_000

#: Set (to a list) by an SSE endpoint while it runs an action: a LongTask's stream is appended to
#: it — the endpoint streams it — and the action answers the task's first increment. Unset (the
#: sync endpoint): the task runs to the end.
pending_streams: "ContextVar[list | None]" = ContextVar("mateu_pending_streams", default=None)


@contextmanager
def collecting_streams():
    """Collect the LongTask streams of the action run inside (the SSE endpoint)."""
    holder: list = []
    token = pending_streams.set(holder)
    try:
        yield holder
    finally:
        pending_streams.reset(token)


@dataclass
class _Entry:
    owner: str
    cancelled: threading.Event = field(default_factory=threading.Event)
    last: Any = None


_lock = threading.Lock()
_tasks: "OrderedDict[str, _Entry]" = OrderedDict()


def owner_of(identity) -> str:
    """The caller, hashed: the name and every grant (None = the anonymous caller)."""
    if identity is None:
        parts = ["None", "", "", "", ""]
    else:
        parts = [
            str(getattr(identity, "name", None)),
            *(",".join(sorted(getattr(identity, d, ()) or ())) for d in
              ("roles", "groups", "scopes", "permissions")),
        ]
    return hashlib.sha256("\u0001".join(parts).encode("utf-8")).hexdigest()


def is_running(task_id: str) -> bool:
    with _lock:
        return task_id in _tasks


def _register(task_id: str, owner: str, last) -> _Entry:
    with _lock:
        entry = _tasks.get(task_id)
        if entry is None:
            entry = _Entry(owner=owner, last=last)
            _tasks[task_id] = entry
            while len(_tasks) > MAX_TASKS:
                _tasks.popitem(last=False)
        else:
            entry.last = last
        return entry


def _unregister(task_id: str) -> None:
    with _lock:
        _tasks.pop(task_id, None)


def _progress(data) -> UIIncrement:
    return UIIncrement.of(commands=[UICommand(target_component_id=None, type="Progress", data=data)])


def _terminal(last, state: str, error: str | None = None):
    return last.model_copy(update={
        "state": state,
        "error": error,
        "backgroundable": False,
        "cancellable": False,
        "retryable": state == "failed" and last.retryable,
    })


def cancel(task_id: str | None, identity) -> UIIncrement:
    """Cancels the caller's task ``task_id``; answers its cancelled state, or an empty increment
    when there is no such task of this caller."""
    with _lock:
        entry = _tasks.get(task_id) if task_id else None
    if entry is None or entry.owner != owner_of(identity):
        return UIIncrement.of()
    entry.cancelled.set()
    return _progress(_terminal(entry.last, "cancelled"))


def _translate_starting(progress, translate: Callable[[str], str] | None):
    from mateu_ui.uidl.progress import STARTING_TEXT

    if translate is not None and progress.text == STARTING_TEXT:
        text = translate(STARTING_TEXT)
        if text and text != STARTING_TEXT:
            return progress.model_copy(update={"text": text})
    return progress


def stream(
    run,
    identity,
    map_item: Callable[[Any], UIIncrement],
    describe_error: Callable[[BaseException], dict],
    translate: Callable[[str], str] | None = None,
) -> Iterator[UIIncrement]:
    """The increments of ``run`` (a ``LongTaskRun``), its task registered while it runs and always
    closed. ``map_item`` maps what the work yields that is not an update; ``describe_error`` is the
    error boundary (the toast dict for an exception)."""
    reporter, work = run.start()
    first = _translate_starting(reporter.current, translate)
    reporter._current = first
    task_id = first.task_id
    entry = _register(task_id, owner_of(identity), first)
    finished = False
    try:
        yield _progress(first)
        while True:
            if entry.cancelled.is_set():
                break
            try:
                item = next(work)
            except StopIteration:
                break
            except Exception as error:  # noqa: BLE001 - the error boundary: the task fails
                message = describe_error(error)
                finished = True
                increment = UIIncrement.of(messages=[MessageDto(**message)])
                yield increment.model_copy(update={"commands": [UICommand(
                    target_component_id=None, type="Progress",
                    data=_terminal(reporter.current, "failed", message.get("text")),
                )]})
                return
            entry.last = reporter.current
            if entry.cancelled.is_set():
                break
            yield item if isinstance(item, UIIncrement) else map_item(item)
        if entry.cancelled.is_set():
            finished = True
            _close(work, run)
            yield _progress(_terminal(reporter.current, "cancelled"))
            return
        finished = True
        yield run.end(reporter.current)
    except GeneratorExit:
        # the consumer went away (the browser closed the stream): the task is cancelled
        if not finished:
            _close(work, run)
        raise
    finally:
        _unregister(task_id)


def _close(work, run) -> None:
    close = getattr(work, "close", None)
    if close is not None:
        try:
            close()
        except Exception:  # noqa: BLE001 - a work that fails to stop must not fail the stream
            pass
    hook = run.task._on_cancel
    if hook is not None:
        hook()


def drain(increments: Iterator[UIIncrement]) -> UIIncrement:
    """The sync endpoint's answer for a task: run it to the end and merge what it streamed (every
    command, message and fragment, in order)."""
    commands, messages, fragments = [], [], []
    for increment in increments:
        commands.extend(increment.commands)
        messages.extend(increment.messages)
        fragments.extend(increment.fragments)
    return UIIncrement.of(commands=commands, messages=messages, fragments=fragments)
