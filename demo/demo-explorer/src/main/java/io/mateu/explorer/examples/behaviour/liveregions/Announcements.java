package io.mateu.explorer.examples.behaviour.liveregions;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;

/**
 * The client keeps two live regions (polite and assertive) from boot; navigation (the new window
 * title), error toasts and {@code UICommand.announce(...)} are read through them. Sighted users see
 * nothing for an announce — it is for screen readers only.
 */
@Title("Announcements")
public class Announcements {

  /** Polite: read when the screen reader is idle. Nothing visible changes. */
  @Button
  UICommand announceSaved() {
    return UICommand.announce("Three records were archived");
  }

  /** Assertive: interrupts what is being read. */
  @Button
  UICommand announceUrgent() {
    return UICommand.announceAssertive("The connection to the payment service was lost");
  }

  /** An error toast is an alert: announced assertively, sticky until closed. */
  @Button
  Message showAnError() {
    return Message.error("The export failed: the disk is full");
  }
}
