package io.mateu.mdd.demoadminpanel.infra.in.ui.e2;

import io.mateu.uidl.LiveHeaderValues;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import java.util.List;

/**
 * Live header values: "Close the day" moves the business date and PUBLISHES it — every open
 * session of the front-desk app repaints its header (the app has {@code @App(liveUpdates)}), not
 * only this tab. "Change shift" only answers a command: this browser's tabs follow, other sessions
 * do not.
 */
@UI("/e2-business-day")
@Title("End of day")
public class BusinessDayPage {

  @Section("Business day")
  @PlainText
  String businessDate = FrontDeskDemo.businessDate();

  @PlainText String shift = FrontDeskDemo.SHIFT.get();

  @Toolbar
  @Action(shortcut = "ctrl+alt+e")
  public Object closeTheDay() {
    var next = FrontDeskDemo.advanceBusinessDate();
    businessDate = next;
    // every session of the app (the event stream); this tab gets it through the stream too
    LiveHeaderValues.publish("businessDate", next);
    return List.of(this, new Message("Day closed — the business date is now " + next));
  }

  @Toolbar
  public Object changeShift() {
    var next = "Night".equals(FrontDeskDemo.SHIFT.get()) ? "Morning" : "Night";
    FrontDeskDemo.SHIFT.set(next);
    shift = next;
    // this browser only (this tab, and the other tabs through storage)
    return List.of(this, UICommand.updateHeaderValue("shift", next));
  }
}
