"""Guided Process Drawer (Redwood template): a multi-step Wizard served inside a Drawer via
EmbeddedView, which embeds the wizard as an INDEPENDENT server-side component so its step
navigation routes back to itself (and doesn't bubble to the host). Mirrors Java's
GuidedProcessDrawerSyncTest."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import RunActionRq  # noqa: E402
from mateu_core import MateuRegistry, SyncHandler  # noqa: E402
from mateu_dtos import ServerSideComponent  # noqa: E402
from mateu_uidl import PlainText, Step, Wizard, title, ui  # noqa: E402
from mateu_uidl import components as fluent  # noqa: E402


@ui("gpd-wizard")
@title("Sign up")
class SignupWizard(Wizard):
    name: Annotated[str | None, Step(1)] = "Ada"
    age: Annotated[int | None, Step(2)] = 30
    message: Annotated[str | None, Step(3), PlainText()] = "pending"


@ui("gpd-host")
@title("Host")
class Host:
    x: str = "hi"

    def open_wizard(self) -> fluent.Drawer:
        return fluent.Drawer(
            id="gpd",
            header_title="Sign up",
            size=fluent.DrawerSize.m,
            content=fluent.EmbeddedView(SignupWizard()),
        )


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


# ── helpers ────────────────────────────────────────────────────────────────────
def walk(node, out):
    if isinstance(node, (ServerSideComponent,)):
        out.append(node)
    children = getattr(node, "children", None) or []
    for child in children:
        walk(child, out)
    meta = getattr(node, "metadata", None)
    if meta is not None:
        for attr in ("content", "header", "footer"):
            sub = getattr(meta, attr, None)
            if sub is not None:
                walk(sub, out)
        for sub in getattr(meta, "children", None) or []:
            walk(sub, out)


def _all_json(inc) -> str:
    return inc.model_dump_json(by_alias=True)


def test_the_wizard_is_embedded_as_an_independent_server_side_component_in_the_drawer():
    inc = handler().handle(
        RunActionRq(route="/gpd-host", actionId="openWizard",
                    serverSideType=f"{__name__}.Host", initiatorComponentId="cmp-1",
                    componentState={"x": "hi"})
    )
    # the drawer fragment
    drawer_meta = None
    for f in inc.fragments:
        meta = getattr(f.component, "metadata", None)
        if meta is not None and getattr(meta, "type", None) == "Drawer":
            drawer_meta = meta
            break
    assert drawer_meta is not None, "drawer fragment"

    # the drawer's content is the wizard embedded as an INDEPENDENT ServerSideComponent, routed to
    # its own type (so its step actions dispatch back to the wizard, not the host)
    embedded = drawer_meta.content
    assert isinstance(embedded, ServerSideComponent)
    assert embedded.server_side_type == f"{__name__}.SignupWizard"

    # and it carries its first step's field + the "next" button
    j = _all_json(inc).replace(" ", "")
    assert '"fieldId":"name"' in j
    assert '"actionId":"next"' in j


def test_next_advances_the_embedded_wizard_to_its_second_step():
    # dispatch "next" against the wizard's own serverSideType (as the embedded component would),
    # carrying the first step's state — it advances to the age step.
    inc = handler().handle(
        RunActionRq(route="/gpd-wizard", actionId="next",
                    serverSideType=f"{__name__}.SignupWizard", initiatorComponentId="cmp-1",
                    componentState={"name": "Ada"})
    )
    j = _all_json(inc).replace(" ", "")
    assert '"fieldId":"age"' in j
