"""Smoke test: the starter serves its app shell, home page and Products CRUD on the Mateu sync
endpoint."""

import os

import pytest
from fastapi.testclient import TestClient

import main

client = TestClient(main.app)


def sync(route: str, action_id: str = "") -> str:
    r = client.post(
        f"/mateu/v3/sync/{route}",
        json={"route": route, "actionId": action_id, "componentState": {}},
    )
    assert r.status_code == 200
    return r.text


def test_the_shell_opens_on_home_with_a_products_entry():
    body = sync("")
    assert '"homeRoute":"home"' in body
    assert '"label":"Products"' in body


def test_home_page_loads_and_its_call_to_action_navigates_to_products():
    assert "Browse products" in sync("home")
    assert '"NavigateTo"' in sync("home", "browseProducts")


def test_products_crud_loads():
    assert "views.Products" in sync("products")


@pytest.mark.skipif("MATEU_UI" in os.environ, reason="this run serves the web page itself")
def test_a_browser_opening_the_url_without_mateu_ui_gets_a_hint_not_a_json_404():
    page = client.get("/", headers={"accept": "text/html"})
    assert page.status_code == 404
    assert page.headers["content-type"].startswith("text/html")
    assert "MATEU_UI" in page.text
