package io.mateu.explorer.examples.behaviour.confirmations;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.ButtonColor;
import io.mateu.uidl.data.Message;

/**
 * {@code @Action(confirmationRequired = true)} asks before the action runs; the title, message and
 * both answers are yours. Declining sends nothing to the server.
 */
@Title("Room 214")
public class RoomRelease {

  String guest = "Ada Lovelace";

  @Button(buttonColor = ButtonColor.error)
  @Label("Release room")
  @Action(
      confirmationRequired = true,
      confirmationTitle = "Release room 214?",
      confirmationMessage = "Ada Lovelace's booking loses the room. This cannot be undone.",
      confirmationText = "Release it",
      confirmationDenialText = "Keep it")
  Message release() {
    return Message.warning("Room 214 released");
  }
}
