package io.mateu.explorer.examples.behaviour.validation;

import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Help;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * Validation is declared once, with Bean validation, and enforced TWICE:
 *
 * <ul>
 *   <li>in the browser, as you type and when you press <em>Sign up</em> (the field is marked, the
 *       message shown, focus moves to the first rejected field);
 *   <li>on the server, before the {@code validationRequired} action runs: the very same constraints
 *       are re-checked, so a client that skips the browser checks is refused with "There are
 *       validation errors" — the browser is never trusted.
 * </ul>
 *
 * <p>A rule only the server knows (here: a taken user name) is a {@link UserFacingException}: its
 * message is shown as written.
 */
@Title("Sign up")
public class SignUpForm {

  @NotEmpty
  @Pattern(regexp = "[a-z0-9_]{3,16}", message = "3-16 lowercase letters, digits or _")
  @Help("Try 'admin' to see a server-side refusal")
  String userName;

  @NotEmpty @Email String email;

  @NotNull
  @Min(18)
  @Max(120)
  Integer age;

  @Action(validationRequired = true)
  @Button
  Message signUp() {
    if ("admin".equals(userName)) {
      throw new UserFacingException("That user name is taken", "Pick another one.");
    }
    return Message.success("Welcome, " + userName + "!");
  }
}
