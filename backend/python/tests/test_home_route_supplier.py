"""A ``@menu_item`` app naming its landing route with ``HomeRouteSupplier`` (Java's
``HomeRouteSupplier``) — the shape of the Python starter's ``Shell`` — and loading its menu routes:
a menu leaf carries the APP's serverSideType (Java parity), so loading a route a registered view
owns (or one of its CRUD sub-routes) must load that view, not the app again."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import Crud, HomeRouteSupplier, Welcome, app, menu_item, ui  # noqa: E402


class LandingItem:
    id: str = ""
    name: str = ""


def _item(id: str, name: str) -> LandingItem:
    i = LandingItem()
    i.id, i.name = id, name
    return i


_ITEMS = {"I-1": _item("I-1", "First item")}


@ui("landing-welcome")
class LandingWelcome(Welcome):
    def hero_title(self) -> str:
        return "Landing"


@ui("landing-items")
class LandingItems(Crud[LandingItem]):
    def fetch(self, search):
        return list(_ITEMS.values())

    def get(self, id):
        return _ITEMS.get(id)

    def save(self, entity):
        _ITEMS[entity.id] = entity

    def delete(self, id):
        _ITEMS.pop(id, None)


@app("Landing app")
class LandingApp(HomeRouteSupplier):
    @menu_item("Welcome")
    def welcome(self) -> LandingWelcome:
        return LandingWelcome()

    @menu_item("Items")
    def items(self) -> LandingItems:
        return LandingItems()

    def home_route(self) -> str:
        return "landing-welcome"


@app("Landing app without home")
class LandingAppWithoutHome:
    @menu_item("Welcome")
    def welcome(self) -> LandingWelcome:
        return LandingWelcome()


MODULE = sys.modules[__name__]


def run(**kw) -> dict:
    inc = SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(**kw))
    return json.loads(json.dumps(inc.model_dump(by_alias=True, mode="json")))


def app_meta(cls) -> dict:
    return run(server_side_type=type_name(cls))["fragments"][0]["component"]["metadata"]


def test_a_supplied_home_route_and_its_view_model_reach_the_wire():
    meta = app_meta(LandingApp)
    assert meta["homeRoute"] == "landing-welcome"
    assert meta["homeServerSideType"] == type_name(LandingWelcome)


def test_without_a_supplier_a_menu_item_app_declares_no_home():
    assert app_meta(LandingAppWithoutHome)["homeRoute"] == "_no_home_route"


def test_loading_a_menu_route_with_the_app_type_loads_the_view_not_the_app():
    body = run(server_side_type=type_name(LandingApp), route="/landing-items")
    component = body["fragments"][0]["component"]
    assert component.get("serverSideType") == type_name(LandingItems)


def test_a_crud_sub_route_under_a_menu_route_loads_the_crud():
    body = json.dumps(run(server_side_type=type_name(LandingApp), route="/landing-items/I-1"))
    assert "First item" in body
    assert '"type": "App"' not in body
