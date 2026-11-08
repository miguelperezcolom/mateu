package io.mateu.explorer.examples.behaviour.skiplink;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;

/**
 * Nothing to declare: every Mateu page gets a "Skip to content" link as its FIRST tab stop (hidden
 * until focused) and a {@code role="main"} landmark on the content, so keyboard and screen-reader
 * users jump past the menu.
 */
@Title("Skip the menu")
public class Landmarks {

  @Button
  Message iAmInTheContent() {
    return new Message("You reached the content");
  }
}
