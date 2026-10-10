"""Wizards: steps, progress styles, navigation buttons (Java's Wizard orchestrator)."""

from __future__ import annotations

from typing import Any

from mateu_dtos import (
    ButtonMetadata,
    CardMetadata,
    ClientSideComponent,
    FormLayoutMetadata,
    HorizontalLayoutMetadata,
    ProgressBarMetadata,
    ProgressStepsMetadata,
    ServerSideComponent,
    StepRecord,
    TextMetadata,
    VerticalLayoutMetadata,
)
from mateu_uidl import Step

from ..naming import (
    camel_case,
    humanize,
)
from ..page_type_inference import page_type_of
from ..reflection import view_fields
from ..registry import type_name
from ..validation import client_validations
from ._base import MixinBase
from ._common import (
    _id,
    _row_cell,
)


class WizardMapperMixin(MixinBase):
    # ── Wizard ─────────────────────────────────────────────────────────────────
    def map_wizard(self, cls, instance, route: str, step: int) -> ServerSideComponent:
        step_fields = [(f, (f.marker(Step).step if f.has(Step) else 1)) for f in view_fields(cls)]
        total = max((s for _, s in step_fields), default=1)
        total = max(total, 1)
        current = min(max(step, 1), total)
        fields = [self.map_field(f, instance) for f, s in step_fields if s == current]

        title = getattr(cls, "__mateu_title__", humanize(cls.__name__))
        title_text = self.client(TextMetadata(text=title), None, [])
        # wizard_progress("steps"): connected step bullets instead of the progress bar
        # (mirrors Java's @WizardProgress(WizardProgressStyle.STEPS)).
        if getattr(cls, "__mateu_wizard_progress__", "bar") == "steps":
            progress = self.client(
                ProgressStepsMetadata(
                    steps=[
                        StepRecord(
                            id=f"step-{i}",
                            title=f"Step {i}",
                            status="done" if i < current else "current" if i == current else "upcoming",
                        )
                        for i in range(1, total + 1)
                    ]
                ),
                "fieldId",
                [],
            )
        else:
            progress = self.client(ProgressBarMetadata(value=current / total), "fieldId", [])
        card = self.client(
            CardMetadata(content=self.client(FormLayoutMetadata(), None, self.form_rows(fields))),
            "fieldId",
            [],
        )
        back = self.client(ButtonMetadata(label="Back", action_id="back", disabled=current == 1), None, [])
        nxt = self.client(
            ButtonMetadata(
                label="Finish" if current == total else "Next", action_id="next", button_style="Primary"
            ),
            None,
            [],
        )
        bar = self.client(HorizontalLayoutMetadata(), None, [back, nxt])
        if getattr(cls, "__mateu_wizard_progress__", "bar") == "rail":
            # wizard_progress("rail"): the Redwood Guided Process rail — the step form on the
            # left, a sticky right band with a big current|total counter over the vertical step
            # list (mirrors Java's WizardProgressStyle.RAIL).
            counter = ClientSideComponent(
                metadata=TextMetadata(text=f"{current} | {total}"),
                style="font-size: 2rem; font-weight: 300; margin: 0 0 1rem; letter-spacing: .1em;",
            )
            rail_steps = ClientSideComponent(
                metadata=ProgressStepsMetadata(
                    steps=[
                        StepRecord(
                            id=f"step-{i}",
                            title=f"Step {i}",
                            status="done" if i < current else "current" if i == current else "upcoming",
                        )
                        for i in range(1, total + 1)
                    ],
                    vertical=True,
                ),
                id="fieldId",
            )
            rail = ClientSideComponent(
                metadata=VerticalLayoutMetadata(),
                children=[counter, rail_steps],
                style=(
                    "flex: 0 0 15rem; align-self: flex-start; position: sticky; top: 1rem;"
                    " border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));"
                    " padding-left: 1.5rem;"
                ),
            )
            main = ClientSideComponent(
                metadata=VerticalLayoutMetadata(spacing=True),
                children=[title_text, card, bar],
                style="flex: 1; min-width: 0;",
            )
            layout = ClientSideComponent(
                metadata=HorizontalLayoutMetadata(),
                children=[main, rail],
                style="align-items: flex-start; gap: 2rem; width: 100%;",
            )
        else:
            layout = self.client(VerticalLayoutMetadata(spacing=True), None, [title_text, progress, card, bar])

        initial: dict[str, Any] = {"__step": current}
        for f, _ in step_fields:
            # Grid (list-of-rows) fields ride as row dicts and scalars keep their JSON type
            # (numbers/booleans as-is, dates ISO, enums by name — the grid-cell convention), so
            # every step field round-trips through the componentState (Java parity: the wizard
            # state is typed, not stringified).
            row_type = self.grid_row_type(f)
            if row_type is not None:
                initial[camel_case(f.name)] = [
                    {camel_case(c.name): _row_cell(getattr(item, c.name, None))
                     for c in view_fields(row_type)}
                    for item in (getattr(instance, f.name, None) or [])
                ]
            else:
                initial[camel_case(f.name)] = _row_cell(getattr(instance, f.name, None))
        return ServerSideComponent(
            id=_id(), server_side_type=type_name(cls), route=route, children=[layout],
            initial_data=initial, actions=[], triggers=[],
            page_width=getattr(cls, "__mateu_page_width__", None),
            page_type=page_type_of(cls),
            # only the CURRENT step's constraints: the others are not on screen (Java's
            # WizardStepInspector)
            validations=client_validations(
                self, cls, instance, fields=[f for f, s in step_fields if s == current]
            ),
        )
