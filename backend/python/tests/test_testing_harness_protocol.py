"""``mateu_ui.testing``: the client side of the harness against SCRIPTED wire answers — the shapes a
renderer must follow that this backend does not emit itself but another Mateu backend (Java's crud
orchestrator, an announced island, a mediator shell) does. Each test asserts the requests the
``Screen`` sends, as a renderer would send them."""

import sys
from pathlib import Path
from typing import Callable

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.testing import MateuTest, MateuTestError  # noqa: E402


class Scripted(MateuTest):
    """A backend that answers from a script: ``answer(request) -> wire answer``."""

    def __init__(self, answer: Callable[[dict], dict]):  # noqa: D107 - no handler: nothing is wired
        self.answer = answer
        self.requests: list[dict] = []

    def exchange(self, request, identity=None):
        self.requests.append(request)
        return self.answer(request)


def server_side(id_=None, sst=None, route=None, children=(), **extra) -> dict:
    node = {"type": "ServerSide", "children": list(children), **extra}
    if id_:
        node["id"] = id_
    if sst:
        node["serverSideType"] = sst
    if route:
        node["route"] = route
    return node


def client(metadata: dict, *children, id_=None) -> dict:
    node = {"type": "ClientSide", "metadata": metadata, "children": list(children)}
    if id_:
        node["id"] = id_
    return node


def field(field_id, label="", **extra) -> dict:
    return client({"type": "FormField", "fieldId": field_id, "label": label, **extra})


def answer(*fragments, **rest) -> dict:
    return {"fragments": list(fragments), **rest}


def frag(component=None, **rest) -> dict:
    out = dict(rest)
    if component is not None:
        out["component"] = component
    return out


def last(mateu: Scripted) -> dict:
    return mateu.requests[-1]


# ── a crud orchestrator: mediator shell → listing → record, its routes moved by state ────────────


def orders_backend(rq: dict) -> dict:
    route, sst, action = rq["route"], rq.get("serverSideType"), rq["actionId"]
    if route == "/orders" and sst is None:
        # the crud's chrome-less mediator shell: what it shows is its home
        return answer(frag(server_side("orders", "OrdersCrud", "/orders", [
            client({"type": "App", "variant": "MEDIATOR", "homeRoute": "/orders",
                    "homeConsumedRoute": "/orders", "serverSideType": "OrdersCrud"})],
            initialData={"tenant": "acme"})))
    if route == "/orders" and action == "":
        return answer(frag(server_side(
            "list", "OrdersCrud", "/orders",
            [client({"type": "Crud", "rowRoute": "", "columns": [
                {"type": "GridColumn", "id": "id", "label": "Id", "actionId": "view"},
                {"type": "GridColumn", "id": "name", "label": "Name"}]}, id_="grid")],
            actions=[{"id": "search"}, {"id": "view"}, {"id": "row-*"}],
            triggers=[{"type": "OnLoad", "actionId": "search"},
                      {"type": "OnLoad", "actionId": "poll", "timeoutMillis": 5000},
                      {"type": "OnLoad"},
                      {"type": "OnLoad", "actionId": "kpis"},
                      {"type": "OnCustomEvent", "actionId": "refresh"}],
            initialData={"_componentRoute": "/orders"})))
    if route == "/orders" and action == "search":
        return answer(frag(data={"rows": {"page": {"content": [
            {"id": "O-1", "name": "First"}, {"__mateuGroup": "g"}, {"id": "O-2", "name": "Second"}],
            "totalElements": 2}}}))
    if route == "/orders" and action == "kpis":
        return answer(frag(state={"kpi": 7}))
    if route == "/orders" and action == "view":
        return answer(frag(state={"_route": "/" + rq["parameters"]["id"], "_componentRoute": "/orders"}))
    if route == "/orders" and action.startswith("row-"):
        return answer(messages=[{"variant": "success", "text": action}])
    if route.startswith("/orders/") and action == "":
        return answer(frag(server_side(
            "record", "OrderView", route,
            [client({"type": "Form", "title": "Order " + route.rsplit("/", 1)[1],
                     "toolbar": [{"actionId": "back", "label": "Back"}]},
                    field("name", "Name"), field("qty", "Quantity"))],
            actions=[{"id": "edit"}, {"id": "save", "bubble": True}],
            triggers=[{"type": "OnValueChange", "propertyName": "qty", "actionId": "recalc"},
                      {"type": "OnLoad", "actionId": ""}],
            initialData={"name": "First", "qty": 1}), data={"extra": 1}))
    if action == "recalc":
        return answer(frag(state={"total": rq["componentState"]["qty"] * 10}))
    if action in ("back", "save"):
        return answer(frag(state={"_route": "list", "_componentRoute": ""}))
    raise AssertionError(f"unexpected request {rq}")


def test_a_crud_orchestrator_is_followed_from_its_shell_to_a_record_and_back():
    mateu = Scripted(orders_backend)
    screen = mateu.open("/orders")
    # the mediator's home is loaded with the shell's state as its seed, then the listing searches
    home = mateu.requests[1]
    assert (home["route"], home["consumedRoute"], home["serverSideType"]) == ("/orders", "/orders", "OrdersCrud")
    assert home["componentState"] == {"tenant": "acme"}
    assert [r["actionId"] for r in mateu.requests[2:]] == ["search", "kpis"]
    assert mateu.requests[2]["componentState"]["size"] == 10
    listing = screen.listing()
    assert listing.total == 2 and [r["name"] for r in listing.rows] == ["First", "Second"]
    assert screen.state["kpi"] == 7
    assert screen.run("row-archive").last_message.text == "row-archive"

    listing.row("Second").open()
    assert screen.route == "/orders/O-2"
    record = mateu.requests[-1]
    assert (record["route"], record["consumedRoute"], record["serverSideType"]) == ("/orders/O-2", "/orders",
                                                                                    "OrdersCrud")
    assert screen.page_title == "Order O-2"
    assert screen.shows("First")

    # a field change runs only the trigger of that property
    sent = len(mateu.requests)
    screen.field("name").set("Renamed")
    assert len(mateu.requests) == sent and screen.state["name"] == "Renamed"
    screen.field("qty").set(3)
    assert last(mateu)["actionId"] == "recalc" and screen.state["total"] == 30

    # an action the record does not own, or one that bubbles, goes to the orchestrator
    screen.button("Back").press()
    back = next(r for r in mateu.requests if r["actionId"] == "back")
    assert (back["actionId"], back["serverSideType"], back["route"]) == ("back", "OrdersCrud", "/orders/O-2")
    assert screen.route == "/orders" and screen.has_listing
    screen.listing().row(0).open()
    screen.run("save")
    save = next(r for r in reversed(mateu.requests) if r["actionId"] == "save")
    assert save["serverSideType"] == "OrdersCrud"


def test_rows_with_a_row_route_navigate_and_rows_with_nothing_do_not_open():
    def backend(rq):
        if rq["route"] == "/people":
            return answer(frag(server_side("people", "People", "/people", [client(
                {"type": "Crud", "rowRoute": "/people/${row.id}",
                 "columns": [{"type": "GridColumn", "id": "id"}]}, id_="people")]),
                data={"people": {"page": {"content": [{"id": 7}]}}}))
        if rq["route"] == "/plain":
            return answer(frag(server_side("plain", "Plain", "/plain", [client(
                {"type": "Crud", "columns": [{"type": "GridColumn", "id": "id"}]}, id_="plain")]),
                data={"plain": {"page": {"content": [{"id": 1}]}}}))
        return answer(frag(server_side("person", "Person", rq["route"], [client({"type": "Text", "text": "a person"})])))

    mateu = Scripted(backend)
    screen = mateu.open("/people")
    assert screen.listing().total == 1  # no totalElements: the rows shown
    screen.listing().row(0).open()
    assert screen.route == "/people/7" and screen.shows("a person")
    with pytest.raises(MateuTestError, match="do not open"):
        mateu.open("/plain").listing().row(0).open()


# ── announced components, overlays with islands, commands ────────────────────────────────────


def test_an_announced_component_loads_on_its_own_and_adopts_its_route():
    def backend(rq):
        if rq["route"] == "":
            return answer(frag(server_side("ann", "Inner", "/dash/inner")))
        if rq["route"] == "/dash/inner" and rq["actionId"] == "":
            # no id, no type, no initial data: the frame keeps what it had
            return answer(frag(server_side(None, None, "/dash/inner", [client({"type": "Text", "text": "inside"})],
                                           initialData="not a dict")))
        return answer(frag(client({"type": "Text", "text": "replaced"}), data={"d": 1}))

    mateu = Scripted(backend)
    screen = mateu.open("")
    inner = mateu.requests[1]
    assert (inner["route"], inner["serverSideType"], inner["initiatorComponentId"]) == ("/dash/inner", "Inner", "ann")
    assert screen.shows("inside")
    assert screen.page_title == ""  # nothing titled on screen
    screen.run("swap")
    assert last(mateu)["serverSideType"] == "Inner" and last(mateu)["initiatorComponentId"] == "ann"
    assert screen.shows("replaced")


def test_a_shell_with_no_home_stays_and_one_redirecting_forever_fails():
    mateu = Scripted(lambda rq: answer(frag(client({"type": "App", "menu": [{"label": "Only"}]}))))
    screen = mateu.open("/nowhere")
    assert screen.menu == ["Only"] and len(mateu.requests) == 1

    looping = Scripted(lambda rq: answer(frag(client({"type": "App", "homeRoute": "/loop"}))))
    with pytest.raises(MateuTestError, match="keeps redirecting"):
        looping.open("/loop")


def overlay_backend(rq: dict) -> dict:
    action = rq["actionId"]
    if action == "":
        return answer(frag(server_side("page", "Page", "/page", [client(
            {"type": "Form", "title": "Page"}, field("name", "Name"))], actions=[{"id": "open"}, {"id": "cancel"}])),
            appState={"session": "s1"})
    if action == "open":
        dialog = client({"type": "Dialog", "headerTitle": "Pick", "initialData": {"choice": "a"}},
                        server_side("island", "Picker", "/picker", [client(
                            {"type": "Button", "label": "OK", "actionId": "ok"})], actions=[{"id": "ok"}]))
        return answer(frag(dialog, action="Add", state={"extra": True}))
    if action == "ok":
        return answer(commands=[{"type": "CloseModal"}, {"type": "NavigateTo", "data": ""},
                                {"type": "PushStateToHistory", "data": ""}, {"type": "RunAction", "data": ""}])
    if action == "cancel":
        return answer("not a fragment", commands=[{"type": "CloseModal"}])
    if action == "away":
        return answer(commands=[{"type": "NavigateTo", "data": {"route": "/elsewhere"}}])
    raise AssertionError(f"unexpected request {rq}")


def test_a_dialog_hosting_an_island_routes_its_own_actions_and_bubbles_the_rest():
    mateu = Scripted(overlay_backend)
    screen = mateu.open("/page")
    screen.run("open")
    assert screen.has_overlay and screen.overlay_title == "Pick"
    assert screen.state["choice"] == "a" and screen.state["extra"] is True
    assert last(mateu)["appState"] == {"session": "s1"}

    screen.button("OK").press()
    ok = last(mateu)
    assert (ok["serverSideType"], ok["initiatorComponentId"]) == ("Picker", "island")
    assert not screen.has_overlay and screen.route == "/page"

    screen.run("open")
    screen.run("cancel")  # not the island's: sent to the page that opened the dialog
    cancel = last(mateu)
    assert (cancel["serverSideType"], cancel["route"]) == ("Page", "/page")
    assert not screen.has_overlay

    screen.run("away")
    assert screen.route == "/elsewhere"

