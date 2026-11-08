package io.mateu.explorer.examples.behaviour.accesskeys;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;

/** Three buttons with no shortcut declared: access keys gives each one a letter. */
@Title("Check-in")
public class CheckInPage {

  String guest = "Ada Lovelace";

  @Button
  Message assignRoom() {
    return Message.success("Room assigned");
  }

  @Button
  Message printCard() {
    return Message.success("Registration card printed");
  }

  @Button
  Message welcome() {
    return Message.success("Welcome message sent");
  }
}
