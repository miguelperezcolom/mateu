package com.example.demo;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;

/** The whole UI: a form with a field and a button, served at http://localhost:8089/. */
@UI("")
@Title("Hello, Mateu")
public class Home {

  @NotEmpty String name = "world";

  @Button
  public Message greet() {
    return new Message("Hello, " + name + "!");
  }
}
