"""Wizard navigation: next/back/go-to-step and the completion action (Java's WizardActionDispatcher)."""

from __future__ import annotations

from mateu_dtos import UICommand, UIIncrement
from mateu_uidl import Draftable, Message, Step, Wizard

from ..reflection import view_fields
from ..registry import normalize
from .. import action_guard
from ..mapper.wizard import (
    completion_method,
    completion_offered_early,
    has_next_step,
)
from ..naming import camel_case
from ._base import MixinBase
from ._common import RunActionRq


class WizardHandlerMixin(MixinBase):
    # ── Wizard ─────────────────────────────────────────────────────────────────
    def handle_wizard(self, type_, rq: RunActionRq) -> UIIncrement:
        wizard = type_()
        self.bind_state(wizard, rq.component_state)
        step = self.step_of(rq)
        steps = [(f.marker(Step).step if f.has(Step) else 1) for f in view_fields(type_)]
        total = max(steps, default=1)
        route = "/" + normalize(getattr(type_, "__mateu_ui__", ""))

        # A Draftable wizard opened afresh (no position in the state yet) resumes on the step the
        # user left (the Redwood guided-process resumeStepId).
        if isinstance(wizard, Draftable) and not rq.action_id and "__step" not in (
            rq.component_state or {}
        ):
            resume = wizard.resume_step()
            last = total - 1 if completion_method(type_) is not None else total
            if isinstance(resume, int) and not isinstance(resume, bool) and 1 <= resume <= last:
                step = resume

        list_action = self.list_field_action(type_, rq.action_id)
        if list_action is not None:
            # a grid field of the step: its row editing never leaves the step
            return self.handle_list_field_action(type_, *list_action, rq)
        completion = completion_method(type_)
        if completion is not None and rq.action_id == camel_case(completion[0]):
            # The completion action (from the penultimate step, or earlier from its
            # available_from_step): run it over the bound state of every step, then show the
            # read-only result step (Java's WizardActionDispatcher).
            if step != total - 1 and not completion_offered_early(type_, step, total):
                return self.error("The wizard cannot complete from this step")
            veto = wizard.before_step_navigate(step, total)
            if veto is not None:
                return self.map_result(veto, rq)
            fn = getattr(wizard, completion[0])
            action_guard.ensure_may_invoke(self.mapper, type_, fn, rq.action_id)
            outcome = fn()
            response = self.fragment_response(
                self.title(type_), self.mapper.map_wizard(type_, wizard, route, total), rq
            )
            if outcome is not None:
                extra = self.map_result(outcome, rq)
                response = response.model_copy(
                    update={
                        "messages": list(response.messages) + list(extra.messages),
                        "commands": list(response.commands) + list(extra.commands),
                    }
                )
            return response
        if completion is not None and rq.action_id == "next" and step >= total - 1:
            # a completion wizard never reaches its result step by Next: only the action leads there
            return self.fragment_response(self.title(type_), self.mapper.map_wizard(type_, wizard, route, step), rq)
        if rq.action_id == "skip":
            # the user leaves this step for later: keep what was typed (already bound), require
            # nothing — only on a skippable step whose Skip is enabled (enforced server-side too)
            if (
                wizard.step_skippable(step)
                and wizard.display().skip.enabled()
                and has_next_step(type_, step, total)
            ):
                veto = wizard.before_step_navigate(step, step + 1)
                if veto is not None:
                    return self.map_result(veto, rq)
                wizard.on_next(step, step + 1)
                step += 1
        elif rq.action_id in ("saveDraft", "saveAndClose"):
            response = self._save_draft(wizard, rq)
            if response is not None:
                return response
        elif rq.action_id == "back":
            if step > 1:
                veto = wizard.before_step_navigate(step, step - 1)
                if veto is not None:
                    return self.map_result(veto, rq)
            step = max(1, step - 1)
        elif rq.action_id == "next" and step >= total:
            return self.map_result(wizard.complete())
        elif rq.action_id == "next":
            veto = wizard.before_step_navigate(step, step + 1)
            if veto is not None:
                # cancelled: the answer is the response, the wizard stays where it was
                return self.map_result(veto, rq)
            wizard.on_next(step, step + 1)
            step += 1
        elif rq.action_id == "goToStep":
            # The drawer step pager's jump-to-step: `_stepId` = the bullet id "step-N"; jump only
            # BACKWARD (to an already-visited step) so we never skip a step's validation forward.
            target = self._go_to_step_target(rq)
            if target is not None and 1 <= target < step:
                veto = wizard.before_step_navigate(step, target)
                if veto is not None:
                    return self.map_result(veto, rq)
                step = target
        return self.fragment_response(self.title(type_), self.mapper.map_wizard(type_, wizard, route, step), rq)

    def _save_draft(self, wizard, rq: RunActionRq) -> UIIncrement | None:
        """Save / Save and close of a Draftable wizard: the state is already bound and is NEVER
        validated (a draft may be incomplete). None = not available (not Draftable, or the
        affordance is off/disabled) — the wizard just re-renders where it is."""
        if not isinstance(wizard, Draftable) or not isinstance(wizard, Wizard):
            return None
        display = wizard.display()
        toggle = display.save_draft if rq.action_id == "saveDraft" else display.save_and_close
        if not toggle.enabled():
            return None
        saved = wizard.save_draft()
        if rq.action_id == "saveDraft":
            return self.map_result(
                saved if saved is not None else Message(self.mapper.T("Draft saved")), rq
            )
        close = wizard.close_draft()
        target = self.target(rq)
        return self.map_result(
            [
                saved if isinstance(saved, Message) else Message(self.mapper.T("Draft saved")),
                UICommand(target_component_id=target, type="MarkAsClean", data=None),
                close
                if isinstance(close, UICommand)
                else UICommand(
                    target_component_id=target, type="NavigateTo",
                    data=str(close) if close is not None else "/",
                ),
            ],
            rq,
        )

    @staticmethod
    def _go_to_step_target(rq: RunActionRq) -> int | None:
        params = rq.parameters or {}
        sid = params.get("_stepId") if isinstance(params, dict) else None
        if isinstance(sid, str) and sid.startswith("step-"):
            try:
                return int(sid[5:])
            except ValueError:
                return None
        return None

    @staticmethod
    def step_of(rq: RunActionRq) -> int:
        v = rq.component_state.get("__step")
        return int(v) if isinstance(v, (int, float)) and not isinstance(v, bool) else 1
