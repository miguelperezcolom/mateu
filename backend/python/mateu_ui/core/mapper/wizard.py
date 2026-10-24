"""Wizards: steps, progress styles, navigation buttons (Java's Wizard orchestrator)."""

from __future__ import annotations

from typing import Any

from mateu_ui.dtos import (
    Action,
    ButtonMetadata,
    ClientSideComponent,
    DivMetadata,
    HorizontalLayoutMetadata,
    ProgressBarMetadata,
    ProgressStepsMetadata,
    ServerSideComponent,
    StepRecord,
    TextMetadata,
    VerticalLayoutMetadata,
)
from mateu_ui.uidl import Draftable, Step

from .. import form_columns_inference, labels_aside_inference
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
    _field_value,
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
        # The wizard's heading, progress, step form and buttons are laid out exactly as Java's
        # Wizard.component() (pinned by the conformance corpus, case "wizard").
        title_text = ClientSideComponent(
            metadata=TextMetadata(text=title, container="h2"), style="margin: 0;"
        )

        def step_title(i: int) -> str | None:
            return instance.step_title(i) if hasattr(instance, "step_title") else None

        # The progress shows the steps of the process; the result screen is none of them (Java's
        # Wizard.stepItems): with a completion, the last step is left out, every bullet is done
        # on it, and its title travels as result_title — a renderer that shows the finished
        # process as one more screen names it instead of inventing one.
        has_result = completion is not None and total > 1
        plain_total = total - 1 if has_result else total
        result_title = (step_title(total) or f"Step {total}") if has_result else None

        def bullet_status(i: int) -> str:
            if result_step or i < current:
                return "done"
            return "current" if i == current else "upcoming"
        # wizard_progress("steps"): connected step bullets instead of the progress bar
        # (mirrors Java's @WizardProgress(WizardProgressStyle.STEPS)).
        if getattr(cls, "__mateu_wizard_progress__", "bar") == "steps":
            progress = self.client(
                ProgressStepsMetadata(
                    steps=[
                        StepRecord(
                            id=f"step-{i}",
                            title=step_title(i) or f"Step {i}",
                            status=bullet_status(i),
                        )
                        for i in range(1, plain_total + 1)
                    ],
                    result_title=result_title,
                ),
                "fieldId",
                [],
            ).model_copy(update={"style": "width: 100%;"})
        else:
            # Java's ProgressBar: value = the steps already done (0 on the first one), max = every
            # step, full on the result step; the current step's title as its text.
            progress = ClientSideComponent(
                metadata=ProgressBarMetadata(
                    value=total if result_step else current - 1, max=total, text=step_title(current)
                ),
                style="width: 100%;",
            )
        # The current step's form: the regular section card of a form (Java's stepForm), under a
        # spacer Div.
        current_fields = [f for f, s in step_fields if s == current]
        # each step is its own form: its column count is inferred from the STEP's fields
        max_columns = form_columns_inference.form_columns(cls, current_fields)
        card = ClientSideComponent(
            metadata=DivMetadata(),
            children=[self.section_card(
                None, fields, labels_aside=labels_aside_inference.labels_aside(
                    current_fields, max_columns, cls),
                max_columns=max_columns,
            )],
            style="width: 100%; margin-top: 1rem;",
        )
        # no Back on the first step: there is nowhere to go back to (Java's WizardButtonBuilder)
        # every wizard button is colour "normal" on the wire, like Java's (ButtonMapper's default)
        back = (
            self.client(ButtonMetadata(label="Back", action_id="back", color="normal"), None, [])
            if current > 1 else None
        )
        if completion is not None and current == total - 1:
            name, label = completion
            nxt = self.client(
                ButtonMetadata(
                    label=self.T(label), action_id=camel_case(name), button_style="primary",
                    color="normal",
                ),
                None,
                [],
            )
        else:
            nxt = self.client(
                ButtonMetadata(
                    label="Finish" if current == total else "Next", action_id="next",
                    button_style="primary", color="normal",
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
            HorizontalLayoutMetadata(justification="END"), None,
            [] if result_step else [b for b in (back, *extras, nxt) if b is not None],
        )
        if getattr(cls, "__mateu_wizard_progress__", "bar") == "rail":
            # wizard_progress("rail"): the Redwood Guided Process rail — the step form on the
            # left, a sticky right band with a big current|total counter over the vertical step
            # list (mirrors Java's WizardProgressStyle.RAIL).
            counter = ClientSideComponent(
                metadata=TextMetadata(
                    text=f"{plain_total if result_step else current} | {plain_total}"
                ),
                style="font-size: 2rem; font-weight: 300; margin: 0 0 1rem; letter-spacing: .1em;",
            )
            rail_steps = ClientSideComponent(
                metadata=ProgressStepsMetadata(
                    steps=[
                        StepRecord(
                            id=f"step-{i}",
                            title=f"Step {i}",
                            status=bullet_status(i),
                        )
                        for i in range(1, plain_total + 1)
                    ],
                    vertical=True,
                    result_title=result_title,
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
                metadata=VerticalLayoutMetadata(),
                children=[ClientSideComponent(
                    metadata=VerticalLayoutMetadata(), children=[title_text, card, bar],
                    style="width: 100%",
                )],
                style="flex: 1; min-width: 0;",
            )
            layout = ClientSideComponent(
                metadata=HorizontalLayoutMetadata(),
                children=[main, rail],
                style="align-items: flex-start; gap: 2rem; width: 100%;",
            )
        else:
            layout = ClientSideComponent(
                metadata=VerticalLayoutMetadata(), children=[title_text, progress, card, bar],
                style="width: 100%",
            )

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
                initial[camel_case(f.name)] = _field_value(getattr(instance, f.name, None))
        return ServerSideComponent(
            id=_id(), server_side_type=type_name(cls), route=route, children=[layout],
            # a wizard is a component tree in Java: the tree envelope's default container style
            style="max-width:900px;margin: auto;",
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
                # Back leaves the step as it is: no validation. Java advertises a catch-all that
                # claims it; unadvertised, Back did nothing in the web client.
                *([] if result_step else [Action(id="back", validation_required=False)]),
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
