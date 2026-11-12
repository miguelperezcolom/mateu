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

  Button openBoard =
      Button.builder()
          .label("Open the board")
          .actionId("openBoard")
          .buttonStyle(ButtonStyle.primary)
          .build();

  Button openSchedule = Button.builder().label("See the schedule").actionId("openSchedule").build();

  @Panel(title = "Board")
  Text board = new Text("Drag a task to another column to move it on: the server decides.");

  @Panel(title = "Schedule")
  Text schedule = new Text("The same tasks on a calendar, by due date.");

  @Override
  protected String heroTitle() {
    return "My app";
  }

  @Override
  protected String heroSubtitle() {
    return "Today's operations at a glance.";
  }

  @Action
  URI openBoard() {
    return URI.create("/board");
  }

  @Action
  URI openSchedule() {
    return URI.create("/schedule");
  }
}
