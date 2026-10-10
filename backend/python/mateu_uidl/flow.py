"""Flow steps: navigation / events / overlays as data, each compiled to an existing UICommand."""

from __future__ import annotations

from dataclasses import dataclass


# ── Flow steps (coherence-plan #3, Phase 2) ──────────────────────────────────
# The flow-step model: an action is a confirmable sequence of steps, and every v0 verb lowers 1:1
# to an existing UICommand, so a flow built from these runs on the CURRENT wire with no renderer
# change (mirrors io.mateu.uidl.fluent.Step in Java). The UICommand is built lazily to avoid a
# module-level dependency on mateu_dtos.
@dataclass(frozen=True)
class FlowStep:
    """Base class for the v0 flow verbs. Subclasses implement ``to_command()``."""

    def to_command(self):
        raise NotImplementedError


@dataclass(frozen=True)
class Navigate(FlowStep):
    """Navigate to a route."""

    route: str

    def to_command(self):
        from mateu_dtos import UICommand

        return UICommand(target_component_id="ux_main", type="NavigateTo", data=self.route)


@dataclass(frozen=True)
class Emit(FlowStep):
    """Emit a named event on the app event bus (refinement R1), optionally with a payload."""

    event: str
    payload: object | None = None

    def to_command(self):
        from mateu_dtos import UICommand

        return UICommand.dispatch_event(self.event, self.payload)


@dataclass(frozen=True)
class CloseOverlay(FlowStep):
    """Close the top overlay, optionally emitting a named result event as it closes."""

    event: str | None = None

    def to_command(self):
        from mateu_dtos import UICommand

        return UICommand.close_modal(self.event)


@dataclass(frozen=True)
class RunAction(FlowStep):
    """Run a server action by id (the 'call the server' verb — needs a backend)."""

    action_id: str

    def to_command(self):
        from mateu_dtos import UICommand

        return UICommand(target_component_id="ux_main", type="RunAction", data={"actionId": self.action_id})


@dataclass(frozen=True)
class MarkClean(FlowStep):
    """Mark the current view clean (e.g. after a save) — suppresses the unsaved-changes guard."""

    def to_command(self):
        from mateu_dtos import UICommand

        return UICommand(target_component_id="ux_main", type="MarkAsClean", data=None)


@dataclass(frozen=True)
class MarkDirty(FlowStep):
    """Mark the current view dirty — arms the unsaved-changes navigation guard."""

    def to_command(self):
        from mateu_dtos import UICommand

        return UICommand(target_component_id="ux_main", type="MarkAsDirty", data=None)


@dataclass(frozen=True)
class Announce(FlowStep):
    """Tell assistive technology what happened (the Redwood ``announcement`` slot) through the
    page's polite live region — or the ASSERTIVE one when ``assertive`` (interrupts: errors only).
    Nothing is drawn. Lowers to the ``Announce`` command (Java's ``UICommand.announce`` /
    ``announceAssertive``)."""

    text: str
    assertive: bool = False

    def to_command(self):
        from mateu_dtos import UICommand

        return (
            UICommand.announce_assertive(self.text)
            if self.assertive
            else UICommand.announce(self.text)
        )
