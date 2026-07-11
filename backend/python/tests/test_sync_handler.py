"""Golden-JSON tests — the Python output must serialize to the same wire shape as the Java/C# backends."""

import json
import sys
from datetime import date
from enum import Enum
from pathlib import Path
from typing import Annotated

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_dtos import Option, UICommand  # noqa: E402
from mateu_uidl.components import Dialog, Drawer, Text  # noqa: E402
from mateu_uidl import (  # noqa: E402
    BannerTheme,
    Disabled,
    Hidden,
    PageBanner,
    PhotoCapture,
    RangeFilter,
    Rule,
    RuleSupplier,
    Searchable,
    SelectedItem,
    Selector,
    Signature,
    TreeSelect,
    app_context,
    Crud,
    DateRange,
    HeroSearch,
    LinkSupplier,
    Listing,
    NumberRange,
    LinkTo,
    Lookup,
    Message,
    Money,
    Multiline,
    NavLink,
    OnRowSelected,
    Password,
    PlainText,
    ReadOnly,
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
    folded_layout,
    inline_editing,
    kpi,
    menu_item,
    shortcut,
    subscribe_to,
    subtitle,
    title,
    toc,
    ui,
    zones,
)


@ui("")
@title("Simple Form")
class SimpleForm:
    name: Annotated[str | None, Required()] = None

    @button()
    def greet(self) -> Message:
        return Message(f"Hello {self.name}!")

    @button()
    def warn(self):
        return PageBanner(BannerTheme.WARNING, "Heads up", "Something to note", closeable=True)

    @button()
    def go_home(self):
        return "/things"


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


@ui("capture")
@title("Capture")
class CaptureForm:
    firma: Annotated[str, Signature()] = ""
    foto: Annotated[str, PhotoCapture()] = ""
    zone: Annotated[str, TreeSelect(leaves_only=True)] = ""

    def options(self, field_name):
        if field_name == "zone":
            return [
                Option(value="es", label="Spain", children=[Option(value="mca", label="Mallorca")]),
                Option(value="pt", label="Portugal"),
            ]
        return []


@ui("things")
@title("Things")
class Things(Crud[Thing]):
    def fetch(self, search):
        a, b = Thing(), Thing()
        a.id, a.name = "1", "Alpha"
        b.id, b.name = "2", "Beta"
        return [a, b]


class BookingChannel(Enum):
    WEB = "WEB"
    PHONE = "PHONE"
    AGENCY = "AGENCY"


class Booking:
    id: str = ""
    guest: str = ""
    paid: bool = False
    channel: BookingChannel = BookingChannel.WEB
    created: date = date(2026, 1, 1)
    total: Annotated[float, RangeFilter()] = 0.0


@ui("bookings")
@title("Bookings")
class Bookings(Crud[Booking]):
    def fetch(self, search):
        def booking(id_, guest, paid, channel, created, total):
            b = Booking()
            b.id, b.guest, b.paid, b.channel, b.created, b.total = id_, guest, paid, channel, created, total
            return b

        return [
            booking("b1", "Smith", True, BookingChannel.WEB, date(2026, 1, 10), 100.0),
            booking("b2", "Jones", False, BookingChannel.PHONE, date(2026, 2, 10), 250.0),
            booking("b3", "Brown", True, BookingChannel.AGENCY, date(2026, 3, 10), 400.0),
        ]


@ui("zoned")
@title("Zoned")
@zones(("left", "64%"), ("right", "36%"))
class ZonedForm:
    a: Annotated[str | None, Section("Main", zone="left")] = None
    b: str | None = None
    c: Annotated[str | None, Section("Side", zone="right")] = None
    d: Annotated[str | None, Section("Loose")] = None


class SelectorHotelRow:
    id: str = ""
    name: str = ""


class SelectorHotelFilters:
    pass


@ui("hotel-selector")
@title("Hotels")
class HotelSelector(Listing[SelectorHotelFilters, SelectorHotelRow], Selector):
    def search(self, search_text, filters):
        a = SelectorHotelRow()
        a.id, a.name = "h1", "Palace"
        b = SelectorHotelRow()
        b.id, b.name = "h2", "Marina"
        return [a, b]

    def selected(self, row):
        return SelectedItem(id=row.id, label=row.name)


@ui("reservation")
@title("Reservation")
class ReservationForm:
    hotel: Annotated[str | None, Searchable(HotelSelector)] = None


class ZoneRow:
    id: str = ""
    name: str = ""
    children: "list[ZoneRow]" = []


class ZoneFilters:
    pass


def _zone(id_, name, children=()):
    z = ZoneRow()
    z.id, z.name, z.children = id_, name, list(children)
    return z


@ui("zone-selector")
@title("Zones")
class ZoneSelector(Listing[ZoneFilters, ZoneRow], Selector):
    def grid_layout(self):
        return "tree"

    def search(self, search_text, filters):
        return [
            _zone("espana", "España", [
                _zone("baleares", "Baleares", [_zone("mallorca", "Mallorca")]),
            ]),
            _zone("portugal", "Portugal"),
        ]

    def selected(self, row):
        return SelectedItem(id=row.id, label=row.name)


class BookingSource(Enum):
    WEB = "WEB"
    PHONE = "PHONE"
    AGENCY = "AGENCY"


class ListedBooking:
    locator: str = ""
    guest: str = ""
    source: BookingSource = BookingSource.WEB
    created: date = date(2026, 1, 1)
    total: float = 0.0


class ListedBookingFilters:
    created: DateRange | None = None
    total: NumberRange | None = None
    sources: set[BookingSource] | None = None
    guest: str | None = None


def _listed_booking(locator, guest, source, created, total):
    b = ListedBooking()
    b.locator, b.guest, b.source, b.created, b.total = locator, guest, source, created, total
    return b


_LISTED_BOOKINGS = [
    _listed_booking("B-001", "Smith", BookingSource.WEB, date(2026, 7, 2), 320.0),
    _listed_booking("B-002", "Jones", BookingSource.PHONE, date(2026, 7, 5), 149.5),
    _listed_booking("B-003", "Garcia", BookingSource.AGENCY, date(2026, 7, 9), 890.0),
    _listed_booking("B-004", "Brown", BookingSource.WEB, date(2026, 7, 12), 260.0),
]


@ui("bookings-listing")
@title("Bookings (typed filters)")
class BookingsListing(Listing[ListedBookingFilters, ListedBooking]):
    def search(self, search_text, filters):
        return [
            r for r in _LISTED_BOOKINGS
            if (not search_text or search_text.lower() in f"{r.guest} {r.locator}".lower())
            and (filters.created is None or filters.created.contains(r.created))
            and (filters.total is None or filters.total.contains(r.total))
            and (not filters.sources or r.source in filters.sources)
        ]


@ui("folded")
@title("Folded")
@folded_layout
class FoldedForm:
    a: Annotated[str | None, Section("One")] = None
    b: Annotated[str | None, Section("Two")] = None


class Guest:
    name: str = ""
    age: int = 0


_LAST_SELECTED: list = []


@ui("checkin")
@title("Check-in")
class CheckInForm:
    guests: Annotated[list[Guest], OnRowSelected("onGuestSelected", shortcut="ctrl+shift")] = None  # type: ignore[assignment]

    def __init__(self):
        a = Guest()
        a.name, a.age = "Alice", 34
        b = Guest()
        b.name, b.age = "Bob", 29
        self.guests = [a, b]

    def on_guest_selected(self, guest: Guest):
        _LAST_SELECTED.append(f"{guest.name}/{guest.age}")
        return Message(f"Selected {guest.name}")


@ui("ruled")
@title("Ruled")
class RuledForm(RuleSupplier):
    special: bool = False
    special_code: Annotated[str | None, Hidden("!state.special")] = None
    locked: Annotated[str | None, Disabled()] = "fixed"

    def rules(self):
        return [Rule.disable("specialCode", "state.locked == 'frozen'")]


@ui("long-doc")
@title("Long Doc")
@toc
class LongDocForm:
    a: Annotated[str | None, Section("One")] = None
    b: Annotated[str | None, Section("Two")] = None


class Hotel:
    id: str = ""
    name: str = ""


@ui("hotel-search")
@title("Hotel Search")
class HotelSearch(HeroSearch[Hotel]):
    def hero_title(self):
        return "Find your stay"

    def hero_subtitle(self):
        return "Search 200 hotels"

    def fetch(self, search):
        h = Hotel()
        h.id, h.name = "h1", "Palace"
        return [h]


@ui("overlays")
@title("Overlays")
class OverlayDemo:
    @button()
    def open_panel(self):
        return Drawer(header_title="Edit contact", width="480px", content=Text(text="drawer body"))

    @button()
    def open_dialog(self):
        return Dialog(header_title="Confirm", content=Text(text="dialog body"))

    @button()
    def save_and_close(self):
        return UICommand.close_modal("contact-saved", {"id": 7})


@ui("order")
@title("Order")
class OrderForm:
    supplier: Annotated[str, Lookup()] = ""

    def options(self, field_name):
        if field_name == "supplier":
            return [
                Option(value="a1", label="Acme Tools"),
                Option(value="a2", label="Acme Paint"),
                Option(value="b1", label="Bolts Inc"),
            ]
        return []


class StockStatus(Enum):
    OK = "OK"
    LOW = "LOW"
    OUT = "OUT"


class StockItem:
    id: Annotated[str, ReadOnly()] = ""
    name: str = ""
    units: int = 0
    active: bool = False
    status: StockStatus = StockStatus.OK


_STOCK_STORE: dict[str, StockItem] = {}


def _stock_item(id_, name, units, active, status):
    s = StockItem()
    s.id, s.name, s.units, s.active, s.status = id_, name, units, active, status
    return s


@ui("stock")
@title("Stock")
@inline_editing
class StockCrud(Crud[StockItem]):
    def fetch(self, search):
        return _STOCK_STORE.values()

    def get(self, id_):
        return _STOCK_STORE.get(id_)

    def save(self, entity):
        _STOCK_STORE[entity.id] = entity


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


def test_capture_and_tree_fields_on_the_wire():
    inc = handler().handle(RunActionRq(route="/capture", server_side_type=_name(CaptureForm)))
    j = render(inc)
    assert '"stereotype": "signature"' in j
    assert '"stereotype": "camera"' in j
    assert '"stereotype": "treeSelect"' in j
    assert '"treeLeavesOnly": true' in j
    assert '"label": "Mallorca"' in j


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


def test_tree_selector_emits_the_tree_grid_layout_without_a_children_column():
    inc = handler().handle(RunActionRq(route="zone-selector", consumed_route="zone-selector"))
    j = render(inc)

    assert '"gridLayout": "tree"' in j
    # The children list rides inside the rows, never as a column…
    assert '"id": "children"' not in j
    # …and the selector wiring is intact.
    assert '"id": "select"' in j
    assert "action-on-row-select" in j


def test_tree_search_returns_hierarchical_rows_with_nested_children():
    inc = handler().handle(
        RunActionRq(action_id="search", server_side_type=_name(ZoneSelector))
    )
    j = render(inc)

    # Two roots; the whole hierarchy rides in one payload as nested children arrays.
    assert '"totalElements": 2' in j
    assert '"name": "Baleares", "children": [{"id": "mallorca", "name": "Mallorca", "children": []}]' in j
    assert '"id": "portugal", "name": "Portugal", "children": []' in j


def test_searchable_field_renders_with_the_searchable_stereotype():
    inc = handler().handle(RunActionRq(route="reservation", consumed_route="reservation"))
    assert '"stereotype": "searchable"' in render(inc)


def test_codesearch_opens_the_selector_listing_in_a_dialog():
    inc = handler().handle(
        RunActionRq(
            action_id="codesearch-hotel",
            route="reservation",
            server_side_type=_name(ReservationForm),
            initiator_component_id="comp-3",
        )
    )
    assert len(inc.fragments) == 1
    assert inc.fragments[0].target_component_id == "comp-3"
    assert inc.fragments[0].action == "Add"
    j = render(inc)
    # A Dialog whose content is the selector's own server-side listing…
    assert '"type": "Dialog"' in j
    assert _name(HotelSelector) in j
    # …with the Select action column, the host field id, and its own search wiring.
    assert '"id": "select", "label": "Select", "type": "GridColumn", "dataType": "action"' in j
    assert '"_fieldId": "hotel"' in j
    assert "action-on-row-select" in j
    assert '"OnLoad"' in j


def test_selecting_a_row_writes_id_and_label_back_and_closes_the_dialog():
    inc = handler().handle(
        RunActionRq(
            action_id="action-on-row-select",
            server_side_type=_name(HotelSelector),
            component_state={"_fieldId": "hotel"},
            parameters={"_clickedRow": {"id": "h2", "name": "Marina"}},
        )
    )
    assert len(inc.commands) == 3
    j = render(inc)
    assert '"eventName": "value-changed"' in j
    assert '"fieldId": "hotel", "value": "h2"' in j
    assert '"eventName": "data-changed"' in j
    assert '"key": "hotel-label", "value": "Marina"' in j
    assert '"eventName": "close-modal-requested"' in j


def test_declarative_listing_emits_typed_filter_widgets_and_read_only_columns():
    inc = handler().handle(RunActionRq(route="bookings-listing", consumed_route="bookings-listing"))
    j = render(inc)

    # Typed filters render range/multi widgets — the type is the developer's explicit ask…
    assert '"fieldId": "created", "dataType": "date", "label": "Created", "stereotype": "dateRange"' in j
    assert '"fieldId": "total", "dataType": "number", "label": "Total", "stereotype": "numberRange"' in j
    assert '"fieldId": "sources", "dataType": "string", "label": "Sources", "stereotype": "multiSelect"' in j
    # …plain fields keep single-value widgets, and the listing is read-only.
    assert '"fieldId": "guest", "dataType": "string", "label": "Guest", "stereotype": "regular"' in j
    assert '"canEdit": false' in j
    assert '"id": "locator"' in j


def test_listing_search_assembles_typed_filters_from_flat_state_keys():
    inc = handler().handle(
        RunActionRq(
            action_id="search",
            server_side_type=_name(BookingsListing),
            component_state={
                "searchText": "",
                "created_from": "2026-07-04",
                "created_to": "2026-07-10",
                "sources": ["PHONE", "AGENCY"],
            },
        )
    )
    j = render(inc)

    # Only Jones (PHONE, 07-05) and Garcia (AGENCY, 07-09) fall in range AND source set.
    assert '"totalElements": 2' in j
    assert "Jones" in j and "Garcia" in j
    assert "Smith" not in j and "Brown" not in j


def test_listing_search_assembles_number_ranges_and_comma_joined_sets():
    inc = handler().handle(
        RunActionRq(
            action_id="search",
            server_side_type=_name(BookingsListing),
            component_state={
                "total_from": "200",
                # Comma-joined after a URL restore; a stale constant is dropped, not fatal.
                "sources": "WEB,GONE",
            },
        )
    )
    j = render(inc)

    assert '"totalElements": 2' in j
    assert "Smith" in j and "Brown" in j
    assert "Garcia" not in j


def test_folded_layout_puts_the_section_cards_in_one_horizontal_row():
    inc = handler().handle(RunActionRq(route="folded", consumed_route="folded"))
    j = render(inc)
    assert '"type": "HorizontalLayout"' in j
    assert "One" in j and "Two" in j


def test_zones_lay_sections_out_as_side_by_side_columns():
    inc = handler().handle(RunActionRq(route="zoned", consumed_route="zoned"))
    j = render(inc)

    # A horizontal row of vertical columns…
    assert '"type": "HorizontalLayout"' in j
    assert "width: 100%; align-items: flex-start;" in j
    # …declared zones size by their width, the unzoned section falls into a flexible column…
    assert "flex: 0 0 64%; min-width: 0;" in j
    assert "flex: 0 0 36%; min-width: 0;" in j
    assert "flex: 1; min-width: 0;" in j
    # …and every section card survives.
    assert "Main" in j and "Side" in j and "Loose" in j


def test_list_of_rows_field_renders_as_a_grid_form_field():
    inc = handler().handle(RunActionRq(route="checkin", consumed_route="checkin"))
    j = render(inc)

    assert '"dataType": "array"' in j
    assert '"stereotype": "grid"' in j
    assert '"itemIdPath": "_rowNumber"' in j
    # Columns come from the row type, initial rows ride as camelCase dicts…
    assert '"id": "name", "label": "Name"' in j
    assert '"id": "age", "label": "Age"' in j
    assert "Alice" in j
    # …and OnRowSelected() wires the click + shortcut and advertises the action.
    assert '"onItemSelectionActionId": "onGuestSelected"' in j
    assert '"rowSelectionShortcut": "ctrl+shift"' in j
    assert '"id": "onGuestSelected"' in j


def test_row_click_injects_the_clicked_row_into_the_method():
    _LAST_SELECTED.clear()
    inc = handler().handle(
        RunActionRq(
            action_id="onGuestSelected",
            route="checkin",
            server_side_type=_name(CheckInForm),
            parameters={"_clickedRow": {"name": "Bob", "age": 29}},
        )
    )
    assert len(inc.messages) == 1
    assert inc.messages[0].text == "Selected Bob"
    assert _LAST_SELECTED == ["Bob/29"]


def test_hidden_disabled_and_supplier_rules_ride_on_the_server_side_component():
    inc = handler().handle(RunActionRq(route="ruled", consumed_route="ruled"))
    j = render(inc)

    # Hidden(expr) → a hidden rule with the client-side expression…
    assert '"fieldName": "specialCode", "fieldAttribute": "hidden", "value": null, "expression": "!state.special"' in j
    # …Disabled() → an unconditional disabled rule…
    assert '"fieldName": "locked", "fieldAttribute": "disabled", "value": null, "expression": "true"' in j
    # …and RuleSupplier contributes programmatic rules.
    assert "state.locked == 'frozen'" in j
    assert '"action": "SetDataValue"' in j
    assert '"result": "Continue"' in j


def test_toc_marks_the_page_for_a_sticky_sections_index():
    inc = handler().handle(RunActionRq(route="long-doc", consumed_route="long-doc"))
    assert '"toc": true' in render(inc)


def test_hero_search_renders_a_hero_over_a_cards_listing_and_does_not_preload():
    inc = handler().handle(RunActionRq(route="hotel-search", consumed_route="hotel-search"))
    j = render(inc)

    assert '"type": "HeroSection"' in j
    assert '"title": "Find your stay"' in j
    assert '"crudlType": "cards"' in j
    # Starts empty: no OnLoad→search trigger (the user searches).
    assert '"OnLoad"' not in j


def test_action_returned_drawer_is_an_add_fragment_on_the_initiator():
    inc = handler().handle(
        RunActionRq(
            action_id="openPanel",
            route="overlays",
            server_side_type=_name(OverlayDemo),
            initiator_component_id="comp-9",
        )
    )
    assert len(inc.fragments) == 1
    assert inc.fragments[0].target_component_id == "comp-9"
    assert inc.fragments[0].action == "Add"
    j = render(inc)
    assert '"type": "Drawer"' in j
    assert '"headerTitle": "Edit contact"' in j
    assert '"position": "end"' in j
    assert "drawer body" in j


def test_action_returned_dialog_is_an_add_fragment_too():
    inc = handler().handle(
        RunActionRq(action_id="openDialog", route="overlays", server_side_type=_name(OverlayDemo))
    )
    assert len(inc.fragments) == 1
    assert inc.fragments[0].action == "Add"
    j = render(inc)
    assert '"type": "Dialog"' in j
    assert '"closeButtonOnHeader": true' in j
    assert "dialog body" in j


def test_close_modal_command_carries_the_named_event_and_detail():
    inc = handler().handle(
        RunActionRq(action_id="saveAndClose", route="overlays", server_side_type=_name(OverlayDemo))
    )
    assert len(inc.commands) == 1
    assert inc.commands[0].type == "CloseModal"
    j = render(inc)
    assert '"eventName": "contact-saved"' in j
    assert '"id": 7' in j


def test_lookup_field_renders_a_remote_combobox_on_the_wire():
    inc = handler().handle(RunActionRq(route="order", consumed_route="order"))
    j = render(inc)

    assert '"stereotype": "combobox"' in j
    assert '"remoteCoordinates": {"action": "search-supplier"' in j


def test_lookup_search_filters_and_pages_the_suppliers_options():
    inc = handler().handle(
        RunActionRq(
            action_id="search-supplier",
            route="order",
            server_side_type=_name(OrderForm),
            initiator_component_id="comp-1",
            parameters={"searchText": "acme", "page": 0, "size": 10},
        )
    )
    assert len(inc.fragments) == 1
    assert inc.fragments[0].target_component_id == "comp-1"
    j = render(inc)
    assert '"totalElements": 2' in j
    assert "Acme Tools" in j and "Acme Paint" in j
    assert "Bolts Inc" not in j


def test_inline_editing_marks_data_columns_editable_and_advertises_update_row():
    _STOCK_STORE.clear()
    _STOCK_STORE["s1"] = _stock_item("s1", "Bolts", 12, True, StockStatus.OK)
    inc = handler().handle(RunActionRq(route="stock", consumed_route="stock"))
    j = render(inc)

    # Data columns edit in place with the widget matching their type…
    assert (
        '"id": "name", "label": "Name", "type": "GridColumn", "dataType": null, "stereotype": null, '
        '"editable": true, "editorType": "text"'
    ) in j
    assert '"editorType": "integer"' in j
    assert '"editorType": "boolean"' in j
    assert '"editorType": "select"' in j
    # …enum editors carry their constants as options…
    assert '"editorOptions": [{"value": "OK"' in j
    # …ReadOnly() columns stay display-only…
    assert (
        '"id": "id", "label": "Id", "type": "GridColumn", "dataType": null, "stereotype": null, '
        '"editable": false'
    ) in j
    # …and the crud advertises the update-row action.
    assert '"update-row"' in j


def test_update_row_rebuilds_the_entity_and_saves_it():
    _STOCK_STORE.clear()
    _STOCK_STORE["s1"] = _stock_item("s1", "Bolts", 12, True, StockStatus.OK)
    inc = handler().handle(
        RunActionRq(
            action_id="update-row",
            server_side_type=_name(StockCrud),
            parameters={"_editedRow": {"id": "s1", "name": "Bolts XL", "units": 20, "active": False, "status": "LOW"}},
        )
    )
    assert len(inc.messages) == 1
    assert inc.messages[0].variant == "success"
    saved = _STOCK_STORE["s1"]
    assert saved.name == "Bolts XL"
    assert saved.units == 20
    assert saved.active is False
    assert saved.status == StockStatus.LOW


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


# ── Smart-search listing filters ─────────────────────────────────────────────


def test_crud_list_metadata_carries_the_smart_search_filters():
    j = render(handler().handle(RunActionRq(route="/bookings", server_side_type=_name(Bookings))))
    assert '"filters": [' in j
    # enum → multi-select with the members as options
    assert '"fieldId": "channel"' in j
    assert '"stereotype": "multiSelect"' in j
    assert '"value": "WEB"' in j
    # temporal → date range by default; RangeFilter numeric → number range
    assert '"stereotype": "dateRange"' in j
    assert '"stereotype": "numberRange"' in j


def search_bookings(state: dict):
    state.setdefault("searchText", "")
    return handler().handle(
        RunActionRq(action_id="search", server_side_type=_name(Bookings), component_state=state)
    )


def test_crud_search_applies_the_enum_multi_select_as_in():
    j = render(search_bookings({"channel": ["WEB", "PHONE"]}))
    assert "Smith" in j and "Jones" in j and "Brown" not in j
    # comma-joined after a URL restore behaves the same
    restored = render(search_bookings({"channel": "WEB,AGENCY"}))
    assert "Smith" in restored and "Brown" in restored and "Jones" not in restored


def test_crud_search_applies_date_and_number_ranges():
    j = render(search_bookings({"created_from": "2026-01-15", "created_to": "2026-02-20"}))
    assert "Jones" in j and "Smith" not in j and "Brown" not in j
    numeric = render(search_bookings({"total_from": "200"}))
    assert "Jones" in numeric and "Brown" in numeric and "Smith" not in numeric


def test_crud_search_applies_string_containment_and_bool_equality():
    j = render(search_bookings({"guest": "mi"}))
    assert "Smith" in j and "Jones" not in j
    paid = render(search_bookings({"paid": False}))
    assert "Jones" in paid and "Smith" not in paid and "Brown" not in paid


def test_crud_search_ignores_blank_bounds_and_empty_selections():
    j = render(search_bookings({"created_from": "", "channel": [], "guest": ""}))
    assert '"totalElements": 3' in j


def _name(cls) -> str:
    from mateu_core import type_name

    return type_name(cls)


def test_crud_search_sorts_and_paginates():
    # sort by name descending → Beta before Alpha; page 0 size 1 → only the first row + real total
    inc = handler().handle(
        RunActionRq(
            action_id="search",
            server_side_type=_name(Things),
            component_state={
                "searchText": "",
                "sort": [{"field": "name", "direction": "descending"}],
                "page": 0,
                "size": 1,
            },
        )
    )
    page = inc.fragments[0].data["crud"]["page"]
    assert page["totalElements"] == 2  # total is the full dataset, not the page
    assert page["pageSize"] == 1 and page["pageNumber"] == 0
    assert len(page["content"]) == 1
    assert page["content"][0]["name"] == "Beta"  # descending

    # page 1 → the second row
    inc2 = handler().handle(
        RunActionRq(
            action_id="search",
            server_side_type=_name(Things),
            component_state={"searchText": "", "sort": [{"field": "name", "direction": "descending"}], "page": 1, "size": 1},
        )
    )
    page2 = inc2.fragments[0].data["crud"]["page"]
    assert page2["content"][0]["name"] == "Alpha"
    assert page2["pageNumber"] == 1


def test_action_returns_page_banner():
    inc = handler().handle(
        RunActionRq(action_id="warn", server_side_type=_name(SimpleForm), component_state={})
    )
    assert len(inc.banners) == 1
    b = inc.banners[0]
    assert b.theme == "WARNING" and b.title == "Heads up" and b.has_close_button is True


def test_action_returns_route_navigates():
    inc = handler().handle(
        RunActionRq(action_id="goHome", server_side_type=_name(SimpleForm), component_state={})
    )
    assert any(c.type == "NavigateTo" and c.data == "/things" for c in inc.commands)
