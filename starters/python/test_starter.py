"""Smoke test: the starter serves the Products CRUD on the Mateu sync endpoint."""

from fastapi.testclient import TestClient

import main


def test_products_crud_loads():
    client = TestClient(main.app)
    r = client.post(
        "/mateu/v3/sync/products",
        json={"route": "products", "actionId": "", "componentState": {}},
    )
    assert r.status_code == 200
    assert "views.Products" in r.text or "Products" in r.text
