package io.mateu.explorer.examples.behaviour.deeplinks;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.interfaces.TitleSupplier;
import java.net.URI;
import java.time.LocalDate;

/**
 * Every screen is a URL. Navigating pushes a history entry, so the browser's Back and Forward walk
 * the screens; opening the URL in a new tab (or after a reload) lands on the same screen with the
 * same parameters — here the date, from {@code x/behaviour/deep-links/days/:date}.
 */
public class DayPlan implements TitleSupplier {

  @ReadOnly String date = "2026-12-20";

  @ReadOnly String arrivals;

  @Override
  public String title() {
    arrivals = (LocalDate.parse(date).getDayOfMonth() % 5 + 2) + " arrivals";
    return "Plan for " + date;
  }

  @Button
  @Label("‹ Previous day")
  URI previous() {
    return URI.create("/x/behaviour/deep-links/days/" + LocalDate.parse(date).minusDays(1));
  }

  @Button
  @Label("Next day ›")
  URI next() {
    return URI.create("/x/behaviour/deep-links/days/" + LocalDate.parse(date).plusDays(1));
  }
}
