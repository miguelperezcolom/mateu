"""Smoke test: the starter serves its app shell, home page and Products CRUD on the Mateu sync
endpoint."""

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
