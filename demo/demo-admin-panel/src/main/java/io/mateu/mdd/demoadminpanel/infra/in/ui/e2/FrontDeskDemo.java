package io.mateu.mdd.demoadminpanel.infra.in.ui.e2;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.AppShortcut;
import io.mateu.uidl.annotations.Text;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.HeaderValue;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.HeaderValuesSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.KeepAliveHandler;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicReference;

/**
 * The IDLE-SESSION WARNING on a small app of its own: one minute without activity (in any tab of
 * the app) → a 30-second countdown; "Stay signed in" runs the keep-alive action, "Sign out" goes to
 * /signed-out-demo. It also shows the live header values the kitchen-sink app (Home2) has — the
 * business date that "Close the day" (/e2-business-day) publishes reaches this app's sessions too.
 * The app-wide shortcuts and quick launch are on Home2 (F9, F8, Alt+Y, "?", MRG / EOD).
 */
@UI("/e2-demo")
@Title("Front desk")
@App(
    value = AppVariant.MENU_ON_TOP,
    liveUpdates = true,
    idleTimeoutMinutes = 1,
    idleWarningSeconds = 30,
    idleSignOutUrl = "/signed-out-demo")
// quick launch in the ⌘K palette of an app without the command center: type HOME + Enter
@AppShortcut(key = "f2", route = "/", label = "Front desk home", code = "HOME")
public class FrontDeskDemo implements HeaderValuesSupplier, KeepAliveHandler {

  static final AtomicReference<LocalDate> BUSINESS_DATE =
      new AtomicReference<>(LocalDate.of(2026, 10, 12));
  static final AtomicReference<String> SHIFT = new AtomicReference<>("Morning");

  static String businessDate() {
    return BUSINESS_DATE.get().format(DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH));
  }

  static String advanceBusinessDate() {
    BUSINESS_DATE.updateAndGet(d -> d.plusDays(1));
    return businessDate();
  }

  /** The header values both demo apps show. */
  public static List<HeaderValue> headerValues() {
    return List.of(
        new HeaderValue("businessDate", "Business date", businessDate()),
        new HeaderValue("shift", "Shift", SHIFT.get()));
  }

  @Text
  String intro =
      "Stay idle for 30 seconds (no key, click or scroll in any tab of this app) to see the idle"
          + " warning. The business date on the header is live: close the day at /e2-business-day"
          + " and it changes here too.";

  @Override
  public List<HeaderValue> headerValues(HttpRequest httpRequest) {
    return headerValues();
  }

  @Override
  public void keepAlive(HttpRequest httpRequest) {
    // a real app refreshes its server session or token here
  }
}
