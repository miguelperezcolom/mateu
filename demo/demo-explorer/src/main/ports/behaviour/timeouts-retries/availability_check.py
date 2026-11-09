# The Python twin (mateu-ui): the knobs are their own decorator, @action_options, composed with
# @button (the port has no @action equivalent carrying them).
import time

from mateu_ui.uidl import Message, action_options, button, title, ui

CALLS = {"n": 0}


@ui("availability")
@title("Availability")
class AvailabilityCheck:
    @button("Slow check")
    @action_options(timeout_millis=1500)
    def slow_check(self) -> Message:
        time.sleep(4)
        return Message("You will not see this")

    @button("Flaky check")
    @action_options(timeout_millis=1500, idempotent=True)
    def flaky_check(self) -> Message:
        CALLS["n"] += 1
        if CALLS["n"] % 2 == 1:
            time.sleep(3)
        return Message(f"Room 214 is available (call #{CALLS['n']})")
