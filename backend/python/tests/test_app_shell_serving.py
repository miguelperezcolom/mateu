"""The app shell as a browser drives it, end to end over HTTP (found walking the demo in the Vaadin
renderer): the shell's content slot must not get the shell again, and the shell must point the
browser at its own mount — never at an origin built from the request the app saw."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

fastapi = pytest.importorskip("fastapi")
from fastapi.testclient import TestClient  # noqa: E402

from mateu_core import type_name  # noqa: E402
from mateu_fastapi import add_mateu  # noqa: E402
from mateu_uidl import app, menu_item, title, ui  # noqa: E402

MODULE = sys.modules[__name__]


@ui("shell-orders")
@title("Orders")
class Orders:
    note: str = "orders"


@app("Shop")
class ShopApp:
    @menu_item("Orders")
    def orders(self) -> Orders:
        return Orders()


def _client(base_url: str = "") -> TestClient:
    api = fastapi.FastAPI()
    add_mateu(api, MODULE, base_url=base_url)
    return TestClient(api, base_url="http://internal-host:8000")


def _app_metadata(body: dict) -> dict:
    return body["fragments"][0]["component"]["metadata"]


@pytest.mark.parametrize("mount", ["", "/hotel"])
def test_the_shell_names_its_mount_not_the_origin_the_app_saw(mount):
    response = _client(mount).post(f"{mount}/mateu/v3/sync", json={"route": "", "consumedRoute": "_empty"})
    metadata = _app_metadata(response.json())
    assert metadata["type"] == "App"
    # Java's controllers pass their relative mount; an absolute http://internal-host:8000 is
    # unreachable (mixed content, CORS) behind a TLS-terminating or Host-rewriting proxy
    assert metadata["homeBaseUrl"] == mount


@pytest.mark.parametrize("mount", ["", "/hotel"])
def test_the_documented_component_action_endpoint_answers_like_sync(mount):
    # POST <base>/mateu/v3/components/_/action is the documented contract and what the Redwood
    # renderer calls; it answered 404, so Redwood could not render a Python backend at all
    response = _client(mount).post(
        f"{mount}/mateu/v3/components/_/action", json={"route": "", "consumedRoute": "_empty"}
    )
    assert response.status_code == 200
    assert _app_metadata(response.json())["type"] == "App"
    # ...booting with the documented load action "__load__" (it answered "Action not found")
    booted = _client(mount).post(
        f"{mount}/mateu/v3/components/_/action",
        json={"route": "", "actionId": "__load__", "componentState": {}},
    )
    assert _app_metadata(booted.json())["type"] == "App", booted.json()


def test_the_content_slot_of_an_app_without_a_home_gets_a_page_not_the_shell_again():
    client = _client()
    shell = _app_metadata(client.post("/mateu/v3/sync", json={"route": "", "consumedRoute": "_empty"}).json())
    assert shell["homeRoute"] == "_no_home_route"
    # what the shell's content slot then loads
    content = client.post(
        "/mateu/v3/sync/_no_home_route",
        json={"route": "_no_home_route", "consumedRoute": "", "serverSideType": type_name(ShopApp)},
    ).json()
    component = content["fragments"][0]["component"]
    # Java renders the app class as a plain page here (ActionInstanceCreator.isTerminalRoute); the
    # shell again nested itself in its own content area and reloaded forever
    assert component["type"] == "ServerSide"
    assert component["children"][0]["metadata"]["type"] == "Page"
