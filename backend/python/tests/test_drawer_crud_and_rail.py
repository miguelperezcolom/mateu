"""edit_in_drawer (the Redwood "Create and Edit - Drawer" template) and the wizard RAIL progress
style, mirroring Java's EditInDrawerSyncTest / WizardProgressStyleSyncTest and the .NET
DrawerCrudAndRailTests."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core.sync_handler import SAVED_IN_DRAWER_EVENT  # noqa: E402
from mateu_core import RunActionRq  # noqa: E402
from mateu_core import MateuRegistry, SyncHandler  # noqa: E402
from mateu_uidl import (  # noqa: E402
    Crud,
    Message,
    Step,
    Wizard,
    edit_in_drawer,
    title,
    ui,
    wizard_progress,
)


class Contact:
    id: str = ""
    name: str = ""
    email: str = ""

    def __init__(self, id: str = "", name: str = "", email: str = ""):
        self.id = id
        self.name = name
        self.email = email


STORED: list[Contact] = []


@ui("drawer-contacts")
@title("Contacts")
@edit_in_drawer
class DrawerContacts(Crud[Contact]):
    element_type = Contact

    def fetch(self, search):
        return STORED

    def save(self, entity):
        if not entity.id:
            entity.id = str(len(STORED) + 1)
        STORED[:] = [c for c in STORED if c.id != entity.id]
        STORED.append(entity)


@ui("rail-signup")
@title("Signup")
@wizard_progress("rail")
class RailSignup(Wizard):
    email: Annotated[str | None, Step(1)] = None
    plan: Annotated[str | None, Step(2)] = None

    def complete(self) -> Message:
        return Message("done")


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def render(inc) -> str:
    return inc.model_dump_json(by_alias=True)


def reset():
    STORED[:] = [Contact("1", "Ada", "ada@computing.org"), Contact("2", "Grace", "grace@navy.mil")]


def test_new_opens_the_creation_form_in_a_drawer_over_the_listing():
    reset()
    inc = handler().handle(
        RunActionRq(route="/drawer-contacts", actionId="new",
                    serverSideType=f"{__name__}.DrawerContacts", initiatorComponentId="ux_list")
    )
    assert len(inc.fragments) == 1
    assert inc.fragments[0].action == "Add"
    assert '"type":"Drawer"' in render(inc).replace(" ", "")
    assert not any(c.type == "NavigateTo" for c in inc.commands)


def test_row_view_opens_the_edit_drawer_with_the_entity_loaded():
    reset()
    inc = handler().handle(
        RunActionRq(route="/drawer-contacts", actionId="view",
                    serverSideType=f"{__name__}.DrawerContacts", initiatorComponentId="ux_list",
                    parameters={"id": "2"})
    )
    j = render(inc)
    assert '"type":"Drawer"' in j.replace(" ", "")
    assert "Grace" in j


def test_create_persists_closes_the_drawer_emitting_the_saved_event_and_reruns_the_search():
    reset()
    before = len(STORED)
    inc = handler().handle(
        RunActionRq(route="/drawer-contacts/new", actionId="create",
                    serverSideType=f"{__name__}.DrawerContacts", initiatorComponentId="ux_list",
                    componentState={"name": "Katherine", "email": "katherine@nasa.gov"})
    )
    assert len(STORED) == before + 1
    types = [c.type for c in inc.commands]
    assert "NavigateTo" not in types
    assert "CloseModal" in types
    assert "RunAction" in types
    assert SAVED_IN_DRAWER_EVENT in render(inc)
    close = next(c for c in inc.commands if c.type == "CloseModal")
    assert close.target_component_id == "ux_list"
    assert inc.messages[0].text == "Saved"


def test_cancel_just_closes_the_drawer():
    reset()
    inc = handler().handle(
        RunActionRq(route="/drawer-contacts", actionId="cancel-new",
                    serverSideType=f"{__name__}.DrawerContacts", initiatorComponentId="ux_list")
    )
    assert [c.type for c in inc.commands] == ["CloseModal"]
    assert inc.fragments == []


def test_rail_wizard_emits_the_vertical_step_list_and_the_counter():
    inc = handler().handle(
        RunActionRq(route="/rail-signup", serverSideType=f"{__name__}.RailSignup",
                    initiatorComponentId="ux_main")
    )
    j = render(inc).replace(" ", "")
    assert '"type":"ProgressSteps"' in j
    assert '"vertical":true' in j
    assert "1|2" in j
    assert '"type":"ProgressBar"' not in j
