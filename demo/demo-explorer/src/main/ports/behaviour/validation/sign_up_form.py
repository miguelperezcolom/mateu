# The Python twin (mateu-ui): Annotated markers drive the same client + server checks.
from typing import Annotated

from mateu_ui.uidl import Max, Message, Min, Pattern, Required, UserFacingException, button, title, ui


@ui("sign-up")
@title("Sign up")
class SignUpForm:
    user_name: Annotated[str | None, Required(), Pattern(r"^[a-z0-9_]{3,16}$")] = None
    email: Annotated[str | None, Required()] = None
    age: Annotated[int | None, Required(), Min(18), Max(120)] = None

    @button()
    def sign_up(self) -> Message:
        if self.user_name == "admin":
            raise UserFacingException("Pick another one.", title="That user name is taken")
        return Message(f"Welcome, {self.user_name}!")
