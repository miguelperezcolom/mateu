"""edit_in_drawer (the Redwood "Create and Edit - Drawer" template) and the wizard RAIL progress
style, mirroring Java's EditInDrawerSyncTest / WizardProgressStyleSyncTest and the .NET
DrawerCrudAndRailTests."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core.sync_handler import SAVED_IN_DRAWER_EVENT  # noqa: E402
from mateu_ui.core import RunActionRq  # noqa: E402
from mateu_ui.core import MateuRegistry, SyncHandler  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
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
    # Java parity (EditInDrawerSyncTest): [closeModal, markAsClean] — the drawer form tracks edits
    assert [c.type for c in inc.commands] == ["CloseModal", "MarkAsClean"]
    assert inc.fragments == []


def test_the_drawer_form_is_dirty_tracked_like_the_routed_form():
    """Java parity (EditInDrawerSyncTest.theDrawerFormIsDirtyTrackedLikeTheRoutedForm): the
    drawer's form opts into the unsaved-changes guard, so closing it by hand asks first, and a
    save answers MarkAsClean before closing."""
    reset()
    for action_id, params in (("new", {}), ("view", {"id": "2"})):
        inc = handler().handle(
            RunActionRq(route="/drawer-contacts", actionId=action_id,
                        serverSideType=f"{__name__}.DrawerContacts", initiatorComponentId="ux_list",
                        parameters=params)
        )
        form = inc.fragments[0].component.metadata.content
        assert form.confirm_on_navigation_if_dirty is True, action_id
    saved = handler().handle(
        RunActionRq(route="/drawer-contacts/new", actionId="create",
                    serverSideType=f"{__name__}.DrawerContacts", initiatorComponentId="ux_list",
                    componentState={"name": "Katherine", "email": "katherine@nasa.gov"})
    )
    types = [c.type for c in saved.commands]
    assert "MarkAsClean" in types
    assert types.index("MarkAsClean") < types.index("CloseModal")


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


from mateu_ui.uidl import Required, wizard_completion_action  # noqa: E402


@ui("rail-enrol")
@title("Enrol")
@wizard_progress("rail")
class RailEnrol(Wizard):
    email: Annotated[str | None, Step(1)] = None
    plan: Annotated[str | None, Step(2)] = None
    outcome: Annotated[str | None, Step(3)] = None

    def step_title(self, step: int) -> str | None:
        return {1: "Email", 2: "Plan", 3: "Enrolled"}.get(step)

    @wizard_completion_action("Enrol")
    def enrol(self):
        return None


def test_the_result_step_is_no_bullet_but_its_title_travels():
    # mirrors Java's Wizard.stepItems / resultTitle: the result screen is not a step of the
    # process — on it every bullet is done, the counter counts the real steps, and its title
    # travels for the renderer that shows it as the process's last screen
    inc = handler().handle(
        RunActionRq(route="/rail-enrol", serverSideType=f"{__name__}.RailEnrol",
                    initiatorComponentId="ux_main", componentState={"__step": 3})
    )
    j = render(inc).replace(" ", "")
    assert '"resultTitle":"Enrolled"' in j
    assert '"title":"Step3"' not in j
    assert '"status":"current"' not in j
    assert "2|2" in j


class Note:
    id: str = ""
    text: Annotated[str, Required()] = ""


@ui("drawer-notes")
@title("Notes")
@edit_in_drawer
class DrawerNotes(Crud[Note]):
    def fetch(self, search):
        return []

    def get(self, id_):
        return None

    def save(self, entity):
        pass


def test_the_drawer_form_validates_in_the_browser_like_the_routed_form():
    """Java's EditInDrawerSyncTest.theDrawerFormValidatesInTheBrowserLikeTheRoutedForm: the drawer's
    form is a server-side component with the entity's validations and a validated create."""
    inc = handler().handle(
        RunActionRq(route="/drawer-notes", actionId="new",
                    serverSideType=f"{__name__}.DrawerNotes", initiatorComponentId="ux_list")
    )
    forms = []

    def walk(n):
        if isinstance(n, dict):
            if n.get("type") == "ServerSide" and n.get("validations"):
                forms.append(n)
            for v in n.values():
                walk(v)
        elif isinstance(n, list):
            for v in n:
                walk(v)

    walk(inc.model_dump(by_alias=True, mode="json"))
    assert forms, "the drawer's form is a component of its own, with validations"
    assert any(v["fieldId"] == "text" for v in forms[0]["validations"])
    assert any(a["id"] == "create" and a["validationRequired"] for a in forms[0]["actions"])
