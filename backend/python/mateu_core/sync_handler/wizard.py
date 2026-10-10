"""Wizard navigation: next/back/go-to-step and the completion action (Java's WizardActionDispatcher)."""

from __future__ import annotations

from mateu_dtos import UIIncrement
from mateu_uidl import Step

from ..reflection import view_fields
from ..registry import normalize
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

        list_action = self.list_field_action(type_, rq.action_id)
        if list_action is not None:
            # a grid field of the step: its row editing never leaves the step
            return self.handle_list_field_action(type_, *list_action, rq)
        if rq.action_id == "back":
            step = max(1, step - 1)
        elif rq.action_id == "next" and step >= total:
            return self.map_result(wizard.complete())
        elif rq.action_id == "next":
            wizard.on_next(step, step + 1)
            step += 1
        elif rq.action_id == "goToStep":
            # The drawer step pager's jump-to-step: `_stepId` = the bullet id "step-N"; jump only
            # BACKWARD (to an already-visited step) so we never skip a step's validation forward.
            target = self._go_to_step_target(rq)
            if target is not None and 1 <= target < step:
                step = target
        return self.fragment_response(self.title(type_), self.mapper.map_wizard(type_, wizard, route, step), rq)

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
