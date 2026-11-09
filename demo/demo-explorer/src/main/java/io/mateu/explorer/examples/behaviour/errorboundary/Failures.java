package io.mateu.explorer.examples.behaviour.errorboundary;

import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;

/**
 * The error boundary: what an exception becomes on the screen.
 *
 * <ul>
 *   <li>a {@link UserFacingException} is shown AS WRITTEN — it is meant for the user;
 *   <li>anything else is "Something went wrong / An unexpected error occurred. Reference: &lt;id&gt;",
 *       and the real exception is logged at ERROR under that id — internals never reach the browser.
 *       ({@code MATEU_ERRORS_DETAILED=true} shows the raw exception, for development.)
 * </ul>
 */
@Title("When things go wrong")
public class Failures {

  @Button
  Message aRuleOfTheBusiness() {
    throw new UserFacingException("Credit limit reached", "This customer cannot order more until they pay.");
  }

  @Button
  Message aBug() {
    var customers = new java.util.HashMap<String, String>();
    return new Message(customers.get("acme").toUpperCase()); // NullPointerException
  }
}
