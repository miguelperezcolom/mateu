package com.example.app;

import io.mateu.core.infra.declarative.orchestrators.welcome.Welcome;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Text;
import java.net.URI;

/**
 * The home page, a {@link Welcome}: a hero with a title and an intro, {@link Button} fields as its
 * calls to action and {@code @Panel} fields as tiles below. A button runs the {@code @Action} method
 * named by its id; returning a {@link URI} navigates there.
 */
public class Home extends Welcome {

  Button startRequest =
      Button.builder()
          .label("Start a request")
          .actionId("startRequest")
          .buttonStyle(ButtonStyle.primary)
          .build();

  @Panel(title = "One step at a time")
  Text steps =
      new Text(
          "The request is a Wizard: each step is a class, the company step only shows up for"
              + " companies, and everything is reviewed before it is submitted.");

  @Panel(title = "Track it")
  Text track = new Text("Submitted requests are listed under Requests.");

  @Override
  protected String heroTitle() {
    return "My app";
  }

  @Override
  protected String heroSubtitle() {
    return "Tell us what you need: it takes a minute.";
  }

  @Action
  URI startRequest() {
    return URI.create("/intake");
  }
}
