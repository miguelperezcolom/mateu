"""Running a view action and mapping what it returns (Java's RunMethodActionRunner / FragmentListMapper / CommandMapper)."""

from __future__ import annotations

import inspect

from mateu_dtos import (
    Banner as BannerDto,
    Message as MessageDto,
    UICommand,
    UIFragment,
    UIIncrement,
)
from mateu_uidl import (
    components as fluent,
    FlowStep,
    Message,
    PageBanner,
)

from .. import action_guard
from ._base import MixinBase
from ._common import RunActionRq


class ActionHandlerMixin(MixinBase):
    def run_action(self, type_, instance, rq: RunActionRq, layout_override=None) -> UIIncrement:
        """Runs a view action. The action id comes from the wire, so it only reaches a method
        DECLARED as an action (see :mod:`mateu_core.action_guard`) and only when the caller
        passes its access gates; anything else is "Action not found" / 403."""
        fn = action_guard.resolve_action(
            type_, rq.action_id,
            lambda: action_guard.advertised_ids(self.mapper, type_, instance, layout_override),
        )
        if fn is None:
            return self.error(f"Action not found: {rq.action_id}")
        action_guard.ensure_may_invoke(self.mapper, type_, fn, rq.action_id)
        method = fn.__get__(instance, type_)
        result = method(*self._build_arguments(method, rq))
        if result is instance:
            # returning the view itself re-renders it in place with its new state (Java's
            # `return this`)
            return self.render(type_, instance, rq, layout_override)
        return self.map_result(result, rq)

    def _build_arguments(self, method, rq: RunActionRq) -> list:
        """Fills a method's parameters from the action request: a row-click's _clickedRow
        parameter is rebuilt into the parameter's annotated class (OnRowSelected() methods take
        the clicked row); anything unfillable is None (mirrors Java's
        RunMethodActionRunner.createParameters)."""
        params = [
            p for p in inspect.signature(method).parameters.values()
            if p.kind in (p.POSITIONAL_OR_KEYWORD, p.POSITIONAL_ONLY)
        ]
        if not params:
            return []
        clicked = (rq.parameters or {}).get("_clickedRow")
        args = []
        for p in params:
            ann = p.annotation
            # The action request itself can be injected (the port's analogue of Java's
            # HttpRequest injection) — e.g. an undoable toast's undo action reads its
            # undoParameters from request.parameters.
            if ann is RunActionRq or (ann is inspect.Parameter.empty and p.name == "request"):
                args.append(rq)
            elif isinstance(clicked, dict) and isinstance(ann, type) and ann is not str:
                row = ann()
                self.bind_state(row, clicked)
                args.append(row)
            else:
                args.append(None)
        return args

    def map_result(self, result, rq: RunActionRq | None = None) -> UIIncrement:
        if result is None:
            return UIIncrement.of()
        # An overlay (drawer/dialog) → an ADD fragment on the initiator, so it stacks on top of
        # the page instead of replacing it (mirrors Java's FragmentDataSerializer.isOverlay).
        if isinstance(result, (fluent.Drawer, fluent.Dialog)):
            return UIIncrement.of(
                fragments=[
                    UIFragment(
                        target_component_id=(rq.initiator_component_id if rq else None) or "ux_main",
                        component=self.mapper.map_component(result),
                        action="Add",
                    )
                ]
            )
        if isinstance(result, Message):
            return UIIncrement.of(
                messages=[
                    MessageDto(
                        variant=result.variant.value,
                        position="middle",
                        title=result.title,
                        text=result.text,
                        duration=result.duration,
                        undo_label=result.undo_label,
                        undo_action_id=result.undo_action_id,
                        undo_parameters=result.undo_parameters,
                    )
                ]
            )
        # Action-returned page banner(s): PageBanner or a list of them → UIIncrement.banners.
        if isinstance(result, PageBanner) or (
            isinstance(result, list) and result and all(isinstance(b, PageBanner) for b in result)
        ):
            banners = result if isinstance(result, list) else [result]
            return UIIncrement.of(
                banners=[
                    BannerDto(
                        theme=b.theme.value,
                        title=b.title,
                        description=b.description,
                        has_icon=True,
                        has_close_button=b.closeable,
                        timeout_seconds=b.timeout_seconds,
                    )
                    for b in banners
                ]
            )
        # A route string → navigate; a UICommand (dispatchEvent / closeModal) → pass through.
        if isinstance(result, str) and result.startswith("/"):
            return UIIncrement.of(
                commands=[UICommand(target_component_id=self.target(rq), type="NavigateTo", data=result)]
            )
        # Any other text is a message (mirrors Java): it leaves the screen as it was.
        if isinstance(result, str):
            return self.map_result(Message(result), rq)
        if isinstance(result, UICommand):
            # Retarget the "ux_main" placeholder at the initiator (the frontend drops commands
            # whose target matches no component id).
            if result.target_component_id == "ux_main" and rq is not None:
                result = result.model_copy(update={"target_component_id": self.target(rq)})
            return UIIncrement.of(commands=[result])
        # A flow Step (coherence-plan #3) is behavior: lower it to its wire command. v0 verbs are
        # 1:1 with a UICommand, so a returned Step (or a list of Steps/commands) becomes commands.
        if isinstance(result, FlowStep):
            return self.map_result(result.to_command(), rq)
        if isinstance(result, list) and result and all(isinstance(s, (FlowStep, UICommand)) for s in result):
            commands = []
            for s in result:
                cmd = s.to_command() if isinstance(s, FlowStep) else s
                if cmd.target_component_id == "ux_main" and rq is not None:
                    cmd = cmd.model_copy(update={"target_component_id": self.target(rq)})
                commands.append(cmd)
            return UIIncrement.of(commands=commands)
        return UIIncrement.of()
