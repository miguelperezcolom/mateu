package io.mateu.explorer.ui;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;

/** A minimal form screen: type a name and greet — the classic first Mateu screen. */
@UI("/greeting")
@Title("Greeting")
public class Greeting {

  @NotEmpty String name;

  @Button
  public Message greet() {
    return new Message("Hello " + name + " 👋");
  }
}
