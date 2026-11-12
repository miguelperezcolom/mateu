"""Observability of the request path (Java ObservabilitySyncTest, .NET ObservabilityTests): one
OpenTelemetry span + metrics per Mateu request (the API only, here an in-memory SDK — the span
tests are skipped where ``opentelemetry-sdk`` is not installed) and the ActionAuditListeners —
who, what, on which records, how it ended; never a field value."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

fastapi = pytest.importorskip("fastapi")
from fastapi.testclient import TestClient  # noqa: E402

from mateu_ui.core import observability  # noqa: E402
from mateu_ui.fastapi import add_mateu  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    ActionAuditListener,
    ActionOutcome,
    Crud,
    Message,
    UserFacingError,
    button,
    title,
    ui,
)


@ui("obs-orders")
@title("Orders")
class ObsOrders:
    note: str = "secret note"

    @button()
    def place(self):
        return Message("placed")

    @button()
    def out_of_stock(self):
        raise UserFacingError("Only 3 units left.")

    @button()
    def bug(self):
        raise RuntimeError("boom")


class ObsItem:
    id: str = ""
    name: str = ""


ITEMS: dict[str, ObsItem] = {}


def _item(id_, name):
    i = ObsItem()
    i.id, i.name = id_, name
    return i


@ui("obs-items")
@title("Items")
class ObsItems(Crud[ObsItem]):
    def fetch(self, search):
        return list(ITEMS.values())

    def get(self, id_):
        return ITEMS.get(id_)

    def delete(self, id_):
        ITEMS.pop(id_, None)


class Recording(ActionAuditListener):
    def __init__(self):
        self.events = []

    def on_action(self, event):
        self.events.append(event)


class Broken(ActionAuditListener):
    def on_action(self, event):
        raise RuntimeError("audit store down")


MODULE = sys.modules[__name__]


@pytest.fixture
def recording():
    return Recording()


@pytest.fixture
def client(recording):
    app = fastapi.FastAPI()
    add_mateu(app, MODULE, audit_listeners=[recording, Broken()])
    return TestClient(app)


def post(c, route, action_id, state=None, headers=None):
    return c.post(
        f"/mateu/v3/sync/{route}",
        json={"route": route, "actionId": action_id, "serverSideType": None,
              "componentState": state or {}},
        headers=headers or {},
    )


# ── audit (no OpenTelemetry needed) ─────────────────────────────────────────


def test_the_audit_event_says_who_what_and_when_but_never_the_state(client, recording):
    response = post(client, "obs-orders", "place", {"note": "secret note"},
                    {"X-Mateu-Correlation-Id": "corr-123"})
    # the broken listener did not fail the request
    assert "placed" in response.text
    event = recording.events[-1]
    assert event.route == "obs-orders"
    assert event.action_id == "place"
    assert event.view.endswith("ObsOrders")
    assert event.outcome is ActionOutcome.OK
    assert event.correlation_id == "corr-123"
    assert event.at is not None and not event.reserved_action
    assert "secret note" not in repr(event)


def test_a_user_error_and_a_bug_are_told_apart(client, recording):
    post(client, "obs-orders", "outOfStock")
    assert recording.events[-1].outcome is ActionOutcome.USER_ERROR
    body = post(client, "obs-orders", "bug").text
    event = recording.events[-1]
    assert event.outcome is ActionOutcome.ERROR
    # the reference the user was shown
    assert event.error_reference and event.error_reference in body


def test_a_refused_action_is_forbidden(client, recording):
    response = post(client, "obs-orders", "noSuchActionXyz")
    assert response.status_code == 403
    assert recording.events[-1].outcome is ActionOutcome.FORBIDDEN


def test_a_crud_delete_names_the_records_it_deleted(client, recording):
    ITEMS.clear()
    ITEMS.update({"1": _item("1", "one"), "2": _item("2", "two")})
    post(client, "obs-items", "delete", {"crud_selected_items": [{"id": "2", "name": "two"}]})
    event = recording.events[-1]
    assert event.action_id == "delete"
    assert event.record_ids == ("2",)


def test_route_templates_take_no_ids_and_the_series_are_bounded():
    observability.reset_series()
    assert observability.route_template("/products/42/edit") == "/products/:id/edit"
    assert observability.route_template("/orders/3f2504e0-4f89-11d3-9a0c-0305e82c3301") == "/orders/:id"
    assert observability.route_template("/bookings/BK2026A01?tab=2") == "/bookings/:id"
    assert observability.route_template("/products/new") == "/products/new"
    assert observability.route_template("_empty") == "/"
    assert observability.metric_key("/a", "x", ActionOutcome.NOT_FOUND) == ("_other", "_other")
    for i in range(observability.MAX_SERIES):
        observability.metric_key("/r", f"a{i}", ActionOutcome.OK)
    assert observability.metric_key("/r", "one-too-many", ActionOutcome.OK) == ("_other", "_other")
    assert observability.metric_key("/r", "a0", ActionOutcome.OK) == ("/r", "a0")
    observability.reset_series()


# ── spans and metrics (an in-memory OpenTelemetry SDK) ──────────────────────


@pytest.fixture(scope="module")
def otel():
    pytest.importorskip("opentelemetry.sdk")
    from opentelemetry import metrics, trace
    from opentelemetry.sdk.metrics import MeterProvider
    from opentelemetry.sdk.metrics.export import InMemoryMetricReader
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import SimpleSpanProcessor
    from opentelemetry.sdk.trace.export.in_memory_span_exporter import InMemorySpanExporter

    spans = InMemorySpanExporter()
    tracer_provider = TracerProvider()
    tracer_provider.add_span_processor(SimpleSpanProcessor(spans))
    trace.set_tracer_provider(tracer_provider)
    reader = InMemoryMetricReader()
    metrics.set_meter_provider(MeterProvider(metric_readers=[reader]))
    if trace.get_tracer_provider() is not tracer_provider:
        pytest.skip("another tracer provider is already installed in this process")
    return spans, reader


def _mateu_spans(spans, prefix):
    return [s for s in spans.get_finished_spans() if s.name.startswith(prefix)]


def test_a_request_is_one_span_with_its_route_action_view_outcome_and_correlation_id(otel, client):
    spans, _ = otel
    spans.clear()
    post(client, "obs-orders", "place", headers={"X-Mateu-Correlation-Id": "corr-123"})
    (span,) = _mateu_spans(spans, "mateu place ")
    assert span.name == "mateu place /obs-orders"
    assert span.attributes["mateu.route"] == "obs-orders"
    assert span.attributes["mateu.route.template"] == "/obs-orders"
    assert span.attributes["mateu.action"] == "place"
    assert span.attributes["mateu.view"].endswith("ObsOrders")
    assert span.attributes["mateu.outcome"] == "ok"
    assert span.attributes["mateu.correlation_id"] == "corr-123"


def test_a_bug_is_an_error_span_and_counted_and_a_refusal_is_measured_under_other(otel, client):
    from opentelemetry.trace import StatusCode

    spans, reader = otel
    spans.clear()
    post(client, "obs-orders", "bug")
    post(client, "obs-orders", "noSuchActionXyz")
    (bug,) = _mateu_spans(spans, "mateu bug ")
    assert bug.attributes["mateu.outcome"] == "error"
    assert bug.attributes["error.type"] == "builtins.RuntimeError"
    assert bug.status.status_code is StatusCode.ERROR
    (refused,) = _mateu_spans(spans, "mateu noSuchActionXyz ")
    assert refused.attributes["mateu.outcome"] == "forbidden"
    points = {
        m.name: [dict(p.attributes) for p in m.data.data_points]
        for rm in reader.get_metrics_data().resource_metrics
        for sm in rm.scope_metrics
        for m in sm.metrics
    }
    assert any(p["mateu.action"] == "bug" for p in points["mateu.request.errors"])
    assert not any(p["mateu.action"] == "noSuchActionXyz" for p in points["mateu.request.duration"])
    assert any(p["mateu.action"] == "_other" and p["mateu.outcome"] == "forbidden"
               for p in points["mateu.request.duration"])


def test_a_micro_frontend_resolution_is_a_child_span_of_the_request(otel):
    from opentelemetry.trace import StatusCode

    spans, _ = otel
    spans.clear()
    observation, token = observability.begin("/shop", "", None, "corr-9")
    try:
        observability.record_child("mateu microfrontend shop", 120,
                                   {"mateu.remote.id": "shop", "mateu.microfrontend.outcome": "timeout"},
                                   "TIMEOUT")
    finally:
        observability.end(observation)
        observability.release(token)
    (child,) = _mateu_spans(spans, "mateu microfrontend shop")
    (request,) = _mateu_spans(spans, "mateu __load__ /shop")
    assert child.parent.span_id == request.context.span_id
    assert child.status.status_code is StatusCode.ERROR
    assert child.end_time - child.start_time >= 100_000_000
