package io.mateu.explorer.examples.behaviour.autopage;

import io.mateu.uidl.annotations.AutoPage;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.data.Message;

/**
 * Only buttons and presentational panels, not one data field: inference composes a WELCOME page —
 * the buttons become the hero's calls to action, the panels its highlight tiles. One data field
 * would keep it a form.
 */
@Title("Front desk")
@AutoPage
public class FrontDeskWelcome {

  Button start =
      Button.builder()
          .label("Start check-in")
          .actionId("startCheckIn")
          .buttonStyle(ButtonStyle.primary)
          .build();

  @Panel(title = "1 · Find the booking")
  Markdown step1 = new Markdown("By locator, guest name or room.", null, null);

  @Panel(title = "2 · Verify the guests")
  Markdown step2 = new Markdown("Scan the documents of every guest.", null, null);

  public Message startCheckIn() {
    return Message.success("Check-in started");
  }
}
