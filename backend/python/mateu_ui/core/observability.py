"""Observability of every Mateu request: one span, two metrics and the audit listeners.

- **Tracing and metrics** go through the OpenTelemetry API when ``opentelemetry-api`` is
  installed — an OPTIONAL dependency, imported lazily: an app that has it (its SDK, or the
  ``opentelemetry-instrument`` agent) gets the spans; one that does not pays nothing.
  ``MATEU_TELEMETRY_ENABLED=false`` switches them off. API only: no SDK, no exporter.
- **Audit**: every :class:`~mateu_ui.uidl.ActionAuditListener` passed to
  ``add_mateu(audit_listeners=...)`` hears each request once it has ended.

The same names, attributes and low-cardinality rules as Java's ``io.mateu.core.infra.observability``
and .NET's ``Mateu.Core.Observability``.
"""

from __future__ import annotations

import logging
import os
import re
import threading
import time
from contextvars import ContextVar
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Iterable, Mapping

from mateu_ui.uidl.audit import ActionAuditEvent, ActionAuditListener, ActionOutcome

log = logging.getLogger("mateu_ui.observability")

SCOPE = "io.mateu"
ENABLED_ENV = "MATEU_TELEMETRY_ENABLED"
OTHER = "_other"
LOAD = "__load__"
MAX_SERIES = 1000
_MAX_RECORD_IDS = 1000

try:  # the optional dependency: never required
    from opentelemetry import context as _otel_context
    from opentelemetry import metrics as _otel_metrics
    from opentelemetry import propagate as _otel_propagate
    from opentelemetry import trace as _otel_trace

    _OTEL = True
except ImportError:  # pragma: no cover - exercised where the API is absent
    _OTEL = False


# ── low-cardinality names (Java TelemetryNames) ─────────────────────────────────────────────────

_NUMERIC = re.compile(r"-?\d+")
_UUID = re.compile(r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
_HEX = re.compile(r"[0-9a-fA-F]{12,}")
_series: set[str] = set()
_series_lock = threading.Lock()


def _id_like(segment: str) -> bool:
    return bool(
        _NUMERIC.fullmatch(segment)
        or _UUID.fullmatch(segment)
        or _HEX.fullmatch(segment)
        or (len(segment) >= 8 and any(c.isdigit() for c in segment))
        or len(segment) > 64
    )


def route_template(route: str | None) -> str:
    """The route's template: id-like segments replaced by ``:id``, no query, no trailing '/'."""
    if not route or not route.strip() or route == "_empty":
        return "/"
    path = route.split("?", 1)[0]
    segments = [":id" if _id_like(s) else s for s in path.split("/") if s]
    return "/" + "/".join(segments) if segments else "/"


def action_name(action_id: str | None) -> str:
    return action_id if action_id else LOAD


def metric_key(route: str | None, action_id: str | None, outcome: ActionOutcome) -> tuple[str, str]:
    """The (route template, action) a request is measured under: a refused or not-found request is
    ``_other``/``_other`` (what the caller sent must not mint series), at most ``MAX_SERIES`` pairs."""
    if outcome in (ActionOutcome.FORBIDDEN, ActionOutcome.NOT_FOUND):
        return OTHER, OTHER
    template = route_template(route)
    action = action_name(action_id)
    if len(action) > 128:
        action = OTHER
    key = template + " " + action
    with _series_lock:
        if key not in _series:
            if len(_series) >= MAX_SERIES:
                return OTHER, OTHER
            _series.add(key)
    return template, action


def reset_series() -> None:
    """For tests: forget the series seen so far."""
    with _series_lock:
        _series.clear()


# ── the request ─────────────────────────────────────────────────────────────────────────────────


@dataclass
class RequestObservation:
    """What is known about ONE request while it runs: never any field value."""

    route: str = ""
    action_id: str = ""
    view: str | None = None
    outcome: ActionOutcome = ActionOutcome.OK
    error_type: str | None = None
    error_reference: str | None = None
    correlation_id: str | None = None
    at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    started: float = field(default_factory=time.monotonic)
    record_ids: list[str] = field(default_factory=list)
    span: Any = None
    ended: bool = False


_current: ContextVar[RequestObservation | None] = ContextVar("mateu_observation", default=None)
_failed_listeners: set[type] = set()


def enabled() -> bool:
    return _OTEL and os.environ.get(ENABLED_ENV, "").strip().lower() != "false"


def current() -> RequestObservation | None:
    return _current.get()


def begin(route: str | None, action_id: str | None, server_side_type: str | None,
          correlation_id: str | None, headers: Mapping[str, str] | None = None):
    """Starts observing a request: returns ``(observation, token)``; reset the token with
    :func:`release` once the request has been handed over (the observation stays usable)."""
    observation = RequestObservation(
        route=route or "", action_id=action_id or "", view=server_side_type or None,
        correlation_id=correlation_id,
    )
    if enabled():
        try:
            observation.span = _start_span(observation, headers or {})
        except Exception as e:  # noqa: BLE001 - telemetry never fails a request
            log.debug("Could not start the request span: %s", e)
    return observation, _current.set(observation)


def release(token) -> None:
    try:
        _current.reset(token)
    except (ValueError, LookupError):  # reset from another context: nothing to restore there
        pass


def _start_span(observation: RequestObservation, headers: Mapping[str, str]):
    parent = _otel_context.get_current()
    has_server_span = _otel_trace.get_current_span(parent).get_span_context().is_valid
    if not has_server_span:
        # no HTTP server instrumentation: continue the caller's trace from its traceparent
        parent = _otel_propagate.extract(dict(headers))
    template = route_template(observation.route)
    action = action_name(observation.action_id)
    attributes = {
        "mateu.route": observation.route,
        "mateu.route.template": template,
        "mateu.action": action,
    }
    if observation.correlation_id:
        attributes["mateu.correlation_id"] = observation.correlation_id
    return _otel_trace.get_tracer(SCOPE).start_span(
        "mateu " + (OTHER if len(action) > 64 else action) + " " + template,
        context=parent,
        kind=_otel_trace.SpanKind.INTERNAL if has_server_span else _otel_trace.SpanKind.SERVER,
        attributes=attributes,
    )


def set_view(view_class: type | None) -> None:
    observation = _current.get()
    if observation is not None and view_class is not None:
        observation.view = f"{view_class.__module__}.{view_class.__qualname__}"


def record_ids(ids: Iterable[Any]) -> None:
    """The records the action acted on (their ids, as text); nulls are skipped."""
    observation = _current.get()
    if observation is None:
        return
    for i in ids:
        if i is None:
            continue
        text = str(i)
        if text not in observation.record_ids and len(observation.record_ids) < _MAX_RECORD_IDS:
            observation.record_ids.append(text)


def record_id(i: Any) -> None:
    if i is not None:
        record_ids([i])


def failed(error: BaseException | None, *, forbidden: bool = False, for_the_user: bool = False,
           reference: str | None = None, observation: RequestObservation | None = None) -> None:
    """How the request ended, from what the error boundary caught."""
    observation = observation or _current.get()
    if observation is None:
        return
    observation.outcome = (
        ActionOutcome.FORBIDDEN if forbidden
        else ActionOutcome.USER_ERROR if for_the_user
        else ActionOutcome.ERROR
    )
    if error is not None:
        observation.error_type = f"{type(error).__module__}.{type(error).__qualname__}"
    if observation.outcome is ActionOutcome.ERROR:
        observation.error_reference = reference


def end(observation: RequestObservation | None, listeners: Iterable[ActionAuditListener] = (),
        caller: Any = None) -> None:
    """Ends the request: its span, its metrics and the audit listeners (each failing one logged once)."""
    if observation is None or observation.ended:
        return
    observation.ended = True
    elapsed = time.monotonic() - observation.started
    span = observation.span
    if span is not None:
        try:
            if observation.view:
                span.set_attribute("mateu.view", observation.view)
            span.set_attribute("mateu.outcome", observation.outcome.value)
            if observation.record_ids:
                span.set_attribute("mateu.record.count", len(observation.record_ids))
            if observation.error_type:
                span.set_attribute("error.type", observation.error_type)
            if observation.error_reference:
                span.set_attribute("mateu.error.reference", observation.error_reference)
            if observation.outcome is ActionOutcome.ERROR:
                span.set_status(_otel_trace.Status(_otel_trace.StatusCode.ERROR))
            span.end()
        except Exception as e:  # noqa: BLE001
            log.debug("Could not end the request span: %s", e)
    if enabled():
        try:
            _record_metrics(observation, elapsed)
        except Exception as e:  # noqa: BLE001
            log.debug("Could not record the request metrics: %s", e)
    listeners = list(listeners)
    if not listeners:
        return
    event = ActionAuditEvent(
        caller=caller,
        route=observation.route,
        action_id=observation.action_id,
        view=observation.view,
        record_ids=tuple(observation.record_ids),
        at=observation.at,
        duration_millis=int(elapsed * 1000),
        outcome=observation.outcome,
        correlation_id=observation.correlation_id,
        error_reference=observation.error_reference,
    )
    for listener in listeners:
        try:
            listener.on_action(event)
        except Exception as e:  # noqa: BLE001 - an audit trail never fails the request it reports
            if type(listener) not in _failed_listeners:
                _failed_listeners.add(type(listener))
                log.warning("ActionAuditListener %s failed (logged once): %s", type(listener).__qualname__, e)


_instruments: dict[int, tuple[Any, Any]] = {}


def _meter_instruments():
    provider = _otel_metrics.get_meter_provider()
    known = _instruments.get(id(provider))
    if known is None:
        meter = provider.get_meter(SCOPE)
        known = (
            meter.create_histogram("mateu.request.duration", unit="s",
                                   description="Duration of Mateu requests (sync and sse)"),
            meter.create_counter("mateu.request.errors",
                                 description="Mateu requests that ended in an unexpected error"),
        )
        _instruments.clear()
        _instruments[id(provider)] = known
    return known


def _record_metrics(observation: RequestObservation, elapsed: float) -> None:
    duration, errors = _meter_instruments()
    route, action = metric_key(observation.route, observation.action_id, observation.outcome)
    duration.record(elapsed, {
        "mateu.route.template": route, "mateu.action": action, "mateu.outcome": observation.outcome.value,
    })
    if observation.outcome is ActionOutcome.ERROR:
        errors.add(1, {
            "mateu.route.template": route, "mateu.action": action,
            "error.type": observation.error_type or "_unknown",
        })


# ── child spans ─────────────────────────────────────────────────────────────────────────────────


class _NoSpan:
    def set_attribute(self, key: str, value: Any) -> None:
        pass

    def failed(self, description: str | None = None) -> None:
        pass

    def __enter__(self):
        return self

    def __exit__(self, *exc) -> None:
        pass


class _ChildSpan(_NoSpan):
    def __init__(self, name: str, attributes: Mapping[str, Any]):
        observation = _current.get()
        parent = (
            _otel_trace.set_span_in_context(observation.span)
            if observation is not None and observation.span is not None
            else None
        )
        self._span = _otel_trace.get_tracer(SCOPE).start_span(
            name, context=parent, kind=_otel_trace.SpanKind.CLIENT,
            attributes={k: v for k, v in attributes.items() if v is not None},
        )
        self._token = None

    def set_attribute(self, key: str, value: Any) -> None:
        if value is not None:
            self._span.set_attribute(key, value)

    def failed(self, description: str | None = None) -> None:
        self._span.set_status(_otel_trace.Status(_otel_trace.StatusCode.ERROR, description))

    def __enter__(self):
        # current on this thread: an instrumented HTTP client nests its span here
        self._token = _otel_context.attach(_otel_trace.set_span_in_context(self._span))
        return self

    def __exit__(self, *exc) -> None:
        if self._token is not None:
            _otel_context.detach(self._token)
        self._span.end()


def child(name: str, attributes: Mapping[str, Any]):
    """A child span of the request's (a context manager); a no-op without OpenTelemetry."""
    if not enabled():
        return _NoSpan()
    try:
        return _ChildSpan(name, attributes)
    except Exception as e:  # noqa: BLE001
        log.debug("Could not start a child span: %s", e)
        return _NoSpan()


def record_child(name: str, duration_millis: int, attributes: Mapping[str, Any], error: str | None) -> None:
    """A child span of something that already happened (a micro frontend resolution)."""
    if not enabled():
        return
    try:
        end_ns = time.time_ns()
        observation = _current.get()
        parent = (
            _otel_trace.set_span_in_context(observation.span)
            if observation is not None and observation.span is not None
            else None
        )
        span = _otel_trace.get_tracer(SCOPE).start_span(
            name, context=parent, kind=_otel_trace.SpanKind.CLIENT,
            attributes={k: v for k, v in attributes.items() if v is not None},
            start_time=end_ns - max(0, duration_millis) * 1_000_000,
        )
        if error is not None:
            span.set_status(_otel_trace.Status(_otel_trace.StatusCode.ERROR, error))
        span.end(end_time=end_ns)
    except Exception as e:  # noqa: BLE001
        log.debug("Could not record a child span: %s", e)


__all__ = [
    "ENABLED_ENV", "LOAD", "OTHER", "RequestObservation", "action_name", "begin", "child", "current",
    "end", "failed", "metric_key", "record_child", "record_id", "record_ids", "release",
    "reset_series", "route_template", "set_view",
]
