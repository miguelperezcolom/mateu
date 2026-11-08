"""Long-running tasks that report their PROGRESS (Java's ``LongTask`` / ``ProgressReporter``).

An action returns ``LongTask.create(...).run(work)``: over the SSE endpoint each update streams as a
``Progress`` command carrying the WHOLE current state of the task, and each renderer presents it its
own way (a modal progress for a blocking task, the task center for a background one). Over the sync
endpoint the task runs to the end and answers its last state (EXPERIMENTAL).
"""

from __future__ import annotations

import time
import uuid
from typing import Any, Callable, Iterable

#: The status line a task starts with until its first step (translated per request).
STARTING_TEXT = "Starting..."


def _clamp(value: float) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return 0.0
    if number != number:  # NaN
        return 0.0
    return max(0.0, min(1.0, number))


class ProgressReporter:
    """Reports the progress of the task :meth:`LongTask.run` runs. Each ``step`` RETURNS the update
    to stream — the item the work must yield, not a side effect::

        .run(lambda progress: (progress.step(f"Row {i}", done=i, total=n) for i in range(1, n + 1)))

    Handed to the work by :meth:`LongTask.run`; callers do not construct it."""

    def __init__(self, initial, progress_bar: bool):
        self._current = initial
        self._progress_bar = progress_bar

    @property
    def current(self):
        """The task's current state (what the last update said)."""
        return self._current

    def _update(self, **changes):
        from mateu_ui.dtos import UICommand, UIIncrement

        self._current = self._current.model_copy(update=changes)
        return UIIncrement.of(
            commands=[UICommand(target_component_id=None, type="Progress", data=self._current)]
        )

    def step(
        self,
        text: str,
        title: str | float | None = None,
        progress: float | None = None,
        *,
        done: int | None = None,
        total: int | None = None,
    ):
        """Updates the status text — and the title (``title``), the progress (``progress``, 0..1,
        ignored unless the task has a bar; a number in ``title``'s place is the progress, like
        Java's ``step(text, double)``) or a count of the work (``done`` of ``total``, which makes
        the task determinate whether it has a bar or not — EXPERIMENTAL)."""
        changes: dict[str, Any] = {"text": text}
        if isinstance(title, (int, float)) and not isinstance(title, bool):
            progress, title = float(title), None
        if title is not None:
            changes["title"] = title
        if progress is not None and self._progress_bar:
            changes["fraction"] = _clamp(progress)
        if total is not None and total > 0:
            changes["done"] = int(done or 0)
            changes["total"] = int(total)
            changes["fraction"] = _clamp((done or 0) / total)
        return self._update(**changes)


class LongTaskRun:
    """What :meth:`LongTask.run` returns: the task and its work, run by the framework (the SSE
    endpoint streams it; the sync one runs it to the end)."""

    def __init__(self, task: "LongTask", work: Callable[[ProgressReporter], Iterable[Any]]):
        self.task = task
        self.work = work

    def start(self):
        """A fresh run: the reporter (holding the start state) and the work's iterator."""
        from mateu_ui.dtos import ProgressDto

        task = self.task
        initial = ProgressDto(
            task_id=str(uuid.uuid4()),
            title=task._title or "",
            text=task._starting_text if task._starting_text is not None else "",
            fraction=0.0 if task._progress_bar else None,
            state="running",
            blocking=task._blocking,
            backgroundable=task._blocking and task._backgroundable,
            cancellable=task._cancellable,
            retryable=task._retryable,
            started_at=int(time.time() * 1000),
        )
        reporter = ProgressReporter(initial, task._progress_bar)
        return reporter, iter(self.work(reporter) or ())

    def end(self, last):
        """The increment ending the run well: the task done (done texts, result actions), the done
        commands and, with ``notify_when_done``, an inbox message."""
        from mateu_ui.dtos import Message as MessageDto, UICommand, UIIncrement

        task = self.task
        done = last.model_copy(update={
            "state": "done",
            "title": task._done_title if task._done_title is not None else last.title,
            "text": task._done_text if task._done_text is not None else last.text,
            "fraction": 1.0 if (task._progress_bar or last.fraction is not None) else None,
            "done": last.total if last.total is not None else last.done,
            "close_after_seconds": task._close_after if task._close_after > 0 else None,
            "result_actions": [a.to_wire() for a in task._result_actions],
        })
        commands = [UICommand(target_component_id=None, type="Progress", data=done)]
        for command in task._commands:
            commands.append(command.model_copy(update={"target_component_id": None}))
        messages = []
        if task._notify_when_done:
            messages.append(MessageDto(
                variant="success", position="middle", title=done.title or "", text=done.text or "",
                duration=5000, persistence="inbox", actions=list(done.result_actions),
                key=f"task-{done.task_id}",
            ))
        return UIIncrement.of(commands=commands, messages=messages)


class LongTask:
    """Fluent builder for a long-running operation that reports its PROGRESS (the Python analogue
    of Java's ``io.mateu.uidl.data.LongTask``; EXPERIMENTAL)::

        @button
        def import_all(self):
            return (LongTask.create("Importing")
                    .background().cancellable().retryable()
                    .done("Imported", "3 rows")
                    .result_action(MessageAction.open("Open report", "/reports/1"))
                    .run(lambda p: (p.step(f"Row {i}", done=i, total=3) for i in range(1, 4))))

    The work is a function receiving a :class:`ProgressReporter` and returning an iterable (a
    generator) of its updates. Cancelling (the user's Cancel, or the stream closing) stops it
    between two updates: the generator is closed, ``on_cancel`` runs."""

    def __init__(self, title: str | None):
        self._title = title
        self._done_title: str | None = None
        self._done_text: str | None = None
        self._progress_bar = False
        self._close_after = 0
        self._starting_text: str | None = STARTING_TEXT
        self._commands: list = []
        self._blocking = True
        self._backgroundable = False
        self._cancellable = False
        self._retryable = False
        self._notify_when_done = False
        self._on_cancel: Callable[[], None] | None = None
        self._result_actions: list = []

    @staticmethod
    def create(title: str) -> "LongTask":
        """A task titled ``title``."""
        return LongTask(title)

    def done(self, done_title: str | None, done_text: str | None) -> "LongTask":
        """The title and text the task shows once done."""
        self._done_title, self._done_text = done_title, done_text
        return self

    def with_progress_bar(self) -> "LongTask":
        """A determinate task: ``step(text, fraction)`` advances it (it starts at 0)."""
        self._progress_bar = True
        return self

    def close_after(self, seconds: int) -> "LongTask":
        """A finished blocking surface closes on its own after ``seconds``."""
        self._close_after = seconds
        return self

    def with_command(self, *commands) -> "LongTask":
        """``UICommand`` s run once the task is done (navigate to the results…)."""
        self._commands.extend(commands)
        return self

    def starting_text(self, text: str) -> "LongTask":
        """The status line until the first step (default ``"Starting..."``)."""
        self._starting_text = text
        return self

    def background(self) -> "LongTask":
        """A BACKGROUND task: the user keeps working while it runs."""
        self._blocking = False
        return self

    def backgroundable(self) -> "LongTask":
        """A blocking task the user may move to the background."""
        self._backgroundable = True
        return self

    def cancellable(self) -> "LongTask":
        """The user may cancel it."""
        self._cancellable = True
        return self

    def on_cancel(self, hook: Callable[[], None]) -> "LongTask":
        """Runs ``hook`` when the task is cancelled (by the user or its stream closing); implies
        :meth:`cancellable`."""
        self._cancellable = True
        self._on_cancel = hook
        return self

    def retryable(self) -> "LongTask":
        """A failed run offers Retry (the renderer re-runs the same action)."""
        self._retryable = True
        return self

    def result_action(self, action) -> "LongTask":
        """What the user can do with the result (a ``MessageAction``: "Open report")."""
        self._result_actions.append(action)
        return self

    def notify_when_done(self) -> "LongTask":
        """Once done the task also posts an entry to the user's inbox (an ``inbox`` message)."""
        self._notify_when_done = True
        return self

    def run(self, work: Callable[[ProgressReporter], Iterable[Any]]) -> LongTaskRun:
        """The task with its work — return it from the action."""
        return LongTaskRun(self, work)
