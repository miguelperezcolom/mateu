"""Wizards: steps, progress styles, navigation buttons (Java's Wizard orchestrator)."""

from __future__ import annotations

from typing import Any

from mateu_dtos import (
    Action,
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
from mateu_uidl import Draftable, Step

from ..naming import (
    camel_case,
    humanize,
)
from ..page_type_inference import page_type_of
from ..reflection import methods_with
from ..reflection import view_fields
from ..registry import type_name
from ..validation import client_validations
from ._base import MixinBase
from ._common import (
    _id,
    _row_cell,
)



def completion_method(cls) -> "tuple[str, str] | None":
    """``(method name, button label)`` of the wizard's ``@wizard_completion_action``, or None."""
    for name, fn in methods_with(cls, "__mateu_wizard_completion__"):
        return name, getattr(fn, "__mateu_wizard_completion__")
    return None


def completion_available_from(cls) -> int | None:
    """The step (1-based) from which the ``@wizard_completion_action`` is offered EARLY, beside
    Next (its ``available_from_step``), or None (only on the penultimate step)."""
    for _name, fn in methods_with(cls, "__mateu_wizard_completion__"):
        value = getattr(fn, "__mateu_wizard_completion_from__", None)
        return value if isinstance(value, int) and not isinstance(value, bool) else None
    return None


def completion_offered_early(cls, current: int, total: int) -> bool:
    """Whether the completion action is offered beside Next on step ``current`` (from its
    ``available_from_step`` on, while a regular next step still exists)."""
    if completion_method(cls) is None:
        return False
    start = completion_available_from(cls)
    return start is not None and start <= current < total - 1


def has_next_step(cls, current: int, total: int) -> bool:
    """Whether Next/Skip lead to another (non-result) step from ``current``."""
    return current < (total - 1 if completion_method(cls) is not None else total)


class WizardMapperMixin(MixinBase):
    def _wizard_extras(self, cls, instance, current: int, total: int) -> list:
        display = instance.display()
        out = []
        if (
            has_next_step(cls, current, total)
            and instance.step_skippable(current)
            and display.skip.shown()
        ):
            out.append(self.client(
                ButtonMetadata(label=self.T("Skip"), action_id="skip", button_style="tertiary",
                               disabled=not display.skip.enabled()),
                "skip", [],
            ))
        if isinstance(instance, Draftable):
            if display.save_draft.shown():
                out.append(self.client(
                    ButtonMetadata(label=self.T("Save"), action_id="saveDraft",
                                   disabled=not display.save_draft.enabled()),
                    "saveDraft", [],
                ))
            if display.save_and_close.shown():
                out.append(self.client(
                    ButtonMetadata(label=self.T("Save and close"), action_id="saveAndClose",
                                   disabled=not display.save_and_close.enabled()),
                    "saveAndClose", [],
                ))
        if completion_offered_early(cls, current, total):
            name, label = completion_method(cls)  # type: ignore[misc]
            out.append(self.client(
                ButtonMetadata(label=self.T(label), action_id=camel_case(name)), None, [],
            ))
        return out

    # ── Wizard ─────────────────────────────────────────────────────────────────
    def map_wizard(self, cls, instance, route: str, step: int) -> ServerSideComponent:
        step_fields = [(f, (f.marker(Step).step if f.has(Step) else 1)) for f in view_fields(cls)]
        total = max((s for _, s in step_fields), default=1)
        total = max(total, 1)
        current = min(max(step, 1), total)
        # A @wizard_completion_action wizard: the last step is the read-only RESULT screen, the
        # penultimate one runs the completion (Java's WizardButtonBuilder / result step).
        completion = completion_method(cls)
        result_step = completion is not None and current == total and total > 1
        fields = [
            self.map_field(f, instance, read_only=result_step) for f, s in step_fields if s == current
        ]

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
        if completion is not None and current == total - 1:
            name, label = completion
            nxt = self.client(
                ButtonMetadata(label=self.T(label), action_id=camel_case(name), button_style="primary"),
                None,
                [],
            )
        else:
            nxt = self.client(
                ButtonMetadata(
                    label="Finish" if current == total else "Next", action_id="next", button_style="primary"
                ),
                None,
                [],
            )
        # The Redwood guided-process affordances, between Back and the way forward (Java's
        # WizardButtonBuilder order): Skip on a skippable step, Save / Save and close on a
        # Draftable wizard, the completion action offered early — each honouring display().
        extras = [] if result_step else self._wizard_extras(cls, instance, current, total)
        # the result step has no navigation at all
        bar = self.client(
            HorizontalLayoutMetadata(), None, [] if result_step else [back, *extras, nxt]
        )
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
            initial_data=initial,
            # the current step's field actions (a grid's row editing, lookups…): the renderer only
            # sends what the component advertises
            actions=[
                # Next validates the step on the client first (Java's Wizard.actions)
                *([] if result_step else [Action(id="next", validation_required=True)]),
                *(
                    [Action(id=camel_case(completion[0]), validation_required=True)]
                    if completion is not None
                    and (current == total - 1 or completion_offered_early(cls, current, total))
                    else []
                ),
                # skipping and saving a draft deliberately leave the step incomplete: no client
                # validation (Java's Wizard.actions)
                *([] if result_step else [Action(id="skip", validation_required=False)]),
                *(
                    [
                        Action(id="saveDraft", validation_required=False),
                        Action(id="saveAndClose", validation_required=False),
                    ]
                    if isinstance(instance, Draftable) and not result_step
                    else []
                ),
                *self.field_actions(cls, [f for f, s in step_fields if s == current]),
            ],
            triggers=[],
            page_width=getattr(cls, "__mateu_page_width__", None),
            page_type=page_type_of(cls),
            # only the CURRENT step's constraints: the others are not on screen (Java's
            # WizardStepInspector)
            validations=client_validations(
                self, cls, instance, fields=[f for f, s in step_fields if s == current]
            ),
        )
