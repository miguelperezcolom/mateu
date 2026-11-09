"""The running tasks of this process (Java's ``ProgressTasks``): what lets a user CANCEL one
(``_progress-cancel``), REATTACH to one after a reload (``_progress-tasks`` / ``_progress-resume``)
and what makes every task end with a terminal ``Progress``.

A ``LongTaskRun`` an action returns is turned into a generator of increments by :func:`stream`:
it registers its task (owner = the caller, hashed — the identity name and every grant), forwards
each update (stamped with the server's ETA, :mod:`mateu_ui.core.eta_estimator`), and always ends
the task — ``done`` (the task's own end), ``failed`` (the error boundary's text, never a raw
exception) or ``cancelled`` (the user's Cancel, the grace period running out with nobody watching,
or the consumer closing the generator; ``on_cancel`` runs). A cancel stops the work BETWEEN two
updates: a Python generator cannot be interrupted mid-step.

Over the SSE endpoint the generator is made HOT (:class:`HotTask`): one thread drives the work and
fans its increments out to every subscriber — the stream that started it and any resume stream of
the same caller. When the last subscriber goes away the task runs on for the reattach grace period
(:func:`configure`, default 60 s, ``MATEU_PROGRESS_REATTACH_GRACE_SECONDS``; 0 = the old
cancel-on-close), then it is cancelled. A finished task keeps its terminal state (and the messages
of its terminal increment) for the same period, so a tab reloading just as it ends still learns how.

Bounded (``MAX_TASKS``, oldest first) and in-process: in a cluster a cancel or a resume must reach
the node running the task. Every lookup is owner-scoped: a foreign task answers exactly like an
unknown one (EXPERIMENTAL for the reattach part).
"""

from __future__ import annotations

import hashlib
import os
import threading
import time
from collections import OrderedDict
from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass, field
from typing import Any, Callable, Iterator

from mateu_ui.dtos import Message as MessageDto, UICommand, UIIncrement

from .eta_estimator import EtaEstimator

CANCEL_ACTION = "_progress-cancel"
#: Lists the caller's tasks among ``taskIds`` (running, or finished within the grace period).
TASKS_ACTION = "_progress-tasks"
#: Re-subscribes to the caller's task ``taskId`` (served as a stream by the SSE endpoint).
RESUME_ACTION = "_progress-resume"
MAX_TASKS = 10_000
#: How many ids ``_progress-tasks`` looks at.
MAX_LISTED_IDS = 50
DEFAULT_GRACE_SECONDS = 60.0
GRACE_ENV = "MATEU_PROGRESS_REATTACH_GRACE_SECONDS"

#: The command types a resumed stream still carries (the page-level parts of an increment).
_PAGE_LEVEL_COMMANDS = ("Progress", "NotificationsChanged")

#: Set (to a list) by an SSE endpoint while it runs an action: a LongTask's stream is appended to
#: it — the endpoint streams it — and the action answers the task's first increment. Unset (the
#: sync endpoint): the task runs to the end.
pending_streams: "ContextVar[list | None]" = ContextVar("mateu_pending_streams", default=None)


def _grace_from_env() -> float:
    raw = os.environ.get(GRACE_ENV)
    if raw is None or not raw.strip():
        return DEFAULT_GRACE_SECONDS
    try:
        return max(0.0, float(raw))
    except ValueError:
        return DEFAULT_GRACE_SECONDS


_grace_seconds: float = _grace_from_env()


def configure(grace_seconds: float | None = None) -> None:
    """The reattach grace period, in seconds (``add_mateu(progress_reattach_grace_seconds=…)``).
    None = the ``MATEU_PROGRESS_REATTACH_GRACE_SECONDS`` env var, else 60; 0 = closing the stream
    cancels the task at once."""
    global _grace_seconds
    _grace_seconds = _grace_from_env() if grace_seconds is None else max(0.0, float(grace_seconds))


def grace_seconds() -> float:
    return _grace_seconds


#: The server clock the ETA is computed on (ms); a test may replace it.
clock_ms: Callable[[], float] = lambda: time.monotonic() * 1000.0  # noqa: E731


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
    #: the hot run fanning the task out (SSE), if any
    hot: "HotTask | None" = None
    #: once finished: the terminal Progress, the messages of its terminal increment, when it goes
    terminal: Any = None
    terminal_messages: list = field(default_factory=list)
    expires_at: float | None = None


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


def _purge_locked() -> None:
    now = time.monotonic()
    expired = [k for k, e in _tasks.items() if e.expires_at is not None and e.expires_at <= now]
    for key in expired:
        _tasks.pop(key, None)


def is_running(task_id: str) -> bool:
    with _lock:
        _purge_locked()
        entry = _tasks.get(task_id)
        return entry is not None and entry.terminal is None


def _register(task_id: str, owner: str, last) -> _Entry:
    with _lock:
        _purge_locked()
        entry = _tasks.get(task_id)
        if entry is None:
            entry = _Entry(owner=owner, last=last)
            _tasks[task_id] = entry
            while len(_tasks) > MAX_TASKS:
                _tasks.popitem(last=False)
        else:
            entry.last = last
        return entry


def _finish(task_id: str, terminal, messages: list) -> None:
    """The task ended: kept with its terminal state for the grace period, else forgotten."""
    with _lock:
        entry = _tasks.get(task_id)
        if entry is None:
            return
        if _grace_seconds > 0 and terminal is not None:
            entry.terminal = terminal
            entry.terminal_messages = list(messages)
            entry.expires_at = time.monotonic() + _grace_seconds
        else:
            _tasks.pop(task_id, None)


def _own_entry(task_id: str | None, identity) -> _Entry | None:
    """The caller's task ``task_id`` (running or finished within the grace period), else None —
    unknown, expired and foreign alike."""
    if not task_id:
        return None
    with _lock:
        _purge_locked()
        entry = _tasks.get(task_id)
    if entry is None or entry.owner != owner_of(identity):
        return None
    return entry


def _command(data) -> UICommand:
    return UICommand(target_component_id=None, type="Progress", data=data)


def _progress(data) -> UIIncrement:
    return UIIncrement.of(commands=[_command(data)])


def _terminal(last, state: str, error: str | None = None):
    return last.model_copy(update={
        "state": state,
        "error": error,
        "backgroundable": False,
        "cancellable": False,
        "retryable": state == "failed" and last.retryable,
        "eta_seconds": None,
    })


def cancel(task_id: str | None, identity) -> UIIncrement:
    """Cancels the caller's task ``task_id``; answers its cancelled state, or an empty increment
    when there is no such running task of this caller."""
    entry = _own_entry(task_id, identity)
    if entry is None or entry.terminal is not None:
        return UIIncrement.of()
    entry.cancelled.set()
    if entry.hot is not None:
        entry.hot.wake()
    return _progress(_terminal(entry.last, "cancelled"))


def tasks(task_ids, identity) -> UIIncrement:
    """``_progress-tasks``: one ``Progress`` per listed id that is a task of the caller, running
    (its current state) or finished within the grace period (its terminal state). Unknown, expired
    and foreign ids are simply absent. At most :data:`MAX_LISTED_IDS` ids are looked at."""
    ids = task_ids if isinstance(task_ids, (list, tuple)) else ([] if task_ids is None else [task_ids])
    commands = []
    seen: set[str] = set()
    for raw in list(ids)[:MAX_LISTED_IDS]:
        task_id = str(raw)
        if task_id in seen:
            continue
        seen.add(task_id)
        entry = _own_entry(task_id, identity)
        if entry is None:
            continue
        state = entry.terminal if entry.terminal is not None else entry.last
        if state is not None:
            commands.append(_command(state))
    return UIIncrement.of(commands=commands)


def page_level(increment: UIIncrement) -> UIIncrement:
    """What of an increment still means something to a client that no longer has the screen that
    started the task: its ``Progress`` and ``NotificationsChanged`` commands and its messages."""
    return UIIncrement.of(
        commands=[c for c in increment.commands if c.type in _PAGE_LEVEL_COMMANDS],
        messages=list(increment.messages),
    )


def resume(task_id: str | None, identity, deliver: Callable[[Any], None]):
    """``_progress-resume``: subscribes ``deliver`` to the caller's task. Answers
    ``(first, subscription)`` — ``first`` the increment to send at once (the current state, or the
    terminal one of a finished task), ``subscription`` the live subscription (None when the task
    has finished: ``first`` is all there is). ``deliver`` receives the later increments, reduced to
    their page-level parts, then :data:`END`. ``(None, None)`` for an unknown or foreign task."""
    entry = _own_entry(task_id, identity)
    if entry is None:
        return None, None
    if entry.terminal is None and entry.hot is not None:
        subscription = entry.hot.subscribe(deliver, reduce=True)
        if subscription is not None:
            return _progress(entry.last), subscription
    if entry.terminal is None:
        # running but not hot (a sync drain): the current state only
        return _progress(entry.last), None
    return UIIncrement.of(commands=[_command(entry.terminal)], messages=list(entry.terminal_messages)), None


def snapshot(task_id: str | None, identity) -> UIIncrement:
    """``_progress-resume`` over the sync endpoint: the task's current (or terminal) state."""
    entry = _own_entry(task_id, identity)
    if entry is None:
        return UIIncrement.of()
    if entry.terminal is not None:
        return UIIncrement.of(commands=[_command(entry.terminal)], messages=list(entry.terminal_messages))
    return _progress(entry.last)


def _translate_starting(progress, translate: Callable[[str], str] | None):
    from mateu_ui.uidl.progress import STARTING_TEXT

    if translate is not None and progress.text == STARTING_TEXT:
        text = translate(STARTING_TEXT)
        if text and text != STARTING_TEXT:
            return progress.model_copy(update={"text": text})
    return progress


def _stamped(increment: UIIncrement, task_id: str, estimator: EtaEstimator, entry: _Entry):
    """The increment with the ETA stamped on its running Progress of this task (entry.last then
    holds the stamped state)."""
    changed = False
    commands = []
    for command in increment.commands:
        data = command.data
        if command.type == "Progress" and getattr(data, "task_id", None) == task_id:
            eta = estimator.observe_progress(clock_ms(), data)
            if eta != data.eta_seconds:
                data = data.model_copy(update={"eta_seconds": eta})
                command = command.model_copy(update={"data": data})
                changed = True
            if data.state == "running":
                entry.last = data
        commands.append(command)
    return increment.model_copy(update={"commands": commands}) if changed else increment


def _terminal_of(increment: UIIncrement, task_id: str):
    for command in increment.commands:
        data = command.data
        if command.type == "Progress" and getattr(data, "task_id", None) == task_id \
                and data.state != "running":
            return data
    return None


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
    estimator = EtaEstimator()
    finished = False
    ending: dict[str, Any] = {"terminal": None, "messages": []}

    def emit(increment: UIIncrement) -> UIIncrement:
        increment = _stamped(increment, task_id, estimator, entry)
        terminal = _terminal_of(increment, task_id)
        if terminal is not None:
            ending["terminal"] = terminal
            ending["messages"] = list(increment.messages)
        return increment

    try:
        yield emit(_progress(first))
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
                yield emit(increment.model_copy(update={"commands": [UICommand(
                    target_component_id=None, type="Progress",
                    data=_terminal(entry.last or reporter.current, "failed", message.get("text")),
                )]}))
                return
            if entry.cancelled.is_set():
                break
            yield emit(item if isinstance(item, UIIncrement) else map_item(item))
        if entry.cancelled.is_set():
            finished = True
            _close(work, run)
            yield emit(_progress(_terminal(entry.last or reporter.current, "cancelled")))
            return
        finished = True
        yield emit(run.end(reporter.current))
    except GeneratorExit:
        # the consumer went away (the browser closed the stream): the task is cancelled
        if not finished:
            _close(work, run)
            ending["terminal"] = _terminal(entry.last or reporter.current, "cancelled")
            ending["messages"] = []
        raise
    finally:
        _finish(task_id, ending["terminal"], ending["messages"])


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


def then(increments: Iterator[UIIncrement], continuation: Callable[[], UIIncrement]) -> Iterator[UIIncrement]:
    """``increments``, then — once they are over and none carried an error message (a failed
    task carries one too) — the answer of ``continuation``. Closing this generator closes the
    task's stream (the browser went away: the task is cancelled, nothing follows)."""
    failed = False
    try:
        for increment in increments:
            if any(m.variant == "error" for m in increment.messages):
                failed = True
            yield increment
    finally:
        close = getattr(increments, "close", None)
        if close is not None:
            close()
    if not failed:
        yield continuation()


def drain(increments: Iterator[UIIncrement]) -> UIIncrement:
    """The sync endpoint's answer for a task: run it to the end and merge what it streamed (every
    command, message and fragment, in order)."""
    commands, messages, fragments = [], [], []
    for increment in increments:
        commands.extend(increment.commands)
        messages.extend(increment.messages)
        fragments.extend(increment.fragments)
    return UIIncrement.of(commands=commands, messages=messages, fragments=fragments)


# ── hot runs (the SSE endpoint): one work, many subscribers, a grace period ───────────────────

#: What a subscriber receives after the last increment.
END = object()


class _Subscription:
    def __init__(self, deliver: Callable[[Any], None], reduce: bool):
        self.deliver = deliver
        self.reduce = reduce


class HotTask:
    """A task stream run ONCE by its own thread and fanned out to its subscribers.

    ``increments`` is the rest of :func:`stream` (its first increment already answered); ``bound``
    runs a function bound to the request that started the task (identity, translations); the
    optional ``transform`` post-processes each full increment once (the inbox storage). Create it
    with :func:`hot`, subscribe the starting stream, then :meth:`start`."""

    def __init__(self, task_id: str, increments: Iterator[UIIncrement], bound: Callable,
                 transform: Callable[[UIIncrement], UIIncrement] | None = None):
        self.task_id = task_id
        self._increments = increments
        self._bound = bound
        self._transform = transform
        self._lock = threading.Lock()
        self._subscribers: list[_Subscription] = []
        self._ended = False
        self._timer: threading.Timer | None = None
        self._thread: threading.Thread | None = None

    def start(self) -> None:
        self._thread = threading.Thread(target=self._pump, name=f"mateu-task-{self.task_id[:8]}",
                                        daemon=True)
        self._thread.start()

    def wake(self) -> None:
        """A cancel arrived: nothing to do here (the work checks between two updates)."""

    @property
    def ended(self) -> bool:
        return self._ended

    def subscribe(self, deliver: Callable[[Any], None], reduce: bool = False) -> _Subscription | None:
        """Adds a subscriber (None when the task has ended); a pending grace cancel is called off."""
        with self._lock:
            if self._ended:
                return None
            subscription = _Subscription(deliver, reduce)
            self._subscribers.append(subscription)
            if self._timer is not None:
                self._timer.cancel()
                self._timer = None
            return subscription

    def unsubscribe(self, subscription: _Subscription | None) -> None:
        """Removes a subscriber; the last one leaving a running task starts the grace period."""
        if subscription is None:
            return
        with self._lock:
            if subscription in self._subscribers:
                self._subscribers.remove(subscription)
            if self._subscribers or self._ended:
                return
            grace = _grace_seconds
            if grace > 0:
                self._timer = threading.Timer(grace, self._expire)
                self._timer.daemon = True
                self._timer.start()
                return
        self._expire()

    def _expire(self) -> None:
        with self._lock:
            self._timer = None
            if self._subscribers or self._ended:
                return
        with _lock:
            entry = _tasks.get(self.task_id)
        if entry is not None and entry.terminal is None:
            # nobody came back for it: cancelled as if its stream had just closed
            entry.cancelled.set()

    def _broadcast(self, item) -> None:
        with self._lock:
            subscribers = list(self._subscribers)
            if item is END:
                self._ended = True
                if self._timer is not None:
                    self._timer.cancel()
                    self._timer = None
        reduced = None
        for subscription in subscribers:
            payload = item
            if item is not END and subscription.reduce:
                if reduced is None:
                    reduced = page_level(item)
                payload = reduced
            try:
                subscription.deliver(payload)
            except Exception:  # noqa: BLE001 - one broken subscriber must not stop the task
                pass

    def _pump(self) -> None:
        def run() -> None:
            try:
                for increment in self._increments:
                    if self._transform is not None:
                        increment = self._transform(increment)
                    self._broadcast(increment)
            finally:
                self._broadcast(END)

        try:
            self._bound(run)
        except Exception:  # noqa: BLE001 - the stream already ended its task (error boundary)
            pass


def hot(task_id: str, increments: Iterator[UIIncrement], bound: Callable,
        transform: Callable[[UIIncrement], UIIncrement] | None = None) -> HotTask:
    """Makes the task stream ``increments`` (task ``task_id``) hot and registers it so a resume of
    the same caller can subscribe. Subscribe the starting stream, then call ``start()``."""
    task = HotTask(task_id, increments, bound, transform)
    with _lock:
        entry = _tasks.get(task_id)
        if entry is not None:
            entry.hot = task
    return task


def hot_task_of(task_id: str) -> HotTask | None:
    """The hot run of task ``task_id`` (to unsubscribe a resume stream from)."""
    with _lock:
        entry = _tasks.get(task_id)
        return entry.hot if entry is not None else None


def task_id_of(increment: UIIncrement | None) -> str | None:
    """The task an increment reports progress for (its first ``Progress`` command)."""
    for command in (increment.commands if increment is not None else []):
        if command.type == "Progress" and getattr(command.data, "task_id", None):
            return command.data.task_id
    return None
