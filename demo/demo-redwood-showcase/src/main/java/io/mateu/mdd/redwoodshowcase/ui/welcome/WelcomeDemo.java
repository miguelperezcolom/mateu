package io.mateu.mdd.redwoodshowcase.ui.welcome;

import io.mateu.core.infra.declarative.orchestrators.welcome.Welcome;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.data.Message;
import java.net.URI;

/**
 * Demo of the {@link Welcome} archetype: hero with call-to-action buttons plus highlight tiles.
 */
@UI("/welcome-demo")
@Title("Welcome")
public class WelcomeDemo extends Welcome {

  Button start =
      Button.builder()
          .label("Start check-in")
          .actionId("startCheckin")
          .buttonStyle(ButtonStyle.primary)
          .build();

  Button learnMore = Button.builder().label("See the dashboard").actionId("openDashboard").build();

  // a third and a fourth CTA: oj-sp-welcome-page shows the first secondary ones as buttons and the
  // rest in its overflow menu — none of them is lost
  Button tasks = Button.builder().label("Open the task list").actionId("openTasks").build();

  Button guide = Button.builder().label("Read the guide").actionId("openGuide").build();

  @Panel(title = "1 · Search the booking")
  Markdown step1 = new Markdown("Find the reservation by locator, guest name or room.", null, null);

  @Panel(title = "2 · Verify the guests")
  Markdown step2 = new Markdown("Scan documents and confirm the cardex for every guest.", null, null);

  @Panel(title = "3 · Assign and charge")
  Markdown step3 = new Markdown("Assign the room, take the deposit and hand over the keys.", null, null);

  @Override
  protected String heroOverline() {
    return "Good morning";
  }

  @Override
  protected String heroTitle() {
    return "Front desk check-in";
  }

  @Override
  protected String heroSubtitle() {
    return "Everything you need to check a guest in, in three steps";
  }

  @Action
  Object startCheckin() {
    return URI.create("/checkin");
  }

  @Action
  Object openDashboard() {
    return URI.create("/dashboard-demo");
  }

  @Action
  Object openTasks() {
    return URI.create("/todo-list-demo");
  }

  @Action
  Object openGuide() {
    return new Message("The check-in guide would open here.");
  }
}
