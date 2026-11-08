package io.mateu.explorer.examples.behaviour.liveheadervalues;

import io.mateu.uidl.LiveHeaderValues;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import java.time.LocalDate;

/** The screen whose buttons move the header values. */
@Title("Front desk")
public class FrontDesk {

  @Button
  Message closeTheDay() {
    var current = LiveHeaderValues.current().getOrDefault("businessDate", "2026-11-08");
    var next = LocalDate.parse(current).plusDays(1).toString();
    LiveHeaderValues.publish("businessDate", next); // every open session sees it
    return Message.success("Day closed — the business date is now " + next);
  }

  @Button
  Message oneMoreArrival() {
    var arrivals = Integer.parseInt(LiveHeaderValues.current().getOrDefault("arrivals", "12")) + 1;
    LiveHeaderValues.publish("arrivals", "" + arrivals);
    return new Message("Arrival registered");
  }

  @Button
  UICommand onlyInThisBrowser() {
    return UICommand.updateHeaderValue("arrivals", "?? (only this browser)");
  }
}
