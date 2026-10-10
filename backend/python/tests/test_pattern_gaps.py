"""The Redwood pattern gaps on the Python port — the mirror of Java's WizardTransactionalSyncTest,
CrudDisplaySyncTest, PageSlotsSyncTest and PageAffordancesSyncTest: wizard drafts / skip / early
completion / the cancelable before-step hook and WizardDisplay; Crud.display() (New/Delete
on|off|disabled, the edit drawer's Save and next and its error banner); GeneralOverview info
slot, foldout panel summary, DataManagement docked panels, SmartSearchPage pre-search content and
hero tones; the header record switcher, section affordances and the Announce command."""

from __future__ import annotations

import dataclasses
import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_dtos import UICommand  # noqa: E402
from mateu_uidl import (  # noqa: E402
    Announce,
    Crud,
    CrudDisplay,
    DataManagement,
    DockedPanel,
    Draftable,
    Foldout,
    GeneralOverview,
    GeneralOverviewDisplay,
    HeroTone,
    ListingData,
    Message,
    MessageVariant,
    Panel,
    RecordSwitcher,
    RecordSwitcherSupplier,
    Required,
    Section,
    SmartSearchPage,
    Step,
    SwitcherType,
    Toggle,
    Welcome,
    Wizard,
    WizardDisplay,
    edit_in_drawer,
    title,
    ui,
    welcome_banner,
    wizard_completion_action,
)
from mateu_uidl import components as fluent  # noqa: E402

MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def run(cls, route: str, action_id: str | None = None, state: dict | None = None,
        parameters: dict | None = None):
    return handler().handle(
        RunActionRq(
            route=route,
            consumed_route=route,
            server_side_type=type_name(cls),
            action_id=action_id,
            initiator_component_id="c1_app",
            component_state=state or {},
            parameters=parameters or {},
        )
    )


def dump(inc) -> dict:
    return inc.model_dump(by_alias=True, mode="json")


def walk(node, out: list | None = None) -> list:
    """Every dict in the dumped wire tree (depth first)."""
    out = [] if out is None else out
    if isinstance(node, dict):
        out.append(node)
        for v in node.values():
            walk(v, out)
    elif isinstance(node, list):
        for v in node:
            walk(v, out)
    return out


def metas(inc, wire_type: str) -> list[dict]:
    return [d for d in walk(dump(inc)) if d.get("type") == wire_type]


def components_with_meta(inc, wire_type: str) -> list[dict]:
    return [
        d for d in walk(dump(inc))
        if isinstance(d.get("metadata"), dict) and d["metadata"].get("type") == wire_type
    ]


def buttons(inc) -> list[dict]:
    return metas(inc, "Button")


def button(inc, action_id: str) -> dict | None:
    return next((b for b in buttons(inc) if b.get("actionId") == action_id), None)


def state_of(inc) -> dict:
    frag = inc.fragments[0]
    comp = frag.component
    data = dict(getattr(comp, "initial_data", None) or {})
    data.update(frag.state or {})
    return data


def texts(inc) -> list[str]:
    return [d.get("text") for d in metas(inc, "Text")]


# ── Wizard: drafts, skip, early completion, before-step hook, display ──────────────────────
DRAFTS: list[str] = []
RESUME_ON: list[int | None] = [None]


@ui("/draft-wizard")
@title("Onboarding")
class DraftWizard(Wizard, Draftable):
    email: Annotated[str, Step(1), Required()] = ""
    newsletter: Annotated[str, Step(2)] = "no"
    notes: Annotated[str, Step(3)] = ""
    result: Annotated[str, Step(4)] = "pending"

    def save_draft(self):
        DRAFTS.append(f"{self.email}|step")
        return None

    def close_draft(self):
        return "/home"

    def resume_step(self):
        return RESUME_ON[0]

    def step_skippable(self, step: int) -> bool:
        return step == 2

    def before_step_navigate(self, from_step: int, to_step: int):
        if from_step == 1 and self.email.endswith("@blocked.test"):
            return Message("That domain is not allowed", MessageVariant.ERROR)
        return None

    @wizard_completion_action("Finish now", available_from_step=2)
    def finish(self):
        self.result = f"finished by {self.email}"
        return None


@ui("/locked-wizard")
@title("Locked")
class LockedWizard(DraftWizard):
    def display(self):
        return dataclasses.replace(
            WizardDisplay.defaults(),
            save_draft=Toggle.disabled, save_and_close=Toggle.off, skip=Toggle.off,
        )


def _wizard_reset():
    DRAFTS.clear()
    RESUME_ON[0] = None


def test_a_draftable_wizard_offers_save_and_save_and_close():
    _wizard_reset()
    inc = run(DraftWizard, "/draft-wizard")
    assert button(inc, "saveDraft")["label"] == "Save"
    assert button(inc, "saveAndClose")["label"] == "Save and close"


def test_saving_a_draft_does_not_validate_and_keeps_the_step():
    _wizard_reset()
    inc = run(DraftWizard, "/draft-wizard", "saveDraft", {"__step": 1, "email": ""})
    assert DRAFTS == ["|step"]
    assert [m.text for m in inc.messages] == ["Draft saved"]
    assert not any(f.component is not None for f in inc.fragments)


def test_save_and_close_saves_then_leaves_the_flow():
    _wizard_reset()
    inc = run(DraftWizard, "/draft-wizard", "saveAndClose", {"__step": 1, "email": "ada@x.test"})
    assert DRAFTS == ["ada@x.test|step"]
    types = [c.type for c in inc.commands]
    assert "MarkAsClean" in types
    nav = next(c for c in inc.commands if c.type == "NavigateTo")
    assert nav.data == "/home"


def test_a_draftable_wizard_resumes_on_the_step_the_user_left():
    _wizard_reset()
    RESUME_ON[0] = 3
    inc = run(DraftWizard, "/draft-wizard")
    assert state_of(inc)["__step"] == 3


def test_skip_is_offered_only_on_skippable_steps_and_moves_on_without_requiring_anything():
    _wizard_reset()
    first = run(DraftWizard, "/draft-wizard")
    assert button(first, "skip") is None
    second = run(DraftWizard, "/draft-wizard", "next", {"__step": 1, "email": "ada@x.test"})
    assert state_of(second)["__step"] == 2
    assert button(second, "skip") is not None
    third = run(DraftWizard, "/draft-wizard", "skip", state_of(second))
    assert state_of(third)["__step"] == 3


def test_a_completion_action_is_offered_early_from_its_available_from_step():
    _wizard_reset()
    first = run(DraftWizard, "/draft-wizard")
    assert button(first, "finish") is None
    second = run(DraftWizard, "/draft-wizard", "next", {"__step": 1, "email": "ada@x.test"})
    # beside Next, not instead of it
    assert button(second, "finish")["label"] == "Finish now"
    assert button(second, "next") is not None
    finished = run(DraftWizard, "/draft-wizard", "finish", state_of(second))
    assert state_of(finished)["__step"] == 4
    assert state_of(finished)["result"] == "finished by ada@x.test"


def test_before_step_navigate_cancels_the_move_with_its_answer():
    _wizard_reset()
    inc = run(DraftWizard, "/draft-wizard", "next", {"__step": 1, "email": "eve@blocked.test"})
    assert [m.text for m in inc.messages] == ["That domain is not allowed"]
    # no re-render: the wizard stays where it was
    assert not any(f.component is not None for f in inc.fragments)


def test_display_toggles_hide_or_disable_the_affordances():
    _wizard_reset()
    first = run(LockedWizard, "/locked-wizard")
    assert button(first, "saveDraft")["disabled"] is True
    assert button(first, "saveAndClose") is None
    second = run(LockedWizard, "/locked-wizard", "next", {"__step": 1, "email": "ada@x.test"})
    assert button(second, "skip") is None
    # a disabled affordance cannot be forced from the client either
    run(LockedWizard, "/locked-wizard", "saveDraft", state_of(second))
    assert DRAFTS == []


# ── Crud.display(): New/Delete, Save and next, the drawer error banner ─────────────────────
class Room:
    id: str = ""
    name: str = ""

    def __init__(self, id: str = "", name: str = ""):
        self.id = id
        self.name = name


ROOMS: list[Room] = []


class _RoomStore:
    def fetch(self, search):
        return list(ROOMS)

    def save(self, entity):
        if entity.name and "boom" in entity.name:
            raise ValueError("Room names cannot explode")
        ROOMS[:] = [entity if r.id == entity.id else r for r in ROOMS]


@ui("/rooms-drawer")
@title("Rooms")
@edit_in_drawer
class RoomsCrud(_RoomStore, Crud[Room]):
    element_type = Room

    def display(self):
        return dataclasses.replace(CrudDisplay.defaults(), save_and_next=Toggle.on)


@ui("/rooms-locked")
@title("Rooms (locked)")
class LockedRoomsCrud(_RoomStore, Crud[Room]):
    element_type = Room

    def display(self):
        return CrudDisplay(create=Toggle.disabled, delete=Toggle.off)


def _rooms_reset():
    ROOMS[:] = [Room("r1", "Ocean view"), Room("r2", "Garden"), Room("r3", "Attic")]


def test_crud_display_defaults_mirror_java():
    d = CrudDisplay.defaults()
    assert (d.create, d.delete, d.save_and_next, d.error_banner) == (
        Toggle.on, Toggle.on, Toggle.off, Toggle.on)
    # unset (None) reads as the default, a plain string is coerced
    assert CrudDisplay(create=None, delete="disabled").create is Toggle.on  # type: ignore[arg-type]
    assert CrudDisplay(delete="disabled").delete is Toggle.disabled  # type: ignore[arg-type]
    assert Toggle.disabled.shown() and not Toggle.disabled.enabled()
    assert not Toggle.off.shown()


def test_create_disabled_and_delete_off_shape_the_listing_toolbar():
    _rooms_reset()
    inc = run(LockedRoomsCrud, "/rooms-locked")
    new = next(b for b in buttons(inc) if b.get("actionId") == "new")
    assert new["disabled"] is True
    assert not any(b.get("actionId") == "delete" for b in buttons(inc))
    # and the server refuses them too
    assert run(LockedRoomsCrud, "/rooms-locked", "new").fragments == []


def test_the_edit_drawer_offers_save_and_next():
    _rooms_reset()
    inc = run(RoomsCrud, "/rooms-drawer", "edit", parameters={"id": "r1"})
    drawer = metas(inc, "Drawer")
    assert drawer
    sn = next(b for b in walk(drawer[0]) if b.get("actionId") == "save-and-next")
    assert sn["label"] == "Save and next"


def test_save_and_next_saves_and_re_sends_the_drawer_for_the_next_row():
    _rooms_reset()
    inc = run(RoomsCrud, "/rooms-drawer/r1/edit", "save-and-next", {"id": "r1", "name": "Sea"})
    assert ROOMS[0].name == "Sea"
    drawers = metas(inc, "Drawer")
    assert len(drawers) == 1 and drawers[0]["id"] == "crud-edit-drawer"
    assert inc.fragments[0].action == "Add"
    # the next row's values
    assert "Garden" in inc.model_dump_json(by_alias=True)
    types = [c.type for c in inc.commands]
    assert "CloseModal" not in types
    assert "DispatchEvent" in types and "MarkAsClean" in types


def test_save_and_next_on_the_last_row_closes_the_drawer():
    _rooms_reset()
    inc = run(RoomsCrud, "/rooms-drawer/r3/edit", "save-and-next", {"id": "r3", "name": "Loft"})
    assert ROOMS[2].name == "Loft"
    assert metas(inc, "Drawer") == []
    assert "CloseModal" in [c.type for c in inc.commands]


def test_a_failed_save_in_the_drawer_shows_an_error_banner_keeping_what_was_typed():
    _rooms_reset()
    inc = run(RoomsCrud, "/rooms-drawer/r2/edit", "create", {"id": "r2", "name": "boom room"})
    drawers = metas(inc, "Drawer")
    assert len(drawers) == 1
    notice = next(d for d in walk(drawers[0]) if d.get("type") == "Notice")
    assert notice["text"] == "Room names cannot explode"
    assert notice["theme"] == "danger"
    assert "boom room" in inc.model_dump_json(by_alias=True)
    # and it is announced, since nothing takes focus
    announce = next(c for c in inc.commands if c.type == "Announce")
    assert announce.data.text == "Room names cannot explode"
    assert announce.data.assertive is True


# ── Page slots: GeneralOverview info, foldout summary, docked panels, pre-search, tones ────
@ui("/overview-with-info")
@title("Customers")
class CustomerOverview(GeneralOverview):
    def switcher_options(self):
        return [("c1", "Ada"), ("c2", "Grace")]

    def load(self, record_id):
        return record_id

    def overview(self, row):
        return fluent.Text(text=f"main-{row}")

    def info(self, row):
        return fluent.Text(text=f"info-{row}")


@ui("/overview-info-promoted")
@title("Customers")
class PromotedOverview(CustomerOverview):
    def display(self):
        return GeneralOverviewDisplay(promote_info_slot=Toggle.on)


def _slots(inc, grid_id: str) -> list[str]:
    grid = next(c for c in components_with_meta(inc, "ResponsiveGrid") if c.get("id") == grid_id)
    return [c.get("slot") for c in grid["children"]]


def test_the_info_slot_sits_beside_the_overview_on_the_one_responsive_grid():
    inc = run(CustomerOverview, "/overview-with-info")
    grid = next(c for c in components_with_meta(inc, "ResponsiveGrid")
                if c.get("id") == "general-overview")
    assert grid["metadata"]["gridTemplateAreas"] == '"main info"'
    assert grid["metadata"]["gridTemplateColumns"] == "1fr 20rem"
    assert _slots(inc, "general-overview") == ["main", "info"]


def test_promote_info_slot_puts_the_info_first_so_it_stacks_on_top():
    assert _slots(run(PromotedOverview, "/overview-info-promoted"), "general-overview") == [
        "info", "main"]


@ui("/foldout-with-summary")
@title("Booking")
class BookingFoldout(Foldout):
    overview: fluent.Component = fluent.Text(text="overview")
    payments: Annotated[fluent.Component, Panel(title="Payments", open=False)] = fluent.Text(
        text="payments")

    def panel_summary(self, panel_field_name):
        return fluent.Text(text="€120 due") if panel_field_name == "payments" else None


def test_a_folded_panel_carries_its_summary_as_a_slotted_child():
    inc = run(BookingFoldout, "/foldout-with-summary")
    foldout = components_with_meta(inc, "FoldoutLayout")[0]
    slots = [c.get("slot") for c in foldout["children"]]
    assert "summary-0" in slots and "panel-0" in slots
    summary = next(c for c in foldout["children"] if c.get("slot") == "summary-0")
    assert summary["metadata"]["text"] == "€120 due"


@ui("/data-management-docked")
@title("Shipments")
class Shipments(DataManagement):
    def grid_view(self):
        return fluent.Text(text="grid")

    def gantt_view(self):
        return fluent.Text(text="gantt")

    def end_panel(self):
        return DockedPanel(id="details", title="Details", content=fluent.Text(text="details-body"),
                           open=True)

    def bottom_panel(self):
        return DockedPanel(id="log", title="Log", content=fluent.Text(text="log-body"))


def test_an_open_end_panel_reflows_the_content_and_each_panel_gets_a_toggle():
    inc = run(Shipments, "/data-management-docked")
    grid = next(c for c in components_with_meta(inc, "ResponsiveGrid")
                if c.get("id") == "data-management-body")
    assert grid["metadata"]["gridTemplateColumns"] == "1fr 22rem"
    assert "details-body" in texts(inc) and "log-body" not in texts(inc)
    ids = [b.get("actionId") for b in buttons(inc)]
    assert "toggleEndPanel" in ids and "toggleBottomPanel" in ids


def test_toggling_a_panel_flips_it_in_place_and_round_trips():
    inc = run(Shipments, "/data-management-docked", "toggleBottomPanel")
    assert "log-body" in texts(inc) and "details-body" in texts(inc)
    # the open state rides in the state (no leading underscore) and survives the next round trip
    state = state_of(inc)
    assert state["bottomOpen"] is True
    again = run(Shipments, "/data-management-docked", "toggleEndPanel", state)
    assert "log-body" in texts(again) and "details-body" not in texts(again)


class Hit:
    id: str = ""
    name: str = ""

    def __init__(self, id: str = "", name: str = ""):
        self.id = id
        self.name = name


class NoFilters:
    pass


@ui("/smart-search-presearch")
@title("Find a guest")
class GuestSearch(SmartSearchPage[NoFilters, Hit]):
    def search(self, request, http=None):
        return ListingData.of([Hit("1", "Ada")])

    def pre_search_content(self):
        return fluent.Text(id="recent", text="Recently viewed: Ada, Grace")


@ui("/smart-search-plain")
@title("Find")
class PlainSearch(SmartSearchPage[NoFilters, Hit]):
    def search(self, request, http=None):
        return ListingData.of([])


def test_pre_search_content_travels_on_the_listing_until_the_first_search():
    crud = metas(run(GuestSearch, "/smart-search-presearch"), "Crud")[0]
    assert len(crud["preSearch"]) == 1
    assert crud["preSearch"][0]["metadata"]["text"] == "Recently viewed: Ada, Grace"
    # absent = null on the wire
    assert metas(run(PlainSearch, "/smart-search-plain"), "Crud")[0]["preSearch"] is None


@ui("/welcome-toned")
class TonedWelcome(Welcome):
    def hero_title(self):
        return "Hello"

    def hero_tone(self):
        return HeroTone.pine


@ui("/welcome-banner-toned")
@title("Inbox")
@welcome_banner(subtitle="3 new", tone=HeroTone.plum)
class TonedBannerPage:
    note: str = ""


@ui("/welcome-untoned")
class PlainWelcome(Welcome):
    def hero_title(self):
        return "Hello"


def test_the_hero_tone_travels_as_its_hue_name():
    assert metas(run(TonedWelcome, "/welcome-toned"), "HeroSection")[0]["tone"] == "pine"
    assert metas(run(TonedBannerPage, "/welcome-banner-toned"), "HeroSection")[0]["tone"] == "plum"
    # auto = the default look: nothing on the wire
    assert metas(run(PlainWelcome, "/welcome-untoned"), "HeroSection")[0]["tone"] is None


# ── Header & section affordances: record switcher, section actions, Announce ──────────────
@ui("/switcher-page")
@title("Customer")
class CustomerPage(RecordSwitcherSupplier):
    customer: str = "c1"
    name: str = "Ada"

    def switcher(self):
        return RecordSwitcher(
            options=[("c1", "Ada"), ("c2", "Grace")],
            value=self.customer,
            type=SwitcherType.object,
            label="Customer",
            searchable=True,
        )

    def switch_to(self, value):
        self.customer = value
        self.name = "Grace" if value == "c2" else "Ada"
        return self


def _page(inc) -> dict:
    return metas(inc, "Page")[0]


def test_the_switcher_travels_in_the_page_header():
    switcher = _page(run(CustomerPage, "/switcher-page"))["switcher"]
    assert [o["label"] for o in switcher["options"]] == ["Ada", "Grace"]
    assert switcher["value"] == "c1"
    assert switcher["type"] == "object"
    assert switcher["label"] == "Customer"
    assert switcher["searchable"] is True
    assert switcher["disabled"] is False
    assert switcher["actionId"] == RecordSwitcherSupplier.ACTION_ID == "_switchRecord"


def test_the_page_advertises_the_switch_action():
    inc = run(CustomerPage, "/switcher-page")
    assert any(a.id == "_switchRecord" for a in inc.fragments[0].component.actions)


def test_picking_an_entry_runs_switch_to_and_re_renders_in_place():
    inc = run(CustomerPage, "/switcher-page", "_switchRecord",
              {"customer": "c1", "name": "Ada"}, {"_record": "c2"})
    state = state_of(inc)
    assert state["customer"] == "c2" and state["name"] == "Grace"
    assert _page(inc)["switcher"]["value"] == "c2"


def test_a_page_without_a_switcher_leaves_it_null():
    assert _page(run(TonedBannerPage, "/welcome-banner-toned"))["switcher"] is None


@ui("/section-affordances")
@title("Booking")
class BookingPage:
    lead_guest: Annotated[str, Section("Guests", add_action="add_guest", edit_action="edit_guests")] = "Ada"
    last_payment: Annotated[str, Section("Payments", view_more_action="all_payments")] = "€120"

    def add_guest(self):
        return UICommand.announce("Guest added")

    def edit_guests(self):
        return None

    def all_payments(self):
        return Announce("All payments", assertive=True)


def test_section_affordances_become_buttons_dispatching_the_named_actions():
    inc = run(BookingPage, "/section-affordances")
    by_action = {b.get("actionId"): b for b in buttons(inc)}
    assert {"addGuest", "editGuests", "allPayments"} <= set(by_action)
    assert by_action["allPayments"]["label"] == "View more"
    assert by_action["addGuest"]["label"] == "Add"
    assert by_action["editGuests"]["label"] == "Edit"
    assert by_action["addGuest"]["buttonStyle"] == "tertiary"
    assert by_action["addGuest"]["size"] == "small"
    ids = {c.get("id") for c in components_with_meta(inc, "Button")}
    assert {"section-add-addGuest", "section-edit-editGuests",
            "section-view-more-allPayments"} <= ids
    # advertised, so the client sends them
    advertised = {a.id for a in inc.fragments[0].component.actions}
    assert {"addGuest", "editGuests", "allPayments"} <= advertised


def test_an_announce_command_travels_with_its_text_and_politeness():
    inc = run(BookingPage, "/section-affordances", "addGuest")
    announce = next(c for c in inc.commands if c.type == "Announce")
    assert dump(inc)["commands"][0]["data"] == {"text": "Guest added", "assertive": False}
    assert announce.target_component_id == "c1_app"
    flow = run(BookingPage, "/section-affordances", "allPayments")
    assert dump(flow)["commands"][0]["data"] == {"text": "All payments", "assertive": True}
