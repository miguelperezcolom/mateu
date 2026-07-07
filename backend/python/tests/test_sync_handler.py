"""Golden-JSON tests — the Python output must serialize to the same wire shape as the Java/C# backends."""

import json
import sys
from pathlib import Path
from typing import Annotated

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_uidl import (  # noqa: E402
    BannerTheme,
    app_context,
    Crud,
    LinkSupplier,
    LinkTo,
    Message,
    Money,
    Multiline,
    NavLink,
    Password,
    PlainText,
    Required,
    Section,
    Step,
    Tab,
    Translator,
    Wizard,
    app,
    banner,
    button,
    compact,
    confirm_on_navigation_if_dirty,
    emits,
    fab,
    kpi,
    menu_item,
    shortcut,
    subscribe_to,
    subtitle,
    title,
    ui,
)


@ui("")
@title("Simple Form")
class SimpleForm:
    name: Annotated[str | None, Required()] = None

    @button()
    def greet(self) -> Message:
        return Message(f"Hello {self.name}!")


@app("Test App")
class TestApp:
    @menu_item("Things")
    def things(self) -> "Things":
        return Things()

    @app_context("Hotel")
    def hotel(self):
        return [("1", "Hotel 1"), ("2", "Hotel 2")]


class Thing:
    id: str = ""
    name: Annotated[str, Required()] = ""


@ui("things")
@title("Things")
class Things(Crud[Thing]):
    def fetch(self, search):
        a, b = Thing(), Thing()
        a.id, a.name = "1", "Alpha"
        b.id, b.name = "2", "Beta"
        return [a, b]


class UpperTranslator(Translator):
    def translate(self, key: str) -> str:
        return key.upper()


@ui("decorated")
@title("Decorated")
@subtitle("a subtitle")
@emits("ev-out")
@subscribe_to("ev-in", "act")
class Decorated:
    field: str | None = None

    @banner(BannerTheme.WARNING, "Careful")
    def warn(self) -> str:
        return "be careful"


@ui("wiz")
@title("Wiz")
class Wiz(Wizard):
    a: Annotated[str | None, Step(1)] = None
    b: Annotated[str | None, Step(2)] = None

    def complete(self) -> Message:
        return Message("done")


@ui("linked")
@title("Linked")
class LinkedForm:
    customer_id: str = "42"
    customer_name: Annotated[str | None, LinkTo("/customers/${state.customerId}")] = "Ada"
    website: Annotated[
        str | None,
        LinkTo(
            "https://mateu.io",
            icon="vaadin:external-link",
            title="Abrir ${state.customerName}",
            target="_blank",
        ),
    ] = None
    plain: str | None = None


@ui("supplied-links")
@title("Supplied links")
class SuppliedLinkForm(LinkSupplier):
    customer_id: Annotated[str, LinkTo("/annotated/${state.customerId}")] = "42"
    order_id: str = "A-1"

    def link(self, member_name):
        if member_name == "order_id":
            return NavLink(href="/orders/${state.orderId}", icon="vaadin:cart")
        return None


@ui("featured")
@title("Featured")
@compact
@confirm_on_navigation_if_dirty
class Featured:
    name: Annotated[str | None, Tab("One")] = None
    secret: Annotated[str | None, Tab("One"), Password()] = None
    bio: Annotated[str | None, Tab("Two"), Multiline()] = None
    salary: Annotated[float, Tab("Two"), Money()] = 0.0
    joined: Annotated[str | None, Tab("Two"), PlainText()] = "2021-03-14"

    @kpi("Tickets")
    def tickets(self) -> str:
        return "42"

    @fab("plus", "Add", 0)
    def add(self) -> Message:
        return Message("Added")

    @button()
    @shortcut("ctrl+s")
    def save(self) -> Message:
        return Message(f"Saved {self.name}")


MODULE = sys.modules[__name__]


def handler(translator=None) -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE), translator)


def render(inc) -> str:
    return json.dumps(inc.model_dump(by_alias=True, mode="json"))


def test_initial_load_form_with_required_field_and_button():
    inc = handler().handle(RunActionRq(route="", consumed_route="_empty"))
    j = render(inc)
    assert '"type": "SetWindowTitle"' in j or '"type":"SetWindowTitle"' in j
    assert "Simple Form" in j
    assert '"ServerSide"' in j
    assert "SimpleForm" in j
    assert '"FormField"' in j
    assert '"name"' in j
    assert '"dataType": "string"' in j
    assert '"required": true' in j
    assert '"greet"' in j


def test_greet_action_returns_hello_from_state():
    inc = handler().handle(
        RunActionRq(
            route="",
            action_id="greet",
            server_side_type=_name(SimpleForm),
            component_state={"name": "Mateu"},
        )
    )
    assert len(inc.messages) == 1
    assert inc.messages[0].text == "Hello Mateu!"
    assert inc.messages[0].variant == "success"
    assert inc.fragments == []


def test_app_shell_menu():
    inc = handler().handle(RunActionRq(server_side_type=_name(TestApp)))
    j = render(inc)
    assert '"App"' in j
    assert "Test App" in j
    assert "Things" in j
    assert '"/things"' in j


def test_app_context_selectors_on_the_wire():
    inc = handler().handle(RunActionRq(server_side_type=_name(TestApp)))
    j = json.loads(render(inc))
    app_meta = j["fragments"][0]["component"]["metadata"]
    selectors = app_meta["contextSelectors"]
    assert selectors[0]["fieldName"] == "hotel"
    assert selectors[0]["label"] == "Hotel"
    assert [o["label"] for o in selectors[0]["options"]] == ["Hotel 1", "Hotel 2"]


def test_crud_search_returns_rows():
    inc = handler().handle(
        RunActionRq(action_id="search", server_side_type=_name(Things), component_state={"searchText": ""})
    )
    assert len(inc.fragments) == 1
    assert inc.fragments[0].target_component_id == "crud"
    assert inc.fragments[0].component is None
    j = render(inc)
    assert '"totalElements": 2' in j
    assert "Alpha" in j and "Beta" in j


def test_crud_view_prefilled_readonly():
    inc = handler().handle(RunActionRq(route="/things/1", server_side_type=_name(Things)))
    j = render(inc)
    assert '"cancel-view"' in j
    assert '"edit"' in j
    assert '"Alpha"' in j
    assert '"readOnly": true' in j


def test_crud_create_navigates_back_with_message():
    inc = handler().handle(
        RunActionRq(
            route="/things/new",
            action_id="create",
            server_side_type=_name(Things),
            component_state={"name": "Gamma"},
        )
    )
    assert len(inc.commands) == 1
    assert inc.commands[0].type == "NavigateTo"
    assert inc.commands[0].data == "/things"
    assert inc.messages[0].text == "Saved"


def test_crud_create_missing_required_is_error():
    inc = handler().handle(
        RunActionRq(route="/things/new", action_id="create", server_side_type=_name(Things), component_state={})
    )
    assert inc.commands == []
    assert inc.messages[0].variant == "error"
    assert "Name" in inc.messages[0].text


def test_translator_translates():
    j = render(handler(UpperTranslator()).handle(RunActionRq(route="")))
    assert "SIMPLE FORM" in j
    assert '"NAME"' in j


def test_page_decorations_subtitle_and_banner():
    j = render(handler().handle(RunActionRq(server_side_type=_name(Decorated))))
    assert '"subtitle": "a subtitle"' in j
    assert '"theme": "WARNING"' in j
    assert '"Careful"' in j
    assert "be careful" in j


def test_events_emit_and_subscription():
    j = render(handler().handle(RunActionRq(server_side_type=_name(Decorated))))
    assert '"emitsName": "ev-out"' in j
    assert '"OnCustomEvent"' in j
    assert '"ev-in"' in j
    assert '"act"' in j


def test_wizard_renders_and_completes():
    j1 = render(handler().handle(RunActionRq(server_side_type=_name(Wiz))))
    assert '"ProgressBar"' in j1
    assert '"next"' in j1
    finish = handler().handle(
        RunActionRq(action_id="next", server_side_type=_name(Wiz), component_state={"__step": 2})
    )
    assert finish.messages[0].text == "done"


def test_tail_features():
    j = render(handler().handle(RunActionRq(server_side_type=_name(Featured))))
    assert '"TabLayout"' in j
    assert '"Tab"' in j
    assert '"One"' in j and '"Two"' in j
    assert '"stereotype": "password"' in j
    assert '"stereotype": "textarea"' in j
    assert '"multiline": true' in j
    assert '"dataType": "money"' in j
    assert '"stereotype": "plainText"' in j
    assert '"Tickets"' in j and '"42"' in j
    assert '"icon": "plus"' in j
    assert '"actionId": "add"' in j
    assert '"shortcut": "ctrl+s"' in j
    assert '"confirmOnNavigationIfDirty": true' in j
    assert "--mateu-compact:1" in j


def test_link_to_travels_verbatim_and_absent_links_are_null():
    j = render(handler().handle(RunActionRq(server_side_type=_name(LinkedForm))))
    # The marker's href/title travel as RAW ${...} templates (interpolated client-side);
    # unset marker members travel as "" — exactly like the Java @LinkTo defaults.
    assert (
        '"link": {"href": "/customers/${state.customerId}", "icon": "", "title": "", "target": ""}'
        in j
    )
    assert (
        '"link": {"href": "https://mateu.io", "icon": "vaadin:external-link", '
        '"title": "Abrir ${state.customerName}", "target": "_blank"}' in j
    )
    # Fields without LinkTo carry "link": null (Mateu's JSON keeps nulls, like the Java wire).
    assert '"link": null' in j


def test_link_supplier_wins_over_the_marker_and_none_falls_back_to_it():
    j = render(handler().handle(RunActionRq(server_side_type=_name(SuppliedLinkForm))))
    # The supplier's link (members it leaves unset serialize as null, like Java's builder).
    assert (
        '"link": {"href": "/orders/${state.orderId}", "icon": "vaadin:cart", '
        '"title": null, "target": null}' in j
    )
    # The supplier returned None for customer_id -> the LinkTo marker applies.
    assert (
        '"link": {"href": "/annotated/${state.customerId}", "icon": "", "title": "", "target": ""}'
        in j
    )


def test_fab_action_invoked():
    inc = handler().handle(RunActionRq(action_id="add", server_side_type=_name(Featured)))
    assert inc.messages[0].text == "Added"


def _name(cls) -> str:
    from mateu_core import type_name

    return type_name(cls)
