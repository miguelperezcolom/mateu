package com.example.parity;

import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** Actions that fail: like a bug (its message must never reach the user) and on purpose. */
@UI("/failing")
@Title("Failing form")
public class FailingForm {

  public String name = "x";

  @Button
  public void explode() {
    throw new IllegalStateException("db password is hunter2");
  }

  @Button
  public void refuse() {
    throw new UserFacingException("Check-in", "The booking is already checked in");
  }
}
