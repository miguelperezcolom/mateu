"""``add_mateu(app, [A, B])`` — a LIST of views — used to register nothing, silently: a list is
neither a module nor a class, so every route answered "Route not found" (found building the Mateu
Explorer's Python remote, 3.0-beta.51). A list (or tuple) is now flattened, a single class still
works, and anything else fails loudly."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

fastapi = pytest.importorskip("fastapi")
from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from mateu_ui.core import MateuRegistry  # noqa: E402
from mateu_ui.fastapi import add_mateu  # noqa: E402
from mateu_ui.uidl import title, ui  # noqa: E402


@ui("sources-reports")
@title("Reports")
class Reports:
    name: str = "r"


@ui("sources-stock")
@title("Stock")
class Stock:
    name: str = "s"


def _load(client: TestClient, route: str) -> str:
    response = client.post(
        f"/mateu/v3/sync/{route}",
        json={"route": "/" + route, "consumedRoute": "_empty", "actionId": "", "componentState": {}},
    )
    assert response.status_code == 200, response.text
    return response.text


def test_a_list_of_views_registers_every_one_of_them():
    app = FastAPI()
    add_mateu(app, [Reports, Stock])
    client = TestClient(app)
    assert "Reports" in _load(client, "sources-reports")
    assert "Stock" in _load(client, "sources-stock")


def test_a_single_class_and_nested_collections_still_work():
    registry = MateuRegistry(Reports, (Stock,))
    assert {Reports, Stock} <= set(registry.registered_types)
    single = MateuRegistry(Reports)
    assert Reports in single.registered_types


def test_anything_else_fails_loudly():
    with pytest.raises(TypeError, match="modules and classes"):
        MateuRegistry("io.acme.Reports")
    with pytest.raises(TypeError, match="modules and classes"):
        add_mateu(FastAPI(), {"reports": Reports})
